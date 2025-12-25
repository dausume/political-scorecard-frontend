import { ActionReducerMap } from '@ngrx/store';

import { AuthState, authReducer } from './reducers/auth.reducer';
// later: import { UsersState, usersReducer } from './users/users.reducer';

export interface AppState {
  auth: AuthState;
  // users: UsersState;
}

export const rootReducers: ActionReducerMap<AppState> = {
  auth: authReducer,
  // users: usersReducer,
};
