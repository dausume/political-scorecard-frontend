import { StateGeoJsonFeature } from '../models/state-geo/state-geo-types';

/**
 * Minimal GeoJSON Polygon/MultiPolygon → SVG `<path>` `d` string
 * converter, no mapping library required — Phase 4b (2026-07-14)
 * deliberately skips maplibre-gl (a new, heavy dependency, plus a
 * WebGL/tile-style setup this app has no existing usage of) for what
 * is fundamentally a static choropleth of a handful of states.
 *
 * Projection is a plain equirectangular scale (lng→x, lat→y flipped)
 * fit to a caller-supplied bounding box — adequate for a continental-
 * US choropleth, not a general-purpose map projection.
 */

export interface Bounds {
  minLng: number;
  maxLng: number;
  minLat: number;
  maxLat: number;
}

export function computeBounds(features: StateGeoJsonFeature[]): Bounds {
  let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
  for (const feature of features) {
    for (const ring of allRings(feature)) {
      for (const [lng, lat] of ring) {
        if (lng < minLng) minLng = lng;
        if (lng > maxLng) maxLng = lng;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }
    }
  }
  return { minLng, maxLng, minLat, maxLat };
}

function allRings(feature: StateGeoJsonFeature): number[][][] {
  if (feature.geometry.type === 'Polygon') {
    return feature.geometry.coordinates;
  }
  return feature.geometry.coordinates.flat();
}

/** Projects one [lng, lat] pair into SVG [x, y] within `viewWidth` x
 *  `viewHeight`, preserving aspect ratio (letterboxed within bounds,
 *  not stretched) and flipping Y since SVG y grows downward while
 *  latitude grows northward. */
export function project(
  lng: number, lat: number, bounds: Bounds, viewWidth: number, viewHeight: number,
): [number, number] {
  const lngSpan = bounds.maxLng - bounds.minLng || 1;
  const latSpan = bounds.maxLat - bounds.minLat || 1;
  // Longitude compresses toward the poles; a flat cos(meanLat) factor
  // keeps the continental-US aspect ratio visually honest without a
  // full projection library.
  const meanLatRad = ((bounds.minLat + bounds.maxLat) / 2) * (Math.PI / 180);
  const lngScaleFactor = Math.cos(meanLatRad);
  const effectiveLngSpan = lngSpan * lngScaleFactor;
  const scale = Math.min(viewWidth / effectiveLngSpan, viewHeight / latSpan);
  const xOffset = (viewWidth - effectiveLngSpan * scale) / 2;
  const yOffset = (viewHeight - latSpan * scale) / 2;
  const x = (lng - bounds.minLng) * lngScaleFactor * scale + xOffset;
  const y = viewHeight - ((lat - bounds.minLat) * scale + yOffset);
  return [x, y];
}

export function featureToPath(
  feature: StateGeoJsonFeature, bounds: Bounds, viewWidth: number, viewHeight: number,
): string {
  const polygons = feature.geometry.type === 'Polygon'
    ? [feature.geometry.coordinates]
    : feature.geometry.coordinates;

  return polygons.map(polygon => polygon.map(ring => {
    const points = ring.map(([lng, lat]) => project(lng, lat, bounds, viewWidth, viewHeight));
    return points.length
      ? `M${points[0][0]},${points[0][1]} ` +
        points.slice(1).map(([x, y]) => `L${x},${y}`).join(' ') + ' Z'
      : '';
  }).join(' ')).join(' ');
}
