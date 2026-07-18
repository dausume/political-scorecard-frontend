import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';

/** Generic evidence-bearing Polari verdict/report envelope. */
export interface PolariReport {
  ok: boolean;
  error?: string;
  [key: string]: unknown;
}

/**
 * READ-ONLY client for Polari's epistemics + survival surfaces
 * (term proofs, manipulation patterns, term competition, credibility
 * bases, sources/trust, drafts, venue patterns, legislation tracking,
 * DMV survival reports). Same posture as PolariScoringService: the
 * browser reads Polari directly; every WRITE goes through PSC's own
 * backend proxies instead (court cases → /api/court-cases, authority
 * → /api/authority).
 */
@Injectable({ providedIn: 'root' })
export class PolariEpistemicsService {
  private readonly API_URL = `${environment.polariApiUrl}/api/scoring`;
  private readonly BASE_URL = environment.polariApiUrl;

  constructor(private http: HttpClient) {}

  private report(path: string, params?: Record<string, string>): Observable<PolariReport> {
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params || {})) {
      if (value) {
        httpParams = httpParams.set(key, value);
      }
    }
    return this.http.get<PolariReport>(`${this.API_URL}${path}`, { params: httpParams });
  }

  // ---------------- generic CRUDE row reads ---------------- //

  /** Read any Polari class's rows (generic CRUDE envelope — the
   *  getScoreGroups parsing pattern, generalized). */
  getClassRows(className: string): Observable<any[]> {
    return this.http.get<any>(`${this.BASE_URL}/${className}`).pipe(
      map((envelope) => {
        const table = envelope?.[0]?.[className];
        const data = Array.isArray(table) ? table?.[0]?.data : table?.data;
        return data || [];
      }),
    );
  }

  // ---------------- survival (DMV cost of living) ---------------- //

  getSurvivalWalkthrough(): Observable<PolariReport> {
    return this.report('/survival/walkthrough');
  }

  getSurvivalReport(location: string, month?: string): Observable<PolariReport> {
    return this.report('/survival/report', { location, month: month || '' });
  }

  // ---------------- term proofs + manipulation catalog ---------------- //

  getProofs(): Observable<PolariReport> {
    return this.report('/proofs');
  }

  getProofReading(name: string): Observable<PolariReport> {
    return this.report(`/proofs/${encodeURIComponent(name)}`);
  }

  getProofReadingByBasis(name: string): Observable<PolariReport> {
    return this.report(`/proofs/${encodeURIComponent(name)}/by-basis`);
  }

  getManipulationPatterns(): Observable<PolariReport> {
    return this.report('/manipulation-patterns');
  }

  // ---------------- term competition ---------------- //

  getTermCompetitionReport(concept: string): Observable<PolariReport> {
    return this.report(`/term-competition/${encodeURIComponent(concept)}`);
  }

  getTermRelations(term: string): Observable<PolariReport> {
    return this.report(`/terms/${encodeURIComponent(term)}/relations`);
  }

  // ---------------- credibility ---------------- //

  getAssertionCredibility(name: string): Observable<PolariReport> {
    return this.report(`/assertions/${encodeURIComponent(name)}/credibility`);
  }

  getAssertionReadingByBasis(name: string): Observable<PolariReport> {
    return this.report(`/assertions/${encodeURIComponent(name)}/by-basis`);
  }

  getContributorStanding(name: string): Observable<PolariReport> {
    return this.report(`/contributors/${encodeURIComponent(name)}/standing`);
  }

  // ---------------- sources + provider trust ---------------- //

  getSourceGlossary(): Observable<PolariReport> {
    return this.report('/sources/glossary');
  }

  getSourceReport(name: string): Observable<PolariReport> {
    return this.report(`/sources/${encodeURIComponent(name)}/report`);
  }

  /** group_name is required by the Polari route — reliability is a
   *  per-group reading (whose retrievals back the group's data). */
  getProviderReliability(groupName: string): Observable<PolariReport> {
    return this.report('/providers/reliability', { group_name: groupName });
  }

  // ---------------- drafts / venue patterns / legislation ---------------- //

  getDrafts(): Observable<PolariReport> {
    return this.report('/drafts');
  }

  getDraftCarryover(name: string): Observable<PolariReport> {
    return this.report(`/drafts/${encodeURIComponent(name)}/carryover`);
  }

  getVenuePatterns(): Observable<PolariReport> {
    return this.report('/venue-patterns');
  }

  getLegislation(): Observable<PolariReport> {
    return this.report('/legislation');
  }

  getLegislationContributions(name: string): Observable<PolariReport> {
    return this.report(`/legislation/${encodeURIComponent(name)}/contributions`);
  }

  getLegislatorVotingRecord(name: string): Observable<PolariReport> {
    return this.report(`/legislators/${encodeURIComponent(name)}/voting-record`);
  }

  getLegislationBurial(name: string): Observable<PolariReport> {
    return this.report(`/legislation/${encodeURIComponent(name)}/burial`);
  }

  getPolicyIntent(name: string): Observable<PolariReport> {
    return this.report(`/policies/${encodeURIComponent(name)}/intent`);
  }
}
