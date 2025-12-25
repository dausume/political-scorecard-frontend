import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthSessionService } from './services/auth/auth-session.service'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'political-scorecard-frontend';

  constructor(private authSession: AuthSessionService) {}

  ngOnInit() {
    this.authSession.start();
  }

}