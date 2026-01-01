import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval, of } from 'rxjs';
import { catchError, switchMap, timeout } from 'rxjs/operators';
import { environment } from '../../environment';
import { OidcService } from './auth/oidc.service';

export enum ConnectionStatus {
  NO_ACCESS = 'no-access',
  GENERAL_ACCESS = 'general-access',
  AUTH_ACCESS = 'auth-access'
}

export interface ConnectionState {
  status: ConnectionStatus;
  backendReachable: boolean;
  authVerified: boolean;
  lastChecked: Date;
  error?: string;
}

/**
 * ConnectionStatusService
 *
 * Monitors backend connectivity and authentication status.
 * Provides real-time status updates through Observable.
 *
 * Status hierarchy:
 * 1. NO_ACCESS - Backend is unreachable
 * 2. GENERAL_ACCESS - Backend is reachable but not authenticated (or no token)
 * 3. AUTH_ACCESS - Backend is reachable AND authentication verified
 */
@Injectable({ providedIn: 'root' })
export class ConnectionStatusService {
  private readonly HEALTH_CHECK_URL = `${environment.backendUri}`;
  private readonly AUTH_CHECK_URL = `${environment.backendUri}auth/test-auth`;
  private readonly CHECK_INTERVAL = 30000; // 30 seconds
  private readonly REQUEST_TIMEOUT = 5000; // 5 seconds

  private connectionStateSubject = new BehaviorSubject<ConnectionState>({
    status: ConnectionStatus.NO_ACCESS,
    backendReachable: false,
    authVerified: false,
    lastChecked: new Date()
  });

  public connectionState$: Observable<ConnectionState> = this.connectionStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private oidcService: OidcService
  ) {
    // Start monitoring on service initialization
    this.startMonitoring();
  }

  /**
   * Start periodic health and auth checks
   */
  private startMonitoring(): void {
    // Perform immediate check
    this.performCheck();

    // Set up periodic checks
    interval(this.CHECK_INTERVAL)
      .pipe(
        switchMap(() => this.performCheck())
      )
      .subscribe();
  }

  /**
   * Perform health and auth check
   * First checks backend health, then checks auth if backend is healthy and token exists
   */
  private performCheck(): Observable<ConnectionState> {
    return new Observable(observer => {
      this.checkBackendHealth().subscribe(backendHealthy => {
        if (!backendHealthy) {
          // Backend is not reachable
          const state: ConnectionState = {
            status: ConnectionStatus.NO_ACCESS,
            backendReachable: false,
            authVerified: false,
            lastChecked: new Date(),
            error: 'Backend is unreachable'
          };
          this.connectionStateSubject.next(state);
          observer.next(state);
          observer.complete();
          return;
        }

        // Backend is healthy, now check if we have a token and should verify auth
        this.oidcService.getAccessToken().then(token => {
          if (!token) {
            // No token, so we have general access but not authenticated
            const state: ConnectionState = {
              status: ConnectionStatus.GENERAL_ACCESS,
              backendReachable: true,
              authVerified: false,
              lastChecked: new Date()
            };
            this.connectionStateSubject.next(state);
            observer.next(state);
            observer.complete();
            return;
          }

          // We have a token, verify it with the backend
          this.checkAuthStatus().subscribe(authValid => {
            const state: ConnectionState = {
              status: authValid ? ConnectionStatus.AUTH_ACCESS : ConnectionStatus.GENERAL_ACCESS,
              backendReachable: true,
              authVerified: authValid,
              lastChecked: new Date(),
              error: authValid ? undefined : 'Authentication failed'
            };
            this.connectionStateSubject.next(state);
            observer.next(state);
            observer.complete();
          });
        });
      });
    });
  }

  /**
   * Check if backend is reachable by hitting the health endpoint
   */
  private checkBackendHealth(): Observable<boolean> {
    return this.http.get(this.HEALTH_CHECK_URL, {
      responseType: 'text',
      // Don't use auth interceptor for health check
      headers: { 'X-Skip-Auth': 'true' }
    }).pipe(
      timeout(this.REQUEST_TIMEOUT),
      switchMap(() => of(true)),
      catchError((error) => {
        console.warn('Backend health check failed:', error);
        return of(false);
      })
    );
  }

  /**
   * Check if authentication is valid by hitting an authenticated endpoint
   * Only called if we already have a token
   */
  private checkAuthStatus(): Observable<boolean> {
    return this.http.get(this.AUTH_CHECK_URL).pipe(
      timeout(this.REQUEST_TIMEOUT),
      switchMap(() => of(true)),
      catchError((error) => {
        console.warn('Auth verification failed:', error);
        return of(false);
      })
    );
  }

  /**
   * Manually trigger a check (useful for immediate feedback after login/logout)
   */
  public triggerCheck(): void {
    this.performCheck().subscribe();
  }

  /**
   * Get current connection state (synchronous)
   */
  public getCurrentState(): ConnectionState {
    return this.connectionStateSubject.value;
  }
}
