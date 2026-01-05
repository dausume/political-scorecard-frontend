import { Component, OnInit } from '@angular/core';
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
import { WorldviewElectionsApiService, WorldviewElectionDTO } from '../../../services/api/worldview-elections-api.service';
import { WorldviewBallotsApiService } from '../../../services/api/worldview-ballots-api.service';

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
export class ManageElectionsComponent implements OnInit {
  elections: WorldviewElectionDTO[] = [];
  loading = true;
  statusFilter: 'all' | 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED' = 'all';

  constructor(
    private router: Router,
    private electionsApi: WorldviewElectionsApiService,
    private ballotsApi: WorldviewBallotsApiService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadElections();
  }

  loadElections(): void {
    this.loading = true;
    this.electionsApi.getAllElections().subscribe({
      next: (elections) => {
        this.elections = elections;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading elections:', error);
        this.snackBar.open('Error loading elections', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
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

  reviewElection(electionId: string): void {
    this.router.navigate(['/worldview-elections', electionId, 'review']);
  }

  changeStatus(election: WorldviewElectionDTO, newStatus: 'DRAFT' | 'ACTIVE' | 'CLOSED' | 'ARCHIVED'): void {
    const updatedElection = { ...election, status: newStatus };
    this.electionsApi.updateElection(election.id!, updatedElection).subscribe({
      next: (result) => {
        this.snackBar.open(`Election status changed to ${newStatus}`, 'Close', { duration: 2000 });
        this.loadElections();
      },
      error: (error) => {
        console.error('Error updating election:', error);
        this.snackBar.open('Error updating election status', 'Close', { duration: 3000 });
      }
    });
  }

  deleteElection(electionId: string): void {
    if (confirm('Are you sure you want to delete this election? This action cannot be undone.')) {
      this.electionsApi.deleteElection(electionId).subscribe({
        next: () => {
          this.snackBar.open('Election deleted successfully', 'Close', { duration: 2000 });
          this.loadElections();
        },
        error: (error) => {
          console.error('Error deleting election:', error);
          this.snackBar.open('Error deleting election', 'Close', { duration: 3000 });
        }
      });
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
