import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WorldviewBallotState } from '../reducers/worldview-ballot.reducer';

export const selectWorldviewBallotState = createFeatureSelector<WorldviewBallotState>('worldviewBallot');

export const selectAllBallots = createSelector(
  selectWorldviewBallotState,
  (state: WorldviewBallotState) => state.ballots
);

export const selectSelectedBallot = createSelector(
  selectWorldviewBallotState,
  (state: WorldviewBallotState) => state.selectedBallot
);

export const selectPersonalContexts = createSelector(
  selectWorldviewBallotState,
  (state: WorldviewBallotState) => state.personalContexts
);

export const selectWeightedTerms = createSelector(
  selectWorldviewBallotState,
  (state: WorldviewBallotState) => state.weightedTerms
);

export const selectPositiveWeightedTerms = createSelector(
  selectWeightedTerms,
  (weightedTerms) => weightedTerms.filter(wt => wt.isPositive)
);

export const selectNegativeWeightedTerms = createSelector(
  selectWeightedTerms,
  (weightedTerms) => weightedTerms.filter(wt => !wt.isPositive)
);

export const selectPositiveTerms = createSelector(
  selectPositiveWeightedTerms,
  (weightedTerms) => weightedTerms.map(wt => wt.term)
);

export const selectNegativeTerms = createSelector(
  selectNegativeWeightedTerms,
  (weightedTerms) => weightedTerms.map(wt => wt.term)
);

export const selectCategorizedTermIds = createSelector(
  selectWeightedTerms,
  (weightedTerms) => weightedTerms.map(wt => wt.term.id)
);

export const selectWorldviewBallotStatus = createSelector(
  selectWorldviewBallotState,
  (state: WorldviewBallotState) => state.status
);

export const selectWorldviewBallotError = createSelector(
  selectWorldviewBallotState,
  (state: WorldviewBallotState) => state.error
);

export const selectWorldviewBallotLoading = createSelector(
  selectWorldviewBallotStatus,
  (status) => status === 'loading'
);

export const selectDrafts = createSelector(
  selectWorldviewBallotState,
  (state: WorldviewBallotState) => state.drafts
);

export const selectDraftByBallotId = (ballotId: string) => createSelector(
  selectDrafts,
  (drafts) => drafts.get(ballotId)
);

export const selectHasDraft = (ballotId: string) => createSelector(
  selectDrafts,
  (drafts) => drafts.has(ballotId)
);
