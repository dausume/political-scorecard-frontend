import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';

/**
 * Defensive renderer for any Polari report/verdict object: flat
 * scalar fields become a key/value grid, array-of-flat-objects fields
 * become tables, everything else pretty-prints as JSON. Lets every
 * epistemics surface render live reports without per-shape templates
 * (the PSC twin of the Polari no-code api-json-panel).
 */
@Component({
  selector: 'app-polari-report-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './polari-report-view.component.html',
  styleUrls: ['./polari-report-view.component.scss'],
})
export class PolariReportViewComponent implements OnChanges {
  // Accepts any typed report interface (e.g. ConceptScoreReport), not just
  // Record — the renderer only ever reflects over Object.entries anyway.
  @Input() report: object | null = null;
  /** Keys to hide (e.g. 'ok'). */
  @Input() omit: string[] = ['ok'];

  flatEntries: Array<[string, string]> = [];
  tables: Array<{ key: string; columns: string[]; rows: any[] }> = [];
  restJson = '';

  ngOnChanges(): void {
    this.flatEntries = [];
    this.tables = [];
    this.restJson = '';
    if (!this.report || typeof this.report !== 'object') {
      return;
    }
    const rest: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(this.report)) {
      if (this.omit.includes(key)) {
        continue;
      }
      if (value === null || ['string', 'number', 'boolean'].includes(typeof value)) {
        this.flatEntries.push([key, String(value ?? '')]);
      } else if (this.isFlatObjectArray(value)) {
        const rows = value as any[];
        const columns = Object.keys(rows[0])
          .filter((column) => {
            const cell = rows[0][column];
            return cell === null || ['string', 'number', 'boolean'].includes(typeof cell);
          })
          .slice(0, 8);
        this.tables.push({ key, columns, rows });
      } else {
        rest[key] = value;
      }
    }
    if (Object.keys(rest).length > 0) {
      this.restJson = JSON.stringify(rest, null, 2);
    }
  }

  private isFlatObjectArray(value: unknown): boolean {
    return Array.isArray(value) && value.length > 0
      && value.every((row) => row && typeof row === 'object' && !Array.isArray(row));
  }

  cell(row: any, column: string): string {
    const value = row?.[column];
    if (value === null || value === undefined) {
      return '';
    }
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  }
}
