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
  PoliticianScoreReport,
  PolariTimeframeSummary,
} from '../../models/polari-scoring/polari-scoring-types';

/**
 * A politician's concept score from their actual voting record —
 * vote-weighted over policy scores, with abstentions surfaced as a
 * participation gap (never folded into the stance) and unscoreable
 * policies named rather than silently skipped.
 *
 * Timeframe is an optional, deep-linkable `?timeframe=` query param
 * (2026-07-14 follow-up) — `politician_score()`'s backend `timeframe`
 * param already worked, this just gives it a real picker instead of
 * requiring a citizen to already know a ScoreContext name.
 */
@Component({
  selector: 'app-polari-politician-score',
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
  templateUrl: './polari-politician-score.component.html',
  styleUrl: './polari-politician-score.component.scss',
})
export class PolariPoliticianScoreComponent implements OnInit {
  politicianName = '';
  conceptName = '';
  timeframeName = '';
  timeframes: PolariTimeframeSummary[] = [];
  report: PoliticianScoreReport | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private polariScoring: PolariScoringService,
  ) {}

  ngOnInit(): void {
    this.politicianName = this.route.snapshot.paramMap.get('name') || '';
    this.conceptName = this.route.snapshot.queryParamMap.get('concept') || '';
    this.timeframeName = this.route.snapshot.queryParamMap.get('timeframe') || '';
    if (!this.politicianName) {
      this.error = 'No politician name in the route.';
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
      .getPoliticianScore(this.politicianName, this.conceptName, this.timeframeName || undefined)
      .subscribe({
        next: (report) => {
          if (!report.ok) {
            this.error = report.error || 'Politician score unavailable.';
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
