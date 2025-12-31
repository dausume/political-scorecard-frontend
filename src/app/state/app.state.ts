import { ActionReducerMap } from '@ngrx/store';

import { AuthState, authReducer } from './reducers/auth.reducer';
import { TermsState, termsReducer } from './reducers/terms.reducer';
import { CompetitiveScoringState, competitiveScoringReducer } from './reducers/competitive-scoring.reducer';
import { WorldviewBallotState, worldviewBallotReducer } from './reducers/worldview-ballot.reducer';
// later: import { UsersState, usersReducer } from './users/users.reducer';

export interface AppState {
  auth: AuthState;
  terms: TermsState;
  competitiveScoring: CompetitiveScoringState;
  worldviewBallot: WorldviewBallotState;
  // users: UsersState;
}

export const rootReducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  terms: termsReducer,
  competitiveScoring: competitiveScoringReducer,
  worldviewBallot: worldviewBallotReducer,
  // users: usersReducer,
};
