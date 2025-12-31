import { Injectable } from '@angular/core';
import { User, UserManager, UserManagerSettings } from 'oidc-client-ts';
import { environment } from '../../../environment';
import { AuthUser } from '../../classes/auth-user';

/**
 * OidcService
 *
 * Wrapper around oidc-client-ts UserManager to handle authentication
 * with Keycloak using the OIDC/OAuth2 protocol.
 */
@Injectable({ providedIn: 'root' })
export class OidcService {
  private userManager: UserManager;

  constructor() {
    const settings: UserManagerSettings = {
      authority: environment.keycloak.authority,
      client_id: environment.keycloak.clientId,
      redirect_uri: environment.keycloak.redirectUri,
      post_logout_redirect_uri: environment.keycloak.postLogoutRedirectUri,
      response_type: environment.keycloak.responseType,
      scope: environment.keycloak.scope,
      silent_redirect_uri: environment.keycloak.silentRedirectUri,
      automaticSilentRenew: true,
      loadUserInfo: true,
      // PKCE is enabled by default in oidc-client-ts
      // Add additional settings as needed
      monitorSession: true,
    };

    this.userManager = new UserManager(settings);

    // Set up event handlers
    this.userManager.events.addUserLoaded((user: User) => {
      console.log('OIDC: User loaded', user);
    });

    this.userManager.events.addUserUnloaded(() => {
      console.log('OIDC: User unloaded');
    });

    this.userManager.events.addAccessTokenExpiring(() => {
      console.log('OIDC: Access token expiring');
    });

    this.userManager.events.addAccessTokenExpired(() => {
      console.log('OIDC: Access token expired');
    });

    this.userManager.events.addSilentRenewError((error: Error) => {
      console.error('OIDC: Silent renew error', error);
    });

    this.userManager.events.addUserSignedOut(() => {
      console.log('OIDC: User signed out');
    });
  }

  /**
   * Get the current user from storage (if exists)
   */
  async getUser(): Promise<User | null> {
    try {
      return await this.userManager.getUser();
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Convert OIDC User to AuthUser
   */
  convertToAuthUser(oidcUser: User): AuthUser {
    const profile = oidcUser.profile;

    return new AuthUser({
      id: profile.sub || '',
      username: profile.preferred_username || profile.email || '',
      email: profile.email || '',
      firstName: profile.given_name || '',
      lastName: profile.family_name || '',
      roles: this.extractRoles(oidcUser),
      permissions: [],
      preferences: {}
    });
  }

  /**
   * Extract roles from OIDC user token
   */
  private extractRoles(oidcUser: User): string[] {
    const profile = oidcUser.profile as any;

    // Check for realm roles
    if (profile.realm_access && Array.isArray(profile.realm_access.roles)) {
      return profile.realm_access.roles;
    }

    // Check for resource access roles
    if (profile.resource_access) {
      const clientId = environment.keycloak.clientId;
      if (profile.resource_access[clientId] && Array.isArray(profile.resource_access[clientId].roles)) {
        return profile.resource_access[clientId].roles;
      }
    }

    return [];
  }

  /**
   * Initiate login flow (redirect to Keycloak)
   */
  async login(): Promise<void> {
    try {
      await this.userManager.signinRedirect({
        state: window.location.pathname
      });
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    }
  }

  /**
   * Handle the callback after redirect from Keycloak
   * Call this on the redirect URI route
   */
  async handleCallback(): Promise<User | null> {
    try {
      const user = await this.userManager.signinRedirectCallback();
      console.log('OIDC: Signin callback completed', user);
      return user;
    } catch (error) {
      console.error('Error handling callback:', error);
      return null;
    }
  }

  /**
   * Logout and redirect to Keycloak logout
   */
  async logout(): Promise<void> {
    try {
      await this.userManager.signoutRedirect();
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    }
  }

  /**
   * Attempt silent authentication (check for existing session)
   */
  async signinSilent(): Promise<User | null> {
    try {
      const user = await this.userManager.signinSilent();
      console.log('OIDC: Silent signin completed', user);
      return user;
    } catch (error) {
      console.error('Error during silent signin:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getUser();
    return user !== null && !user.expired;
  }

  /**
   * Get access token for API calls
   */
  async getAccessToken(): Promise<string | null> {
    const user = await this.getUser();
    return user?.access_token || null;
  }

  /**
   * Remove user from storage (local logout only, doesn't contact Keycloak)
   */
  async removeUser(): Promise<void> {
    try {
      await this.userManager.removeUser();
    } catch (error) {
      console.error('Error removing user:', error);
    }
  }

  /**
   * Clear stale state from storage
   */
  async clearStaleState(): Promise<void> {
    try {
      await this.userManager.clearStaleState();
    } catch (error) {
      console.error('Error clearing stale state:', error);
    }
  }
}
