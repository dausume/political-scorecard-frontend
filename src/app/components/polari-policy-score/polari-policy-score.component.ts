import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolariScoringService } from '../../services/polari/polari-scoring.service';
import { PolicyScoreReport } from '../../models/polari-scoring/polari-scoring-types';

/**
 * A policy subject's assertion-composed score for one concept — the
 * literal original point of this whole revamp ("compute issue scores
 * on the fly using Polari's scoring engine"), which had a real
 * working backend endpoint and zero frontend until now.
 *
 * `concept` is a required query param (`?concept=labor-quality`) —
 * there's no dedicated "list of policies" backend route, so this page
 * is reached from `polari-accountability-hub`'s real picker, not
 * typed blind.
 */
@Component({
  selector: 'app-polari-policy-score',
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
  templateUrl: './polari-policy-score.component.html',
  styleUrl: './polari-policy-score.component.scss',
})
export class PolariPolicyScoreComponent implements OnInit {
  policyName = '';
  conceptName = '';
  report: PolicyScoreReport | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private polariScoring: PolariScoringService,
  ) {}

  ngOnInit(): void {
    this.policyName = this.route.snapshot.paramMap.get('name') || '';
    this.conceptName = this.route.snapshot.queryParamMap.get('concept') || '';
    if (!this.policyName) {
      this.error = 'No policy name in the route.';
      return;
    }
    if (!this.conceptName) {
      this.error = 'No concept given — open this page from the Accountability Hub '
        + 'so a concept is selected.';
      return;
    }
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = null;
    this.polariScoring.getPolicyScore(this.policyName, this.conceptName).subscribe({
      next: (report) => {
        if (!report.ok) {
          this.error = report.error || 'Policy score unavailable.';
        } else {
          this.report = report;
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
}
