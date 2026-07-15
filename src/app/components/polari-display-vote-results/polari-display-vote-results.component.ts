import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { PolariScoringService } from '../../services/polari/polari-scoring.service';
import {
  DisplayVoteTallyReport,
  ResolvedCandidateDisplay,
} from '../../models/polari-scoring/polari-scoring-types';

/**
 * Read-only live results view for one Polari GroupDisplayVote —
 * mechanism A (2026-07-14, Phase 4b): which explanatory Display best
 * helps people understand a score, distinct from
 * polari-election-results (mechanism B: which term-weighting
 * worldview the group reads by).
 *
 * Shows each candidate's actual explanation text next to its vote
 * share, not just numbers — the point of mechanism A is explanatory
 * quality, so seeing what each explanation SAYS is the whole feature.
 */
@Component({
  selector: 'app-polari-display-vote-results',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './polari-display-vote-results.component.html',
  styleUrl: './polari-display-vote-results.component.scss',
})
export class PolariDisplayVoteResultsComponent implements OnInit {
  voteName = '';
  tally: DisplayVoteTallyReport | null = null;
  displaysByName: Map<string, ResolvedCandidateDisplay> = new Map();
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private polariScoring: PolariScoringService,
  ) {}

  ngOnInit(): void {
    this.voteName = this.route.snapshot.paramMap.get('name') || '';
    if (!this.voteName) {
      this.error = 'No display vote name in the route.';
      return;
    }
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = null;
    forkJoin({
      tally: this.polariScoring.getDisplayVoteTally(this.voteName),
      displays: this.polariScoring.getDisplayVoteDisplays(this.voteName),
    }).subscribe({
      next: ({ tally, displays }) => {
        if (!tally.ok) {
          this.error = tally.error || 'Display vote tally unavailable.';
        } else {
          this.tally = tally;
          this.displaysByName = new Map(displays.map(d => [d.name, d]));
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not reach Polari’s scoring engine — '
          + (err?.message || 'unknown error');
        this.loading = false;
      },
    });
  }

  isWinner(candidate: string): boolean {
    return !!this.tally?.winners.includes(candidate);
  }

  /** The seed writes `item = f'{heading}\n\n{body}'` — title already
   *  carries the heading, so strip the duplicate leading line before
   *  rendering rather than showing it twice. */
  bodyWithoutHeading(item: { title: string; body: string }): string {
    const prefix = `${item.title}\n\n`;
    return item.body.startsWith(prefix)
      ? item.body.slice(prefix.length)
      : item.body;
  }
}
