import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolariScoringService } from '../../services/polari/polari-scoring.service';
import { ElectionTallyReport } from '../../models/polari-scoring/polari-scoring-types';

/**
 * Read-only live results view for one Polari WorldviewElection — the
 * real replacement for what browse-worldview-ballots used to link
 * into (the fully-mocked worldview-ballot.component.ts editor).
 *
 * This is deliberately READ-ONLY (2026-07-14, Phase 3a of the
 * Democratic Scorecard revamp): casting a real ballot requires
 * Polari's generic auto-CRUDE write endpoint (`POST /WorldviewBallot`,
 * multipart `initParamSets`), which currently has a known-temporary
 * permission gap (anonymous requests get full write access, per
 * `polariCRUDE.py`'s own `# TODO ... temporarily just give universal
 * access` comment) — building a citizen-facing "submit your vote" UI
 * on top of that without Dustin's explicit sign-off would be building
 * a product feature on a security hole its own author flagged as
 * temporary. See DEMOCRATIC_SCORECARD_REVAMP_PLAN.md Phase 3b.
 */
@Component({
  selector: 'app-polari-election-results',
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
  templateUrl: './polari-election-results.component.html',
  styleUrl: './polari-election-results.component.scss',
})
export class PolariElectionResultsComponent implements OnInit {
  electionName = '';
  tally: ElectionTallyReport | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private polariScoring: PolariScoringService,
  ) {}

  ngOnInit(): void {
    this.electionName = this.route.snapshot.paramMap.get('name') || '';
    if (!this.electionName) {
      this.error = 'No election name in the route.';
      return;
    }
    this.loadTally();
  }

  private loadTally(): void {
    this.loading = true;
    this.error = null;
    this.polariScoring.getElectionTally(this.electionName).subscribe({
      next: (report) => {
        if (!report.ok) {
          this.error = report.error || 'Election tally unavailable.';
          this.tally = null;
        } else {
          this.tally = report;
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
}
