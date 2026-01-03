import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface TermContextDTO {
  id?: string;
  type: 'TIMEFRAME' | 'LOCATION' | 'DEMOGRAPHIC' | 'ECONOMIC' | 'CUSTOM';
  label: string;
  [key: string]: any; // Type-specific fields
}

export interface TimeframeContextDTO extends TermContextDTO {
  type: 'TIMEFRAME';
  startDate: string;
  endDate: string;
  timeframeType: 'SINGLE_YEAR' | 'YEAR_RANGE' | 'SINGLE_DATE' | 'DATE_RANGE';
}

export interface LocationContextDTO extends TermContextDTO {
  type: 'LOCATION';
  country?: string;
  state?: string;
  city?: string;
  region?: string;
}

export interface DemographicContextDTO extends TermContextDTO {
  type: 'DEMOGRAPHIC';
  ageRange?: string;
  incomeLevel?: string;
  education?: string;
  occupation?: string;
}

export interface EconomicContextDTO extends TermContextDTO {
  type: 'ECONOMIC';
  gdpRange?: string;
  inflationRate?: string;
  unemploymentRate?: string;
  marketCondition?: string;
}

export interface CustomContextDTO extends TermContextDTO {
  type: 'CUSTOM';
  value: string;
  metadata?: Record<string, any>;
}

/**
 * Service for managing Term Contexts via backend API
 */
@Injectable({ providedIn: 'root' })
export class ContextsApiService {
  private readonly API_URL = `${environment.backendUri}api/contexts`;

  constructor(private http: HttpClient) {}

  /**
   * Create a new context
   */
  createContext(context: TermContextDTO): Observable<TermContextDTO> {
    return this.http.post<ApiResponse<TermContextDTO>>(`${this.API_URL}/create`, context)
      .pipe(map(response => response.data));
  }

  /**
   * Get context by ID
   */
  getContext(id: string): Observable<TermContextDTO> {
    return this.http.get<ApiResponse<TermContextDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get all contexts
   */
  getAllContexts(): Observable<TermContextDTO[]> {
    return this.http.get<ApiResponse<TermContextDTO[]>>(`${this.API_URL}/all`)
      .pipe(map(response => response.data));
  }

  /**
   * Get contexts by type
   */
  getContextsByType(type: string): Observable<TermContextDTO[]> {
    return this.http.get<ApiResponse<TermContextDTO[]>>(`${this.API_URL}/type/${type}`)
      .pipe(map(response => response.data));
  }

  /**
   * Update a context
   */
  updateContext(id: string, context: TermContextDTO): Observable<TermContextDTO> {
    return this.http.put<ApiResponse<TermContextDTO>>(`${this.API_URL}/${id}`, context)
      .pipe(map(response => response.data));
  }

  /**
   * Delete a context
   */
  deleteContext(id: string): Observable<TermContextDTO> {
    return this.http.delete<ApiResponse<TermContextDTO>>(`${this.API_URL}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get hierarchy chain for a context
   */
  getHierarchyChain(id: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.API_URL}/${id}/hierarchy`)
      .pipe(map(response => response.data));
  }
}
