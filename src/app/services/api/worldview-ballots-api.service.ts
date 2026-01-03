import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';
import { ApiResponse, TermContextDTO } from './contexts-api.service';

export interface WorldviewBallotDTO {
  id?: string;
  electionId: string;
  voterId: string;
  name: string;
  ballotType?: string;
  personalContextIds?: string[];
  contextualizedTermScoreIds?: string[];
  criticalContextIds?: string[];
  // Populated when retrieved:
  personalContexts?: TermContextDTO[];
  contextualizedTermScores?: any[];
  criticalContexts?: any[];
}

/**
 * Service for managing Worldview Ballots via backend API
 */
@Injectable({ providedIn: 'root' })
export class WorldviewBallotsApiService {
  private readonly API_URL = `${environment.backendUri}api/worldview-ballots`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new worldview ballot
   */
  createBallot(ballot: WorldviewBallotDTO): Observable<WorldviewBallotDTO> {
    return this.http.post<ApiResponse<WorldviewBallotDTO>>(`${this.API_URL}/create`, ballot)
      .pipe(map(response => response.data));
  }

  /**
   * Get ballot by ID
   */
  getBallot(id: string): Observable<WorldviewBallotDTO> {
    return this.http.get<ApiResponse<WorldviewBallotDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get all ballots
   */
  getAllBallots(): Observable<WorldviewBallotDTO[]> {
    return this.http.get<ApiResponse<WorldviewBallotDTO[]>>(`${this.API_URL}/all`)
      .pipe(map(response => response.data));
  }

  /**
   * Get ballots by election ID
   */
  getBallotsByElection(electionId: string): Observable<WorldviewBallotDTO[]> {
    return this.http.get<ApiResponse<WorldviewBallotDTO[]>>(`${this.API_URL}/election/${electionId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get ballots by voter ID
   */
  getBallotsByVoter(voterId: string): Observable<WorldviewBallotDTO[]> {
    return this.http.get<ApiResponse<WorldviewBallotDTO[]>>(`${this.API_URL}/voter/${voterId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Update a ballot
   */
  updateBallot(id: string, ballot: WorldviewBallotDTO): Observable<WorldviewBallotDTO> {
    return this.http.put<ApiResponse<WorldviewBallotDTO>>(`${this.API_URL}/${id}`, ballot)
      .pipe(map(response => response.data));
  }

  /**
   * Delete a ballot
   */
  deleteBallot(id: string): Observable<WorldviewBallotDTO> {
    return this.http.delete<ApiResponse<WorldviewBallotDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }
}
