import { createReducer, on } from '@ngrx/store';
import { WorldviewBallotActions } from '../actions/worldview-ballot.actions';
import { ContextualizedWorldviewBallot } from '../../classes/contextualized-worldview-ballot';
import { TermContext } from '../../classes/terms/contextualized-term';
import { WeightedWorldviewTerm } from '../../classes/terms/weighted-worldview-term';

export const WorldviewBallotStatuses = {
  Idle: 'idle',
  Loading: 'loading',
  Loaded: 'loaded',
  Error: 'error',
} as const;

export type WorldviewBallotStatus = typeof WorldviewBallotStatuses[keyof typeof WorldviewBallotStatuses];

export interface DraftBallot {
  ballotId: string;
  personalContexts: TermContext[];
  weightedTerms: WeightedWorldviewTerm[];
  lastSaved: Date;
}

export interface SubmittedBallot {
  ballotId: string;
  personalContexts: TermContext[];
  weightedTerms: WeightedWorldviewTerm[];
  submittedAt: Date;
}

export interface WorldviewBallotState {
  ballots: ContextualizedWorldviewBallot[];
  selectedBallot: ContextualizedWorldviewBallot | null;
  personalContexts: TermContext[];
  weightedTerms: WeightedWorldviewTerm[];
  drafts: Map<string, DraftBallot>; // Map of ballotId -> draft
  submittedBallots: Map<string, SubmittedBallot>; // Map of ballotId -> submitted ballot
  status: WorldviewBallotStatus;
  submissionStatus: 'idle' | 'submitting' | 'unsubmitting';
  error: string | null;
}

export const initialWorldviewBallotState: WorldviewBallotState = {
  ballots: [],
  selectedBallot: null,
  personalContexts: [],
  weightedTerms: [],
  drafts: new Map<string, DraftBallot>(),
  submittedBallots: new Map<string, SubmittedBallot>(),
  status: WorldviewBallotStatuses.Idle,
  submissionStatus: 'idle',
  error: null,
};

export const worldviewBallotReducer = createReducer(
  initialWorldviewBallotState,

  // Load ballots
  on(WorldviewBallotActions.loadAllBallots, (state) => ({
    ...state,
    status: WorldviewBallotStatuses.Loading,
    error: null,
  })),

  on(WorldviewBallotActions.loadBallotById, (state, { ballotId }) => ({
    ...state,
    status: WorldviewBallotStatuses.Loading,
    error: null,
  })),

  on(WorldviewBallotActions.loadBallotsStarted, (state) => ({
    ...state,
    status: WorldviewBallotStatuses.Loading,
    error: null,
  })),

  on(WorldviewBallotActions.loadBallotsSuccess, (state, { ballots }) => ({
    ...state,
    ballots,
    status: WorldviewBallotStatuses.Loaded,
    error: null,
  })),

  on(WorldviewBallotActions.loadBallotsFailure, (state, { error }) => ({
    ...state,
    ballots: [],
    status: WorldviewBallotStatuses.Error,
    error,
  })),

  // Select ballot
  on(WorldviewBallotActions.selectBallot, (state, { ballot }) => ({
    ...state,
    selectedBallot: ballot,
    personalContexts: [...ballot.personalContexts], // Initialize with ballot's contexts
    weightedTerms: [], // Clear weighted terms when selecting new ballot
  })),

  on(WorldviewBallotActions.clearSelectedBallot, (state) => ({
    ...state,
    selectedBallot: null,
    personalContexts: [],
    weightedTerms: [],
  })),

  // Update contexts
  on(WorldviewBallotActions.updatePersonalContexts, (state, { contexts }) => ({
    ...state,
    personalContexts: [...contexts], // Create new array reference for change detection
  })),

  // Manage weighted terms
  on(WorldviewBallotActions.addPositiveTerm, (state, { term }) => {
    if (!state.selectedBallot) return state;

    // Check if term already exists
    const exists = state.weightedTerms.some(wt => wt.term.id === term.id);
    if (exists) return state;

    const weightedTerm = new WeightedWorldviewTerm({
      id: `wt-${term.id}-${Date.now()}`,
      term: term,
      weight: 0.5, // Default weight 50%
      worldviewBallotId: state.selectedBallot.id,
      isPositive: true,
    });

    return {
      ...state,
      weightedTerms: [...state.weightedTerms, weightedTerm],
    };
  }),

  on(WorldviewBallotActions.addNegativeTerm, (state, { term }) => {
    if (!state.selectedBallot) return state;

    // Check if term already exists
    const exists = state.weightedTerms.some(wt => wt.term.id === term.id);
    if (exists) return state;

    const weightedTerm = new WeightedWorldviewTerm({
      id: `wt-${term.id}-${Date.now()}`,
      term: term,
      weight: 0.5, // Default weight 50%
      worldviewBallotId: state.selectedBallot.id,
      isPositive: false,
    });

    return {
      ...state,
      weightedTerms: [...state.weightedTerms, weightedTerm],
    };
  }),

  on(WorldviewBallotActions.removePositiveTerm, (state, { termId }) => ({
    ...state,
    weightedTerms: state.weightedTerms.filter(wt => !(wt.term.id === termId && wt.isPositive)),
  })),

  on(WorldviewBallotActions.removeNegativeTerm, (state, { termId }) => ({
    ...state,
    weightedTerms: state.weightedTerms.filter(wt => !(wt.term.id === termId && !wt.isPositive)),
  })),

  on(WorldviewBallotActions.updateTermWeight, (state, { termId, isPositive, weight }) => {
    const weightedTermIndex = state.weightedTerms.findIndex(
      wt => wt.term.id === termId && wt.isPositive === isPositive
    );

    if (weightedTermIndex === -1) return state;

    const existingTerm = state.weightedTerms[weightedTermIndex];

    // Create a new instance with updated weight (weight comes in as 0-100, needs to be converted to 0-1)
    const updatedTerm = new WeightedWorldviewTerm({
      id: existingTerm.id,
      term: existingTerm.term,
      weight: Math.max(0, Math.min(100, weight)) / 100,
      worldviewBallotId: existingTerm.worldviewBallotId,
      isPositive: existingTerm.isPositive,
    });

    // Create new array with the updated term
    const newWeightedTerms = [...state.weightedTerms];
    newWeightedTerms[weightedTermIndex] = updatedTerm;

    return {
      ...state,
      weightedTerms: newWeightedTerms,
    };
  }),

  on(WorldviewBallotActions.clearWeightedTerms, (state) => ({
    ...state,
    weightedTerms: [],
  })),

  on(WorldviewBallotActions.setWeightedTerms, (state, { weightedTerms }) => ({
    ...state,
    weightedTerms: [...weightedTerms],
  })),

  // Draft ballot management
  on(WorldviewBallotActions.saveDraft, (state) => {
    if (!state.selectedBallot) return state;

    const draft: DraftBallot = {
      ballotId: state.selectedBallot.id,
      personalContexts: [...state.personalContexts],
      weightedTerms: [...state.weightedTerms],
      lastSaved: new Date(),
    };

    const newDrafts = new Map(state.drafts);
    newDrafts.set(state.selectedBallot.id, draft);

    return {
      ...state,
      drafts: newDrafts,
    };
  }),

  on(WorldviewBallotActions.loadDraft, (state, { ballotId }) => {
    const draft = state.drafts.get(ballotId);
    if (!draft) return state;

    return {
      ...state,
      personalContexts: [...draft.personalContexts],
      weightedTerms: [...draft.weightedTerms],
    };
  }),

  on(WorldviewBallotActions.deleteDraft, (state, { ballotId }) => {
    const newDrafts = new Map(state.drafts);
    newDrafts.delete(ballotId);

    return {
      ...state,
      drafts: newDrafts,
    };
  }),

  on(WorldviewBallotActions.clearDrafts, (state) => ({
    ...state,
    drafts: new Map<string, DraftBallot>(),
  })),

  // Submit ballot
  on(WorldviewBallotActions.submitBallot, (state) => ({
    ...state,
    submissionStatus: 'submitting' as const,
    error: null,
  })),

  on(WorldviewBallotActions.submitBallotSuccess, (state, { ballotId, submittedAt }) => {
    if (!state.selectedBallot || state.selectedBallot.id !== ballotId) {
      return state;
    }

    const submittedBallot: SubmittedBallot = {
      ballotId,
      personalContexts: [...state.personalContexts],
      weightedTerms: [...state.weightedTerms],
      submittedAt,
    };

    const newSubmittedBallots = new Map(state.submittedBallots);
    newSubmittedBallots.set(ballotId, submittedBallot);

    // Remove draft after successful submission
    const newDrafts = new Map(state.drafts);
    newDrafts.delete(ballotId);

    return {
      ...state,
      submittedBallots: newSubmittedBallots,
      drafts: newDrafts,
      submissionStatus: 'idle' as const,
      error: null,
    };
  }),

  on(WorldviewBallotActions.submitBallotFailure, (state, { error }) => ({
    ...state,
    submissionStatus: 'idle' as const,
    error,
  })),

  // Unsubmit ballot
  on(WorldviewBallotActions.unsubmitBallot, (state) => ({
    ...state,
    submissionStatus: 'unsubmitting' as const,
    error: null,
  })),

  on(WorldviewBallotActions.unsubmitBallotSuccess, (state, { ballotId }) => {
    const submittedBallot = state.submittedBallots.get(ballotId);
    if (!submittedBallot) {
      return {
        ...state,
        submissionStatus: 'idle' as const,
      };
    }

    // Remove from submitted ballots
    const newSubmittedBallots = new Map(state.submittedBallots);
    newSubmittedBallots.delete(ballotId);

    // Restore to draft
    const draft: DraftBallot = {
      ballotId: submittedBallot.ballotId,
      personalContexts: [...submittedBallot.personalContexts],
      weightedTerms: [...submittedBallot.weightedTerms],
      lastSaved: new Date(),
    };

    const newDrafts = new Map(state.drafts);
    newDrafts.set(ballotId, draft);

    return {
      ...state,
      submittedBallots: newSubmittedBallots,
      drafts: newDrafts,
      submissionStatus: 'idle' as const,
      error: null,
    };
  }),

  on(WorldviewBallotActions.unsubmitBallotFailure, (state, { error }) => ({
    ...state,
    submissionStatus: 'idle' as const,
    error,
  }))
);
