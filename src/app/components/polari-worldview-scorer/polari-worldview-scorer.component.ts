import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import {
  ConceptScoreReport,
  GroupAggregateReport,
  PolariWorldviewGroup,
} from '../../models/polari-scoring/polari-scoring-types';
import { AuthorityApiService, TermProvenance } from '../../services/api/authority-api.service';
import { PolariScoringService } from '../../services/polari/polari-scoring.service';
import { PolariReportViewComponent } from '../polari-epistemics/polari-report-view/polari-report-view.component';

interface ConceptRow {
  concept: string;
  weight: number;
  whatIfWeight: number;
  score: number | null;
  smallSample: boolean;
  error: string | null;
  report: ConceptScoreReport | null;
  expanded: boolean;
}

/**
 * The REAL worldview scorer — replaces the retired client-side
 * weighted-sum engine (worldview-scoring.service.ts). A worldview is
 * a Polari ScoreGroup's hosted concept set with the group's elected
 * weights; every score here is computed by Polari's live engine over
 * real ContextualizedValues (including terms the group asserted
 * through its authoritative instance). The what-if panel re-weights
 * LOCALLY over those real per-concept scores and is labeled as a
 * preview — the recorded group weighting only changes through the
 * election machinery.
 */
@Component({
  selector: 'app-polari-worldview-scorer',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule,
    MatInputModule, MatSelectModule, MatProgressSpinnerModule,
    PolariReportViewComponent,
  ],
  templateUrl: './polari-worldview-scorer.component.html',
  styleUrls: ['./polari-worldview-scorer.component.scss'],
})
export class PolariWorldviewScorerComponent implements OnInit {
  groups: PolariWorldviewGroup[] = [];
  loadingGroups = true;
  groupsError: string | null = null;

  selected: PolariWorldviewGroup | null = null;
  policy = '';

  aggregate: GroupAggregateReport | null = null;
  aggregateError: string | null = null;
  loadingAggregate = false;

  rows: ConceptRow[] = [];
  loadingConcepts = false;

  provenance: TermProvenance[] = [];

  constructor(
    private scoring: PolariScoringService,
    private authorityApi: AuthorityApiService,
  ) {}

  ngOnInit(): void {
    this.scoring.getWorldviewGroups().subscribe({
      next: (groups) => {
        // Only groups actually hosting a concept set are scoreable
        // worldviews; subject-cohort groups stay on their own pages.
        this.groups = groups.filter((group) => group.memberConceptNames.length > 0);
        this.loadingGroups = false;
        if (this.groups.length > 0) {
          this.select(this.groups[0]);
        }
      },
      error: (err) => {
        this.groupsError = 'Could not read ScoreGroups: ' + (err?.message || 'request failed');
        this.loadingGroups = false;
      },
    });
  }

  groupByName(name: string): PolariWorldviewGroup {
    return this.groups.find((group) => group.name === name) || this.groups[0];
  }

  select(group: PolariWorldviewGroup): void {
    this.selected = group;
    this.loadAggregate();
    this.loadConcepts(group);
    this.authorityApi.getProvenance().subscribe({
      next: (rows) => (this.provenance = (rows || []).filter(
        (row) => row.groupName === group.name)),
      error: () => (this.provenance = []),
    });
  }

  loadAggregate(): void {
    if (!this.selected) {
      return;
    }
    this.loadingAggregate = true;
    this.aggregate = null;
    this.aggregateError = null;
    this.scoring.getGroupAggregate(this.selected.name, this.policy || undefined).subscribe({
      next: (report) => {
        this.aggregate = report;
        this.loadingAggregate = false;
      },
      error: (err) => {
        this.aggregateError = err?.error?.error || 'Aggregate unavailable.';
        this.loadingAggregate = false;
      },
    });
  }

  private loadConcepts(group: PolariWorldviewGroup): void {
    this.loadingConcepts = true;
    this.rows = group.memberConceptNames.map((concept) => ({
      concept,
      weight: group.memberWeights[concept] ?? 1,
      whatIfWeight: group.memberWeights[concept] ?? 1,
      score: null,
      smallSample: false,
      error: null,
      report: null,
      expanded: false,
    }));
    forkJoin(this.rows.map((row) =>
      this.scoring.getConceptScore(row.concept).pipe(
        catchError((err) => of({ ok: false, error: err?.error?.error || 'score failed' } as any)),
      ),
    )).subscribe((reports) => {
      reports.forEach((report: any, index) => {
        const row = this.rows[index];
        row.report = report;
        if (report?.ok === false) {
          row.error = report.error || 'unavailable';
          return;
        }
        row.score = this.extractScore(report);
        row.smallSample = !!(report?.smallSample || report?.small_sample);
        if (row.score === null) {
          row.error = 'no numeric score in reading';
        }
      });
      this.loadingConcepts = false;
    });
  }

  /** Concept readings expose their number under 'score' (with
   *  null = honestly-unrated); probe close variants defensively. */
  private extractScore(report: any): number | null {
    for (const key of ['score', 'value', 'aggregate', 'weightedScore']) {
      const value = report?.[key];
      if (typeof value === 'number') {
        return value;
      }
    }
    return null;
  }

  get recordedTotal(): number | null {
    return this.total((row) => row.weight);
  }

  get whatIfTotal(): number | null {
    return this.total((row) => row.whatIfWeight);
  }

  get whatIfDiffers(): boolean {
    return this.rows.some((row) => row.whatIfWeight !== row.weight);
  }

  private total(weightOf: (row: ConceptRow) => number): number | null {
    const scored = this.rows.filter((row) => row.score !== null);
    if (scored.length === 0) {
      return null;
    }
    const weightSum = scored.reduce((sum, row) => sum + Math.abs(weightOf(row)), 0);
    if (weightSum === 0) {
      return null;
    }
    return scored.reduce((sum, row) => sum + (row.score as number) * weightOf(row), 0)
      / weightSum;
  }

  contribution(row: ConceptRow): string {
    if (row.score === null) {
      return '—';
    }
    return (row.score * row.whatIfWeight).toFixed(3);
  }

  resetWhatIf(): void {
    this.rows.forEach((row) => (row.whatIfWeight = row.weight));
  }
}
