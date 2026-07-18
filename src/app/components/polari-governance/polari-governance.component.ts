import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AppState } from '../../state/app.state';
import * as AuthSelectors from '../../state/selectors/auth.selectors';
import { AuthUser } from '../../classes/auth-user';
import {
  DecisionProcedureEdgeCreate,
  GovernanceApiService,
  GovernanceResult,
  LogicForkVoteCreate,
} from '../../services/api/governance-api.service';
import { PolariEpistemicsService } from '../../services/polari/polari-epistemics.service';
import { PolariReportViewComponent } from '../polari-epistemics/polari-report-view/polari-report-view.component';

type VoteMode = 'approval' | 'sole' | 'ranked-condorcet';

/**
 * Mechanism-C CREATE surfaces: open a LogicForkVote over a fork's
 * candidate criteria, cast mode-aware ballots on it, and wire
 * DecisionProcedureEdges — the write-side companions to the
 * read-only results page at /polari-logic-fork-votes/:name. Reads
 * come straight off Polari's generic class rows; every write goes
 * through PSC's authenticated /api/governance proxies.
 */
@Component({
  selector: 'app-polari-governance',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterModule, MatCardModule, MatButtonModule,
    MatCheckboxModule, MatFormFieldModule, MatInputModule, MatSelectModule,
    MatProgressSpinnerModule, PolariReportViewComponent,
  ],
  templateUrl: './polari-governance.component.html',
  styleUrls: ['./polari-governance.component.scss'],
})
export class PolariGovernanceComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  user$: Observable<AuthUser | null>;

  // -------- open votes list -------- //
  votes: any[] = [];
  loadingVotes = false;
  votesError: string | null = null;
  selectedVote: any | null = null;

  // -------- ballot casting -------- //
  candidates: string[] = [];
  approvals = new Set<string>();
  soleChoice = '';
  ranking: string[] = [];
  ballotNotes = '';
  castingBallot = false;
  ballotResult: GovernanceResult | null = null;
  ballotError: string | null = null;

  // -------- known criteria/forks (for the create form) -------- //
  criterionNames: string[] = [];
  knownForks: string[] = [];
  loadingCriteria = false;
  criteriaError: string | null = null;

  // -------- create-vote form -------- //
  voteForm = {
    name: '', display_name: '', description: '', decision_procedure_name: '',
    fork_name: '', mode: 'approval' as VoteMode, opens_date: '',
    closes_date: '', notes: '',
  };
  selectedCandidates: string[] = [];
  extraCandidate = '';
  extraCandidates: string[] = [];
  creatingVote = false;
  createVoteResult: GovernanceResult | null = null;
  createVoteError: string | null = null;

  // -------- decision-procedure edge form -------- //
  edgeForm: DecisionProcedureEdgeCreate = {
    name: '', decision_procedure_name: '', from_fork: '', from_outcome: '',
    to_fork: '', to_terminal: '', description: '',
  };
  knownProcedures: string[] = [];
  creatingEdge = false;
  edgeResult: GovernanceResult | null = null;
  edgeError: string | null = null;

  constructor(
    private governanceApi: GovernanceApiService,
    private epistemics: PolariEpistemicsService,
    private store: Store<AppState>,
  ) {
    this.isAuthenticated$ = this.store.select(AuthSelectors.selectIsAuthenticated);
    this.user$ = this.store.select(AuthSelectors.selectAuthUser);
  }

  ngOnInit(): void {
    this.loadVotes();
    this.loadCriteria();
    this.loadProcedureNames();
  }

  // ---------------- loads ---------------- //

  loadVotes(): void {
    this.loadingVotes = true;
    this.votesError = null;
    this.epistemics.getClassRows('LogicForkVote').subscribe({
      next: (rows) => {
        this.votes = rows;
        this.loadingVotes = false;
      },
      error: (err) => {
        this.votesError = err?.error?.error || 'Could not load LogicForkVote rows from Polari.';
        this.loadingVotes = false;
      },
    });
  }

  private loadCriteria(): void {
    this.loadingCriteria = true;
    this.criteriaError = null;
    this.epistemics.getClassRows('LogicForkCriterion').subscribe({
      next: (rows) => {
        this.criterionNames = Array.from(new Set(
          rows.map((row) => row?.name).filter((name) => typeof name === 'string' && name),
        )).sort();
        this.knownForks = this.distinctField(rows, ['fork_name', 'forkName', 'fork']);
        this.loadingCriteria = false;
      },
      error: (err) => {
        this.criteriaError = err?.error?.error
          || 'Could not load LogicForkCriterion rows — enter fork/criteria names manually.';
        this.loadingCriteria = false;
      },
    });
  }

  private loadProcedureNames(): void {
    this.epistemics.getClassRows('DecisionProcedureEdge').subscribe({
      next: (rows) => {
        this.knownProcedures = this.distinctField(rows, ['decision_procedure_name']);
      },
      // Silent: known procedures are only a convenience for the edge
      // form's dropdown — free text still works without them.
      error: () => {},
    });
  }

  /** Rows may spell a field several ways — collect distinct values
   *  from whichever of the candidate keys each row actually has. */
  private distinctField(rows: any[], keys: string[]): string[] {
    const found = new Set<string>();
    for (const row of rows || []) {
      if (!row || typeof row !== 'object') {
        continue;
      }
      for (const key of keys) {
        const value = row[key];
        if (typeof value === 'string' && value) {
          found.add(value);
          break;
        }
      }
    }
    return Array.from(found).sort();
  }

  // ---------------- vote selection + ballot ---------------- //

  selectVote(vote: any): void {
    this.selectedVote = vote;
    this.candidates = this.parseCandidates(vote);
    this.approvals.clear();
    this.soleChoice = '';
    this.ranking = [];
    this.ballotNotes = '';
    this.ballotResult = null;
    this.ballotError = null;
  }

  private parseCandidates(vote: any): string[] {
    const raw = vote?.candidate_criterion_names_json;
    if (Array.isArray(raw)) {
      return raw.filter((name) => typeof name === 'string');
    }
    if (typeof raw === 'string' && raw) {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((name: unknown) => typeof name === 'string') : [];
      } catch {
        return [];
      }
    }
    return [];
  }

  toggleApproval(candidate: string, checked: boolean): void {
    if (checked) {
      this.approvals.add(candidate);
    } else {
      this.approvals.delete(candidate);
    }
  }

  addToRanking(candidate: string): void {
    if (!this.ranking.includes(candidate)) {
      this.ranking.push(candidate);
    }
  }

  resetRanking(): void {
    this.ranking = [];
  }

  get ballotReady(): boolean {
    const mode = this.selectedVote?.mode;
    if (mode === 'approval') {
      return this.approvals.size > 0;
    }
    if (mode === 'sole') {
      return !!this.soleChoice;
    }
    if (mode === 'ranked-condorcet') {
      return this.ranking.length > 0;
    }
    return false;
  }

  castBallot(): void {
    if (!this.selectedVote || !this.ballotReady) {
      return;
    }
    const mode = this.selectedVote.mode;
    const body: any = { notes: this.ballotNotes || undefined };
    if (mode === 'approval') {
      body.approvals = Array.from(this.approvals);
    } else if (mode === 'sole') {
      body.sole_choice = this.soleChoice;
    } else {
      body.ranking = [...this.ranking];
    }
    this.castingBallot = true;
    this.ballotResult = null;
    this.ballotError = null;
    this.governanceApi.castLogicForkBallot(this.selectedVote.name, body).subscribe({
      next: (result) => {
        this.castingBallot = false;
        if (result?.ok) {
          this.ballotResult = result;
        } else {
          this.ballotError = result?.error || 'Ballot rejected.';
        }
      },
      error: (err) => {
        this.castingBallot = false;
        this.ballotError = err?.error?.error || err?.message || 'Could not cast the ballot.';
      },
    });
  }

  // ---------------- create a vote ---------------- //

  addExtraCandidate(): void {
    const name = this.extraCandidate.trim();
    if (name && !this.extraCandidates.includes(name) && !this.selectedCandidates.includes(name)) {
      this.extraCandidates.push(name);
    }
    this.extraCandidate = '';
  }

  removeExtraCandidate(name: string): void {
    this.extraCandidates = this.extraCandidates.filter((candidate) => candidate !== name);
  }

  get allChosenCandidates(): string[] {
    return Array.from(new Set([...this.selectedCandidates, ...this.extraCandidates]));
  }

  get voteFormReady(): boolean {
    return !!(this.voteForm.name.trim() && this.voteForm.fork_name.trim()
      && this.voteForm.mode && this.allChosenCandidates.length > 0);
  }

  createVote(): void {
    if (!this.voteFormReady) {
      return;
    }
    const body: LogicForkVoteCreate = {
      name: this.voteForm.name.trim(),
      display_name: this.voteForm.display_name.trim() || undefined,
      description: this.voteForm.description.trim() || undefined,
      decision_procedure_name: this.voteForm.decision_procedure_name.trim() || undefined,
      fork_name: this.voteForm.fork_name.trim(),
      candidate_criterion_names: this.allChosenCandidates,
      mode: this.voteForm.mode,
      opens_date: this.voteForm.opens_date.trim() || undefined,
      closes_date: this.voteForm.closes_date.trim() || undefined,
      notes: this.voteForm.notes.trim() || undefined,
    };
    this.creatingVote = true;
    this.createVoteResult = null;
    this.createVoteError = null;
    this.governanceApi.createLogicForkVote(body).subscribe({
      next: (result) => {
        this.creatingVote = false;
        if (result?.ok) {
          this.createVoteResult = result;
          this.loadVotes();
        } else {
          this.createVoteError = result?.error || 'Vote creation failed.';
        }
      },
      error: (err) => {
        this.creatingVote = false;
        this.createVoteError = err?.error?.error || err?.message || 'Could not create the vote.';
      },
    });
  }

  // ---------------- decision-procedure edge ---------------- //

  get edgeFormReady(): boolean {
    return !!(this.edgeForm.name.trim() && this.edgeForm.decision_procedure_name.trim());
  }

  createEdge(): void {
    if (!this.edgeFormReady) {
      return;
    }
    const body: DecisionProcedureEdgeCreate = {
      name: this.edgeForm.name.trim(),
      decision_procedure_name: this.edgeForm.decision_procedure_name.trim(),
      from_fork: this.edgeForm.from_fork?.trim() || undefined,
      from_outcome: this.edgeForm.from_outcome?.trim() || undefined,
      to_fork: this.edgeForm.to_fork?.trim() || undefined,
      to_terminal: this.edgeForm.to_terminal?.trim() || undefined,
      description: this.edgeForm.description?.trim() || undefined,
    };
    this.creatingEdge = true;
    this.edgeResult = null;
    this.edgeError = null;
    this.governanceApi.createProcedureEdge(body).subscribe({
      next: (result) => {
        this.creatingEdge = false;
        if (result?.ok) {
          this.edgeResult = result;
        } else {
          // Verbatim: the backend's error names the exact rule broken
          // (e.g. both to_fork and to_terminal set).
          this.edgeError = result?.error || 'Edge creation failed.';
        }
      },
      error: (err) => {
        this.creatingEdge = false;
        this.edgeError = err?.error?.error || err?.message || 'Could not create the edge.';
      },
    });
  }
}
