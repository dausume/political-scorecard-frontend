import { createReducer, on } from '@ngrx/store';
import { AuthActions } from '../actions/auth.actions';
import { AuthUser } from '../../classes/auth-user';

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

  on(AuthActions.setAuthUser, (state, { user }) => {
    // console.log('[AUTH REDUCER] setAuthUser - BEFORE:', state);
    const newState = {
      ...state,
      user,
      status: AuthStatuses.Authenticated,
    };
    // console.log('[AUTH REDUCER] setAuthUser - AFTER:', newState);
    return newState;
  }),

  on(AuthActions.clearAuthUser, (state) => {
    // console.log('[AUTH REDUCER] clearAuthUser - BEFORE:', state);
    const newState = {
      ...state,
      user: null,
      status: AuthStatuses.Unauthenticated,
    };
    // console.log('[AUTH REDUCER] clearAuthUser - AFTER:', newState);
    return newState;
  }),

  on(AuthActions.authCheckStarted, (state) => {
    // console.log('[AUTH REDUCER] authCheckStarted - BEFORE:', state);
    const newState = {
      ...state,
      status: AuthStatuses.Checking,
    };
    // console.log('[AUTH REDUCER] authCheckStarted - AFTER:', newState);
    return newState;
  }),

  on(AuthActions.updateAuthUserRoles, (state, { roles }) => {
    if (!state.user) return state;
    return {
      ...state,
      user: { ...state.user, roles },
    };
  }),
);