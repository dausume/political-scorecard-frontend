import { createFeatureSelector, createSelector } from '@ngrx/store';
import { AuthState } from '../reducers/auth.reducer';

// Feature key: 'auth'
export const selectAuthState = createFeatureSelector<AuthState>('auth');

export const selectAuthUser = createSelector(selectAuthState, (s) => s.user);
export const selectAuthUserName = createSelector(selectAuthState, (s) => s.user?.name ?? null);
export const selectIsAuthenticated = createSelector(selectAuthState, (s) => !!s.user);
export const selectAuthStatus = createSelector(selectAuthState, (s) => s.status ?? null);
