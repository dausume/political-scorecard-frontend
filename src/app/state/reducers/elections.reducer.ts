import { createReducer, on } from '@ngrx/store';
import { ElectionsActions } from '../actions/elections.actions';
import { WorldviewElectionDTO } from '../../services/api/worldview-elections-api.service';

export interface ElectionsState {
  elections: WorldviewElectionDTO[];
  selectedElection: WorldviewElectionDTO | null;
  loading: boolean;
  error: string | null;
}

const initialState: ElectionsState = {
  elections: [],
  selectedElection: null,
  loading: false,
  error: null,
};

export const electionsReducer = createReducer(
  initialState,

  // Load elections
  on(ElectionsActions.loadAllElections, ElectionsActions.loadActiveElections, ElectionsActions.loadElectionsByStatus, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ElectionsActions.loadElectionsSuccess, (state, { elections }) => ({
    ...state,
    elections,
    loading: false,
    error: null,
  })),
  on(ElectionsActions.loadElectionsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Load single election
  on(ElectionsActions.loadElection, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ElectionsActions.loadElectionSuccess, (state, { election }) => {
    // Add or update the election in the list
    const existingIndex = state.elections.findIndex(e => e.id === election.id);
    const updatedElections = existingIndex >= 0
      ? state.elections.map((e, i) => i === existingIndex ? election : e)
      : [...state.elections, election];

    return {
      ...state,
      elections: updatedElections,
      loading: false,
      error: null,
    };
  }),
  on(ElectionsActions.loadElectionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Select election
  on(ElectionsActions.selectElection, (state, { election }) => ({
    ...state,
    selectedElection: election,
  })),
  on(ElectionsActions.clearSelectedElection, (state) => ({
    ...state,
    selectedElection: null,
  })),

  // Create election
  on(ElectionsActions.createElection, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ElectionsActions.createElectionSuccess, (state, { election }) => ({
    ...state,
    elections: [...state.elections, election],
    loading: false,
    error: null,
  })),
  on(ElectionsActions.createElectionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Update election
  on(ElectionsActions.updateElection, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ElectionsActions.updateElectionSuccess, (state, { election }) => ({
    ...state,
    elections: state.elections.map(e => e.id === election.id ? election : e),
    selectedElection: state.selectedElection?.id === election.id ? election : state.selectedElection,
    loading: false,
    error: null,
  })),
  on(ElectionsActions.updateElectionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Delete election
  on(ElectionsActions.deleteElection, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ElectionsActions.deleteElectionSuccess, (state, { electionId }) => ({
    ...state,
    elections: state.elections.filter(e => e.id !== electionId),
    selectedElection: state.selectedElection?.id === electionId ? null : state.selectedElection,
    loading: false,
    error: null,
  })),
  on(ElectionsActions.deleteElectionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Close election
  on(ElectionsActions.closeElection, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ElectionsActions.closeElectionSuccess, (state, { election }) => ({
    ...state,
    elections: state.elections.map(e => e.id === election.id ? election : e),
    selectedElection: state.selectedElection?.id === election.id ? election : state.selectedElection,
    loading: false,
    error: null,
  })),
  on(ElectionsActions.closeElectionFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  }))
);
