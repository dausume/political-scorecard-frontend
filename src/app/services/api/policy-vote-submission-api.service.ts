import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';
import { ApiResponse } from '../../models/polari-vote/polari-vote-types';
import {
  KeycloakUserRef,
  PoliticianAuthorizations,
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

  /** Admin-only (403 otherwise) — every politician's authorized-submitter
   *  group with its current members. */
  listAuthorizations(): Observable<PoliticianAuthorizations[]> {
    return this.http.get<ApiResponse<PoliticianAuthorizations[]>>(
      `${this.API_URL}/authorizations`)
      .pipe(map(response => response.data));
  }

  /** Admin-only — removes a user from a politician's authorized-submitter
   *  group (the undo of `authorizeStaff`). */
  revokeStaff(politicianName: string, username: string): Observable<ApiResponse<StaffAuthorization>> {
    return this.http.post<ApiResponse<StaffAuthorization>>(
      `${this.API_URL}/revoke-staff`, { politicianName, username });
  }

  /** Admin-only — who currently holds ROLE_policy-voting-admin. */
  listAdmins(): Observable<KeycloakUserRef[]> {
    return this.http.get<ApiResponse<KeycloakUserRef[]>>(`${this.API_URL}/admins`)
      .pipe(map(response => response.data));
  }
}
