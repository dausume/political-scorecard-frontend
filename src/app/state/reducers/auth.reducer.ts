import { createReducer, on } from '@ngrx/store';
import { AuthActions, AuthUser } from '../actions/auth.actions';

export const AuthStatuses = {
  Unknown: 'unknown',
  Checking: 'checking',
  Authenticated: 'authenticated',
  Unauthenticated: 'unauthenticated',
} as const;

export type AuthStatus = typeof AuthStatuses[keyof typeof AuthStatuses];

export interface AuthState {
  user: AuthUser | null;
  status: AuthStatus;
}

export const initialAuthState: AuthState = {
  user: null,
  status: 'unknown'
};

export const authReducer = createReducer(
  initialAuthState,

  on(AuthActions.setAuthUser, (state, { user }) => ({
    ...state,
    user,
    status: AuthStatuses.Authenticated,
  })),

  on(AuthActions.clearAuthUser, (state) => ({
    ...state,
    user: null,
    status: AuthStatuses.Unauthenticated,
  })),

  on(AuthActions.authCheckStarted, (state) => ({
    ...state,
    status: AuthStatuses.Checking,
  })),
);