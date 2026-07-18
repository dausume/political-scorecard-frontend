import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

/** Polari court-case verdict/report envelope (passthrough). */
export interface CourtCaseReport {
  ok: boolean;
  error?: string;
  case?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Client for PSC's court-case proxy (/api/court-cases): creation and
 * fork-by-fork advancement are authenticated writes that PSC forwards
 * to Polari with the caller's own bearer token; reads are public.
 */
@Injectable({ providedIn: 'root' })
export class CourtCaseApiService {
  private readonly API_URL = `${environment.backendUri}api/court-cases`;

  constructor(private http: HttpClient) {}

  createCase(body: {
    name: string; decision_procedure_name: string;
    initial_context?: Record<string, unknown>;
    adjudicator_type?: string; adjudicator_name?: string;
    jurisdiction_subject_name?: string; notes?: string;
  }): Observable<CourtCaseReport> {
    return this.http.post<CourtCaseReport>(this.API_URL, body);
  }

  advanceCase(name: string, determination: unknown, suppliedBy: string): Observable<CourtCaseReport> {
    return this.http.post<CourtCaseReport>(
      `${this.API_URL}/${encodeURIComponent(name)}/advance`,
      { determination, supplied_by: suppliedBy });
  }

  caseReport(name: string): Observable<CourtCaseReport> {
    return this.http.get<CourtCaseReport>(`${this.API_URL}/${encodeURIComponent(name)}`);
  }
}
