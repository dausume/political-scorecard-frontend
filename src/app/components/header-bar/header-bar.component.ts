import { Component, OnInit, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthState } from '../../state/reducers/auth.reducer';
import { selectAuthState } from '../../state/selectors/auth.selectors';
import { OidcService } from '../../services/auth/oidc.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header-bar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header-bar.component.html',
  styleUrl: './header-bar.component.scss'
})
export class HeaderBarComponent implements OnInit, OnDestroy {
  authState$: Observable<AuthState>;
  isDark = false;
  private themeSub?: Subscription;

  constructor(
    private store: Store,
    private oidcService: OidcService,
    private themeService: ThemeService
  ) {
    this.authState$ = this.store.select(selectAuthState);
  }

  ngOnInit(): void {
    this.themeSub = this.themeService.currentTheme.subscribe(
      theme => this.isDark = theme === 'dark'
    );
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  async login(): Promise<void> {
    await this.oidcService.login();
  }

  async logout(): Promise<void> {
    await this.oidcService.logout();
  }
}
