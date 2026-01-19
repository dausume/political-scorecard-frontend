import { Injectable, signal, computed } from '@angular/core';
import { environment } from '../../environment';

export interface EndpointStatus {
  name: string;
  url: string;
  trusted: boolean;
  checked: boolean;
  error?: string;
}

/**
 * CertificateTrustService
 *
 * Detects when self-signed certificates are not trusted by the browser
 * and provides information to help users resolve the issue.
 *
 * In development with self-signed certs, browsers will reject HTTPS connections
 * to endpoints they don't trust. This service probes key endpoints and detects
 * these failures so we can show a helpful UI to the user.
 */
@Injectable({ providedIn: 'root' })
export class CertificateTrustService {

  // Endpoints to check for certificate trust
  // Use /cert-trust endpoint for API servers to show a user-friendly page
  private endpoints: EndpointStatus[] = [
    {
      name: 'Keycloak (Authentication)',
      url: this.extractBaseUrl(environment.keycloak.authority),
      trusted: false,
      checked: false
    },
    {
      name: 'Backend API',
      url: environment.backendHttpsUri.replace(/\/$/, '') + '/cert-trust',
      trusted: false,
      checked: false
    }
  ];

  // Reactive signals for component binding
  private _endpointStatuses = signal<EndpointStatus[]>(this.endpoints);
  private _checkComplete = signal<boolean>(false);
  private _hasUntrustedCerts = signal<boolean>(false);
  private _dismissed = signal<boolean>(false);

  // Public computed signals
  endpointStatuses = computed(() => this._endpointStatuses());
  checkComplete = computed(() => this._checkComplete());
  hasUntrustedCerts = computed(() => this._hasUntrustedCerts());
  showPrompt = computed(() =>
    this._checkComplete() &&
    this._hasUntrustedCerts() &&
    !this._dismissed()
  );

  constructor() {}

  /**
   * Extract base URL from a full URL (e.g., get origin from authority URL)
   */
  private extractBaseUrl(url: string): string {
    try {
      const parsed = new URL(url);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      return url;
    }
  }

  /**
   * Check all endpoints for certificate trust issues
   * Call this on app startup
   */
  async checkAllEndpoints(): Promise<void> {
    // Skip check if not using HTTPS endpoints (bare metal HTTP mode)
    if (!environment.backendHttpsUri.startsWith('https://')) {
      this._checkComplete.set(true);
      return;
    }

    const results = await Promise.all(
      this.endpoints.map(endpoint => this.checkEndpoint(endpoint))
    );

    this._endpointStatuses.set(results);
    this._checkComplete.set(true);
    this._hasUntrustedCerts.set(results.some(e => !e.trusted));

    if (this._hasUntrustedCerts()) {
      console.warn('Certificate trust issues detected. Some endpoints are not trusted by the browser.');
      results.filter(e => !e.trusted).forEach(e => {
        console.warn(`  - ${e.name}: ${e.url}`);
      });
    }
  }

  /**
   * Check a single endpoint for certificate trust
   */
  private async checkEndpoint(endpoint: EndpointStatus): Promise<EndpointStatus> {
    try {
      // Use a simple fetch with a short timeout
      // We're just checking if the connection succeeds, not the response content
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(endpoint.url, {
        method: 'HEAD',
        mode: 'no-cors', // Allows the request to complete even without CORS headers
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      // If we get here without throwing, the certificate is trusted
      // Note: 'no-cors' mode returns opaque response, so we can't check status
      // But if SSL handshake failed, fetch would throw
      return {
        ...endpoint,
        trusted: true,
        checked: true
      };
    } catch (error: any) {
      // Network errors (including SSL failures) end up here
      // Unfortunately browsers don't give us specific SSL error info
      return {
        ...endpoint,
        trusted: false,
        checked: true,
        error: error.message || 'Connection failed - likely untrusted certificate'
      };
    }
  }

  /**
   * Dismiss the certificate trust prompt
   * User has acknowledged and will handle it themselves
   */
  dismiss(): void {
    this._dismissed.set(true);
  }

  /**
   * Reset dismissed state (e.g., for re-checking)
   */
  reset(): void {
    this._dismissed.set(false);
    this._checkComplete.set(false);
    this._hasUntrustedCerts.set(false);
  }

  /**
   * Get instructions for trusting certificates
   */
  getTrustInstructions(): string[] {
    return [
      'Click each link below to open the service in a new tab',
      'Your browser will show a security warning about the certificate',
      'Click "Advanced" (or similar) and choose to proceed/accept the risk',
      'Once accepted, close the tab and return here',
      'After trusting all certificates, refresh this page'
    ];
  }
}
