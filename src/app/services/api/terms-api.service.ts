import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';
import { ApiResponse } from './contexts-api.service';
import { Term } from '../../classes/terms/term';

/** Backend row shape for a term. */
export interface TermDTO {
  id: string;
  name: string;
  description: string;
  source: string;
  category: string;
}

/**
 * TermsApiService
 *
 * Loads terms from the real backend (/api/terms).
 */
@Injectable({ providedIn: 'root' })
export class TermsApiService {
  private readonly API_URL = `${environment.backendUri}api/terms`;

  constructor(private http: HttpClient) {}

  /**
   * Load all terms
   */
  loadAllTerms(): Observable<Term[]> {
    return this.http.get<ApiResponse<TermDTO[]>>(`${this.API_URL}/all`)
      .pipe(map(response => (response.data || []).map(dto => this.toTerm(dto))));
  }

  /**
   * Load terms by worldview ballot ID
   */
  loadTermsByWorldviewBallot(worldviewBallotId: string): Observable<Term[]> {
    // TODO: ballot-scoped filtering is server-side work; reads /all for now.
    return this.loadAllTerms();
  }

  /**
   * Load terms by competitive scoring ID
   */
  loadTermsByCompetitiveScoring(competitiveScoringId: string): Observable<Term[]> {
    // TODO: competitive-scoring filtering is server-side work; reads /all for now.
    return this.loadAllTerms();
  }

  /**
   * Load the distinct term categories known to the backend.
   */
  loadCategories(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.API_URL}/categories`)
      .pipe(map(response => response.data || []));
  }

  private toTerm(dto: TermDTO): Term {
    return new Term({
      id: dto.id,
      name: dto.name,
      description: dto.description ?? '',
      source: dto.source ?? '',
      category: dto.category ?? undefined
    });
  }
}
