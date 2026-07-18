import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AuthUser } from '../../../classes/auth-user';
import {
  AuthorityApiService,
  AuthorityVerdict,
  GroupInstanceBinding,
  PolariInstance,
  TermProvenance,
} from '../../../services/api/authority-api.service';
import { selectAuthUser, selectIsAuthenticated } from '../../../state/selectors/auth.selectors';
import { AuthorityGrantsComponent } from '../authority-grants/authority-grants.component';
import { TermSignalComponent } from '../term-signal/term-signal.component';

/**
 * The authority hub: where a Polari instance becomes "the
 * authoritative source for a group" and groups assert complex
 * matters to the scorecard through it.
 *
 * Sections: registered Polari instances; group↔instance bindings
 * (both-sides status); my authority grants (via the Polari report,
 * proxied with my own token); the term-availability signal form; and
 * the provenance trail of everything admitted so far.
 */
@Component({
  selector: 'app-authority-hub',
  standalone: true,
  imports: [
    CommonModule, FormsModule, MatCardModule, MatButtonModule,
    MatIconModule, MatInputModule, MatSelectModule,
    AuthorityGrantsComponent, TermSignalComponent,
  ],
  templateUrl: './authority-hub.component.html',
  styleUrls: ['./authority-hub.component.scss'],
})
export class AuthorityHubComponent implements OnInit {
  instances: PolariInstance[] = [];
  bindings: GroupInstanceBinding[] = [];
  provenance: TermProvenance[] = [];
  loading = true;
  error: string | null = null;

  isAuthenticated$: Observable<boolean>;
  authUser$: Observable<AuthUser | null>;

  // Register-instance form (backend enforces policy-voting-admin).
  newInstance = { name: '', baseUrl: '', description: '' };
  registerResult: string | null = null;

  // Create-PSC-binding form (activates a Polari-side proposal).
  newBinding = { groupName: '', groupType: 'Political-Group', instanceName: '' };
  bindingResult: AuthorityVerdict | null = null;

  constructor(private authorityApi: AuthorityApiService, private store: Store) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.authUser$ = this.store.select(selectAuthUser);
  }

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loading = true;
    this.error = null;
    this.authorityApi.getInstances().subscribe({
      next: (instances) => {
        this.instances = instances || [];
        if (!this.newBinding.instanceName && this.instances.length > 0) {
          this.newBinding.instanceName = this.instances[0].name;
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load Polari instances: ' + (err?.message || 'unknown error');
        this.loading = false;
      },
    });
    this.authorityApi.getBindings().subscribe({
      next: (bindings) => (this.bindings = bindings || []),
      error: () => (this.bindings = []),
    });
    this.authorityApi.getProvenance().subscribe({
      next: (provenance) => (this.provenance = provenance || []),
      error: () => (this.provenance = []),
    });
  }

  registerInstance(): void {
    this.registerResult = null;
    this.authorityApi.registerInstance(this.newInstance).subscribe({
      next: (response) => {
        this.registerResult = response.success
          ? `Registered '${this.newInstance.name}'.`
          : response.message;
        if (response.success) {
          this.newInstance = { name: '', baseUrl: '', description: '' };
          this.reload();
        }
      },
      error: (err) => {
        this.registerResult = err?.error?.message
          || 'Registration failed (policy-voting-admin role required).';
      },
    });
  }

  createBinding(): void {
    this.bindingResult = null;
    this.authorityApi.createBinding(
      this.newBinding.groupName, this.newBinding.groupType, this.newBinding.instanceName,
    ).subscribe({
      next: (result) => {
        this.bindingResult = result;
        if (result['ok']) {
          this.reload();
        }
      },
      error: (err) => {
        this.bindingResult = err?.error || { ok: false, error: 'Binding creation failed.' };
      },
    });
  }
}
