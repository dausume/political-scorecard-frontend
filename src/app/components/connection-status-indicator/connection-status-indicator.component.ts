import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ConnectionStatusService, ConnectionStatus, ConnectionState } from '../../services/connection-status.service';

@Component({
  selector: 'app-connection-status-indicator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './connection-status-indicator.component.html',
  styleUrl: './connection-status-indicator.component.scss'
})
export class ConnectionStatusIndicatorComponent implements OnInit, OnDestroy {
  connectionState: ConnectionState | null = null;
  private subscription?: Subscription;

  // Expose enum to template
  ConnectionStatus = ConnectionStatus;

  constructor(private connectionStatusService: ConnectionStatusService) {}

  ngOnInit(): void {
    this.subscription = this.connectionStatusService.connectionState$.subscribe(
      state => {
        this.connectionState = state;
      }
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  /**
   * Get display text for current status
   */
  getStatusText(): string {
    if (!this.connectionState) {
      return 'Checking...';
    }

    switch (this.connectionState.status) {
      case ConnectionStatus.NO_ACCESS:
        return 'Backend Offline';
      case ConnectionStatus.GENERAL_ACCESS:
        return 'Backend Online';
      case ConnectionStatus.AUTH_ACCESS:
        return 'Authenticated';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get tooltip text with more details
   */
  getTooltipText(): string {
    if (!this.connectionState) {
      return 'Checking connection status...';
    }

    const lastChecked = this.connectionState.lastChecked.toLocaleTimeString();

    switch (this.connectionState.status) {
      case ConnectionStatus.NO_ACCESS:
        return `Backend is unreachable. Last checked: ${lastChecked}`;
      case ConnectionStatus.GENERAL_ACCESS:
        return `Backend is online but not authenticated. Last checked: ${lastChecked}`;
      case ConnectionStatus.AUTH_ACCESS:
        return `Backend is online and authenticated. Last checked: ${lastChecked}`;
      default:
        return `Status unknown. Last checked: ${lastChecked}`;
    }
  }

  /**
   * Get CSS class for current status
   */
  getStatusClass(): string {
    if (!this.connectionState) {
      return 'status-checking';
    }

    switch (this.connectionState.status) {
      case ConnectionStatus.NO_ACCESS:
        return 'status-no-access';
      case ConnectionStatus.GENERAL_ACCESS:
        return 'status-general-access';
      case ConnectionStatus.AUTH_ACCESS:
        return 'status-auth-access';
      default:
        return 'status-unknown';
    }
  }
}
