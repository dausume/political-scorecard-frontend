/**
 * PSC's own authenticated PolicyVote submission endpoints
 * (`political-scorecard-backend`'s `/api/policy-votes/*`, 2026-07-14
 * dual-path follow-up). Per Dustin (verbatim): "PolicyVote should
 * either cite an official government source for the vote record, and
 * be defined by a policy voting admin, or it should be defined by the
 * Politician themselves or one of their cabinet people or assistants
 * they personally authorized to handle it." Unlike ScoreAssertion
 * submissions, a PolicyVote has no review lifecycle — it counts
 * toward the named politician's score immediately — so BOTH paths
 * require real, deliberately-granted authorization, enforced entirely
 * server-side (see `PolicyVoteSubmissionService`'s Java doc).
 */

/** Mirrors `PolicyVoteSubmissionDTO.java`. `authorizedVia` and
 *  `voteName` are set by the server on success. */
export interface PolicyVoteSubmission {
  politicianName: string;
  policyName: string;
  vote: 'yea' | 'nay' | 'abstain';
  voteDate?: string;
  chamber?: string;
  session?: string;
  /** Required if the submitter holds ROLE_policy-voting-admin;
   *  optional (self-attesting) on the politician/staff path. */
  officialSourceUrl?: string;
  notes?: string;
  voteName?: string;
  authorizedVia?: 'admin' | 'staff';
}

/** Mirrors `StaffAuthorizationDTO.java` — an admin-only request to
 *  authorize a Keycloak user as a politician's own PolicyVote
 *  submitter. */
export interface StaffAuthorization {
  politicianName: string;
  username: string;
}

/** A Keycloak user as the admin endpoints report it. */
export interface KeycloakUserRef {
  id: string;
  username: string;
}

/** One politician's authorized-submitter group with its members
 *  (`GET /api/policy-votes/authorizations`, admin-only). */
export interface PoliticianAuthorizations {
  politicianName: string;
  groupId: string;
  members: KeycloakUserRef[];
}
