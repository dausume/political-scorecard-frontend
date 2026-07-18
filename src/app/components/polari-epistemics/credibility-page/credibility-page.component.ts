import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { PolariEpistemicsService, PolariReport } from '../../../services/polari/polari-epistemics.service';
import { PolariReportViewComponent } from '../polari-report-view/polari-report-view.component';

/**
 * Credibility: per-assertion credibility readings (group/individual
 * units), the never-flattened by-basis reading, and contributor
 * standing lookups.
 */
@Component({
  selector: 'app-credibility-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule,
    MatInputModule, MatSelectModule, MatProgressSpinnerModule,
    PolariReportViewComponent,
  ],
  templateUrl: './credibility-page.component.html',
  styleUrls: ['./credibility-page.component.scss'],
})
export class CredibilityPageComponent implements OnInit {
  assertions: string[] = [];
  assertionsError: string | null = null;
  loadingAssertions = true;

  assertion = '';
  credibility: PolariReport | null = null;
  credibilityError: string | null = null;
  loadingCredibility = false;
  byBasis: PolariReport | null = null;
  byBasisError: string | null = null;
  loadingByBasis = false;

  contributor = '';
  standing: PolariReport | null = null;
  standingError: string | null = null;
  loadingStanding = false;

  constructor(private epistemics: PolariEpistemicsService) {}

  ngOnInit(): void {
    this.epistemics.getClassRows('ScoreAssertion').subscribe({
      next: (rows) => {
        this.assertions = rows
          .map((row) => row?.name)
          .filter((name): name is string => typeof name === 'string' && name.length > 0)
          .sort();
        this.loadingAssertions = false;
      },
      error: (err) => {
        this.assertionsError = err?.error?.error || 'ScoreAssertion rows unavailable.';
        this.loadingAssertions = false;
      },
    });
  }

  loadAssertionReadings(): void {
    const name = this.assertion;
    if (!name) {
      return;
    }
    this.loadingCredibility = true;
    this.credibility = null;
    this.credibilityError = null;
    this.epistemics.getAssertionCredibility(name).subscribe({
      next: (report) => {
        this.credibility = report;
        this.loadingCredibility = false;
      },
      error: (err) => {
        this.credibilityError = err?.error?.error || `No credibility reading for '${name}'.`;
        this.loadingCredibility = false;
      },
    });
    this.loadingByBasis = true;
    this.byBasis = null;
    this.byBasisError = null;
    this.epistemics.getAssertionReadingByBasis(name).subscribe({
      next: (report) => {
        this.byBasis = report;
        this.loadingByBasis = false;
      },
      error: (err) => {
        this.byBasisError = err?.error?.error || `No by-basis reading for '${name}'.`;
        this.loadingByBasis = false;
      },
    });
  }

  loadStanding(): void {
    const name = this.contributor.trim();
    if (!name) {
      return;
    }
    this.loadingStanding = true;
    this.standing = null;
    this.standingError = null;
    this.epistemics.getContributorStanding(name).subscribe({
      next: (report) => {
        this.standing = report;
        this.loadingStanding = false;
      },
      error: (err) => {
        this.standingError = err?.error?.error || `No standing found for contributor '${name}'.`;
        this.loadingStanding = false;
      },
    });
  }
}
