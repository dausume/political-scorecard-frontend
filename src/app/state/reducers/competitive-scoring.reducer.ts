import { createReducer, on } from '@ngrx/store';
import { CompetitiveScoringActions } from '../actions/competitive-scoring.actions';
import { CompetitiveScore } from '../../classes/competitive-score';
import { ContextualizedWorldviewBallot } from '../../classes/contextualized-worldview-ballot';
import { ContextualizedTerm } from '../../classes/terms/contextualized-term';

export const CompetitiveScoringStatuses = {
  Idle: 'idle',
  Loading: 'loading',
  Loaded: 'loaded',
  Error: 'error',
} as const;

export type CompetitiveScoringStatus = typeof CompetitiveScoringStatuses[keyof typeof CompetitiveScoringStatuses];

export interface CompetitiveScoringState {
  // Competitive Scores
  competitiveScores: CompetitiveScore[];
  currentCompetitiveScore: CompetitiveScore | null;
  competitiveScoresStatus: CompetitiveScoringStatus;
  competitiveScoresError: string | null;

  // Contextualized Worldview Ballots
  contextualizedWorldviewBallots: ContextualizedWorldviewBallot[];
  currentContextualizedWorldviewBallot: ContextualizedWorldviewBallot | null;
  ballotsStatus: CompetitiveScoringStatus;
  ballotsError: string | null;

  // Contextualized Terms for current ballot
  contextualizedTerms: ContextualizedTerm[];
  contextualizedTermsStatus: CompetitiveScoringStatus;
  contextualizedTermsError: string | null;
}

export const initialCompetitiveScoringState: CompetitiveScoringState = {
  competitiveScores: [],
  currentCompetitiveScore: null,
  competitiveScoresStatus: CompetitiveScoringStatuses.Idle,
  competitiveScoresError: null,

  contextualizedWorldviewBallots: [],
  currentContextualizedWorldviewBallot: null,
  ballotsStatus: CompetitiveScoringStatuses.Idle,
  ballotsError: null,

  contextualizedTerms: [],
  contextualizedTermsStatus: CompetitiveScoringStatuses.Idle,
  contextualizedTermsError: null,
};

export const competitiveScoringReducer = createReducer(
  initialCompetitiveScoringState,

  // Load Competitive Scores
  on(CompetitiveScoringActions.loadCompetitiveScores, (state) => ({
    ...state,
    competitiveScoresStatus: CompetitiveScoringStatuses.Loading,
    competitiveScoresError: null,
  })),

  on(CompetitiveScoringActions.loadCompetitiveScoreById, (state) => ({
    ...state,
    competitiveScoresStatus: CompetitiveScoringStatuses.Loading,
    competitiveScoresError: null,
  })),

  on(CompetitiveScoringActions.loadCompetitiveScoresSuccess, (state, { competitiveScores }) => ({
    ...state,
    competitiveScores,
    competitiveScoresStatus: CompetitiveScoringStatuses.Loaded,
    competitiveScoresError: null,
  })),

  on(CompetitiveScoringActions.loadCompetitiveScoreSuccess, (state, { competitiveScore }) => ({
    ...state,
    currentCompetitiveScore: competitiveScore,
    competitiveScoresStatus: CompetitiveScoringStatuses.Loaded,
    competitiveScoresError: null,
  })),

  on(CompetitiveScoringActions.loadCompetitiveScoresFailure, (state, { error }) => ({
    ...state,
    competitiveScoresStatus: CompetitiveScoringStatuses.Error,
    competitiveScoresError: error,
  })),

  on(CompetitiveScoringActions.setCurrentCompetitiveScore, (state, { competitiveScore }) => ({
    ...state,
    currentCompetitiveScore: competitiveScore,
  })),

  on(CompetitiveScoringActions.clearCurrentCompetitiveScore, (state) => ({
    ...state,
    currentCompetitiveScore: null,
  })),

  // Load Contextualized Worldview Ballots
  on(CompetitiveScoringActions.loadContextualizedWorldviewBallots, (state) => ({
    ...state,
    ballotsStatus: CompetitiveScoringStatuses.Loading,
    ballotsError: null,
  })),

  on(CompetitiveScoringActions.loadContextualizedWorldviewBallotById, (state) => ({
    ...state,
    ballotsStatus: CompetitiveScoringStatuses.Loading,
    ballotsError: null,
  })),

  on(CompetitiveScoringActions.loadContextualizedWorldviewBallotsSuccess, (state, { ballots }) => ({
    ...state,
    contextualizedWorldviewBallots: ballots,
    ballotsStatus: CompetitiveScoringStatuses.Loaded,
    ballotsError: null,
  })),

  on(CompetitiveScoringActions.loadContextualizedWorldviewBallotSuccess, (state, { ballot }) => ({
    ...state,
    currentContextualizedWorldviewBallot: ballot,
    ballotsStatus: CompetitiveScoringStatuses.Loaded,
    ballotsError: null,
  })),

  on(CompetitiveScoringActions.loadContextualizedWorldviewBallotsFailure, (state, { error }) => ({
    ...state,
    ballotsStatus: CompetitiveScoringStatuses.Error,
    ballotsError: error,
  })),

  on(CompetitiveScoringActions.createContextualizedWorldviewBallot, (state, { ballot }) => ({
    ...state,
    contextualizedWorldviewBallots: [...state.contextualizedWorldviewBallots, ballot],
    currentContextualizedWorldviewBallot: ballot,
  })),

  on(CompetitiveScoringActions.updateContextualizedWorldviewBallot, (state, { ballot }) => ({
    ...state,
    contextualizedWorldviewBallots: state.contextualizedWorldviewBallots.map(b =>
      b.id === ballot.id ? ballot : b
    ),
    currentContextualizedWorldviewBallot:
      state.currentContextualizedWorldviewBallot?.id === ballot.id
        ? ballot
        : state.currentContextualizedWorldviewBallot,
  })),

  on(CompetitiveScoringActions.deleteContextualizedWorldviewBallot, (state, { id }) => ({
    ...state,
    contextualizedWorldviewBallots: state.contextualizedWorldviewBallots.filter(b => b.id !== id),
    currentContextualizedWorldviewBallot:
      state.currentContextualizedWorldviewBallot?.id === id
        ? null
        : state.currentContextualizedWorldviewBallot,
  })),

  on(CompetitiveScoringActions.setCurrentContextualizedWorldviewBallot, (state, { ballot }) => ({
    ...state,
    currentContextualizedWorldviewBallot: ballot,
  })),

  on(CompetitiveScoringActions.clearCurrentContextualizedWorldviewBallot, (state) => ({
    ...state,
    currentContextualizedWorldviewBallot: null,
  })),

  // Load Contextualized Terms
  on(CompetitiveScoringActions.loadContextualizedTermsForBallot, (state) => ({
    ...state,
    contextualizedTermsStatus: CompetitiveScoringStatuses.Loading,
    contextualizedTermsError: null,
  })),

  on(CompetitiveScoringActions.loadContextualizedTermsSuccess, (state, { contextualizedTerms }) => ({
    ...state,
    contextualizedTerms,
    contextualizedTermsStatus: CompetitiveScoringStatuses.Loaded,
    contextualizedTermsError: null,
  })),

  on(CompetitiveScoringActions.loadContextualizedTermsFailure, (state, { error }) => ({
    ...state,
    contextualizedTermsStatus: CompetitiveScoringStatuses.Error,
    contextualizedTermsError: error,
  })),

  // Clear all
  on(CompetitiveScoringActions.clearAll, () => initialCompetitiveScoringState)
);
