import { CommonModule } from '@angular/common';
import { Component, Input, OnChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Store } from '@ngrx/store';
import { AuthUser } from '../../../classes/auth-user';
import {
  AuthorityApiService,
  AuthorityVerdict,
  PolariInstance,
} from '../../../services/api/authority-api.service';
import { selectAuthUser } from '../../../state/selectors/auth.selectors';

/**
 * Authority grants on the Polari side, proxied through PSC with the
 * caller's own token. Covers the whole grant lifecycle the plan
 * names: first-claim PRIMARY self-claim on a group or instance,
 * primary granting SHARED authority to others, and proposing the
 * group↔instance binding once the caller holds both.
 */
@Component({
  selector: 'app-authority-grants',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatInputModule, MatSelectModule],
  templateUrl: './authority-grants.component.html',
  styleUrls: ['./authority-grants.component.scss'],
})
export class AuthorityGrantsComponent implements OnChanges {
  @Input() instances: PolariInstance[] = [];

  user: AuthUser | null = null;
  selectedInstance = '';
  report: AuthorityVerdict | null = null;

  grant = {
    kind: 'group' as 'group' | 'instance',
    targetName: '',
    subject: '',
    username: '',
    role: 'primary',
  };
  grantResult: AuthorityVerdict | null = null;

  proposeGroupName = '';
  proposeResult: AuthorityVerdict | null = null;

  constructor(private authorityApi: AuthorityApiService, private store: Store) {
    this.store.select(selectAuthUser).subscribe((user) => {
      this.user = user;
      if (user && !this.grant.subject) {
        this.grant.subject = user.id;
        this.grant.username = user.username || '';
      }
    });
  }

  ngOnChanges(): void {
    if (!this.selectedInstance && this.instances.length > 0) {
      this.selectedInstance = this.instances[0].name;
      this.loadReport();
    }
  }

  loadReport(): void {
    if (!this.selectedInstance) {
      return;
    }
    this.authorityApi.polariReport(this.selectedInstance, {}).subscribe({
      next: (report) => (this.report = report),
      error: (err) => (this.report = err?.error || { ok: false, error: 'Report failed' }),
    });
  }

  submitGrant(): void {
    this.grantResult = null;
    const body = {
      subject: this.grant.subject,
      username: this.grant.username,
      role: this.grant.role,
    };
    const call = this.grant.kind === 'group'
      ? this.authorityApi.polariGroupGrant(this.selectedInstance,
          { ...body, group_name: this.grant.targetName })
      : this.authorityApi.polariInstanceGrant(this.selectedInstance,
          { ...body, instance_name: this.grant.targetName });
    call.subscribe({
      next: (result) => {
        this.grantResult = result;
        this.loadReport();
      },
      error: (err) => {
        this.grantResult = err?.error || { ok: false, error: 'Grant failed' };
      },
    });
  }

  proposeBinding(): void {
    this.proposeResult = null;
    this.authorityApi.polariBindingPropose(this.selectedInstance,
      { group_name: this.proposeGroupName }).subscribe({
      next: (result) => {
        this.proposeResult = result;
        this.loadReport();
      },
      error: (err) => {
        this.proposeResult = err?.error || { ok: false, error: 'Proposal failed' };
      },
    });
  }

  asJson(value: unknown): string {
    return JSON.stringify(value, null, 1);
  }
}
