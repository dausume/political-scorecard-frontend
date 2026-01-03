import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';
import { ApiResponse } from './contexts-api.service';

export interface WorldviewElectionDTO {
  id?: string;
  name: string;
  description?: string;
  electionType: string;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  ballotIds?: string[];
  totalBallots?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Service for managing Worldview Elections via backend API
 */
@Injectable({ providedIn: 'root' })
export class WorldviewElectionsApiService {
  private readonly API_URL = `${environment.backendUri}api/worldview-elections`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new worldview election
   */
  createElection(election: WorldviewElectionDTO): Observable<WorldviewElectionDTO> {
    return this.http.post<ApiResponse<WorldviewElectionDTO>>(`${this.API_URL}/create`, election)
      .pipe(map(response => response.data));
  }

  /**
   * Get election by ID
   */
  getElection(id: string): Observable<WorldviewElectionDTO> {
    return this.http.get<ApiResponse<WorldviewElectionDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get all elections
   */
  getAllElections(): Observable<WorldviewElectionDTO[]> {
    return this.http.get<ApiResponse<WorldviewElectionDTO[]>>(`${this.API_URL}/all`)
      .pipe(map(response => response.data));
  }

  /**
   * Get elections by status
   */
  getElectionsByStatus(status: string): Observable<WorldviewElectionDTO[]> {
    return this.http.get<ApiResponse<WorldviewElectionDTO[]>>(`${this.API_URL}/status/${status}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get all ballots for an election
   */
  getElectionBallots(id: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.API_URL}/${id}/ballots`)
      .pipe(map(response => response.data));
  }

  /**
   * Update an election
   */
  updateElection(id: string, election: WorldviewElectionDTO): Observable<WorldviewElectionDTO> {
    return this.http.put<ApiResponse<WorldviewElectionDTO>>(`${this.API_URL}/${id}`, election)
      .pipe(map(response => response.data));
  }

  /**
   * Delete an election
   */
  deleteElection(id: string): Observable<WorldviewElectionDTO> {
    return this.http.delete<ApiResponse<WorldviewElectionDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Close an election (change status to CLOSED)
   */
  closeElection(id: string): Observable<WorldviewElectionDTO> {
    return this.http.post<ApiResponse<WorldviewElectionDTO>>(`${this.API_URL}/${id}/close`, {})
      .pipe(map(response => response.data));
  }
}
