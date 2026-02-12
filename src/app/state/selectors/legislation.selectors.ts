import { createFeatureSelector, createSelector } from '@ngrx/store';
import { LegislationState } from '../reducers/legislation.reducer';

export const selectLegislationState = createFeatureSelector<LegislationState>('legislation');

export const selectAllLegislations = createSelector(
  selectLegislationState,
  (state) => state.legislations
);

export const selectSelectedLegislation = createSelector(
  selectLegislationState,
  (state) => state.selectedLegislation
);

export const selectLegislationAnnotations = createSelector(
  selectLegislationState,
  (state) => state.annotations
);

export const selectLegislationLoading = createSelector(
  selectLegislationState,
  (state) => state.loading
);

export const selectLegislationError = createSelector(
  selectLegislationState,
  (state) => state.error
);

export const selectLegislationsByStatus = (status: string) =>
  createSelector(selectAllLegislations, (legislations) =>
    legislations.filter(l => l.status === status)
  );

export const selectAnnotationsByType = (type: string) =>
  createSelector(selectLegislationAnnotations, (annotations) =>
    annotations.filter(a => a.annotationType === type)
  );

export const selectLegislationById = (id: string) =>
  createSelector(selectAllLegislations, (legislations) =>
    legislations.find(l => l.id === id)
  );
