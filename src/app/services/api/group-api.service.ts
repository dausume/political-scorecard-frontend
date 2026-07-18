import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';
import { ApiResponse } from './contexts-api.service';
import { Group, PscGroupType } from '../../classes/group/group';

@Injectable({ providedIn: 'root' })
export class GroupApiService {
  private readonly API_URL = `${environment.backendUri}api/groups`;

  constructor(private http: HttpClient) {}

  getMyGroups(): Observable<string[]> {
    return this.http.get<ApiResponse<string[]>>(`${this.API_URL}/mine`)
      .pipe(map(response => response.data));
  }

  /** The real group catalogue (psc-typed Keycloak groups) — replaces
   *  the MOCK_*_GROUPS lists. */
  getDirectory(type?: PscGroupType): Observable<Group[]> {
    const params = type ? `?type=${type}` : '';
    return this.http.get<ApiResponse<Array<{ id: string; name: string; pscType: PscGroupType }>>>(
      `${this.API_URL}/directory${params}`
    ).pipe(map(response => (response.data || []).map(g => new Group({
      id: g.id,
      name: g.name,
      description: '',
      pscType: g.pscType,
    }))));
  }

  joinGroup(groupName: string, groupType: PscGroupType): Observable<string[]> {
    return this.http.post<ApiResponse<string[]>>(
      `${this.API_URL}/join`,
      { groupName, groupType }
    ).pipe(map(response => response.data));
  }
}
