import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { WorldviewElectionDTO } from '../../../services/api/worldview-elections-api.service';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../../state/app.state';
import { ElectionsActions } from '../../../state/actions/elections.actions';
import { selectAllElections, selectElectionsLoading, selectElectionsError } from '../../../state/selectors/elections.selectors';

/**
 * Worldview Elections Management Component
 * Note: These are NOT political elections (presidential, congressional, etc.)
 * Worldview Elections are democratic processes to establish:
 * - The exact meaning of issues or states of society
 * - Accountability systems and measurement frameworks
 * - Democratic consensus on how problems should be understood
 */
@Component({
  selector: 'app-manage-elections',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatBadgeModule,
    MatDividerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './manage-elections.component.html',
  styleUrls: ['./manage-elections.component.scss']
})
export class ManageElectionsComponent implements OnInit, OnDestroy {
  elections$: Observable<WorldviewElectionDTO[]>;
  loading$: Observable<boolean>;
  statusFilter: 'all' | 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED' = 'all';

  // For template usage (async pipe alternative)
  elections: WorldviewElectionDTO[] = [];
  loading = true;

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private store: Store<AppState>,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {
    this.elections$ = this.store.select(selectAllElections);
    this.loading$ = this.store.select(selectElectionsLoading);
  }

  ngOnInit(): void {
    // Subscribe to state
    this.elections$.pipe(takeUntil(this.destroy$)).subscribe(elections => {
      this.elections = elections;
    });

    this.loading$.pipe(takeUntil(this.destroy$)).subscribe(loading => {
      this.loading = loading;
    });

    // Subscribe to errors
    this.store.select(selectElectionsError).pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        this.snackBar.open(`Error: ${error}`, 'Close', { duration: 3000 });
      }
    });

    // Load elections
    this.loadElections();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadElections(): void {
    this.store.dispatch(ElectionsActions.loadAllElections());
  }

  get filteredElections(): WorldviewElectionDTO[] {
    if (this.statusFilter === 'all') {
      return this.elections;
    }
    return this.elections.filter(election => election.status === this.statusFilter);
  }

  setFilter(filter: 'all' | 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED'): void {
    this.statusFilter = filter;
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'DRAFT': return 'default';
      case 'ACTIVE': return 'primary';
      case 'CLOSED': return 'warn';
      case 'ARCHIVED': return 'accent';
      default: return 'default';
    }
  }

  createElection(): void {
    this.router.navigate(['/worldview-elections/create']);
  }

  createBallot(electionId: string): void {
    this.router.navigate(['/worldview-ballots/create'], { queryParams: { electionId } });
  }

  viewElection(electionId: string): void {
    this.router.navigate(['/worldview-elections', electionId]);
  }

  viewBallots(electionId: string): void {
    this.router.navigate(['/worldview-elections', electionId, 'ballots']);
  }

  joinDiscussion(electionId: string): void {
    this.router.navigate(['/worldview-elections', electionId, 'debate']);
  }

  reviewElection(electionId: string): void {
    this.router.navigate(['/worldview-elections', electionId, 'review']);
  }

  changeStatus(election: WorldviewElectionDTO, newStatus: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED'): void {
    const updatedElection = { ...election, status: newStatus };
    this.store.dispatch(ElectionsActions.updateElection({
      electionId: election.id!,
      election: updatedElection
    }));
    this.snackBar.open(`Updating election status to ${newStatus}`, 'Close', { duration: 2000 });
  }

  deleteElection(electionId: string): void {
    if (confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
      this.store.dispatch(ElectionsActions.deleteElection({ electionId }));
      this.snackBar.open('Deleting election...', 'Close', { duration: 2000 });
    }
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
