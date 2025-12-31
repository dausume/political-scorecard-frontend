import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Term } from '../../classes/terms/term';
import { MOCK_TERMS } from '../../state/mock-data/terms.mock';

/**
 * TermsApiService
 *
 * CURRENT: Mock implementation that returns mock data
 * LATER: Replace with actual HTTP calls to backend API
 */
@Injectable({ providedIn: 'root' })
export class TermsApiService {

  constructor() {}

  /**
   * Load all terms
   * TODO: Replace with actual API call: this.http.get<Term[]>('/api/terms')
   */
  loadAllTerms(): Observable<Term[]> {
    // Simulate network delay
    return of(MOCK_TERMS).pipe(delay(300));
  }

  /**
   * Load terms by worldview ballot ID
   * TODO: Replace with actual API call: this.http.get<Term[]>(`/api/worldview-ballots/${worldviewBallotId}/terms`)
   */
  loadTermsByWorldviewBallot(worldviewBallotId: string): Observable<Term[]> {
    // For mock: return filtered or all terms
    // In real implementation, this would filter on backend
    return of(MOCK_TERMS).pipe(delay(300));
  }

  /**
   * Load terms by competitive scoring ID
   * TODO: Replace with actual API call: this.http.get<Term[]>(`/api/competitive-scoring/${competitiveScoringId}/terms`)
   */
  loadTermsByCompetitiveScoring(competitiveScoringId: string): Observable<Term[]> {
    // For mock: return filtered or all terms
    // In real implementation, this would filter on backend
    return of(MOCK_TERMS).pipe(delay(300));
  }
}
