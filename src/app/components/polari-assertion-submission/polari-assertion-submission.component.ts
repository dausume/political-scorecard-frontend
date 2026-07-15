import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ScoreAssertionApiService } from '../../services/api/score-assertion-api.service';
import { OidcService } from '../../services/auth/oidc.service';
import { AppState } from '../../state/app.state';
import * as AuthSelectors from '../../state/selectors/auth.selectors';
import { ScoreAssertionSubmission } from '../../models/score-assertion/score-assertion-submission-types';

/**
 * Citizen-facing ScoreAssertion submission form (2026-07-14
 * general-scoring follow-up) — same auth-gated pattern as
 * `polari-vote-detail` (login prompt when logged out, real bearer
 * token attached automatically by `auth.interceptor.ts`). POSTs to
 * PSC's OWN backend (`ScoreAssertionApiService`), never directly to
 * Polari — see `ScoreAssertionSubmissionService`'s doc (Java side)
 * for why.
 *
 * Always lands at Polari status='asserted', never pre-confirmed — the
 * form says this plainly rather than implying the claim counts
 * immediately, since `score_policy()` only counts 'confirmed'
 * assertions by default.
 */
@Component({
  selector: 'app-polari-assertion-submission',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './polari-assertion-submission.component.html',
  styleUrl: './polari-assertion-submission.component.scss',
})
export class PolariAssertionSubmissionComponent implements OnInit {
  policyName = '';
  conceptName = '';

  isAuthenticated$: Observable<boolean>;

  form: ScoreAssertionSubmission = {
    policyName: '',
    intent: '',
    assertionType: 'score-impact',
    direction: 'supports',
    strength: 0.5,
    conceptName: '',
    termName: '',
    quote: '',
    dependsOnPolicy: '',
    notes: '',
  };

  submitting = false;
  submitError: string | null = null;
  submitted: ScoreAssertionSubmission | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private assertionApi: ScoreAssertionApiService,
    private oidcService: OidcService,
    private store: Store<AppState>,
  ) {
    this.isAuthenticated$ = this.store.select(AuthSelectors.selectIsAuthenticated);
  }

  ngOnInit(): void {
    this.policyName = this.route.snapshot.paramMap.get('name') || '';
    this.conceptName = this.route.snapshot.queryParamMap.get('concept') || '';
    this.form.policyName = this.policyName;
    this.form.conceptName = this.conceptName;
  }

  login(): void {
    this.oidcService.login();
  }

  submit(): void {
    if (!this.form.intent.trim()) {
      this.submitError = 'Say what this claim asserts.';
      return;
    }
    this.submitting = true;
    this.submitError = null;
    this.assertionApi.submit(this.form).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response.success) {
          this.submitted = response.data;
        } else {
          this.submitError = response.message || 'Polari refused the submission.';
        }
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err?.error?.message || err?.message || 'Could not reach the server.';
      },
    });
  }

  backToPolicy(): void {
    this.router.navigate(['/policy-scores', this.policyName], {
      queryParams: { concept: this.conceptName },
    });
  }
}
