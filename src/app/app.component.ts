import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { AuthSessionService } from './services/auth/auth-session.service'
import { HeaderBarComponent } from './components/header-bar/header-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'political-scorecard-frontend';

  constructor(
    private authSession: AuthSessionService,
    private router: Router
  ) {}

  async ngOnInit() {
    // Check if this is an OAuth callback (has 'code' or 'state' in URL)
    const urlParams = new URLSearchParams(window.location.search);
    const hasCode = urlParams.has('code');
    const hasState = urlParams.has('state');

    if (hasCode || hasState) {
      console.log('Detected OAuth callback, handling...');
      await this.authSession.handleOAuthCallback();

      // Clean up the URL by navigating to root or stored state
      // The handleOAuthCallback already handles state restoration
      this.router.navigate(['/'], { replaceUrl: true });
    } else {
      // Normal app startup - check for existing session
      this.authSession.start();
    }
  }

}