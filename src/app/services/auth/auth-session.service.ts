import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription, take } from 'rxjs';

import { AuthActions, AuthUser } from '../../state/actions/auth.actions';
import { selectAuthStatus, selectAuthUser } from '../../state/selectors/auth.selectors';
import { AuthStatus } from '../../state/reducers/auth.reducer';

/**
 * AuthSessionService
 *
 * Think of this like a React "auth hook" but at app scope.
 * It centralizes all auth entry points (startup, route gates, 401s, manual login, logout).
 *
 * CURRENT: Mock implementation (no OIDC).
 * LATER: Replace the mock bodies with OIDC calls (see TODO blocks).
 */
@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private started = false;
  private inFlight = false;
  private sub = new Subscription();

  constructor(private store: Store) {}

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
   * With OIDC, this typically initiates a redirect or popup.
   */
  login(): void {
    // TODO(OIDC): trigger the OIDC login flow.
    // Examples depending on library:
    // - oidc-client-ts: userManager.signinRedirect() or signinPopup()
    // - angular-oauth2-oidc: oauthService.initLoginFlow()
    // - custom: navigate to /auth/login, etc.

    // MOCK: "pretend login succeeded"
    this.mockSetUser({ id: 'mock-user-123', name: 'Dustin Etts' }, 'manual-login');
  }

  /**
   * Manual logout trigger.
   */
  logout(): void {
    // TODO(OIDC): trigger OIDC logout flow (end session endpoint).
    // Examples:
    // - oidc-client-ts: userManager.signoutRedirect()
    // - angular-oauth2-oidc: oauthService.logOut()

    // MOCK: clear state immediately
    this.store.dispatch(AuthActions.clearAuthUser());
  }

  /**
   * Ensure the app has determined authentication state.
   * - If already authenticated: do nothing
   * - If unknown/unauthenticated: attempt to establish session (mock now; OIDC later)
   */
  ensureAuth(reason: string): void {
    if (this.inFlight) return;

    const s = this.store
      .select(selectAuthUser)
      .pipe(take(1))
      .subscribe((user) => {
        if (user) return; // already authenticated

        // At this point, we have no user. Decide whether to attempt session restore.
        this.inFlight = true;
        this.store.dispatch(AuthActions.authCheckStarted());

        // TODO(OIDC): Replace this block with:
        // - silent token refresh
        // - check existing session / tokens in storage
        // - handle callback route
        // - or perform "signinSilent" / "checkAuth"
        //
        // Pseudocode:
        // try {
        //   const oidcUser = await oidc.getUser() or await oidc.signinSilent();
        //   if (oidcUser && oidcUser.profile) dispatch(setAuthUser(...));
        //   else dispatch(clearAuthUser());
        // } catch { dispatch(clearAuthUser()); }
        // finally { inFlight=false; }

        this.mockAttemptSessionRestore(reason);
      });

    this.sub.add(s);
  }

  /**
   * MOCK: Simulates "call backend /auth/me" OR "silent auth check".
   * Swap this out for OIDC silent refresh / session check later.
   */
  private mockAttemptSessionRestore(reason: string): void {
    // MOCK POLICY:
    // - For now, we always "find" a session on startup/enter.
    // - You can change this to randomly fail to test unauth flows.
    const shouldAuthSucceed = true;

    setTimeout(() => {
      if (shouldAuthSucceed) {
        const mockUser: AuthUser = { id: 'mock-user-123', name: `Mock Auth User` };
        this.store.dispatch(AuthActions.setAuthUser({ user: mockUser }));
      } else {
        this.store.dispatch(AuthActions.clearAuthUser());
      }

      this.inFlight = false;
    }, 300);
  }

  /**
   * MOCK helper to set user without "restore".
   */
  private mockSetUser(user: AuthUser, reason: string): void {
    // If you want, you can also set status checking first:
    // this.store.dispatch(AuthActions.authCheckStarted());
    this.store.dispatch(AuthActions.setAuthUser({ user }));
    this.inFlight = false;
  }

  /**
   * Optional: call this if you create router listeners / global subscriptions later.
   */
  destroy(): void {
    this.sub.unsubscribe();
  }
}
