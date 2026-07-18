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
import { extractReportList } from '../report-list.util';

/**
 * Sources & trust: the source glossary and provider-reliability
 * readings, plus a per-source trust-report lookup (select from
 * glossary names when extractable, free text otherwise).
 */
@Component({
  selector: 'app-sources-trust-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule,
    MatInputModule, MatSelectModule, MatProgressSpinnerModule,
    PolariReportViewComponent,
  ],
  templateUrl: './sources-trust-page.component.html',
  styleUrls: ['./sources-trust-page.component.scss'],
})
export class SourcesTrustPageComponent implements OnInit {
  glossary: PolariReport | null = null;
  glossaryError: string | null = null;
  loadingGlossary = true;
  sourceNames: string[] = [];

  reliability: PolariReport | null = null;
  reliabilityError: string | null = null;
  loadingReliability = false;
  reliabilityGroup = '';
  groupNames: string[] = [];

  source = '';
  sourceReport: PolariReport | null = null;
  sourceError: string | null = null;
  loadingSource = false;

  constructor(private epistemics: PolariEpistemicsService) {}

  ngOnInit(): void {
    this.epistemics.getSourceGlossary().subscribe({
      next: (report) => {
        this.glossary = report;
        this.sourceNames = this.extractSourceNames(report);
        this.loadingGlossary = false;
      },
      error: (err) => {
        this.glossaryError = err?.error?.error || 'Source glossary unavailable.';
        this.loadingGlossary = false;
      },
    });
    // Reliability is a per-group reading (whose retrievals back the
    // group's data) — offer the known provider groups.
    this.epistemics.getClassRows('ScoreGroup').subscribe({
      next: (rows) => (this.groupNames = rows.map((row: any) => row?.name).filter(Boolean).sort()),
      error: () => (this.groupNames = []),
    });
  }

  loadReliability(): void {
    if (!this.reliabilityGroup) {
      return;
    }
    this.loadingReliability = true;
    this.reliability = null;
    this.reliabilityError = null;
    this.epistemics.getProviderReliability(this.reliabilityGroup).subscribe({
      next: (report) => {
        this.reliability = report;
        this.loadingReliability = false;
      },
      error: (err) => {
        this.reliabilityError = err?.error?.error
          || `No reliability reading for '${this.reliabilityGroup}'.`;
        this.loadingReliability = false;
      },
    });
  }

  /** Pull source names out of the glossary defensively (no shape assumed). */
  private extractSourceNames(report: PolariReport): string[] {
    const entries = extractReportList(report, ['glossary', 'sources', 'entries', 'records', 'items']) || [];
    const names = new Set<string>();
    for (const entry of entries) {
      if (typeof entry === 'string' && entry) {
        names.add(entry);
      } else if (entry && typeof entry === 'object') {
        const name = entry.name || entry.sourceName || entry.source;
        if (typeof name === 'string' && name) {
          names.add(name);
        }
      }
    }
    return Array.from(names).sort();
  }

  loadSourceReport(): void {
    const name = this.source.trim();
    if (!name) {
      return;
    }
    this.loadingSource = true;
    this.sourceReport = null;
    this.sourceError = null;
    this.epistemics.getSourceReport(name).subscribe({
      next: (report) => {
        this.sourceReport = report;
        this.loadingSource = false;
      },
      error: (err) => {
        this.sourceError = err?.error?.error || `No source report for '${name}'.`;
        this.loadingSource = false;
      },
    });
  }
}
