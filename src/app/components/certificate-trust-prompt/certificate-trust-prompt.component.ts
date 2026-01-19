import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { CertificateTrustService } from '../../services/certificate-trust.service';

/**
 * CertificateTrustPromptComponent
 *
 * Displays a user-friendly prompt when self-signed certificates are not trusted.
 * Provides links to each endpoint so users can accept the certificates,
 * and instructions on how to proceed.
 */
@Component({
  selector: 'app-certificate-trust-prompt',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatListModule],
  templateUrl: './certificate-trust-prompt.component.html',
  styleUrl: './certificate-trust-prompt.component.scss'
})
export class CertificateTrustPromptComponent {

  // Inject service using inject() to allow field initialization
  private certService = inject(CertificateTrustService);

  // Bind to service signals
  showPrompt = this.certService.showPrompt;
  endpoints = this.certService.endpointStatuses;
  instructions = this.certService.getTrustInstructions();

  // Filter to only untrusted endpoints
  untrustedEndpoints = computed(() =>
    this.endpoints().filter(e => !e.trusted)
  );

  /**
   * Open an endpoint URL in a new tab so user can accept the certificate
   */
  openEndpoint(url: string): void {
    window.open(url, '_blank');
  }

  /**
   * Dismiss the prompt - user will handle it themselves
   */
  dismiss(): void {
    this.certService.dismiss();
  }

  /**
   * Refresh the page after user has trusted certificates
   */
  refresh(): void {
    window.location.reload();
  }
}
