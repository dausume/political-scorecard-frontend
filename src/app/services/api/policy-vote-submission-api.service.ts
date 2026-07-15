import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';
import { ApiResponse } from '../../models/polari-vote/polari-vote-types';
import {
  PolicyVoteSubmission,
  StaffAuthorization,
} from '../../models/policy-vote/policy-vote-submission-types';

/**
 * Client for PSC's OWN authenticated PolicyVote-submission backend
 * (2026-07-14 dual-path follow-up). Built from `environment.backendUri`,
 * same pattern as `polari-vote-api.service.ts`/`score-assertion-api.service.ts`
 * — `auth.interceptor.ts` attaches the bearer token automatically.
 */
@Injectable({ providedIn: 'root' })
export class PolicyVoteSubmissionApiService {
  private readonly API_URL = `${environment.backendUri}api/policy-votes`;

  constructor(private http: HttpClient) {}

  /** Requires authentication. Whether this lands via the admin path
   *  (requires officialSourceUrl) or the staff path (Keycloak group
   *  membership) is resolved entirely server-side — never trust a
   *  client-side role check alone to gate this call, the backend
   *  re-verifies regardless. */
  submit(submission: PolicyVoteSubmission): Observable<ApiResponse<PolicyVoteSubmission>> {
    return this.http.post<ApiResponse<PolicyVoteSubmission>>(`${this.API_URL}/submit`, submission);
  }

  /** Admin-only (ROLE_policy-voting-admin) — authorizes a Keycloak
   *  user as a politician's own PolicyVote submitter. */
  authorizeStaff(authorization: StaffAuthorization): Observable<ApiResponse<StaffAuthorization>> {
    return this.http.post<ApiResponse<StaffAuthorization>>(
      `${this.API_URL}/authorize-staff`, authorization);
  }
}
