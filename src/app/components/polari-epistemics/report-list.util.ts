import { PolariReport } from '../../services/polari/polari-epistemics.service';

/**
 * Probe a Polari report for the first array-valued key among the given
 * candidates. Returns null when none of them is an array — callers then
 * render the WHOLE report via app-polari-report-view instead of
 * assuming a list shape they haven't verified.
 */
export function extractReportList(report: PolariReport | null, candidateKeys: string[]): any[] | null {
  if (!report || typeof report !== 'object') {
    return null;
  }
  for (const key of candidateKeys) {
    const value = (report as Record<string, unknown>)[key];
    if (Array.isArray(value)) {
      return value;
    }
  }
  return null;
}

/** Best-effort display name for a list entry of unknown shape. */
export function entryName(entry: any): string {
  if (entry === null || entry === undefined) {
    return '';
  }
  if (typeof entry !== 'object') {
    return String(entry);
  }
  return entry.name || entry.title || entry.proofName || entry.draftName
    || entry.label || JSON.stringify(entry).slice(0, 80);
}

/** Best-effort status label for a list entry (empty when absent). */
export function entryStatus(entry: any): string {
  if (!entry || typeof entry !== 'object') {
    return '';
  }
  const status = entry.status ?? entry.state ?? entry.proofStatus;
  return status === null || status === undefined ? '' : String(status);
}
