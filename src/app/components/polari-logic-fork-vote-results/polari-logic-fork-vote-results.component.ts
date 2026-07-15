import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolariScoringService } from '../../services/polari/polari-scoring.service';
import { LogicForkVoteTallyReport } from '../../models/polari-scoring/polari-scoring-types';

/**
 * Read-only live results view for one Polari LogicForkVote —
 * mechanism C (2026-07-14, Phase 4b/judicial expansion): vote on
 * which alternate CRITERION a specific decision-procedure fork
 * should use (e.g. affirmative-consent vs. force-based consent
 * standards), distinct from polari-election-results (mechanism B)
 * and polari-display-vote-results (mechanism A).
 *
 * Shows the fork/decision-procedure the vote belongs to up top, since
 * a criterion vote only makes sense in that context — a bare "40% vs
 * 60%" number means nothing without knowing which fork of which
 * procedure is being decided.
 */
@Component({
  selector: 'app-polari-logic-fork-vote-results',
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
  templateUrl: './polari-logic-fork-vote-results.component.html',
  styleUrl: './polari-logic-fork-vote-results.component.scss',
})
export class PolariLogicForkVoteResultsComponent implements OnInit {
  voteName = '';
  tally: LogicForkVoteTallyReport | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private polariScoring: PolariScoringService,
  ) {}

  ngOnInit(): void {
    this.voteName = this.route.snapshot.paramMap.get('name') || '';
    if (!this.voteName) {
      this.error = 'No logic-fork vote name in the route.';
      return;
    }
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = null;
    this.polariScoring.getLogicForkVoteTally(this.voteName).subscribe({
      next: (tally) => {
        if (!tally.ok) {
          this.error = tally.error || 'Logic-fork vote tally unavailable.';
        } else {
          this.tally = tally;
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

  weightFor(candidate: string): number | null {
    const w = this.tally?.weights?.[candidate];
    return w === undefined ? null : w;
  }
}
