import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable, map } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { Group } from '../../../../classes/group/group';
import { MOCK_PROFESSIONAL_GROUPS } from '../../../../state/mock-data/groups.mock';
import { selectIsAuthenticated, selectAuthStatus, selectAuthUserRoles } from '../../../../state/selectors/auth.selectors';
import { AuthStatus } from '../../../../state/reducers/auth.reducer';
import { AuthSessionService } from '../../../../services/auth/auth-session.service';
import { GroupApiService } from '../../../../services/api/group-api.service';
import { AuthActions } from '../../../../state/actions/auth.actions';

@Component({
  selector: 'app-professional-groups',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './professional-groups.component.html',
  styleUrl: './professional-groups.component.scss'
})
export class ProfessionalGroupsComponent implements OnInit {
  groups: Group[] = [];
  searchQuery: string = '';
  joinedGroupNames: Set<string> = new Set();

  isAuthenticated$: Observable<boolean>;
  authStatus$: Observable<AuthStatus>;
  hasProfessionalGroup$: Observable<boolean>;

  constructor(
    private store: Store,
    private authSession: AuthSessionService,
    private groupApi: GroupApiService,
    private snackBar: MatSnackBar
  ) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.authStatus$ = this.store.select(selectAuthStatus);
    this.hasProfessionalGroup$ = this.store.select(selectAuthUserRoles).pipe(
      map(roles => roles.includes('professional-competitor'))
    );
  }

  ngOnInit(): void {
    this.groups = MOCK_PROFESSIONAL_GROUPS;
    this.loadMyGroups();
  }

  get filteredGroups(): Group[] {
    if (!this.searchQuery.trim()) {
      return this.groups;
    }
    const query = this.searchQuery.toLowerCase();
    return this.groups.filter(group =>
      group.name.toLowerCase().includes(query) ||
      group.description.toLowerCase().includes(query) ||
      group.categories?.some(cat => cat.toLowerCase().includes(query))
    );
  }

  isJoined(group: Group): boolean {
    return this.joinedGroupNames.has(group.name);
  }

  login(): void {
    this.authSession.login();
  }

  viewGroup(group: Group): void {
    // TODO: Navigate to group detail page
    console.log('View group:', group.id);
  }

  joinGroup(group: Group): void {
    this.groupApi.joinGroup(group.name, group.pscType).subscribe({
      next: (updatedRoles) => {
        this.store.dispatch(AuthActions.updateAuthUserRoles({ roles: updatedRoles }));
        this.snackBar.open(`Joined ${group.name}!`, 'OK', { duration: 3000 });
        this.loadMyGroups();
      },
      error: (err) => {
        const message = err?.error?.message || 'Failed to join group';
        this.snackBar.open(message, 'Dismiss', { duration: 5000 });
      }
    });
  }

  private loadMyGroups(): void {
    this.groupApi.getMyGroups().subscribe({
      next: (names) => this.joinedGroupNames = new Set(names),
      error: () => {}
    });
  }
}
