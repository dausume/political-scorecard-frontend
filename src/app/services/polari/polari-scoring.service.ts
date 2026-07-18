/**
 * Client for Polari's `/api/scoring/*` backend (see
 * `models/polari-scoring/polari-scoring-types.ts` for why this app
 * calls a separate app's API instead of computing scores itself).
 *
 * `environment.polariApiUrl` resolves per environment the same way
 * `environment.backendUri` does (production / suite / nip.io / bare
 * metal / runtime-config.json override) — see `environment.ts`.
 */

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environment';
import {
  ScoreConceptSummary,
  ScoreConceptsResponse,
  ConceptScoreReport,
  PolariElectionSummary,
  PolariElectionsResponse,
  ElectionTallyReport,
  PolariDisplayVoteSummary,
  PolariDisplayVotesResponse,
  DisplayVoteTallyReport,
  DisplayVoteDisplaysResponse,
  ResolvedCandidateDisplay,
  PolariLogicForkVoteSummary,
  PolariLogicForkVotesResponse,
  LogicForkVoteTallyReport,
  ResolvedDecisionProcedure,
  SystemChoiceOutcomesReport,
  PolariAssertionSummary,
  PolariAssertionsResponse,
  AssertionValidityReport,
  PolicyScoreReport,
  PoliticianScoreReport,
  CohortReport,
  PolariScoreSubjectSummary,
  PolariScoreGroupSummary,
  PolariTimeframeSummary,
  PolariWorldviewGroup,
  GroupAggregateReport,
} from '../../models/polari-scoring/polari-scoring-types';

@Injectable({ providedIn: 'root' })
export class PolariScoringService {
  private readonly API_URL = `${environment.polariApiUrl}/api/scoring`;
  /** Base URL with no `/api/scoring` suffix — for generic CRUDE reads
   *  (`GET /{ClassName}`), a different protocol from the bespoke
   *  `/api/scoring/*` routes (see `getScoreSubjects`/`getScoreGroups`). */
  private readonly BASE_URL = environment.polariApiUrl;

  constructor(private http: HttpClient) {}

  /** Every ScoreConcept currently defined in Polari. */
  getConcepts(): Observable<ScoreConceptSummary[]> {
    return this.http.get<ScoreConceptsResponse>(`${this.API_URL}/concepts`)
      .pipe(map(response => response.concepts));
  }

  /** Live-computed score report for one concept, across every
   *  subject it applies to. */
  getConceptScore(conceptName: string): Observable<ConceptScoreReport> {
    return this.http.get<ConceptScoreReport>(
      `${this.API_URL}/concepts/${encodeURIComponent(conceptName)}/score`);
  }

  /** Every WorldviewElection Polari knows about, with a live tally
   *  digest — Polari's real version of what this app's mocked
   *  browse-worldview-ballots page used to show. */
  getElections(): Observable<PolariElectionSummary[]> {
    return this.http.get<PolariElectionsResponse>(`${this.API_URL}/elections`)
      .pipe(map(response => response.elections));
  }

  /** The full tally for one election: mode-specific results, winners,
   *  elected weights, refused ballots by name, pairwise matrix when
   *  ranked-condorcet. */
  getElectionTally(electionName: string): Observable<ElectionTallyReport> {
    return this.http.get<ElectionTallyReport>(
      `${this.API_URL}/elections/${encodeURIComponent(electionName)}/tally`);
  }

  /** Every GroupDisplayVote Polari knows about — mechanism A: which
   *  Display best explains a score, distinct from getElections()'s
   *  mechanism B (term-weighting worldviews). */
  getDisplayVotes(): Observable<PolariDisplayVoteSummary[]> {
    return this.http.get<PolariDisplayVotesResponse>(
      `${this.API_URL}/display-votes`)
      .pipe(map(response => response.displayVotes));
  }

  /** The full tally for one display vote. */
  getDisplayVoteTally(voteName: string): Observable<DisplayVoteTallyReport> {
    return this.http.get<DisplayVoteTallyReport>(
      `${this.API_URL}/display-votes/${encodeURIComponent(voteName)}/tally`);
  }

  /** The vote's candidate Displays, resolved to their actual text
   *  content — so a UI can show what each explanation SAYS, not just
   *  tally numbers. */
  getDisplayVoteDisplays(
    voteName: string,
  ): Observable<ResolvedCandidateDisplay[]> {
    return this.http.get<DisplayVoteDisplaysResponse>(
      `${this.API_URL}/display-votes/${encodeURIComponent(voteName)}/displays`)
      .pipe(map(response => response.displays));
  }

  /** Every LogicForkVote Polari knows about — mechanism C: vote on
   *  which alternate CRITERION a specific fork should use, distinct
   *  from mechanism A (whole Displays) and mechanism B (whole
   *  worldview concepts). */
  getLogicForkVotes(): Observable<PolariLogicForkVoteSummary[]> {
    return this.http.get<PolariLogicForkVotesResponse>(
      `${this.API_URL}/logic-fork-votes`)
      .pipe(map(response => response.logicForkVotes));
  }

  /** The full tally for one logic-fork vote. */
  getLogicForkVoteTally(voteName: string): Observable<LogicForkVoteTallyReport> {
    return this.http.get<LogicForkVoteTallyReport>(
      `${this.API_URL}/logic-fork-votes/${encodeURIComponent(voteName)}/tally`);
  }

  /** Every known fork in a decision procedure + its resolution state,
   *  plus the graph edges connecting them start-to-terminal. NOT an
   *  executable no-code graph — a readable summary. */
  getResolvedProcedure(procedureName: string): Observable<ResolvedDecisionProcedure> {
    return this.http.get<ResolvedDecisionProcedure>(
      `${this.API_URL}/decision-procedures/${encodeURIComponent(procedureName)}/resolved`);
  }

  /** Groups jurisdictions by which criterion they currently deploy at
   *  a fork, reporting each's outcome-term value + a per-group
   *  average — a RAW comparison, explicitly not a causal estimate
   *  (always render the response's `note`). */
  getSystemChoiceOutcomes(
    forkName: string,
    outcomeTerm: string,
  ): Observable<SystemChoiceOutcomesReport> {
    return this.http.get<SystemChoiceOutcomesReport>(
      `${this.API_URL}/system-choices/${encodeURIComponent(forkName)}/outcomes`,
      { params: { term: outcomeTerm } });
  }

  /** Evidence-weighted claims that a system choice affects a
   *  real-world score, optionally filtered to one subject. */
  getAssertions(subjectName?: string): Observable<PolariAssertionSummary[]> {
    const params: Record<string, string> = subjectName ? { subject: subjectName } : {};
    return this.http.get<PolariAssertionsResponse>(`${this.API_URL}/assertions`, { params })
      .pipe(map(response => response.assertions));
  }

  /** Multi-round validity-vote tally for one assertion — status
   *  classification band (e.g. 'divisive'), never a forced verdict. */
  getAssertionValidity(assertionName: string): Observable<AssertionValidityReport> {
    return this.http.get<AssertionValidityReport>(
      `${this.API_URL}/assertions/${encodeURIComponent(assertionName)}/validity`);
  }

  /** One policy subject's assertion-composed score for one concept —
   *  every contributing assertion itemized, every exclusion named. */
  getPolicyScore(
    policyName: string,
    conceptName: string,
    opts?: { statuses?: string; evidencePolicy?: string },
  ): Observable<PolicyScoreReport> {
    const params: Record<string, string> = { concept: conceptName };
    if (opts?.statuses) { params['statuses'] = opts.statuses; }
    if (opts?.evidencePolicy) { params['evidencePolicy'] = opts.evidencePolicy; }
    return this.http.get<PolicyScoreReport>(
      `${this.API_URL}/policies/${encodeURIComponent(policyName)}/score`, { params });
  }

  /** One politician's concept score from their voting record —
   *  vote-weighted over policy scores, abstentions surfaced as a
   *  participation gap rather than folded into the stance. */
  getPoliticianScore(
    politicianName: string,
    conceptName: string,
    timeframeContext?: string,
  ): Observable<PoliticianScoreReport> {
    const params: Record<string, string> = { concept: conceptName };
    if (timeframeContext) { params['timeframe'] = timeframeContext; }
    return this.http.get<PoliticianScoreReport>(
      `${this.API_URL}/politicians/${encodeURIComponent(politicianName)}/score`, { params });
  }

  /** A politician cohort's per-member scores + per-policy vote
   *  cohesion, banded through the same editable AgreementPolicy as
   *  worldview agreement. */
  getCohortReport(
    groupName: string,
    conceptName: string,
    opts?: { policy?: string; timeframeContext?: string },
  ): Observable<CohortReport> {
    const params: Record<string, string> = { concept: conceptName };
    if (opts?.policy) { params['policy'] = opts.policy; }
    if (opts?.timeframeContext) { params['timeframe'] = opts.timeframeContext; }
    return this.http.get<CohortReport>(
      `${this.API_URL}/cohorts/${encodeURIComponent(groupName)}/report`, { params });
  }

  /** Every ScoreSubject Polari knows about, read via the GENERIC
   *  CRUDE `GET /ScoreSubject` (there is no dedicated
   *  `/api/scoring/subjects` list route) — this is the same envelope
   *  shape (`[0][className][0].data`) `polari-platform-angular`'s
   *  `CRUDEclassService` already relies on. `kind` filters
   *  client-side since the server ignores query params on this
   *  route. Used to populate real policy/politician pickers instead
   *  of asking a citizen to already know an exact subject name. */
  getScoreSubjects(kind?: string): Observable<PolariScoreSubjectSummary[]> {
    return this.http.get<any>(`${this.BASE_URL}/ScoreSubject`).pipe(
      map(envelope => {
        const rows: any[] = envelope?.[0]?.['ScoreSubject']?.[0]?.data ?? [];
        const mapped: PolariScoreSubjectSummary[] = rows.map(r => ({
          id: r.id,
          name: r.name,
          displayName: r.display_name || r.name,
          kind: r.kind || '',
          description: r.description || '',
        }));
        return kind ? mapped.filter(s => s.kind === kind) : mapped;
      }),
    );
  }

  /** Every ScoreGroup Polari knows about, same generic-CRUDE read as
   *  `getScoreSubjects()`. Used to populate a cohort-report picker —
   *  only groups with actual politician members
   *  (`memberSubjectNames.length > 0`) are real cohorts, the rest are
   *  mechanism B worldview-concept groups. */
  getScoreGroups(): Observable<PolariScoreGroupSummary[]> {
    return this.http.get<any>(`${this.BASE_URL}/ScoreGroup`).pipe(
      map(envelope => {
        const rows: any[] = envelope?.[0]?.['ScoreGroup']?.[0]?.data ?? [];
        return rows.map(r => {
          let members: string[] = [];
          try {
            members = JSON.parse(r.member_subject_names_json || '[]');
          } catch {
            members = [];
          }
          return {
            id: r.id,
            name: r.name,
            displayName: r.display_name || r.name,
            groupType: r.group_type || '',
            memberSubjectNames: members,
            description: r.description || '',
          } as PolariScoreGroupSummary;
        });
      }),
    );
  }

  /** ScoreGroups read as WORLDVIEWS: the group-hosted concept set
   *  (member_concept_names_json) with the group's elected weights
   *  (member_weights_json + provenance) — the real replacement for
   *  the legacy client-side worldview scorer's mocked term pool. */
  getWorldviewGroups(): Observable<PolariWorldviewGroup[]> {
    return this.http.get<any>(`${this.BASE_URL}/ScoreGroup`).pipe(
      map(envelope => {
        const rows: any[] = envelope?.[0]?.['ScoreGroup']?.[0]?.data ?? [];
        return rows.map(r => {
          const parse = (text: string, fallback: unknown) => {
            try {
              return JSON.parse(text || '') ?? fallback;
            } catch {
              return fallback;
            }
          };
          return {
            name: r.name,
            displayName: r.display_name || r.name,
            groupType: r.group_type || '',
            description: r.description || '',
            memberConceptNames: parse(r.member_concept_names_json, []) as string[],
            memberWeights: parse(r.member_weights_json, {}) as Record<string, number>,
            weightsProvenance: r.weights_provenance || '',
          } as PolariWorldviewGroup;
        });
      }),
    );
  }

  /** Polari's SERVER-SIDE group-weighted aggregate — the engine's own
   *  worldview score, optionally scoped to one policy. */
  getGroupAggregate(groupName: string, policy?: string): Observable<GroupAggregateReport> {
    const params = policy ? { params: { policy } } : {};
    return this.http.get<GroupAggregateReport>(
      `${this.API_URL}/groups/${encodeURIComponent(groupName)}/aggregate`, params);
  }

  /** Every named timeframe (`ScoreContext` rows with
   *  `context_type: 'timeframe'`) — same generic-CRUDE read as
   *  `getScoreSubjects`/`getScoreGroups`, since there is no dedicated
   *  list route for these either. Used to populate a real timeframe
   *  picker for politician/cohort scoring instead of asking a citizen
   *  to already know a ScoreContext name. */
  getTimeframeContexts(): Observable<PolariTimeframeSummary[]> {
    return this.http.get<any>(`${this.BASE_URL}/ScoreContext`).pipe(
      map(envelope => {
        const rows: any[] = envelope?.[0]?.['ScoreContext']?.[0]?.data ?? [];
        return rows
          .filter(r => r.context_type === 'timeframe')
          .map(r => {
            let value: { start?: string; end?: string } = {};
            try {
              value = JSON.parse(r.value_json || '{}');
            } catch {
              value = {};
            }
            return {
              id: r.id,
              name: r.name,
              displayName: r.display_name || r.name,
              start: value.start || '',
              end: value.end || '',
            } as PolariTimeframeSummary;
          });
      }),
    );
  }
}
