/**
 * PSC's own public vote over candidate definitions drafted in Polari
 * (2026-07-14 ballot-hosting architecture move). Mirrors
 * `PolariVoteTopicDTO`/`WorldviewVoteDTO` on the backend
 * (`political-scorecard-backend/.../json/dtos/scoringdto/`) —
 * verified against the live API, not guessed.
 *
 * Distinct from `models/polari-scoring/polari-scoring-types.ts`,
 * which mirrors POLARI's own WorldviewElection/GroupDisplayVote
 * (read-only, drafting/analysis side). This file is PSC's own hosted
 * vote (write side, real ballots, real auth).
 */

export type PolariVoteMode = 'approval' | 'sole' | 'ranked-condorcet';
export type PolariVoteStatus = 'OPEN' | 'CLOSED' | 'SYNCED';
export type PolariVoteItemKind = 'concept' | 'display';

export interface PolariVoteTopicDTO {
  id: string;
  title: string;
  description: string;
  polariGroupName: string;
  polariItemKind: PolariVoteItemKind;
  candidateNames: string[];
  mode: PolariVoteMode;
  status: PolariVoteStatus;
  createdBy: string;
  totalBallots: number;
  electedCandidate: string;
  electedProvenance: string;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface WorldviewVoteDTO {
  id: string;
  topicId: string;
  voterId: string;
  approvals: string[] | null;
  soleChoice: string | null;
  ranking: string[] | null;
  castAt: string | null;
}

/** `GET /api/polari-votes/{id}/results` — PSC-side raw-count preview
 *  ONLY, not the real weighted tally (that happens in Polari once
 *  synced — see `note`). */
export interface PolariVoteResults {
  topicId: string;
  mode: PolariVoteMode;
  ballotsCast: number;
  counts: Record<string, number>;
  note: string;
}

/** Backend's generic `ApiResponse<T>` envelope
 *  (`controllers/responses/ApiResponse.java`) — same shape this app's
 *  other API services already unwrap via `.pipe(map(r => r.data))`. */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
