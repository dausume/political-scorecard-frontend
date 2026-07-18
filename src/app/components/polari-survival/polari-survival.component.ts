import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { PolariEpistemicsService, PolariReport } from '../../services/polari/polari-epistemics.service';
import { PolariReportViewComponent } from '../polari-epistemics/polari-report-view/polari-report-view.component';

/**
 * DMV cost-of-living survival reports — the survival endpoints' first
 * frontend consumer (DMV_COST_OF_LIVING_DATA_PLAN §7 col-6): the
 * seeded walkthrough plus baseline-vs-reported survival reports per
 * location (persona × DMV jurisdiction), straight off Polari's live
 * /api/scoring/survival/* routes.
 */
@Component({
  selector: 'app-polari-survival',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule,
    MatInputModule, MatSelectModule, MatProgressSpinnerModule,
    PolariReportViewComponent,
  ],
  templateUrl: './polari-survival.component.html',
  styleUrls: ['./polari-survival.component.scss'],
})
export class PolariSurvivalComponent implements OnInit {
  walkthrough: PolariReport | null = null;
  walkthroughError: string | null = null;
  loadingWalkthrough = true;

  location = '';
  month = '';
  knownLocations: string[] = [];
  report: PolariReport | null = null;
  reportError: string | null = null;
  loadingReport = false;

  constructor(private epistemics: PolariEpistemicsService) {}

  ngOnInit(): void {
    this.epistemics.getSurvivalWalkthrough().subscribe({
      next: (walkthrough) => {
        this.walkthrough = walkthrough;
        this.knownLocations = this.extractLocations(walkthrough);
        if (!this.location && this.knownLocations.length > 0) {
          this.location = this.knownLocations[0];
          this.loadReport();
        }
        this.loadingWalkthrough = false;
      },
      error: (err) => {
        this.walkthroughError = err?.error?.error || 'Walkthrough unavailable.';
        this.loadingWalkthrough = false;
      },
    });
  }

  /** Location names appear wherever the walkthrough mentions them —
   *  sweep string fields named like locations defensively. */
  private extractLocations(report: PolariReport): string[] {
    const found = new Set<string>();
    const sweep = (node: unknown): void => {
      if (Array.isArray(node)) {
        node.forEach(sweep);
      } else if (node && typeof node === 'object') {
        for (const [key, value] of Object.entries(node)) {
          if (typeof value === 'string' && value
              && ['location', 'locationName', 'location_name', 'jurisdiction'].includes(key)) {
            found.add(value);
          } else {
            sweep(value);
          }
        }
      }
    };
    sweep(report);
    return Array.from(found).sort();
  }

  loadReport(): void {
    if (!this.location) {
      return;
    }
    this.loadingReport = true;
    this.report = null;
    this.reportError = null;
    this.epistemics.getSurvivalReport(this.location, this.month || undefined).subscribe({
      next: (report) => {
        this.report = report;
        this.loadingReport = false;
      },
      error: (err) => {
        this.reportError = err?.error?.error || `No survival report for '${this.location}'.`;
        this.loadingReport = false;
      },
    });
  }
}
