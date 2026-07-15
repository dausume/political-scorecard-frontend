import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { StateGeoApiService } from '../../services/api/state-geo-api.service';
import { PolariScoringService } from '../../services/polari/polari-scoring.service';
import { StateBoundary } from '../../models/state-geo/state-geo-types';
import { ConceptScoreReport, ScoredSubject } from '../../models/polari-scoring/polari-scoring-types';
import { Bounds, computeBounds, featureToPath } from '../../utils/geojson-to-svg-path';

interface StateShape {
  abbreviation: string;
  name: string;
  path: string;
  /** null = no score data for this state under the selected concept
   *  (honestly rendered as uncolored, not silently skipped). */
  score: number | null;
}

const VIEW_WIDTH = 960;
const VIEW_HEIGHT = 600;

/** Maps Polari's ScoreSubject slugs (e.g. 'washington-dc') to the
 *  2-letter USPS abbreviations PSC's state boundary store uses. Only
 *  covers subjects the seeded Housing Affordability concepts actually
 *  use — not a general-purpose 50-state map (add entries as new
 *  concepts need them). */
const SUBJECT_TO_ABBREVIATION: Record<string, string> = {
  alabama: 'AL', california: 'CA', idaho: 'ID', texas: 'TX',
  // 'washington-dc' deliberately omitted — DC is not a state and has
  // no boundary row in PSC's stateGeoLocations store (confirmed
  // against the live API). Handled as an honest "no map data" note,
  // not silently dropped.
};

/**
 * Choropleth map of a Polari ScoreConcept's per-state results
 * (2026-07-14, Phase 4b). Boundaries come from PSC's OWN existing
 * `stateGeoLocations` store (real per-state GeoJSON, already fetched
 * at backend startup — no new backend work); scores come from
 * Polari's already-built `getConceptScore()`. Deliberately a plain
 * SVG choropleth, not maplibre-gl — see `geojson-to-svg-path.ts`.
 */
@Component({
  selector: 'app-polari-score-map',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonToggleModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './polari-score-map.component.html',
  styleUrl: './polari-score-map.component.scss',
})
export class PolariScoreMapComponent implements OnInit {
  readonly viewWidth = VIEW_WIDTH;
  readonly viewHeight = VIEW_HEIGHT;

  readonly conceptOptions = [
    { name: 'housing-afford-price-only', label: 'Price & Rent Burden' },
    { name: 'housing-afford-quality-weighted', label: 'Quality-Weighted' },
    { name: 'housing-afford-supply-first', label: 'Supply-First' },
  ];
  selectedConcept = this.conceptOptions[0].name;

  loading = false;
  error: string | null = null;
  contextStates: StateShape[] = [];
  scoredStates: StateShape[] = [];
  hovered: StateShape | null = null;
  missingSubjects: string[] = [];

  private boundariesByAbbrev = new Map<string, StateBoundary>();
  private bounds: Bounds | null = null;

  constructor(
    private stateGeoApi: StateGeoApiService,
    private polariScoring: PolariScoringService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = null;
    forkJoin({
      boundaries: this.stateGeoApi.getAllStateBoundaries(),
      report: this.polariScoring.getConceptScore(this.selectedConcept),
    }).subscribe({
      next: ({ boundaries, report }) => {
        this.boundariesByAbbrev = new Map(boundaries.map(b => [b.abbreviation, b]));
        this.bounds = computeBounds(boundaries.map(b => b.feature));
        this.contextStates = boundaries.map(b => this.toShape(b, null));
        this.applyReport(report);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not load the map — ' + (err?.message || 'unknown error');
        this.loading = false;
      },
    });
  }

  onConceptChange(conceptName: string): void {
    this.selectedConcept = conceptName;
    this.loading = true;
    this.polariScoring.getConceptScore(conceptName).subscribe({
      next: (report) => {
        this.applyReport(report);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not load scores — ' + (err?.message || 'unknown error');
        this.loading = false;
      },
    });
  }

  private applyReport(report: ConceptScoreReport): void {
    this.missingSubjects = [];
    const scored: StateShape[] = [];
    for (const subject of report.subjects) {
      const abbrev = SUBJECT_TO_ABBREVIATION[subject.subject];
      if (!abbrev) {
        // Honest, visible note — e.g. washington-dc — rather than a
        // silently incomplete-looking map.
        this.missingSubjects.push(subject.displayName || subject.subject);
        continue;
      }
      const boundary = this.boundariesByAbbrev.get(abbrev);
      if (!boundary) continue;
      scored.push(this.toShape(boundary, this.scoreValue(subject)));
    }
    this.scoredStates = scored;
  }

  private scoreValue(subject: ScoredSubject): number {
    return subject.levelizedScore ?? subject.initialScore;
  }

  private toShape(boundary: StateBoundary, score: number | null): StateShape {
    return {
      abbreviation: boundary.abbreviation,
      name: boundary.name,
      path: this.bounds ? featureToPath(boundary.feature, this.bounds, VIEW_WIDTH, VIEW_HEIGHT) : '',
      score,
    };
  }

  /** Red (low) → green (high) on a 0-100 scale, matching the
   *  levelized-to-best-subject-=-100 convention Polari's own engine
   *  uses (`scoring_engine.py`'s levelize knob). */
  fillFor(score: number | null): string {
    if (score === null) return '#e0e0e0';
    const clamped = Math.max(0, Math.min(100, score));
    const hue = (clamped / 100) * 120; // 0 = red, 120 = green
    return `hsl(${hue}, 65%, 50%)`;
  }

  setHovered(state: StateShape | null): void {
    this.hovered = state;
  }
}
