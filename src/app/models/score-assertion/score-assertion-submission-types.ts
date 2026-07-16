/**
 * PSC's own citizen-facing ScoreAssertion submission endpoint
 * (`political-scorecard-backend`'s `/api/score-assertions/submit`,
 * 2026-07-14 general-scoring follow-up) — NOT Polari's `/api/scoring/*`
 * directly. PSC's authenticated backend resolves the submitter's
 * anonymized voter id server-side and pushes the assertion into
 * Polari on the citizen's behalf (see `ScoreAssertionSubmissionService`'s
 * doc for why this exists: Polari's generic CRUDE write endpoint is
 * still open/unauthenticated, so citizen writes route through PSC's
 * own auth layer instead, same architecture as PSC's real ballot
 * casting).
 */

/** Mirrors `ScoreAssertionSubmissionDTO.java` — everything a citizen
 *  fills in themselves; `assertionName` is set by the server on a
 *  successful submission. */
export interface ScoreAssertionSubmission {
  policyName: string;
  quote?: string;
  intent: string;
  assertionType: 'score-impact' | 'dependency' | 'decorative';
  direction?: 'supports' | 'harms';
  strength?: number;
  conceptName?: string;
  termName?: string;
  dependsOnPolicy?: string;
  notes?: string;
  assertionName?: string;
}
