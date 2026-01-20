import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Group } from '../../../../classes/group/group';
import { MOCK_PROFESSIONAL_GROUPS } from '../../../../state/mock-data/groups.mock';
import { selectIsAuthenticated, selectAuthStatus } from '../../../../state/selectors/auth.selectors';
import { AuthStatus } from '../../../../state/reducers/auth.reducer';
import { AuthSessionService } from '../../../../services/auth/auth-session.service';

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
    MatProgressSpinnerModule
  ],
  templateUrl: './professional-groups.component.html',
  styleUrl: './professional-groups.component.scss'
})
export class ProfessionalGroupsComponent implements OnInit {
  groups: Group[] = [];
  searchQuery: string = '';

  isAuthenticated$: Observable<boolean>;
  authStatus$: Observable<AuthStatus>;

  constructor(
    private store: Store,
    private authSession: AuthSessionService
  ) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.authStatus$ = this.store.select(selectAuthStatus);
  }

  ngOnInit(): void {
    // In the future, this will fetch from API when authenticated
    // For now, use mock data
    this.groups = MOCK_PROFESSIONAL_GROUPS;
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

  login(): void {
    this.authSession.login();
  }

  viewGroup(group: Group): void {
    // TODO: Navigate to group detail page
    console.log('View group:', group.id);
  }

  joinGroup(group: Group): void {
    // TODO: Implement join group functionality
    console.log('Join group:', group.id);
  }
}
