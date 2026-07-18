import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolicyVoteSubmissionApiService } from '../../services/api/policy-vote-submission-api.service';
import { AppState } from '../../state/app.state';
import * as AuthSelectors from '../../state/selectors/auth.selectors';
import {
  KeycloakUserRef,
  PoliticianAuthorizations,
  StaffAuthorization,
} from '../../models/policy-vote/policy-vote-submission-types';

/**
 * Admin-only page (2026-07-14): lets a policy-voting-admin designate
 * a Keycloak user as a specific politician's own PolicyVote submitter
 * — the "cabinet people or assistants they personally authorized"
 * path. Client-side role check here is purely cosmetic (shows an
 * honest "admins only" message instead of a form that would just get
 * a 403) — the real enforcement is the backend's
 * `hasRole('policy-voting-admin')` on `/api/policy-votes/authorize-staff`.
 */
@Component({
  selector: 'app-polari-authorize-staff',
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
    MatProgressSpinnerModule,
  ],
  templateUrl: './polari-authorize-staff.component.html',
  styleUrl: './polari-authorize-staff.component.scss',
})
export class PolariAuthorizeStaffComponent implements OnInit {
  isAdmin$: Observable<boolean>;

  form: StaffAuthorization = { politicianName: '', username: '' };

  submitting = false;
  submitError: string | null = null;
  submitMessage: string | null = null;

  // Current authorizations (admin-only; a 403 shows the note instead).
  authorizations: PoliticianAuthorizations[] = [];
  loadingAuthorizations = false;
  authorizationsAdminOnly = false;
  authorizationsError: string | null = null;
  revoking: string | null = null;
  revokeError: string | null = null;

  // policy-voting-admin holders (same admin-only handling).
  admins: KeycloakUserRef[] = [];
  loadingAdmins = false;
  adminsAdminOnly = false;
  adminsError: string | null = null;

  constructor(
    private voteApi: PolicyVoteSubmissionApiService,
    private store: Store<AppState>,
  ) {
    this.isAdmin$ = this.store.select(AuthSelectors.selectAuthUserRoles)
      .pipe(map(roles => roles.includes('policy-voting-admin')));
  }

  ngOnInit(): void {
    this.loadAuthorizations();
    this.loadAdmins();
  }

  loadAuthorizations(): void {
    this.loadingAuthorizations = true;
    this.authorizationsAdminOnly = false;
    this.authorizationsError = null;
    this.voteApi.listAuthorizations().subscribe({
      next: (authorizations) => {
        this.authorizations = authorizations || [];
        this.loadingAuthorizations = false;
      },
      error: (err) => {
        this.loadingAuthorizations = false;
        if (err?.status === 403 || err?.status === 401) {
          this.authorizationsAdminOnly = true;
        } else {
          this.authorizationsError = err?.error?.message || 'Could not load authorizations.';
        }
      },
    });
  }

  loadAdmins(): void {
    this.loadingAdmins = true;
    this.adminsAdminOnly = false;
    this.adminsError = null;
    this.voteApi.listAdmins().subscribe({
      next: (admins) => {
        this.admins = admins || [];
        this.loadingAdmins = false;
      },
      error: (err) => {
        this.loadingAdmins = false;
        if (err?.status === 403 || err?.status === 401) {
          this.adminsAdminOnly = true;
        } else {
          this.adminsError = err?.error?.message || 'Could not load admins.';
        }
      },
    });
  }

  revoke(politicianName: string, username: string): void {
    this.revoking = `${politicianName}:${username}`;
    this.revokeError = null;
    this.voteApi.revokeStaff(politicianName, username).subscribe({
      next: (response) => {
        this.revoking = null;
        if (response.success) {
          this.loadAuthorizations();
        } else {
          this.revokeError = response.message || 'Revocation failed.';
        }
      },
      error: (err) => {
        this.revoking = null;
        this.revokeError = err?.error?.message || err?.message || 'Could not revoke.';
      },
    });
  }

  submit(): void {
    if (!this.form.politicianName.trim() || !this.form.username.trim()) {
      this.submitError = 'Both politician and username are required.';
      return;
    }
    this.submitting = true;
    this.submitError = null;
    this.submitMessage = null;
    this.voteApi.authorizeStaff(this.form).subscribe({
      next: (response) => {
        this.submitting = false;
        if (response.success) {
          this.submitMessage = response.message;
        } else {
          this.submitError = response.message || 'Authorization failed.';
        }
      },
      error: (err) => {
        this.submitting = false;
        this.submitError = err?.error?.message || err?.message || 'Could not reach the server.';
      },
    });
  }
}
