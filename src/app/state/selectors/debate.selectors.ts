import { createFeatureSelector, createSelector } from '@ngrx/store';
import { DebateState } from '../reducers/debate.reducer';

export const selectDebateState = createFeatureSelector<DebateState>('debate');

export const selectMessagesByElection = createSelector(
  selectDebateState,
  (state) => state.messagesByElection
);

export const selectSelectedElectionId = createSelector(
  selectDebateState,
  (state) => state.selectedElectionId
);

export const selectMessagesForSelectedElection = createSelector(
  selectMessagesByElection,
  selectSelectedElectionId,
  (messagesByElection, selectedElectionId) =>
    selectedElectionId ? messagesByElection[selectedElectionId] || [] : []
);

export const selectMessagesForElection = (electionId: string) => createSelector(
  selectMessagesByElection,
  (messagesByElection) => messagesByElection[electionId] || []
);

export const selectLoading = createSelector(
  selectDebateState,
  (state) => state.loading
);

export const selectSending = createSelector(
  selectDebateState,
  (state) => state.sending
);

export const selectError = createSelector(
  selectDebateState,
  (state) => state.error
);
