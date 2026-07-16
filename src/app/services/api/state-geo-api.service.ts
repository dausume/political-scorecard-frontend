import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';
import {
  ApiResponse,
  StateBoundary,
  StateGeoJsonFeatureCollection,
  StateGeoLocationDTO,
} from '../../models/state-geo/state-geo-types';

/**
 * Client for PSC's OWN existing state boundary store
 * (`StateGeoLocationController` — already populated at backend
 * startup by `StateGeoInitializer` from real per-state GeoJSON, no
 * new backend work for Phase 4b map visualization).
 */
@Injectable({ providedIn: 'root' })
export class StateGeoApiService {
  private readonly API_URL = `${environment.backendUri}stateGeoLocations`;

  constructor(private http: HttpClient) {}

  /** Every US state boundary, parsed and ready to render. Note: only
   *  the 50 states are present — Washington DC has no boundary row
   *  here (confirmed against the live API), so any caller scoring DC
   *  alongside states must handle that absence honestly. */
  getAllStateBoundaries(): Observable<StateBoundary[]> {
    return this.http.get<ApiResponse<StateGeoLocationDTO[]>>(`${this.API_URL}/all`)
      .pipe(map(response => response.data
        .map(row => this.toBoundary(row))
        .filter((b): b is StateBoundary => b !== null)));
  }

  private toBoundary(row: StateGeoLocationDTO): StateBoundary | null {
    try {
      const collection: StateGeoJsonFeatureCollection = JSON.parse(row.geoJson);
      const feature = collection.features[0];
      const abbreviation = row.id.replace(/^state:/, '');
      return {
        abbreviation,
        name: (feature.properties?.['name'] as string) || abbreviation,
        feature,
      };
    } catch {
      return null;
    }
  }
}
