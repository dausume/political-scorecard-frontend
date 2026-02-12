import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';
import { ApiResponse } from './contexts-api.service';
import { LegislationDTO, LegislationAnnotationDTO } from '../../models/legislation.model';

@Injectable({ providedIn: 'root' })
export class LegislationApiService {
  private readonly API_URL = `${environment.backendUri}api/legislation`;

  constructor(private http: HttpClient) {}

  // Legislation CRUD
  createLegislation(legislation: Partial<LegislationDTO>): Observable<LegislationDTO> {
    return this.http.post<ApiResponse<LegislationDTO>>(this.API_URL, legislation)
      .pipe(map(response => response.data));
  }

  getLegislation(id: string): Observable<LegislationDTO> {
    return this.http.get<ApiResponse<LegislationDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  getAllLegislations(): Observable<LegislationDTO[]> {
    return this.http.get<ApiResponse<LegislationDTO[]>>(this.API_URL)
      .pipe(map(response => response.data));
  }

  getLegislationsByStatus(status: string): Observable<LegislationDTO[]> {
    return this.http.get<ApiResponse<LegislationDTO[]>>(`${this.API_URL}?status=${status}`)
      .pipe(map(response => response.data));
  }

  updateLegislation(id: string, legislation: Partial<LegislationDTO>): Observable<LegislationDTO> {
    return this.http.put<ApiResponse<LegislationDTO>>(`${this.API_URL}/${id}`, legislation)
      .pipe(map(response => response.data));
  }

  deleteLegislation(id: string): Observable<LegislationDTO> {
    return this.http.delete<ApiResponse<LegislationDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  // Status management
  updateStatus(id: string, status: string): Observable<LegislationDTO> {
    return this.http.put<ApiResponse<LegislationDTO>>(`${this.API_URL}/${id}/status`, { status })
      .pipe(map(response => response.data));
  }

  // File operations
  uploadFile(id: string, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<string>>(`${this.API_URL}/${id}/upload`, formData)
      .pipe(map(response => response.data));
  }

  downloadFile(id: string, filename: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${id}/download/${filename}`, { responseType: 'blob' });
  }

  // Export
  exportAsPdf(id: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${id}/export/pdf`, { responseType: 'blob' });
  }

  exportAsDocx(id: string): Observable<Blob> {
    return this.http.get(`${this.API_URL}/${id}/export/docx`, { responseType: 'blob' });
  }

  // Annotations
  createAnnotation(legislationId: string, annotation: Partial<LegislationAnnotationDTO>): Observable<LegislationAnnotationDTO> {
    return this.http.post<ApiResponse<LegislationAnnotationDTO>>(
      `${this.API_URL}/${legislationId}/annotations`, annotation
    ).pipe(map(response => response.data));
  }

  getAnnotations(legislationId: string, groupId?: string): Observable<LegislationAnnotationDTO[]> {
    let url = `${this.API_URL}/${legislationId}/annotations`;
    if (groupId) {
      url += `?groupId=${groupId}`;
    }
    return this.http.get<ApiResponse<LegislationAnnotationDTO[]>>(url)
      .pipe(map(response => response.data));
  }

  updateAnnotation(legislationId: string, annotationId: string, annotation: Partial<LegislationAnnotationDTO>): Observable<LegislationAnnotationDTO> {
    return this.http.put<ApiResponse<LegislationAnnotationDTO>>(
      `${this.API_URL}/${legislationId}/annotations/${annotationId}`, annotation
    ).pipe(map(response => response.data));
  }

  deleteAnnotation(legislationId: string, annotationId: string): Observable<LegislationAnnotationDTO> {
    return this.http.delete<ApiResponse<LegislationAnnotationDTO>>(
      `${this.API_URL}/${legislationId}/annotations/${annotationId}`
    ).pipe(map(response => response.data));
  }
}
