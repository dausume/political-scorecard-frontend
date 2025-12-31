import { createReducer, on } from '@ngrx/store';
import { TermsActions } from '../actions/terms.actions';
import { Term } from '../../classes/terms/term';

export const TermStatuses = {
  Idle: 'idle',
  Loading: 'loading',
  Loaded: 'loaded',
  Error: 'error',
} as const;

export type TermStatus = typeof TermStatuses[keyof typeof TermStatuses];

export interface TermsState {
  terms: Term[];
  status: TermStatus;
  error: string | null;
  lastQuery: {
    worldviewBallotId?: string;
    competitiveScoringId?: string;
  } | null;
}

export const initialTermsState: TermsState = {
  terms: [],
  status: TermStatuses.Idle,
  error: null,
  lastQuery: null,
};

export const termsReducer = createReducer(
  initialTermsState,

  on(TermsActions.loadAllTerms, (state) => {
    // console.log('[TERMS REDUCER] loadAllTerms - BEFORE:', state);
    const newState = {
      ...state,
      status: TermStatuses.Loading,
      error: null,
      lastQuery: null,
    };
    // console.log('[TERMS REDUCER] loadAllTerms - AFTER:', newState);
    return newState;
  }),

  on(TermsActions.loadTermsByWorldviewBallot, (state, { worldviewBallotId }) => {
    // console.log('[TERMS REDUCER] loadTermsByWorldviewBallot - BEFORE:', state);
    const newState = {
      ...state,
      status: TermStatuses.Loading,
      error: null,
      lastQuery: { worldviewBallotId },
    };
    // console.log('[TERMS REDUCER] loadTermsByWorldviewBallot - AFTER:', newState);
    return newState;
  }),

  on(TermsActions.loadTermsByCompetitiveScoring, (state, { competitiveScoringId }) => {
    // console.log('[TERMS REDUCER] loadTermsByCompetitiveScoring - BEFORE:', state);
    const newState = {
      ...state,
      status: TermStatuses.Loading,
      error: null,
      lastQuery: { competitiveScoringId },
    };
    // console.log('[TERMS REDUCER] loadTermsByCompetitiveScoring - AFTER:', newState);
    return newState;
  }),

  on(TermsActions.loadTermsStarted, (state) => {
    // console.log('[TERMS REDUCER] loadTermsStarted - BEFORE:', state);
    const newState = {
      ...state,
      status: TermStatuses.Loading,
      error: null,
    };
    // console.log('[TERMS REDUCER] loadTermsStarted - AFTER:', newState);
    return newState;
  }),

  on(TermsActions.loadTermsSuccess, (state, { terms }) => {
    // console.log('[TERMS REDUCER] loadTermsSuccess - BEFORE:', state);
    const newState = {
      ...state,
      terms,
      status: TermStatuses.Loaded,
      error: null,
    };
    // console.log('[TERMS REDUCER] loadTermsSuccess - AFTER:', newState);
    return newState;
  }),

  on(TermsActions.loadTermsFailure, (state, { error }) => {
    // console.log('[TERMS REDUCER] loadTermsFailure - BEFORE:', state);
    const newState = {
      ...state,
      terms: [],
      status: TermStatuses.Error,
      error,
    };
    // console.log('[TERMS REDUCER] loadTermsFailure - AFTER:', newState);
    return newState;
  }),

  on(TermsActions.setTerms, (state, { terms }) => {
    // console.log('[TERMS REDUCER] setTerms - BEFORE:', state);
    const newState = {
      ...state,
      terms,
      status: TermStatuses.Loaded,
      error: null,
    };
    // console.log('[TERMS REDUCER] setTerms - AFTER:', newState);
    return newState;
  }),

  on(TermsActions.clearTerms, (state) => {
    // console.log('[TERMS REDUCER] clearTerms - BEFORE:', state);
    const newState = {
      ...state,
      terms: [],
      status: TermStatuses.Idle,
      error: null,
      lastQuery: null,
    };
    // console.log('[TERMS REDUCER] clearTerms - AFTER:', newState);
    return newState;
  }),
);
