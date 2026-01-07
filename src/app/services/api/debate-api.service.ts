import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';
import { ApiResponse } from './contexts-api.service';

export interface DebateMessageDTO {
  id?: string;
  electionId: string;
  userId: string;
  username: string;
  message: string;
  timestamp?: string;
  edited?: boolean;
  editedAt?: string;
  deleted?: boolean;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Service for managing election debate messages via backend API
 */
@Injectable({ providedIn: 'root' })
export class DebateApiService {
  private readonly API_URL = `${environment.backendUri}api/debate-messages`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new debate message
   */
  createMessage(message: DebateMessageDTO): Observable<DebateMessageDTO> {
    return this.http.post<ApiResponse<DebateMessageDTO>>(`${this.API_URL}/create`, message)
      .pipe(map(response => response.data));
  }

  /**
   * Get message by ID
   */
  getMessage(id: string): Observable<DebateMessageDTO> {
    return this.http.get<ApiResponse<DebateMessageDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get all messages
   */
  getAllMessages(): Observable<DebateMessageDTO[]> {
    return this.http.get<ApiResponse<DebateMessageDTO[]>>(`${this.API_URL}/all`)
      .pipe(map(response => response.data));
  }

  /**
   * Get messages by election ID
   */
  getMessagesByElectionId(electionId: string): Observable<DebateMessageDTO[]> {
    return this.http.get<ApiResponse<DebateMessageDTO[]>>(`${this.API_URL}/election/${electionId}`)
      .pipe(map(response => response.data));
  }

  /**
   * Update an existing message
   */
  updateMessage(id: string, message: DebateMessageDTO): Observable<DebateMessageDTO> {
    return this.http.put<ApiResponse<DebateMessageDTO>>(`${this.API_URL}/${id}`, message)
      .pipe(map(response => response.data));
  }

  /**
   * Delete a message (soft delete)
   */
  deleteMessage(id: string): Observable<DebateMessageDTO> {
    return this.http.delete<ApiResponse<DebateMessageDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }
}
