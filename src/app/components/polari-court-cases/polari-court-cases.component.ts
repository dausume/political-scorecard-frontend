import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { CourtCaseApiService, CourtCaseReport } from '../../services/api/court-case-api.service';
import { PolariEpistemicsService } from '../../services/polari/polari-epistemics.service';
import { selectAuthUser, selectIsAuthenticated } from '../../state/selectors/auth.selectors';
import { PolariReportViewComponent } from '../polari-epistemics/polari-report-view/polari-report-view.component';

/**
 * Court cases (ncg-2): disputes advanced fork-by-fork through
 * compiled no-code decision procedures. Reads come straight off
 * Polari (case rows + reports); create/advance are authenticated
 * writes proxied through PSC's backend with the caller's own token —
 * the adjudicator's determinations and the full execution log stay
 * inspectable at every step.
 */
@Component({
  selector: 'app-polari-court-cases',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule,
    MatInputModule, MatSelectModule, MatProgressSpinnerModule,
    PolariReportViewComponent,
  ],
  templateUrl: './polari-court-cases.component.html',
  styleUrls: ['./polari-court-cases.component.scss'],
})
export class PolariCourtCasesComponent implements OnInit, OnDestroy {
  cases: any[] = [];
  procedures: string[] = [];
  loading = true;
  error: string | null = null;

  selectedName = '';
  report: CourtCaseReport | null = null;
  loadingReport = false;

  isAuthenticated$: Observable<boolean>;
  private username = '';
  private sub?: Subscription;

  newCase = {
    name: '',
    decision_procedure_name: '',
    adjudicator_type: 'judge',
    adjudicator_name: '',
    notes: '',
  };
  createResult: CourtCaseReport | null = null;

  advanceDetermination = '';
  advanceResult: CourtCaseReport | null = null;

  constructor(
    private courtCaseApi: CourtCaseApiService,
    private epistemics: PolariEpistemicsService,
    private store: Store,
  ) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.sub = this.store.select(selectAuthUser).subscribe((user) => {
      this.username = user?.username || '';
      if (user && !this.newCase.adjudicator_name) {
        this.newCase.adjudicator_name = this.username;
      }
    });
  }

  ngOnInit(): void {
    this.reload();
    // Compiled decision procedures live as GraphCompilerDefinition-
    // compiled solutions; offer the known solution names as hints.
    this.epistemics.getClassRows('SolutionDefinition').subscribe({
      next: (rows) => (this.procedures = rows.map((row: any) => row?.name).filter(Boolean).sort()),
      error: () => (this.procedures = []),
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  reload(): void {
    this.loading = true;
    this.epistemics.getClassRows('CourtCase').subscribe({
      next: (rows) => {
        this.cases = rows;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not read court cases: ' + (err?.message || 'request failed');
        this.loading = false;
      },
    });
  }

  select(name: string): void {
    this.selectedName = name;
    this.report = null;
    this.advanceResult = null;
    this.loadingReport = true;
    this.courtCaseApi.caseReport(name).subscribe({
      next: (report) => {
        this.report = report;
        this.loadingReport = false;
      },
      error: (err) => {
        this.report = err?.error || { ok: false, error: 'Report failed.' };
        this.loadingReport = false;
      },
    });
  }

  create(): void {
    this.createResult = null;
    this.courtCaseApi.createCase(this.newCase).subscribe({
      next: (result) => {
        this.createResult = result;
        if (result.ok) {
          this.reload();
          this.select(this.newCase.name);
        }
      },
      error: (err) => {
        this.createResult = err?.error || { ok: false, error: 'Create failed (login required).' };
      },
    });
  }

  advance(): void {
    if (!this.selectedName) {
      return;
    }
    let determination: unknown = this.advanceDetermination;
    try {
      determination = JSON.parse(this.advanceDetermination);
    } catch {
      // plain-string determinations are legitimate — send as typed
    }
    this.advanceResult = null;
    this.courtCaseApi.advanceCase(this.selectedName, determination, this.username).subscribe({
      next: (result) => {
        this.advanceResult = result;
        this.select(this.selectedName);
      },
      error: (err) => {
        this.advanceResult = err?.error || { ok: false, error: 'Advance failed (login required).' };
      },
    });
  }
}
