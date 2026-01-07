import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ElectionsState } from '../reducers/elections.reducer';

export const selectElectionsState = createFeatureSelector<ElectionsState>('elections');

// Basic selectors
export const selectAllElections = createSelector(
  selectElectionsState,
  (state) => state.elections
);

export const selectSelectedElection = createSelector(
  selectElectionsState,
  (state) => state.selectedElection
);

export const selectElectionsLoading = createSelector(
  selectElectionsState,
  (state) => state.loading
);

export const selectElectionsError = createSelector(
  selectElectionsState,
  (state) => state.error
);

// Filtered selectors
export const selectActiveElections = createSelector(
  selectAllElections,
  (elections) => elections.filter(e => e.status === 'ACTIVE')
);

export const selectDraftElections = createSelector(
  selectAllElections,
  (elections) => elections.filter(e => e.status === 'DRAFT')
);

export const selectClosedElections = createSelector(
  selectAllElections,
  (elections) => elections.filter(e => e.status === 'CLOSED')
);

export const selectArchivedElections = createSelector(
  selectAllElections,
  (elections) => elections.filter(e => e.status === 'ARCHIVED')
);

// Election by ID selector (factory)
export const selectElectionById = (electionId: string) =>
  createSelector(selectAllElections, (elections) =>
    elections.find(e => e.id === electionId)
  );
