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
 * Term competition: pick a ScoreConcept and read how its competing
 * terms stand against each other, plus a lookup for the relations any
 * single term participates in.
 */
@Component({
  selector: 'app-term-competition-page',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule,
    MatInputModule, MatSelectModule, MatProgressSpinnerModule,
    PolariReportViewComponent,
  ],
  templateUrl: './term-competition-page.component.html',
  styleUrls: ['./term-competition-page.component.scss'],
})
export class TermCompetitionPageComponent implements OnInit {
  concepts: string[] = [];
  conceptsError: string | null = null;
  loadingConcepts = true;

  concept = '';
  competition: PolariReport | null = null;
  competitionError: string | null = null;
  loadingCompetition = false;

  term = '';
  relations: PolariReport | null = null;
  relationsError: string | null = null;
  loadingRelations = false;

  constructor(private epistemics: PolariEpistemicsService) {}

  ngOnInit(): void {
    this.epistemics.getClassRows('ScoreConcept').subscribe({
      next: (rows) => {
        this.concepts = rows
          .map((row) => row?.name)
          .filter((name): name is string => typeof name === 'string' && name.length > 0)
          .sort();
        this.loadingConcepts = false;
      },
      error: (err) => {
        this.conceptsError = err?.error?.error || 'ScoreConcept rows unavailable.';
        this.loadingConcepts = false;
      },
    });
  }

  loadCompetition(): void {
    if (!this.concept) {
      return;
    }
    this.loadingCompetition = true;
    this.competition = null;
    this.competitionError = null;
    this.epistemics.getTermCompetitionReport(this.concept).subscribe({
      next: (report) => {
        this.competition = report;
        this.loadingCompetition = false;
      },
      error: (err) => {
        this.competitionError = err?.error?.error || `No term-competition report for '${this.concept}'.`;
        this.loadingCompetition = false;
      },
    });
  }

  loadRelations(): void {
    const term = this.term.trim();
    if (!term) {
      return;
    }
    this.loadingRelations = true;
    this.relations = null;
    this.relationsError = null;
    this.epistemics.getTermRelations(term).subscribe({
      next: (report) => {
        this.relations = report;
        this.loadingRelations = false;
      },
      error: (err) => {
        this.relationsError = err?.error?.error || `No relations found for term '${term}'.`;
        this.loadingRelations = false;
      },
    });
  }
}
