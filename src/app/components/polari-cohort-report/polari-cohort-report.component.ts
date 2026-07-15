import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolariScoringService } from '../../services/polari/polari-scoring.service';
import {
  CohortReport,
  PolariTimeframeSummary,
} from '../../models/polari-scoring/polari-scoring-types';

/**
 * A politician cohort (e.g. a committee or party) — per-member
 * concept scores plus per-policy vote cohesion, banded through the
 * same editable AgreementPolicy as worldview agreement so a
 * "divisive" cohort vote and a "divisive" worldview election read on
 * one comparable scale.
 *
 * Timeframe is an optional, deep-linkable `?timeframe=` query param
 * (2026-07-14 follow-up), same picker pattern as
 * `polari-politician-score` — `cohort_report()`'s backend `timeframe`
 * param already worked, this just gives it a real control.
 */
@Component({
  selector: 'app-polari-cohort-report',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './polari-cohort-report.component.html',
  styleUrl: './polari-cohort-report.component.scss',
})
export class PolariCohortReportComponent implements OnInit {
  groupName = '';
  conceptName = '';
  timeframeName = '';
  timeframes: PolariTimeframeSummary[] = [];
  report: CohortReport | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private polariScoring: PolariScoringService,
  ) {}

  ngOnInit(): void {
    this.groupName = this.route.snapshot.paramMap.get('name') || '';
    this.conceptName = this.route.snapshot.queryParamMap.get('concept') || '';
    this.timeframeName = this.route.snapshot.queryParamMap.get('timeframe') || '';
    if (!this.groupName) {
      this.error = 'No cohort group name in the route.';
      return;
    }
    if (!this.conceptName) {
      this.error = 'No concept given — open this page from the Accountability Hub '
        + 'so a concept is selected.';
      return;
    }
    this.polariScoring.getTimeframeContexts().subscribe({
      next: (timeframes) => { this.timeframes = timeframes; },
      error: () => { /* timeframe picker is a supplementary control, not primary content */ },
    });
    this.load();
  }

  onTimeframeChange(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { concept: this.conceptName, timeframe: this.timeframeName || null },
      queryParamsHandling: 'merge',
    });
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = null;
    this.polariScoring
      .getCohortReport(this.groupName, this.conceptName, {
        timeframeContext: this.timeframeName || undefined,
      })
      .subscribe({
        next: (report) => {
          if (!report.ok) {
            this.error = report.error || 'Cohort report unavailable.';
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
