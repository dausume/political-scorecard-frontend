/**
 * Response shapes for Polari's `/api/scoring/*` backend (a separate
 * app — polari-rf-node/polari-framework/scoring/, reached at
 * `environment.polariApiUrl`, NOT this app's own backend).
 *
 * Added 2026-07-14 (Democratic Scorecard revamp) — political-scorecard's
 * own scoring/calculation layer was mocked (worldview-ballot reading
 * MOCK_TERMS) or a dead stub (`Score.java` empty class,
 * `WorldviewBallot`/`WorldviewVote` had a DB table but no DAO/
 * controller), while Polari's scoring module is a real, live-computing,
 * already-generalized descendant of this app's own original design
 * (see `DEMOCRATIC_SCORECARD_REVAMP_PLAN.md` at the repo root). Decision:
 * Polari does the calculating, this app becomes a client — these types
 * mirror Polari's actual JSON responses (verified against the live API,
 * not guessed), kept in their own file per this session's object/
 * interface placement standard (a file's own logic file is not where a
 * shared data shape belongs).
 */

/** One weighted term entry inside a ScoreConcept's term bundle. */
export interface TermWeight {
  term: string;
  weight: number;
  /** Sign of contribution — absent means "use the term's own default". */
  isPositive?: boolean;
}

/** One entry from `GET /api/scoring/concepts` — a named, weighted
 *  bundle of ScoreTerms (Polari's generalization of this app's own
 *  Term/TermContext/ContextualizedTerm design). */
export interface ScoreConceptSummary {
  name: string;
  displayName: string;
  description: string;
  /** What this concept holds accountable ('policy' | 'politician' |
   *  'state' | any free-text kind); '' = any. */
  subjectKind: string;
  termWeights: TermWeight[];
  /** Context names every evaluation must hold under (e.g. "year-2022"). */
  requiredContexts: string[];
  aggregation: 'weighted-mean';
  /** Scale scores to the best subject = 100. */
  levelize: boolean;
}

export interface ScoreConceptsResponse {
  ok: boolean;
  error?: string;
  concepts: ScoreConceptSummary[];
}

/** How one ScoreTerm's raw value was normalized to 0-1 for a
 *  weighted-mean composition — present when `found: true`. */
export interface ScoreNormalizationDetail {
  method: string;
  min?: number;
  max?: number;
  inverted?: boolean;
  clamped?: boolean;
}

/** One line of a subject's score breakdown — EITHER a term
 *  contribution (`term` set) or a nested-concept contribution
 *  (`concept` set, `kind: 'concept'`). Mirrors
 *  `scoring_engine.py::score_concept()`'s breakdown entries exactly
 *  (verified against the live API, not guessed) — most fields are
 *  only present when `found: true`, since a not-found entry's whole
 *  point is naming what's missing, not fabricating placeholder
 *  numbers. */
export interface ScoreBreakdownEntry {
  term?: string;
  concept?: string;
  kind?: 'concept';
  label?: string;
  weight: number;
  found: boolean;
  error?: string;
  isPositive?: boolean;
  raw?: number;
  unit?: string;
  normalized?: number;
  weighted?: number;
  normalization?: ScoreNormalizationDetail;
  source?: string;
  valueRow?: string;
  provenance?: string;
  /** Only present on nested-concept entries — the child concept's own
   *  named-missing terms, surfaced on the parent so nothing silently
   *  disappears a level down. */
  childTermsMissing?: string[];
}

/** One subject's line in a concept's score report. */
export interface ScoredSubject {
  subject: string;
  displayName: string;
  kind: string;
  weightedSum: number;
  initialScore: number;
  levelizedScore: number | null;
  /** Named, never silently dropped — terms this subject had no value for. */
  termsMissing: string[];
  breakdown: ScoreBreakdownEntry[];
}

/** `GET /api/scoring/concepts/{name}/score` — the live-computed report. */
export interface ConceptScoreReport {
  ok: boolean;
  error?: string;
  knownConcepts?: string[];
  concept: string;
  displayName: string;
  description: string;
  aggregation: string;
  aggregationNote: string;
  totalWeight: number;
  requiredContexts: string[];
  levelized: boolean;
  /** Names of child concepts this one composes (concept nesting — a
   *  Context Tree's structural backbone), each already scored once
   *  and reused across every subject that needs it. */
  nestedConcepts: string[];
  subjects: ScoredSubject[];
}

/**
 * Added 2026-07-14 (Phase 3, real WorldviewElection browsing) — mirrors
 * `GET /api/scoring/elections` (list) and `GET /api/scoring/elections/
 * {name}/tally` (detail), verified against the live API. Distinct from
 * this app's OWN native `WorldviewElectionDTO` (`services/api/
 * worldview-elections-api.service.ts`, DRAFT/ACTIVE/CLOSED/ARCHIVED,
 * backed by this app's own `api/worldview-elections` backend route) —
 * that's a real, separately-working PSC-native feature, not touched
 * here. This type is Polari's WorldviewElection specifically.
 */

/** One entry from `GET /api/scoring/elections` — election summary +
 *  a live tally digest (winners/ballotsCast) in the same round trip. */
export interface PolariElectionSummary {
  name: string;
  displayName: string;
  description: string;
  groupName: string;
  mode: 'approval' | 'sole' | 'ranked-condorcet';
  /** Polari only distinguishes open/closed — no DRAFT/PENDING/ARCHIVED
   *  the way this app's native elections do. */
  status: 'open' | 'closed';
  opensDate: string;
  closesDate: string;
  explicitCandidates: string[];
  /** False when tally_election() itself returned ok:false (e.g. no
   *  ballots cast yet) — honest absence, not an error. */
  tallyAvailable: boolean;
  ballotsCast: number;
  winners: string[];
  candidates: string[];
}

export interface PolariElectionsResponse {
  ok: boolean;
  error?: string;
  elections: PolariElectionSummary[];
}

/** One candidate's line in a tally's `results` array — shape differs
 *  slightly by mode (approval/sole carry `share`+vote counts; ranked
 *  carries `copelandWins`+`share`) so fields beyond `candidate` are
 *  optional rather than mode-specific subtypes; no current consumer
 *  needs to discriminate further than display. */
export interface ElectionTallyResultRow {
  candidate: string;
  share: number;
  votes?: number;
  approvals?: number;
  copelandWins?: number;
  voters?: string[];
}

export interface ElectionPairwiseResult {
  pair: [string, string];
  wins: Record<string, number>;
  beats: string | null;
}

/** `GET /api/scoring/elections/{name}/tally` — the full tally report. */
export interface ElectionTallyReport {
  ok: boolean;
  error?: string;
  knownElections?: string[];
  election: string;
  displayName: string;
  group: string;
  mode: 'approval' | 'sole' | 'ranked-condorcet';
  status: 'open' | 'closed';
  candidates: string[];
  ballotsCast: number;
  ballotsCounted: number;
  refusedBallots: { ballot: string; error: string }[];
  results: ElectionTallyResultRow[];
  winners: string[];
  electedWeights: Record<string, number>;
  note: string;
  /** Only present in ranked-condorcet mode. */
  pairwise?: ElectionPairwiseResult[];
}

/**
 * Added 2026-07-14 (Phase 4b) — mirrors `GET /api/scoring/display-votes`
 * and `GET /api/scoring/display-votes/{name}/tally`. Mechanism A: vote
 * on which Display best EXPLAINS a score, distinct from
 * PolariElectionSummary/ElectionTallyReport (mechanism B: vote on
 * term-WEIGHTING worldviews). Same shapes, deliberately not merged
 * with the election types — a display vote's candidates are
 * DisplayDefinition names, an election's are ScoreConcept names;
 * conflating them would blur what's actually being voted on.
 */

/** One entry from `GET /api/scoring/display-votes`. */
export interface PolariDisplayVoteSummary {
  name: string;
  displayName: string;
  description: string;
  groupName: string;
  conceptName: string;
  mode: 'approval' | 'sole' | 'ranked-condorcet';
  status: 'open' | 'closed';
  opensDate: string;
  closesDate: string;
  /** '' until POST .../apply has been called on a closed vote. */
  electedDisplayName: string;
  tallyAvailable: boolean;
  ballotsCast: number;
  winners: string[];
  candidates: string[];
}

export interface PolariDisplayVotesResponse {
  ok: boolean;
  error?: string;
  displayVotes: PolariDisplayVoteSummary[];
}

/** `GET /api/scoring/display-votes/{name}/tally` — the full report. */
export interface DisplayVoteTallyReport {
  ok: boolean;
  error?: string;
  knownVotes?: string[];
  vote: string;
  displayName: string;
  group: string;
  concept: string;
  mode: 'approval' | 'sole' | 'ranked-condorcet';
  status: 'open' | 'closed';
  candidates: string[];
  /** Candidate names that don't match any real DisplayDefinition row
   *  — surfaced honestly rather than silently tallied as real. */
  unknownCandidates: string[];
  ballotsCast: number;
  ballotsCounted: number;
  refusedBallots: { ballot: string; error: string }[];
  results: ElectionTallyResultRow[];
  winners: string[];
  weights: Record<string, number>;
  note: string;
  pairwise?: ElectionPairwiseResult[];
}

/** One extracted 'text'-type item from a candidate Display's
 *  definition — the only DisplayItem type Phase 4's seed data uses;
 *  other types would need a real Display renderer, not attempted
 *  here. `body` includes the heading Polari's seed wrote into the
 *  item text itself (`f'{heading}\n\n{body}'`) — the frontend strips
 *  the duplicate leading heading before rendering, since `title`
 *  already carries it. */
export interface DisplayContentItem {
  title: string;
  body: string;
}

/** One candidate Display resolved for `GET /api/scoring/display-votes/
 *  {name}/displays` — `found: false` when the vote names a candidate
 *  with no matching DisplayDefinition row (honest, not silently
 *  dropped). */
export interface ResolvedCandidateDisplay {
  name: string;
  found: boolean;
  description?: string;
  items: DisplayContentItem[];
}

export interface DisplayVoteDisplaysResponse {
  ok: boolean;
  error?: string;
  vote: string;
  displays: ResolvedCandidateDisplay[];
}

/**
 * Added 2026-07-14 (mechanism C) — mirrors `GET /api/scoring/
 * logic-fork-votes` and `GET /api/scoring/decision-procedures/{name}
 * /resolved`. Mechanism C votes on which alternate CRITERION a
 * specific decision point/fork inside a shared decision procedure
 * should use — distinct from mechanism A (whole Displays) and
 * mechanism B (whole worldview concepts): fork granularity, not
 * whole-object granularity.
 */

export interface PolariLogicForkVoteSummary {
  name: string;
  displayName: string;
  description: string;
  decisionProcedure: string;
  fork: string;
  mode: 'approval' | 'sole' | 'ranked-condorcet';
  status: 'open' | 'closed';
  opensDate: string;
  closesDate: string;
  electedCriterionName: string;
  tallyAvailable: boolean;
  ballotsCast: number;
  winners: string[];
  candidates: string[];
}

export interface PolariLogicForkVotesResponse {
  ok: boolean;
  error?: string;
  logicForkVotes: PolariLogicForkVoteSummary[];
}

/** `GET /api/scoring/logic-fork-votes/{name}/tally` — same shape as
 *  ElectionTallyReport/DisplayVoteTallyReport, over fork criteria. */
export interface LogicForkVoteTallyReport {
  ok: boolean;
  error?: string;
  knownVotes?: string[];
  vote: string;
  displayName: string;
  decisionProcedure: string;
  fork: string;
  mode: 'approval' | 'sole' | 'ranked-condorcet';
  status: 'open' | 'closed';
  candidates: string[];
  unknownCandidates: string[];
  ballotsCast: number;
  ballotsCounted: number;
  refusedBallots: { ballot: string; error: string }[];
  results: ElectionTallyResultRow[];
  winners: string[];
  weights: Record<string, number>;
  note: string;
  pairwise?: ElectionPairwiseResult[];
}

/** One candidate criterion for one fork, as returned by
 *  `resolved_procedure_summary()`. */
export interface DecisionProcedureCandidateCriterion {
  name: string;
  displayName: string;
  description: string;
  isCurrentDefault: boolean;
  proposedBy: string;
}

/** One fork's resolution state within a decision procedure. */
export interface ResolvedDecisionFork {
  fork: string;
  candidateCriteria: DecisionProcedureCandidateCriterion[];
  vote: string | null;
  voteStatus: string | null;
  resolvedCriterion: string | null;
  resolvedSource: 'vote' | 'incumbent-default' | null;
}

/** One connection in the decision procedure's graph. `fromFork`/
 *  `toFork` are null at the graph's start/terminal edges;
 *  `toTerminal` is set (e.g. 'ACQUITTAL') when an edge ends the
 *  procedure rather than continuing to another fork. */
export interface DecisionProcedureGraphEdge {
  fromFork: string | null;
  fromOutcome: string | null;
  toFork: string | null;
  toTerminal: string | null;
  description: string;
}

/** `GET /api/scoring/decision-procedures/{name}/resolved` — the full
 *  connected graph: every locally-defined fork's resolution state +
 *  every edge connecting them start-to-terminal. NOT an executable
 *  no-code graph — a readable summary (see
 *  `scoring/logic_fork_vote.py`'s own documented scope limit). */
export interface ResolvedDecisionProcedure {
  ok: boolean;
  error?: string;
  knownProcedures?: string[];
  decisionProcedure: string;
  forks: ResolvedDecisionFork[];
  edges: DecisionProcedureGraphEdge[];
  note: string;
}

/**
 * Added 2026-07-14 (system-choice implications) — mirrors `GET
 * /api/scoring/system-choices/{fork}/outcomes`. A RAW grouped
 * comparison of a real-world outcome score across jurisdictions,
 * grouped by which criterion each currently deploys at a fork —
 * explicitly NOT a controlled-for-confounds causal estimate (see
 * `note` on the response, always render it, never omit it).
 */

export interface SystemChoiceJurisdictionOutcome {
  jurisdiction: string;
  displayName: string;
  value: number | null;
  note: string;
}

export interface SystemChoiceOutcomeGroup {
  criterion: string;
  jurisdictions: SystemChoiceJurisdictionOutcome[];
  jurisdictionCount: number;
  averageValue: number | null;
  missingCount: number;
}

export interface SystemChoiceOutcomesReport {
  ok: boolean;
  error?: string;
  knownForks?: string[];
  fork: string;
  outcomeTerm: string;
  groups: SystemChoiceOutcomeGroup[];
  note: string;
}

/**
 * Added 2026-07-14 (system-choice implications) — mirrors `GET
 * /api/scoring/assertions?subject=<name>`. A ScoreAssertion is a
 * claim binding a target to a score concept/term, with a full
 * asserted→under-review→confirmed/rejected review lifecycle —
 * genuinely contested claims stay 'under-review', never overclaimed
 * as settled by seed data alone.
 */
export interface PolariAssertionSummary {
  name: string;
  displayName: string;
  subject: string;
  span: unknown | null;
  intent: string;
  type: 'score-impact' | 'dependency' | 'decorative';
  direction: 'supports' | 'harms';
  strength: number;
  conceptName: string;
  termName: string;
  dependsOn: string;
  evidence: string[];
  assertedBy: string;
  status: 'asserted' | 'under-review' | 'confirmed' | 'rejected';
  statusHistory: { from: string; to: string; by: string; note: string; at: string }[];
}

export interface PolariAssertionsResponse {
  ok: boolean;
  error?: string;
  assertions: PolariAssertionSummary[];
}

export interface AssertionValidityRound {
  round: number;
  valid: number;
  invalid: number;
  abstain: number;
  dominantFraction: number;
  leaning: 'valid' | 'invalid' | 'tied';
  band: string;
  voters: string[];
}

/** `GET /api/scoring/assertions/{name}/validity`. */
export interface AssertionValidityReport {
  ok: boolean;
  error?: string;
  assertion: string;
  status: string;
  agreementPolicy: string | null;
  rounds: AssertionValidityRound[];
  suggestion: { knob: string; action: string; evidence: string } | null;
  note: string;
}

/**
 * Policy/politician/cohort accountability scoring (`policy_scoring.py`,
 * `politician_scoring.py`) — added 2026-07-14, same session, once
 * Dustin flagged that the voting layer had UI but the actual scoring
 * layer (the literal original point of this revamp) didn't. Field
 * names verified against a live curl of the real running API, not
 * guessed from the Python source.
 */

export interface ScoreKnobSuggestion {
  knob: string;
  action: string;
}

export interface PolicyAssertionEvidenceItem {
  evidence: string;
  grade: string;
  weight: number;
  quote: string;
  url: string;
}

export interface PolicyAssertionEvidence {
  policy: string;
  items: PolicyAssertionEvidenceItem[];
  dangling: string[];
  grade: string;
  weight: number;
}

/** One CONFIRMED (or otherwise included-status) assertion that
 *  actually moved a policy's score — `term`/`termShare` present when
 *  bound to a specific term; `dependsOn`/`childScore` present when
 *  this is a dependency assertion carrying over another policy's
 *  stance. */
export interface PolicyAssertionUsed {
  assertion: string;
  type: string;
  status: string;
  intent: string;
  quote: string;
  assertedBy: string;
  direction?: string;
  stance: number;
  strength: number;
  evidence: PolicyAssertionEvidence;
  weight: number;
  term?: string;
  termShare?: number | null;
  dependsOn?: string;
  childScore?: number;
}

/** One assertion named but NOT counted (wrong status, decorative,
 *  unbound, or a failed dependency) — visible, never silently
 *  dropped. */
export interface PolicyAssertionExcluded {
  assertion: string;
  type: string;
  status: string;
  intent: string;
  quote: string;
  assertedBy: string;
  reason: string;
  suggestion?: ScoreKnobSuggestion | null;
  error?: string;
}

/** `GET /api/scoring/policies/{name}/score?concept=<name>`. */
export interface PolicyScoreReport {
  ok: boolean;
  error?: string;
  knownConcepts?: string[];
  suggestion?: ScoreKnobSuggestion | null;
  excluded?: PolicyAssertionExcluded[];
  policy: string;
  displayName: string;
  kind: string;
  concept: string;
  stance: number;
  score: number;
  totalWeight: number;
  includeStatuses: string[];
  assertionsUsed: PolicyAssertionUsed[];
  note: string;
}

export interface PoliticianVoteBreakdownEntry {
  policy: string;
  vote: string;
  voteDate: string;
  chamber: string;
  policyStance: number;
  policyScore: number;
  contribution: number;
}

export interface PoliticianAbstain {
  policy: string;
  vote: string;
  voteDate: string;
  chamber: string;
}

export interface PoliticianUnscoreablePolicy extends PoliticianAbstain {
  error: string;
  suggestion?: ScoreKnobSuggestion | null;
}

/** `GET /api/scoring/politicians/{name}/score?concept=<name>`. */
export interface PoliticianScoreReport {
  ok: boolean;
  error?: string;
  suggestion?: ScoreKnobSuggestion | null;
  abstains?: PoliticianAbstain[];
  unscoreablePolicies?: PoliticianUnscoreablePolicy[];
  politician: string;
  displayName: string;
  concept: string;
  timeframe: string | null;
  stance: number;
  score: number;
  decisiveVotes: number;
  /** Fraction of votes that were decisive (not abstained) — null
   *  when there's no denominator at all. Never itself a score. */
  participation: number | null;
  votesOutOfTimeframe: number;
  voteBreakdown: PoliticianVoteBreakdownEntry[];
  note: string;
}

export interface CohortMemberScore {
  politician: string;
  score: number | null;
  stance: number | null;
  participation: number | null;
  error: string | null;
}

export interface CohortVoteCohesion {
  policy: string;
  yea: number;
  nay: number;
  abstain: number;
  dominantFraction: number;
  band: string;
}

/** `GET /api/scoring/cohorts/{name}/report?concept=<name>`. */
export interface CohortReport {
  ok: boolean;
  error?: string;
  knownGroups?: string[];
  suggestion?: ScoreKnobSuggestion | null;
  group: string;
  displayName: string;
  groupType: string;
  concept: string;
  timeframe: string | null;
  agreementPolicy: string | null;
  members: CohortMemberScore[];
  cohortMeanScore: number | null;
  /** Per-policy: how often this cohort actually voted together,
   *  banded through the same editable AgreementPolicy as worldview
   *  agreement. */
  voteCohesion: CohortVoteCohesion[];
  note: string;
}

/**
 * Minimal client-side view of a ScoreSubject/ScoreGroup row, read via
 * Polari's GENERIC CRUDE `GET /{ClassName}` (not `/api/scoring/*` —
 * there is no dedicated list-of-policies/politicians/cohorts route,
 * so this reuses the same generic mechanism
 * `polari-platform-angular`'s `CRUDEclassService` already relies on).
 * Only the fields a picker UI needs are pulled out of the much larger
 * raw row.
 */
export interface PolariScoreSubjectSummary {
  id: string;
  name: string;
  displayName: string;
  kind: string;
  description: string;
}

export interface PolariScoreGroupSummary {
  id: string;
  name: string;
  displayName: string;
  groupType: string;
  memberSubjectNames: string[];
  description: string;
}

/** A `ScoreContext` row with `context_type: 'timeframe'` — a named
 *  date range (`timeframes.py::frame_of_context`) politician/cohort
 *  scoring can be scoped to. Read the same generic-CRUDE way as
 *  `PolariScoreSubjectSummary`/`PolariScoreGroupSummary`, since there
 *  is no dedicated `/api/scoring/timeframes` list route either. */
export interface PolariTimeframeSummary {
  id: string;
  name: string;
  displayName: string;
  start: string;
  end: string;
}
