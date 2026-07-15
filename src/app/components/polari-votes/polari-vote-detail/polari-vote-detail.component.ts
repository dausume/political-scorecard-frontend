import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { MatBadgeModule } from '@angular/material/badge';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { PolariVoteApiService } from '../../../services/api/polari-vote-api.service';
import { PolariScoringService } from '../../../services/polari/polari-scoring.service';
import {
  PolariVoteTopicDTO,
  PolariVoteResults,
} from '../../../models/polari-vote/polari-vote-types';
import { ScoreConceptSummary } from '../../../models/polari-scoring/polari-scoring-types';
import { OidcService } from '../../../services/auth/oidc.service';
import { AppState } from '../../../state/app.state';
import * as AuthSelectors from '../../../state/selectors/auth.selectors';

interface CandidateRow {
  name: string;
  displayName: string;
  description: string;
  count: number;
}

/**
 * Cast a real, authenticated ballot on a PSC-hosted public vote
 * (2026-07-14 ballot-hosting architecture move). Candidates are
 * drafted definitions from Polari — for 'concept' kind items, their
 * display name/description are resolved via `PolariScoringService`
 * (read-only). Voting itself goes to PSC's OWN backend
 * (`PolariVoteApiService`), never to Polari directly.
 */
@Component({
  selector: 'app-polari-vote-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatCheckboxModule,
    MatRadioModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './polari-vote-detail.component.html',
  styleUrl: './polari-vote-detail.component.scss',
})
export class PolariVoteDetailComponent implements OnInit {
  topicId = '';
  topic: PolariVoteTopicDTO | null = null;
  results: PolariVoteResults | null = null;
  candidates: CandidateRow[] = [];

  loading = false;
  error: string | null = null;
  submitting = false;
  submitError: string | null = null;
  submitSuccess = false;

  isAuthenticated$: Observable<boolean>;

  // Vote-in-progress form state — only the field matching the
  // topic's mode is read on submit.
  approvals = new Set<string>();
  soleChoice = '';
  ranking: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private voteApi: PolariVoteApiService,
    private polariScoring: PolariScoringService,
    private oidcService: OidcService,
    private store: Store<AppState>,
  ) {
    this.isAuthenticated$ = this.store.select(AuthSelectors.selectIsAuthenticated);
  }

  ngOnInit(): void {
    this.topicId = this.route.snapshot.paramMap.get('id') || '';
    if (!this.topicId) {
      this.error = 'No vote id in the route.';
      return;
    }
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = null;
    this.voteApi.getTopicById(this.topicId).subscribe({
      next: (topic) => {
        this.topic = topic;
        this.loadCandidateLabels(topic);
        this.loadResults();
      },
      error: (err) => {
        this.error = 'Could not load this vote — ' + (err?.message || 'unknown error');
        this.loading = false;
      },
    });
  }

  private loadCandidateLabels(topic: PolariVoteTopicDTO): void {
    if (topic.polariItemKind !== 'concept') {
      // 'display' kind: no lightweight label source before this vote
      // is synced into Polari (a GroupDisplayVote naming these exact
      // candidates doesn't exist yet) — raw names are an honest,
      // if unpolished, fallback rather than guessed labels.
      this.candidates = topic.candidateNames.map(name => ({
        name, displayName: name, description: '', count: 0,
      }));
      return;
    }
    this.polariScoring.getConcepts().subscribe({
      next: (concepts) => {
        const byName = new Map<string, ScoreConceptSummary>(concepts.map(c => [c.name, c]));
        this.candidates = topic.candidateNames.map(name => {
          const concept = byName.get(name);
          return {
            name,
            displayName: concept?.displayName || name,
            description: concept?.description || '',
            count: 0,
          };
        });
      },
      error: () => {
        // Labels are a nicety, not load-bearing — fall back to raw
        // names rather than blocking the whole page on this call.
        this.candidates = topic.candidateNames.map(name => ({
          name, displayName: name, description: '', count: 0,
        }));
      },
    });
  }

  private loadResults(): void {
    this.voteApi.getResults(this.topicId).subscribe({
      next: (results) => {
        this.results = results;
        for (const candidate of this.candidates) {
          candidate.count = results.counts[candidate.name] || 0;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not load results — ' + (err?.message || 'unknown error');
        this.loading = false;
      },
    });
  }

  login(): void {
    this.oidcService.login();
  }

  toggleApproval(name: string): void {
    if (this.approvals.has(name)) {
      this.approvals.delete(name);
    } else {
      this.approvals.add(name);
    }
  }

  toggleRanking(name: string): void {
    const index = this.ranking.indexOf(name);
    if (index >= 0) {
      this.ranking.splice(index, 1);
    } else {
      this.ranking.push(name);
    }
  }

  rankOf(name: string): number {
    const index = this.ranking.indexOf(name);
    return index >= 0 ? index + 1 : 0;
  }

  get canSubmit(): boolean {
    if (!this.topic) return false;
    switch (this.topic.mode) {
      case 'approval': return this.approvals.size > 0;
      case 'sole': return !!this.soleChoice;
      case 'ranked-condorcet': return this.ranking.length > 0;
      default: return false;
    }
  }

  submitVote(): void {
    if (!this.topic || !this.canSubmit) return;
    this.submitting = true;
    this.submitError = null;

    const payload = this.topic.mode === 'approval'
      ? { approvals: Array.from(this.approvals) }
      : this.topic.mode === 'sole'
        ? { soleChoice: this.soleChoice }
        : { ranking: this.ranking };

    this.voteApi.castVote(this.topicId, payload).subscribe({
      next: (response) => {
        this.submitting = false;
        if (!response.success) {
          this.submitError = response.message;
          return;
        }
        this.submitSuccess = true;
        this.loadResults();
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err?.error?.message || err?.message || 'Could not cast vote.';
      },
    });
  }

  closeTopic(): void {
    this.voteApi.closeTopic(this.topicId).subscribe({
      next: () => this.load(),
      error: (err) => { this.error = err?.error?.message || 'Could not close the vote.'; },
    });
  }

  syncToPolari(): void {
    this.voteApi.syncToPolari(this.topicId).subscribe({
      next: () => this.load(),
      error: (err) => { this.error = err?.error?.message || 'Could not sync to Polari.'; },
    });
  }

  maxCount(): number {
    return Math.max(1, ...this.candidates.map(c => c.count));
  }
}
