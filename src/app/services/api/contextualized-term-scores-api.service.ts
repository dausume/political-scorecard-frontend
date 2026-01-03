import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';
import { ApiResponse } from './contexts-api.service';

export interface ContextualizedTermScoreDTO {
  id?: string;
  contextualizedTermId: string;
  weight: number;
  worldviewBallotId?: string;
}

/**
 * Service for managing Contextualized Term Scores via backend API
 */
@Injectable({ providedIn: 'root' })
export class ContextualizedTermScoresApiService {
  private readonly API_URL = `${environment.backendUri}api/contextualized-term-scores`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new contextualized term score
   */
  createScore(score: ContextualizedTermScoreDTO): Observable<ContextualizedTermScoreDTO> {
    return this.http.post<ApiResponse<ContextualizedTermScoreDTO>>(`${this.API_URL}/create`, score)
      .pipe(map(response => response.data));
  }

  /**
   * Get score by ID
   */
  getScore(id: string): Observable<ContextualizedTermScoreDTO> {
    return this.http.get<ApiResponse<ContextualizedTermScoreDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get all scores for a ballot
   */
  getScoresByBallot(ballotId: string): Observable<ContextualizedTermScoreDTO[]> {
    return this.http.get<ApiResponse<ContextualizedTermScoreDTO[]>>(`${this.API_URL}/ballot/${ballotId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Update a score
   */
  updateScore(id: string, score: ContextualizedTermScoreDTO): Observable<ContextualizedTermScoreDTO> {
    return this.http.put<ApiResponse<ContextualizedTermScoreDTO>>(`${this.API_URL}/${id}`, score)
      .pipe(map(response => response.data));
  }

  /**
   * Delete a score
   */
  deleteScore(id: string): Observable<ContextualizedTermScoreDTO> {
    return this.http.delete<ApiResponse<ContextualizedTermScoreDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }
}
