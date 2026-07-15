import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolariScoringService } from '../../services/polari/polari-scoring.service';
import { ConceptScoreReport } from '../../models/polari-scoring/polari-scoring-types';

/**
 * The general-scoring detail view (2026-07-14): a ScoreConcept's full
 * live-computed report, subject by subject, with every subject's
 * term-by-term breakdown available on expand — raw value,
 * normalization method, weighted contribution, and (never silently
 * dropped) which terms were missing. This is the actual "what did
 * Polari compute and why" view mechanism A/B/C's voting UI all feed
 * INTO, and until now had no frontend at all.
 */
@Component({
  selector: 'app-polari-concept-score-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './polari-concept-score-detail.component.html',
  styleUrl: './polari-concept-score-detail.component.scss',
})
export class PolariConceptScoreDetailComponent implements OnInit {
  conceptName = '';
  report: ConceptScoreReport | null = null;
  loading = false;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private polariScoring: PolariScoringService,
  ) {}

  ngOnInit(): void {
    this.conceptName = this.route.snapshot.paramMap.get('name') || '';
    if (!this.conceptName) {
      this.error = 'No concept name in the route.';
      return;
    }
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.error = null;
    this.polariScoring.getConceptScore(this.conceptName).subscribe({
      next: (report) => {
        if (!report.ok) {
          this.error = report.error || 'Concept score unavailable.';
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

  entryLabel(entry: { term?: string; concept?: string; label?: string }): string {
    return entry.label || entry.term || entry.concept || 'unknown';
  }
}
