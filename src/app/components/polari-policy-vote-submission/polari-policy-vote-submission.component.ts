import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { PolicyVoteSubmissionApiService } from '../../services/api/policy-vote-submission-api.service';
import { OidcService } from '../../services/auth/oidc.service';
import { AppState } from '../../state/app.state';
import * as AuthSelectors from '../../state/selectors/auth.selectors';
import { PolicyVoteSubmission } from '../../models/policy-vote/policy-vote-submission-types';

/**
 * PolicyVote submission form (2026-07-14 dual-path follow-up) — same
 * auth-gated pattern as `polari-assertion-submission`. Whether the
 * submission actually lands is decided server-side (real
 * ROLE_policy-voting-admin, or real Keycloak group membership as an
 * authorized submitter for this politician) — the client-side
 * `isAdmin$` check below only changes what the form SAYS is required,
 * it never grants anything itself.
 */
@Component({
  selector: 'app-polari-policy-vote-submission',
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
    MatRadioModule,
    MatProgressSpinnerModule,
    MatChipsModule,
  ],
  templateUrl: './polari-policy-vote-submission.component.html',
  styleUrl: './polari-policy-vote-submission.component.scss',
})
export class PolariPolicyVoteSubmissionComponent implements OnInit {
  politicianName = '';
  conceptName = '';

  isAuthenticated$: Observable<boolean>;
  isAdmin$: Observable<boolean>;

  form: PolicyVoteSubmission = {
    politicianName: '',
    policyName: '',
    vote: 'yea',
    voteDate: '',
    chamber: '',
    session: '',
    officialSourceUrl: '',
    notes: '',
  };

  submitting = false;
  submitError: string | null = null;
  submitted: PolicyVoteSubmission | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private voteApi: PolicyVoteSubmissionApiService,
    private oidcService: OidcService,
    private store: Store<AppState>,
  ) {
    this.isAuthenticated$ = this.store.select(AuthSelectors.selectIsAuthenticated);
    this.isAdmin$ = this.store.select(AuthSelectors.selectAuthUserRoles)
      .pipe(map(roles => roles.includes('policy-voting-admin')));
  }

  ngOnInit(): void {
    this.politicianName = this.route.snapshot.paramMap.get('name') || '';
    this.conceptName = this.route.snapshot.queryParamMap.get('concept') || '';
    this.form.politicianName = this.politicianName;
    this.form.policyName = this.route.snapshot.queryParamMap.get('policy') || '';
  }

  login(): void {
    this.oidcService.login();
  }

  submit(): void {
    if (!this.form.policyName.trim()) {
      this.submitError = 'Which policy was this vote on?';
      return;
    }
    this.submitting = true;
    this.submitError = null;
    this.voteApi.submit(this.form).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response.success) {
          this.submitted = response.data;
        } else {
          this.submitError = response.message || 'Not authorized to submit this vote record.';
        }
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err?.error?.message || err?.message || 'Could not reach the server.';
      },
    });
  }

  backToPolitician(): void {
    this.router.navigate(['/politician-scores', this.politicianName], {
      queryParams: { concept: this.conceptName },
    });
  }
}
