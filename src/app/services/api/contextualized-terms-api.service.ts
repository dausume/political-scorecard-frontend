import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';
import { ApiResponse, TermContextDTO } from './contexts-api.service';

export interface ValueMetadataDTO {
  id?: string;
  type: 'PERCENTAGE' | 'CURRENCY' | 'COUNT' | 'RATE' | 'INDEX' | 'RATIO' | 'SCORE' | 'CUSTOM';
  unit?: string;
  label: string;
  isPositive: boolean; // true = higher is better, false = lower is better
}

export interface TermDTO {
  id?: string;
  name: string;
  description?: string;
  source?: string;
  category?: string;
}

export interface ContextualizedTermDTO {
  id?: string;
  termId: string;
  contextIds: string[];
  valueMetadataId: string;
  preNormalizedValue: number;
  postNormalizedValue: number;
  // Populated when retrieved:
  term?: TermDTO;
  contexts?: TermContextDTO[];
  valueMetadata?: ValueMetadataDTO;
}

/**
 * Service for managing Contextualized Terms via backend API
 */
@Injectable({ providedIn: 'root' })
export class ContextualizedTermsApiService {
  private readonly API_URL = `${environment.backendUri}api/contextualized-terms`;
  private readonly METADATA_URL = `${environment.backendUri}api/value-metadata`;
  private readonly TERMS_URL = `${environment.backendUri}api/terms`;

  constructor(private http: HttpClient) {}

  // ============ Contextualized Terms ============

  /**
   * Create a new contextualized term
   */
  createContextualizedTerm(contextualizedTerm: ContextualizedTermDTO): Observable<ContextualizedTermDTO> {
    return this.http.post<ApiResponse<ContextualizedTermDTO>>(`${this.API_URL}/create`, contextualizedTerm)
      .pipe(map(response => response.data));
  }

  /**
   * Get contextualized term by ID
   */
  getContextualizedTerm(id: string): Observable<ContextualizedTermDTO> {
    return this.http.get<ApiResponse<ContextualizedTermDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get all contextualized terms
   */
  getAllContextualizedTerms(): Observable<ContextualizedTermDTO[]> {
    return this.http.get<ApiResponse<ContextualizedTermDTO[]>>(`${this.API_URL}/all`)
      .pipe(map(response => response.data));
  }

  /**
   * Get contextualized terms by base term ID
   */
  getContextualizedTermsByTermId(termId: string): Observable<ContextualizedTermDTO[]> {
    return this.http.get<ApiResponse<ContextualizedTermDTO[]>>(`${this.API_URL}/by-term/${termId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get contextualized terms by context IDs
   * Used to filter terms based on selected primary, comparative, or critical contexts
   */
  getContextualizedTermsByContextIds(contextIds: string[]): Observable<ContextualizedTermDTO[]> {
    return this.http.post<ApiResponse<ContextualizedTermDTO[]>>(`${this.API_URL}/by-contexts`, contextIds)
      .pipe(map(response => response.data));
  }

  /**
   * Update a contextualized term
   */
  updateContextualizedTerm(id: string, contextualizedTerm: ContextualizedTermDTO): Observable<ContextualizedTermDTO> {
    return this.http.put<ApiResponse<ContextualizedTermDTO>>(`${this.API_URL}/${id}`, contextualizedTerm)
      .pipe(map(response => response.data));
  }

  /**
   * Delete a contextualized term
   */
  deleteContextualizedTerm(id: string): Observable<ContextualizedTermDTO> {
    return this.http.delete<ApiResponse<ContextualizedTermDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  // ============ Value Metadata ============

  /**
   * Create value metadata
   */
  createValueMetadata(metadata: ValueMetadataDTO): Observable<ValueMetadataDTO> {
    return this.http.post<ApiResponse<ValueMetadataDTO>>(`${this.METADATA_URL}/create`, metadata)
      .pipe(map(response => response.data));
  }

  /**
   * Get all value metadata
   */
  getAllValueMetadata(): Observable<ValueMetadataDTO[]> {
    return this.http.get<ApiResponse<ValueMetadataDTO[]>>(`${this.METADATA_URL}/all`)
      .pipe(map(response => response.data));
  }

  /**
   * Get value metadata by ID
   */
  getValueMetadata(id: string): Observable<ValueMetadataDTO> {
    return this.http.get<ApiResponse<ValueMetadataDTO>>(`${this.METADATA_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  // ============ Terms ============

  /**
   * Create a new term
   */
  createTerm(term: TermDTO): Observable<TermDTO> {
    return this.http.post<ApiResponse<TermDTO>>(`${this.TERMS_URL}/create`, term)
      .pipe(map(response => response.data));
  }

  /**
   * Get all terms
   */
  getAllTerms(): Observable<TermDTO[]> {
    return this.http.get<ApiResponse<TermDTO[]>>(`${this.TERMS_URL}/all`)
      .pipe(map(response => response.data));
  }

  /**
   * Get term by ID
   */
  getTerm(id: string): Observable<TermDTO> {
    return this.http.get<ApiResponse<TermDTO>>(`${this.TERMS_URL}/${id}`)
      .pipe(map(response => response.data));
  }
}
