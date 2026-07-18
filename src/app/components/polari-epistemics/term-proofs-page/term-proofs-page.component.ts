import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolariEpistemicsService, PolariReport } from '../../../services/polari/polari-epistemics.service';
import { PolariReportViewComponent } from '../polari-report-view/polari-report-view.component';
import { entryName, entryStatus, extractReportList } from '../report-list.util';

/**
 * Term proofs: the live proof catalog (clickable by name+status), each
 * proof's reading plus its never-flattened by-basis reading, and the
 * votable data-manipulation pattern catalog.
 */
@Component({
  selector: 'app-term-proofs-page',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatProgressSpinnerModule, PolariReportViewComponent],
  templateUrl: './term-proofs-page.component.html',
  styleUrls: ['./term-proofs-page.component.scss'],
})
export class TermProofsPageComponent implements OnInit {
  proofsReport: PolariReport | null = null;
  proofList: any[] | null = null;
  proofsError: string | null = null;
  loadingProofs = true;

  selectedProof: string | null = null;
  reading: PolariReport | null = null;
  readingError: string | null = null;
  loadingReading = false;
  byBasis: PolariReport | null = null;
  byBasisError: string | null = null;
  loadingByBasis = false;

  patterns: PolariReport | null = null;
  patternsError: string | null = null;
  loadingPatterns = true;

  entryName = entryName;
  entryStatus = entryStatus;

  constructor(private epistemics: PolariEpistemicsService) {}

  ngOnInit(): void {
    this.epistemics.getProofs().subscribe({
      next: (report) => {
        this.proofsReport = report;
        this.proofList = extractReportList(report, ['proofs', 'termProofs', 'items', 'records']);
        this.loadingProofs = false;
      },
      error: (err) => {
        this.proofsError = err?.error?.error || 'Proof catalog unavailable.';
        this.loadingProofs = false;
      },
    });
    this.epistemics.getManipulationPatterns().subscribe({
      next: (report) => {
        this.patterns = report;
        this.loadingPatterns = false;
      },
      error: (err) => {
        this.patternsError = err?.error?.error || 'Manipulation-pattern catalog unavailable.';
        this.loadingPatterns = false;
      },
    });
  }

  selectProof(entry: any): void {
    const name = entryName(entry);
    if (!name) {
      return;
    }
    this.selectedProof = name;
    this.loadingReading = true;
    this.reading = null;
    this.readingError = null;
    this.epistemics.getProofReading(name).subscribe({
      next: (report) => {
        this.reading = report;
        this.loadingReading = false;
      },
      error: (err) => {
        this.readingError = err?.error?.error || `No proof reading for '${name}'.`;
        this.loadingReading = false;
      },
    });
    this.loadingByBasis = true;
    this.byBasis = null;
    this.byBasisError = null;
    this.epistemics.getProofReadingByBasis(name).subscribe({
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
}
