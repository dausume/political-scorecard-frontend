import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { forkJoin } from 'rxjs';
import { PolariScoringService } from '../../services/polari/polari-scoring.service';
import {
  ScoreConceptSummary,
  PolariScoreSubjectSummary,
  PolariScoreGroupSummary,
} from '../../models/polari-scoring/polari-scoring-types';

/**
 * Landing page for the general-scoring surface (2026-07-14): policy
 * scoring, politician scoring, and cohort reports all have real,
 * working backend endpoints (`policy_scoring.py`/
 * `politician_scoring.py`) but NO dedicated "list of policies" or
 * "list of politicians" backend route exists — so this page discovers
 * real names via Polari's generic CRUDE `GET /ScoreSubject`/
 * `GET /ScoreGroup` reads (`getScoreSubjects`/`getScoreGroups`)
 * instead of asking a citizen to already know an exact subject name.
 *
 * Every score below is concept-relative (Polari's engine scores a
 * subject FOR a concept, not in the abstract), so a single concept
 * picker at the top drives all three lists' outgoing links.
 */
@Component({
  selector: 'app-polari-accountability-hub',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './polari-accountability-hub.component.html',
  styleUrl: './polari-accountability-hub.component.scss',
})
export class PolariAccountabilityHubComponent implements OnInit {
  concepts: ScoreConceptSummary[] = [];
  policies: PolariScoreSubjectSummary[] = [];
  politicians: PolariScoreSubjectSummary[] = [];
  cohorts: PolariScoreGroupSummary[] = [];

  selectedConcept = '';
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private polariScoring: PolariScoringService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = null;
    forkJoin({
      concepts: this.polariScoring.getConcepts(),
      policies: this.polariScoring.getScoreSubjects('policy'),
      politicians: this.polariScoring.getScoreSubjects('politician'),
      groups: this.polariScoring.getScoreGroups(),
    }).subscribe({
      next: ({ concepts, policies, politicians, groups }) => {
        this.concepts = concepts;
        this.policies = policies;
        this.politicians = politicians;
        this.cohorts = groups.filter(g => g.memberSubjectNames.length > 0);
        this.selectedConcept = concepts[0]?.name || '';
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not reach Polari’s scoring engine — '
          + (err?.message || 'unknown error');
        this.loading = false;
      },
    });
  }

  goToPolicy(policyName: string): void {
    this.router.navigate(['/policy-scores', policyName], {
      queryParams: { concept: this.selectedConcept },
    });
  }

  goToPolitician(politicianName: string): void {
    this.router.navigate(['/politician-scores', politicianName], {
      queryParams: { concept: this.selectedConcept },
    });
  }

  goToCohort(groupName: string): void {
    this.router.navigate(['/cohort-reports', groupName], {
      queryParams: { concept: this.selectedConcept },
    });
  }
}
