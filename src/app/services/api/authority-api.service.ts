import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';
import { ApiResponse } from './contexts-api.service';

/** One registered Polari instance (PSC-side registry row). */
export interface PolariInstance {
  id: string;
  name: string;
  baseUrl: string;
  description: string;
  status: string;
  createdAt?: string;
}

/** The PSC side of a group↔instance binding. */
export interface GroupInstanceBinding {
  id: string;
  groupName: string;
  groupType: string;
  instanceName: string;
  polariBindingName: string;
  status: string;
  createdBySub: string;
  createdByUsername: string;
  createdAt?: string;
  confirmedAt?: string;
}

/** Provenance of an admitted term: asserted by group X via instance Y. */
export interface TermProvenance {
  id: string;
  termId: string;
  termName: string;
  contextName: string;
  groupName: string;
  instanceName: string;
  signalName: string;
  requestedBy: string;
  verdictJson: string;
  admittedAt?: string;
}

/** One named check inside a Polari authority verdict. */
export interface AuthorityCheck {
  check: string;
  passed: boolean;
  evidence: unknown;
}

/** Polari's evidence-bearing authority/admission verdict. */
export interface AuthorityVerdict {
  ok: boolean;
  authorized?: boolean;
  admitted?: boolean;
  checks?: AuthorityCheck[];
  failedChecks?: string[];
  error?: string;
  [key: string]: unknown;
}

/**
 * Client for the group↔instance authority surface. Everything goes
 * through PSC's OWN backend (`/api/authority/...`): reads hit PSC's
 * registry/bindings/provenance tables; Polari-mutating calls are
 * authenticated proxies that FORWARD the caller's bearer token so
 * Polari's Keycloak middleware re-verifies the same person before
 * its authority rules run. Browsers never write to Polari directly.
 */
@Injectable({ providedIn: 'root' })
export class AuthorityApiService {
  private readonly API_URL = `${environment.backendUri}api/authority`;

  constructor(private http: HttpClient) {}

  // ---------------- PSC-side registry + bindings ---------------- //

  getInstances(): Observable<PolariInstance[]> {
    return this.http.get<ApiResponse<PolariInstance[]>>(`${this.API_URL}/instances`)
      .pipe(map(response => response.data));
  }

  registerInstance(instance: Partial<PolariInstance>): Observable<ApiResponse<PolariInstance>> {
    return this.http.post<ApiResponse<PolariInstance>>(`${this.API_URL}/instances`, instance);
  }

  getBindings(): Observable<GroupInstanceBinding[]> {
    return this.http.get<ApiResponse<GroupInstanceBinding[]>>(`${this.API_URL}/bindings`)
      .pipe(map(response => response.data));
  }

  /** Creates the PSC side and remote-confirms the Polari side in one
   *  act — succeeds only when the binding was already PROPOSED on
   *  Polari by someone authoritative on both the group and the
   *  instance. */
  createBinding(groupName: string, groupType: string, instanceName: string): Observable<AuthorityVerdict> {
    return this.http.post<AuthorityVerdict>(`${this.API_URL}/bindings`,
      { groupName, groupType, instanceName });
  }

  getProvenance(termId?: string): Observable<TermProvenance[]> {
    let params = new HttpParams();
    if (termId) {
      params = params.set('termId', termId);
    }
    return this.http.get<ApiResponse<TermProvenance[]>>(`${this.API_URL}/provenance`, { params })
      .pipe(map(response => response.data));
  }

  // ---------------- The signal ---------------- //

  /** "We want to make this term available for this context on the
   *  PSC" — admitted only when Polari's three-check verdict passes. */
  submitTermAvailability(signal: {
    termName: string; contextName: string; groupName: string;
    instanceName: string; conceptName?: string; description?: string;
    category?: string;
  }): Observable<AuthorityVerdict> {
    return this.http.post<AuthorityVerdict>(`${this.API_URL}/signals/term-availability`, signal);
  }

  // ---------------- Authenticated proxies to Polari ---------------- //

  polariGroupGrant(instanceName: string, body: {
    group_name: string; subject: string; username?: string; role: string; notes?: string;
  }): Observable<AuthorityVerdict> {
    return this.http.post<AuthorityVerdict>(
      `${this.API_URL}/polari/${instanceName}/groups/grant`, body);
  }

  polariInstanceGrant(instanceName: string, body: {
    instance_name?: string; subject: string; username?: string; role: string; notes?: string;
  }): Observable<AuthorityVerdict> {
    return this.http.post<AuthorityVerdict>(
      `${this.API_URL}/polari/${instanceName}/instances/grant`, body);
  }

  polariBindingPropose(instanceName: string, body: {
    group_name: string; instance_name?: string; notes?: string;
  }): Observable<AuthorityVerdict> {
    return this.http.post<AuthorityVerdict>(
      `${this.API_URL}/polari/${instanceName}/bindings/propose`, body);
  }

  polariReport(instanceName: string, filters: {
    group?: string; instance?: string; subject?: string;
  } = {}): Observable<AuthorityVerdict> {
    let params = new HttpParams();
    if (filters.group) params = params.set('group', filters.group);
    if (filters.instance) params = params.set('instance', filters.instance);
    if (filters.subject) params = params.set('subject', filters.subject);
    return this.http.get<AuthorityVerdict>(
      `${this.API_URL}/polari/${instanceName}/report`, { params });
  }
}
