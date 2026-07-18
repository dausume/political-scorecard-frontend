import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolariEpistemicsService, PolariReport } from '../../../services/polari/polari-epistemics.service';
import { PolariReportViewComponent } from '../polari-report-view/polari-report-view.component';
import { entryName, entryStatus, extractReportList } from '../report-list.util';

/**
 * Legislation trust: policy drafts (with per-draft carryover),
 * venue-mismatch patterns, and legislation tracking with per-record
 * contributions + burial checks and a legislator voting-record lookup.
 */
@Component({
  selector: 'app-legislation-trust-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule,
    MatInputModule, MatProgressSpinnerModule, PolariReportViewComponent,
  ],
  templateUrl: './legislation-trust-page.component.html',
  styleUrls: ['./legislation-trust-page.component.scss'],
})
export class LegislationTrustPageComponent implements OnInit {
  draftsReport: PolariReport | null = null;
  draftList: any[] | null = null;
  draftsError: string | null = null;
  loadingDrafts = true;
  selectedDraft: string | null = null;
  carryover: PolariReport | null = null;
  carryoverError: string | null = null;
  loadingCarryover = false;

  venuePatterns: PolariReport | null = null;
  venuePatternsError: string | null = null;
  loadingVenuePatterns = true;

  legislationReport: PolariReport | null = null;
  legislationList: any[] | null = null;
  legislationError: string | null = null;
  loadingLegislation = true;
  selectedRecord: string | null = null;
  contributions: PolariReport | null = null;
  contributionsError: string | null = null;
  loadingContributions = false;
  burial: PolariReport | null = null;
  burialError: string | null = null;
  loadingBurial = false;

  legislator = '';
  votingRecord: PolariReport | null = null;
  votingRecordError: string | null = null;
  loadingVotingRecord = false;

  entryName = entryName;
  entryStatus = entryStatus;

  constructor(private epistemics: PolariEpistemicsService) {}

  ngOnInit(): void {
    this.epistemics.getDrafts().subscribe({
      next: (report) => {
        this.draftsReport = report;
        this.draftList = extractReportList(report, ['drafts', 'policyDrafts', 'items', 'records']);
        this.loadingDrafts = false;
      },
      error: (err) => {
        this.draftsError = err?.error?.error || 'Policy drafts unavailable.';
        this.loadingDrafts = false;
      },
    });
    this.epistemics.getVenuePatterns().subscribe({
      next: (report) => {
        this.venuePatterns = report;
        this.loadingVenuePatterns = false;
      },
      error: (err) => {
        this.venuePatternsError = err?.error?.error || 'Venue-mismatch patterns unavailable.';
        this.loadingVenuePatterns = false;
      },
    });
    this.epistemics.getLegislation().subscribe({
      next: (report) => {
        this.legislationReport = report;
        this.legislationList = extractReportList(report, ['legislation', 'records', 'bills', 'items']);
        this.loadingLegislation = false;
      },
      error: (err) => {
        this.legislationError = err?.error?.error || 'Legislation tracking unavailable.';
        this.loadingLegislation = false;
      },
    });
  }

  selectDraft(entry: any): void {
    const name = entryName(entry);
    if (!name) {
      return;
    }
    this.selectedDraft = name;
    this.loadingCarryover = true;
    this.carryover = null;
    this.carryoverError = null;
    this.epistemics.getDraftCarryover(name).subscribe({
      next: (report) => {
        this.carryover = report;
        this.loadingCarryover = false;
      },
      error: (err) => {
        this.carryoverError = err?.error?.error || `No carryover report for draft '${name}'.`;
        this.loadingCarryover = false;
      },
    });
  }

  selectRecord(entry: any): void {
    const name = entryName(entry);
    if (!name) {
      return;
    }
    this.selectedRecord = name;
    this.loadingContributions = true;
    this.contributions = null;
    this.contributionsError = null;
    this.epistemics.getLegislationContributions(name).subscribe({
      next: (report) => {
        this.contributions = report;
        this.loadingContributions = false;
      },
      error: (err) => {
        this.contributionsError = err?.error?.error || `No contributions for '${name}'.`;
        this.loadingContributions = false;
      },
    });
    this.loadingBurial = true;
    this.burial = null;
    this.burialError = null;
    this.epistemics.getLegislationBurial(name).subscribe({
      next: (report) => {
        this.burial = report;
        this.loadingBurial = false;
      },
      error: (err) => {
        this.burialError = err?.error?.error || `No burial check for '${name}'.`;
        this.loadingBurial = false;
      },
    });
  }

  loadVotingRecord(): void {
    const name = this.legislator.trim();
    if (!name) {
      return;
    }
    this.loadingVotingRecord = true;
    this.votingRecord = null;
    this.votingRecordError = null;
    this.epistemics.getLegislatorVotingRecord(name).subscribe({
      next: (report) => {
        this.votingRecord = report;
        this.loadingVotingRecord = false;
      },
      error: (err) => {
        this.votingRecordError = err?.error?.error || `No voting record for '${name}'.`;
        this.loadingVotingRecord = false;
      },
    });
  }
}
