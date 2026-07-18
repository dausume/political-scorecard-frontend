import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

/** Raw governance verdict — these endpoints do NOT use the
 *  `ApiResponse` envelope; the backend answers `{ok, ...}` directly
 *  (mirroring Polari's own evidence-bearing verdict shape). */
export interface GovernanceResult {
  ok: boolean;
  name?: string;
  voteName?: string;
  voter?: string;
  error?: string;
  [key: string]: unknown;
}

/** Body for creating a LogicForkVote (mechanism C). */
export interface LogicForkVoteCreate {
  name: string;
  display_name?: string;
  description?: string;
  decision_procedure_name?: string;
  fork_name: string;
  candidate_criterion_names: string[];
  mode: 'approval' | 'sole' | 'ranked-condorcet';
  opens_date?: string;
  closes_date?: string;
  notes?: string;
}

/** Body for casting a ballot — which field matters depends on the
 *  vote's mode; the voter is derived server-side from the token. */
export interface LogicForkBallotCreate {
  approvals?: string[];
  sole_choice?: string;
  ranking?: string[];
  notes?: string;
}

/** Body for adding a DecisionProcedureEdge. Exactly one of
 *  `to_fork`/`to_terminal` should be set; an empty `from_fork`
 *  marks the procedure's START edge. */
export interface DecisionProcedureEdgeCreate {
  name: string;
  decision_procedure_name: string;
  from_fork?: string;
  from_outcome?: string;
  to_fork?: string;
  to_terminal?: string;
  description?: string;
}

/**
 * Client for PSC's authenticated mechanism-C governance surface
 * (`/api/governance/*`): creating logic-fork votes, casting ballots
 * on them, and wiring decision-procedure edges. All three are
 * login-gated server-side (401 when anonymous) — the bearer token is
 * attached by `auth.interceptor.ts` like every other API service.
 */
@Injectable({ providedIn: 'root' })
export class GovernanceApiService {
  private readonly API_URL = `${environment.backendUri}api/governance`;

  constructor(private http: HttpClient) {}

  createLogicForkVote(body: LogicForkVoteCreate): Observable<GovernanceResult> {
    return this.http.post<GovernanceResult>(`${this.API_URL}/logic-fork-votes`, body);
  }

  castLogicForkBallot(voteName: string, body: LogicForkBallotCreate): Observable<GovernanceResult> {
    return this.http.post<GovernanceResult>(
      `${this.API_URL}/logic-fork-votes/${encodeURIComponent(voteName)}/ballots`, body);
  }

  createProcedureEdge(body: DecisionProcedureEdgeCreate): Observable<GovernanceResult> {
    return this.http.post<GovernanceResult>(`${this.API_URL}/decision-procedure-edges`, body);
  }
}
