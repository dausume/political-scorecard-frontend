import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';
import { ApiResponse } from '../../models/polari-vote/polari-vote-types';
import { ScoreAssertionSubmission } from '../../models/score-assertion/score-assertion-submission-types';

/**
 * Client for PSC's OWN authenticated ScoreAssertion-submission
 * backend (2026-07-14 general-scoring follow-up). Built from
 * `environment.backendUri`, matching `polari-vote-api.service.ts` —
 * `auth.interceptor.ts` attaches the Keycloak bearer token
 * automatically, no manual token code needed here either.
 */
@Injectable({ providedIn: 'root' })
export class ScoreAssertionApiService {
  private readonly API_URL = `${environment.backendUri}api/score-assertions`;

  constructor(private http: HttpClient) {}

  /** Requires authentication — PSC's backend resolves the real
   *  submitter id from the JWT and ignores/overwrites anything sent
   *  here. Always lands in Polari at status='asserted', never
   *  pre-confirmed — zero live scoring effect until reviewed. */
  submit(submission: ScoreAssertionSubmission): Observable<ApiResponse<ScoreAssertionSubmission>> {
    return this.http.post<ApiResponse<ScoreAssertionSubmission>>(`${this.API_URL}/submit`, submission);
  }
}
