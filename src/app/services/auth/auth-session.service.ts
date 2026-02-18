import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Subscription, take, firstValueFrom } from 'rxjs';

import { AuthActions } from '../../state/actions/auth.actions';
import { AuthUser } from '../../classes/auth-user';
import { selectAuthStatus, selectAuthUser } from '../../state/selectors/auth.selectors';
import { AuthStatus } from '../../state/reducers/auth.reducer';
import { OidcService } from './oidc.service';
import { environment } from '../../../environment';

/**
 * AuthSessionService
 *
 * Think of this like a React "auth hook" but at app scope.
 * It centralizes all auth entry points (startup, route gates, 401s, manual login, logout).
 *
 * Integrates with Keycloak via OIDC using oidc-client-ts.
 */
@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private started = false;
  private inFlight = false;
  private sub = new Subscription();

  constructor(
    private store: Store,
    private oidcService: OidcService,
    private http: HttpClient
  ) {}

  /**
   * Call once at app startup (e.g., AppComponent.ngOnInit()).
   * Goal: establish current auth session if any exists.
   */
  start(): void {
    if (this.started) return;
    this.started = true;

    // On startup, do a single "ensure auth" check.
    this.ensureAuth('startup');
  }

  /**
   * Call when navigating into areas that require authentication.
   * You can invoke this from:
   * - route guards (later)
   * - container components on init
   * - a central router listener (later)
   */
  onProtectedAreaEntered(area: string): void {
    this.ensureAuth(`enter:${area}`);
  }

  /**
   * Call when the backend returns 401/403 (later via an HTTP interceptor).
   * This should trigger refresh/re-auth.
   */
  onApiUnauthorized(endpoint?: string): void {
    this.ensureAuth(`api-unauthorized:${endpoint ?? 'unknown'}`);
  }

  /**
   * Manual login trigger (e.g., Login button).
   * Initiates OIDC login flow with redirect to Keycloak.
   */
  async login(): Promise<void> {
    try {
      await this.oidcService.login();
    } catch (error) {
      console.error('Login failed:', error);
      this.store.dispatch(AuthActions.clearAuthUser());
    }
  }

  /**
   * Manual logout trigger.
   * Initiates OIDC logout flow with redirect to Keycloak.
   */
  async logout(): Promise<void> {
    try {
      await this.oidcService.logout();
      this.store.dispatch(AuthActions.clearAuthUser());
    } catch (error) {
      console.error('Logout failed:', error);
      // Clear local state even if remote logout fails
      this.store.dispatch(AuthActions.clearAuthUser());
    }
  }

  /**
   * Ensure the app has determined authentication state.
   * - If already authenticated: do nothing
   * - If unknown/unauthenticated: attempt to establish session via OIDC
   */
  ensureAuth(reason: string): void {
    if (this.inFlight) return;

    const s = this.store
      .select(selectAuthUser)
      .pipe(take(1))
      .subscribe((user) => {
        if (user) return; // already authenticated

        // At this point, we have no user. Attempt to restore session from OIDC.
        this.inFlight = true;
        this.store.dispatch(AuthActions.authCheckStarted());

        this.attemptSessionRestore(reason);
      });

    this.sub.add(s);
  }

  /**
   * Attempt to restore session from OIDC storage or via silent authentication
   */
  private async attemptSessionRestore(reason: string): Promise<void> {
    try {
      console.log(`Attempting session restore: ${reason}`);

      // First, check if we have a user in storage
      let oidcUser = await this.oidcService.getUser();

      // If no user in storage, try silent signin
      if (!oidcUser || oidcUser.expired) {
        console.log('No valid user in storage, attempting silent signin...');
        oidcUser = await this.oidcService.signinSilent();
      }

      // If we have a valid user, convert and enrich with backend roles
      if (oidcUser && !oidcUser.expired) {
        const authUser = this.oidcService.convertToAuthUser(oidcUser);
        await this.enrichWithBackendRoles(authUser);
        this.store.dispatch(AuthActions.setAuthUser({ user: authUser }));
        console.log('Session restored successfully');
      } else {
        // No valid session found
        console.log('No valid session found');
        this.store.dispatch(AuthActions.clearAuthUser());
      }
    } catch (error) {
      console.error('Session restore failed:', error);
      this.store.dispatch(AuthActions.clearAuthUser());
    } finally {
      this.inFlight = false;
    }
  }

  /**
   * Handle the OAuth callback after redirect from Keycloak.
   * Call this when the app receives the callback on the redirect URI.
   */
  async handleOAuthCallback(): Promise<void> {
    try {
      console.log('Handling OAuth callback...');
      const oidcUser = await this.oidcService.handleCallback();

      if (oidcUser) {
        const authUser = this.oidcService.convertToAuthUser(oidcUser);
        await this.enrichWithBackendRoles(authUser);
        this.store.dispatch(AuthActions.setAuthUser({ user: authUser }));
        console.log('OAuth callback handled successfully');

        // Restore the original path from state if available
        const state = oidcUser.state;
        if (state && typeof state === 'string' && state !== '/') {
          window.history.replaceState({}, '', state);
        }
      } else {
        console.error('OAuth callback did not return a user');
        this.store.dispatch(AuthActions.clearAuthUser());
      }
    } catch (error) {
      console.error('OAuth callback handling failed:', error);
      this.store.dispatch(AuthActions.clearAuthUser());
    }
  }

  /**
   * Fetch user info (including roles) from the backend via /auth/me.
   * Merges backend-provided roles into the AuthUser, preferring the backend
   * as the source of truth over client-side token parsing.
   */
  private async enrichWithBackendRoles(authUser: AuthUser): Promise<void> {
    try {
      const backendUrl = environment.backendUri.replace(/\/$/, '');
      const response = await firstValueFrom(
        this.http.get<{ success: boolean; data: { roles?: string[] } }>(`${backendUrl}/auth/me`)
      );
      if (response?.success && response.data?.roles) {
        authUser.roles = response.data.roles;
        console.log('Roles enriched from backend:', authUser.roles);
      }
    } catch (error) {
      console.warn('Could not fetch roles from backend, using token roles:', error);
      // Keep the roles extracted from the OIDC token as fallback
    }
  }

  /**
   * Re-fetch the user's roles from the backend and update the store.
   * Useful after actions that change the user's roles (e.g., joining a group).
   */
  async refreshRoles(): Promise<void> {
    const oidcUser = await this.oidcService.getUser();
    if (oidcUser && !oidcUser.expired) {
      const authUser = this.oidcService.convertToAuthUser(oidcUser);
      await this.enrichWithBackendRoles(authUser);
      this.store.dispatch(AuthActions.setAuthUser({ user: authUser }));
    }
  }

  /**
   * Optional: call this if you create router listeners / global subscriptions later.
   */
  destroy(): void {
    this.sub.unsubscribe();
  }
}
