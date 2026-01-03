import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';
import { ApiResponse, TermContextDTO } from './contexts-api.service';

export interface CriticalContextDTO {
  id?: string;
  name: string;
  description: string;
  contextVariationIds?: string[];
  contextVariations?: TermContextDTO[];
  worldviewBallotId?: string;
}

/**
 * Service for managing Critical Contexts via backend API
 */
@Injectable({ providedIn: 'root' })
export class CriticalContextsApiService {
  private readonly API_URL = `${environment.backendUri}api/critical-contexts`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new critical context
   */
  createCriticalContext(criticalContext: CriticalContextDTO): Observable<CriticalContextDTO> {
    return this.http.post<ApiResponse<CriticalContextDTO>>(`${this.API_URL}/create`, criticalContext)
      .pipe(map(response => response.data));
  }

  /**
   * Get critical context by ID
   */
  getCriticalContext(id: string): Observable<CriticalContextDTO> {
    return this.http.get<ApiResponse<CriticalContextDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get all critical contexts
   */
  getAllCriticalContexts(): Observable<CriticalContextDTO[]> {
    return this.http.get<ApiResponse<CriticalContextDTO[]>>(`${this.API_URL}/all`)
      .pipe(map(response => response.data));
  }

  /**
   * Get critical contexts by ballot ID
   */
  getCriticalContextsByBallot(ballotId: string): Observable<CriticalContextDTO[]> {
    return this.http.get<ApiResponse<CriticalContextDTO[]>>(`${this.API_URL}/ballot/${ballotId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Update a critical context
   */
  updateCriticalContext(id: string, criticalContext: CriticalContextDTO): Observable<CriticalContextDTO> {
    return this.http.put<ApiResponse<CriticalContextDTO>>(`${this.API_URL}/${id}`, criticalContext)
      .pipe(map(response => response.data));
  }

  /**
   * Delete a critical context
   */
  deleteCriticalContext(id: string): Observable<CriticalContextDTO> {
    return this.http.delete<ApiResponse<CriticalContextDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }
}
