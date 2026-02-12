import { createReducer, on } from '@ngrx/store';
import { LegislationActions } from '../actions/legislation.actions';
import { LegislationDTO, LegislationAnnotationDTO } from '../../models/legislation.model';

export interface LegislationState {
  legislations: LegislationDTO[];
  selectedLegislation: LegislationDTO | null;
  annotations: LegislationAnnotationDTO[];
  loading: boolean;
  error: string | null;
}

const initialState: LegislationState = {
  legislations: [],
  selectedLegislation: null,
  annotations: [],
  loading: false,
  error: null,
};

export const legislationReducer = createReducer(
  initialState,

  // Load legislations
  on(LegislationActions.loadAllLegislations, LegislationActions.loadLegislationsByStatus, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(LegislationActions.loadLegislationsSuccess, (state, { legislations }) => ({
    ...state,
    legislations,
    loading: false,
    error: null,
  })),
  on(LegislationActions.loadLegislationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load single legislation
  on(LegislationActions.loadLegislation, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(LegislationActions.loadLegislationSuccess, (state, { legislation }) => {
    const existingIndex = state.legislations.findIndex(l => l.id === legislation.id);
    const updatedLegislations = existingIndex >= 0
      ? state.legislations.map((l, i) => i === existingIndex ? legislation : l)
      : [...state.legislations, legislation];

    return {
      ...state,
      legislations: updatedLegislations,
      loading: false,
      error: null,
    };
  }),
  on(LegislationActions.loadLegislationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Select legislation
  on(LegislationActions.selectLegislation, (state, { legislation }) => ({
    ...state,
    selectedLegislation: legislation,
  })),
  on(LegislationActions.clearSelectedLegislation, (state) => ({
    ...state,
    selectedLegislation: null,
  })),

  // Create legislation
  on(LegislationActions.createLegislation, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(LegislationActions.createLegislationSuccess, (state, { legislation }) => ({
    ...state,
    legislations: [...state.legislations, legislation],
    loading: false,
    error: null,
  })),
  on(LegislationActions.createLegislationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update legislation
  on(LegislationActions.updateLegislation, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(LegislationActions.updateLegislationSuccess, (state, { legislation }) => ({
    ...state,
    legislations: state.legislations.map(l => l.id === legislation.id ? legislation : l),
    selectedLegislation: state.selectedLegislation?.id === legislation.id ? legislation : state.selectedLegislation,
    loading: false,
    error: null,
  })),
  on(LegislationActions.updateLegislationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Delete legislation
  on(LegislationActions.deleteLegislation, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(LegislationActions.deleteLegislationSuccess, (state, { id }) => ({
    ...state,
    legislations: state.legislations.filter(l => l.id !== id),
    selectedLegislation: state.selectedLegislation?.id === id ? null : state.selectedLegislation,
    loading: false,
    error: null,
  })),
  on(LegislationActions.deleteLegislationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update status
  on(LegislationActions.updateLegislationStatus, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(LegislationActions.updateLegislationStatusSuccess, (state, { legislation }) => ({
    ...state,
    legislations: state.legislations.map(l => l.id === legislation.id ? legislation : l),
    selectedLegislation: state.selectedLegislation?.id === legislation.id ? legislation : state.selectedLegislation,
    loading: false,
    error: null,
  })),
  on(LegislationActions.updateLegislationStatusFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Annotations
  on(LegislationActions.loadAnnotations, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(LegislationActions.loadAnnotationsSuccess, (state, { annotations }) => ({
    ...state,
    annotations,
    loading: false,
    error: null,
  })),
  on(LegislationActions.loadAnnotationsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(LegislationActions.createAnnotation, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(LegislationActions.createAnnotationSuccess, (state, { annotation }) => ({
    ...state,
    annotations: [...state.annotations, annotation],
    loading: false,
    error: null,
  })),
  on(LegislationActions.createAnnotationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(LegislationActions.updateAnnotation, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(LegislationActions.updateAnnotationSuccess, (state, { annotation }) => ({
    ...state,
    annotations: state.annotations.map(a => a.id === annotation.id ? annotation : a),
    loading: false,
    error: null,
  })),
  on(LegislationActions.updateAnnotationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(LegislationActions.deleteAnnotation, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(LegislationActions.deleteAnnotationSuccess, (state, { annotationId }) => ({
    ...state,
    annotations: state.annotations.filter(a => a.id !== annotationId),
    loading: false,
    error: null,
  })),
  on(LegislationActions.deleteAnnotationFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
