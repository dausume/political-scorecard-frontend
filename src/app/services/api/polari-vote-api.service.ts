import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';
import {
  ApiResponse,
  PolariVoteResults,
  PolariVoteTopicDTO,
  WorldviewVoteDTO,
} from '../../models/polari-vote/polari-vote-types';

/**
 * Client for PSC's OWN ballot-casting backend (2026-07-14
 * architecture move — see DEMOCRATIC_SCORECARD_REVAMP_PLAN.md's
 * "Architecture correction"). `API_URL` is built from
 * `environment.backendUri`, matching every other authenticated PSC
 * API service in this app (e.g. `worldview-ballots-api.service.ts`)
 * — `auth.interceptor.ts` attaches the Keycloak bearer token
 * automatically to any request whose URL matches `backendUri`/
 * `/api/`, so `castVote()` needs no manual auth header code.
 */
@Injectable({ providedIn: 'root' })
export class PolariVoteApiService {
  private readonly API_URL = `${environment.backendUri}api/polari-votes`;

  constructor(private http: HttpClient) {}

  getAllTopics(): Observable<PolariVoteTopicDTO[]> {
    return this.http.get<ApiResponse<PolariVoteTopicDTO[]>>(`${this.API_URL}/all`)
      .pipe(map(response => response.data));
  }

  getTopicById(id: string): Observable<PolariVoteTopicDTO> {
    return this.http.get<ApiResponse<PolariVoteTopicDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  /** Requires authentication — the interceptor attaches the bearer
   *  token; the backend resolves the real voter id from it server-
   *  side and ignores/overwrites anything sent here. */
  castVote(topicId: string, vote: Partial<WorldviewVoteDTO>): Observable<ApiResponse<WorldviewVoteDTO>> {
    return this.http.post<ApiResponse<WorldviewVoteDTO>>(`${this.API_URL}/${topicId}/ballots`, vote);
  }

  /** PSC-side raw-count preview — NOT the real weighted tally. */
  getResults(topicId: string): Observable<PolariVoteResults> {
    return this.http.get<ApiResponse<PolariVoteResults>>(`${this.API_URL}/${topicId}/results`)
      .pipe(map(response => response.data));
  }

  /** Not role-gated on the backend today (matches an existing,
   *  already-accepted gap on WorldviewElectionController's own
   *  create endpoint) — exposed here as a plain action, not hidden
   *  behind a role check this app doesn't enforce anywhere yet. */
  closeTopic(topicId: string): Observable<ApiResponse<PolariVoteTopicDTO>> {
    return this.http.post<ApiResponse<PolariVoteTopicDTO>>(`${this.API_URL}/${topicId}/close`, {});
  }

  /** Replays this topic's ballots into Polari and applies the result
   *  — "the derivative goes back to Polari to be resolved." */
  syncToPolari(topicId: string): Observable<ApiResponse<PolariVoteTopicDTO>> {
    return this.http.post<ApiResponse<PolariVoteTopicDTO>>(`${this.API_URL}/${topicId}/sync`, {});
  }
}
