import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthState } from '../../state/reducers/auth.reducer';
import { selectAuthState } from '../../state/selectors/auth.selectors';
import { OidcService } from '../../services/auth/oidc.service';
import { ConnectionStatusIndicatorComponent } from '../connection-status-indicator/connection-status-indicator.component';
import { ConnectionStatusService } from '../../services/connection-status.service';

@Component({
  selector: 'app-header-bar',
  standalone: true,
  imports: [CommonModule, RouterModule, ConnectionStatusIndicatorComponent],
  templateUrl: './header-bar.component.html',
  styleUrl: './header-bar.component.scss'
})
export class HeaderBarComponent {
  authState$: Observable<AuthState>;

  constructor(
    private store: Store,
    private oidcService: OidcService,
    private connectionStatusService: ConnectionStatusService
  ) {
    this.authState$ = this.store.select(selectAuthState);
  }

  async login(): Promise<void> {
    await this.oidcService.login();
    // Trigger connection check after login
    this.connectionStatusService.triggerCheck();
  }

  async logout(): Promise<void> {
    await this.oidcService.logout();
    // Trigger connection check after logout
    this.connectionStatusService.triggerCheck();
  }
}
