import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TermsState } from '../reducers/terms.reducer';

export const selectTermsState = createFeatureSelector<TermsState>('terms');

export const selectAllTerms = createSelector(
  selectTermsState,
  (state: TermsState) => state.terms
);

export const selectTermsStatus = createSelector(
  selectTermsState,
  (state: TermsState) => state.status
);

export const selectTermsError = createSelector(
  selectTermsState,
  (state: TermsState) => state.error
);

export const selectTermsLoading = createSelector(
  selectTermsStatus,
  (status) => status === 'loading'
);

export const selectTermsLastQuery = createSelector(
  selectTermsState,
  (state: TermsState) => state.lastQuery
);
