import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolariScoringService } from '../../services/polari/polari-scoring.service';
import {
  SystemChoiceOutcomesReport,
  PolariAssertionSummary,
  AssertionValidityReport,
} from '../../models/polari-scoring/polari-scoring-types';

/** The seed data's one real outcome term (rape-occurrence-rate) is
 *  used as the default when the route carries no `?term=` — a UI
 *  should not force every visitor to know the exact ScoreTerm name
 *  before this page shows anything. */
const DEFAULT_OUTCOME_TERM = 'rape-occurrence-rate';

/**
 * The "implications" view (2026-07-14): for one decision-procedure
 * fork, shows how outcome-term values compare across jurisdictions
 * grouped by which criterion each currently deploys — a RAW
 * comparison, never presented as causal (the backend's `note` field
 * carries that caveat and is always rendered, never summarized away).
 *
 * Below the comparison: the evidence-weighted ScoreAssertions that
 * argue a system choice actually causes a score effect, each with its
 * own multi-round validity-vote tally (loaded on demand) — since an
 * assertion existing is not the same as it being confirmed credible.
 */
@Component({
  selector: 'app-polari-system-choice-outcomes',
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
  templateUrl: './polari-system-choice-outcomes.component.html',
  styleUrl: './polari-system-choice-outcomes.component.scss',
})
export class PolariSystemChoiceOutcomesComponent implements OnInit {
  forkName = '';
  outcomeTerm = DEFAULT_OUTCOME_TERM;

  report: SystemChoiceOutcomesReport | null = null;
  assertions: PolariAssertionSummary[] = [];
  validityByAssertion: Map<string, AssertionValidityReport> = new Map();
  loadingValidity: Set<string> = new Set();

  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private polariScoring: PolariScoringService,
  ) {}

  ngOnInit(): void {
    this.forkName = this.route.snapshot.paramMap.get('fork') || '';
    this.outcomeTerm = this.route.snapshot.queryParamMap.get('term') || DEFAULT_OUTCOME_TERM;
    if (!this.forkName) {
      this.error = 'No decision-procedure fork name in the route.';
      return;
    }
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = null;
    this.polariScoring.getSystemChoiceOutcomes(this.forkName, this.outcomeTerm).subscribe({
      next: (report) => {
        if (!report.ok) {
          this.error = report.error || 'System-choice outcomes unavailable.';
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
    this.polariScoring.getAssertions().subscribe({
      next: (assertions) => { this.assertions = assertions; },
      error: () => { /* the outcomes comparison is the primary content; assertions are supplementary */ },
    });
  }

  loadValidity(assertionName: string): void {
    if (this.validityByAssertion.has(assertionName) || this.loadingValidity.has(assertionName)) {
      return;
    }
    this.loadingValidity.add(assertionName);
    this.polariScoring.getAssertionValidity(assertionName).subscribe({
      next: (report) => {
        this.validityByAssertion.set(assertionName, report);
        this.loadingValidity.delete(assertionName);
      },
      error: () => { this.loadingValidity.delete(assertionName); },
    });
  }

  validityFor(assertionName: string): AssertionValidityReport | null {
    return this.validityByAssertion.get(assertionName) || null;
  }

  isLoadingValidity(assertionName: string): boolean {
    return this.loadingValidity.has(assertionName);
  }

  latestRound(report: AssertionValidityReport): AssertionValidityReport['rounds'][number] | null {
    return report.rounds.length > 0 ? report.rounds[report.rounds.length - 1] : null;
  }
}
