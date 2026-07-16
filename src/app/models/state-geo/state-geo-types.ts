/**
 * PSC's own state boundary store (2026-07-14, Phase 4b map
 * visualization). `political-scorecard-backend`'s `StateGeoInitializer`
 * already fetches real per-state GeoJSON (from world.geo.json) into
 * Redis on startup and serves it via `/stateGeoLocations/*` — no new
 * backend work needed, this is purely a frontend consumer.
 *
 * `id` is `state:XX` (2-letter USPS abbreviation). Only the 50 states
 * are present — Washington DC is NOT a state and has no boundary row
 * here (confirmed against the live API, not assumed) — anything that
 * scores DC alongside states must say so honestly rather than
 * silently drop it from a map.
 */
export interface StateGeoLocationDTO {
  id: string;
  /** A GeoJSON FeatureCollection, JSON-encoded as a string (not a
   *  parsed object) — parse with JSON.parse before use. */
  geoJson: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Minimal local GeoJSON geometry shapes — `@types/geojson` isn't a
 *  dependency of this app, and a full GeoJSON type isn't needed, just
 *  the two geometry kinds real US state boundaries actually use. */
export type GeoJsonPolygonCoords = number[][][];
export type GeoJsonMultiPolygonCoords = number[][][][];

export interface StateGeoJsonFeature {
  type: 'Feature';
  properties: { name?: string; fips?: string; [key: string]: unknown };
  geometry:
    | { type: 'Polygon'; coordinates: GeoJsonPolygonCoords }
    | { type: 'MultiPolygon'; coordinates: GeoJsonMultiPolygonCoords };
}

export interface StateGeoJsonFeatureCollection {
  type: 'FeatureCollection';
  features: StateGeoJsonFeature[];
}

/** A single parsed state boundary, ready to render. */
export interface StateBoundary {
  /** 2-letter USPS abbreviation, e.g. 'CA'. */
  abbreviation: string;
  name: string;
  feature: StateGeoJsonFeature;
}
