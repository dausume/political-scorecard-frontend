import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { WorldviewElectionsApiService, WorldviewElectionDTO } from '../../../services/api/worldview-elections-api.service';

/**
 * Election Review Component
 * Displays results from closed/archived worldview elections
 * Allows creation of Group-Specific and General Scores from election results
 */
@Component({
  selector: 'app-election-review',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatTableModule,
    MatTabsModule,
    MatExpansionModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './election-review.component.html',
  styleUrls: ['./election-review.component.scss']
})
export class ElectionReviewComponent implements OnInit {
  electionId: string = '';
  election: WorldviewElectionDTO | null = null;
  generalResults: any = null;
  groupResults: Map<string, any> = new Map();
  availableGroups: any[] = [];
  loading = true;
  loadingGroups = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private electionsApi: WorldviewElectionsApiService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.electionId = this.route.snapshot.paramMap.get('id') || '';
    if (this.electionId) {
      this.loadElectionData();
    }
  }

  loadElectionData(): void {
    this.loading = true;

    // Load election details
    this.electionsApi.getElection(this.electionId).subscribe({
      next: (election) => {
        this.election = election;

        // Verify election is closed or archived
        if (election.status !== 'CLOSED' && election.status !== 'ARCHIVED') {
          this.snackBar.open('This election is not yet finalized', 'Close', { duration: 3000 });
          this.goBack();
          return;
        }

        this.loadResults();
      },
      error: (error) => {
        console.error('Error loading election:', error);
        this.snackBar.open('Error loading election', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadResults(): void {
    // Load general results
    this.electionsApi.getElectionResults(this.electionId).subscribe({
      next: (results) => {
        this.generalResults = results;
        this.loading = false;
        this.loadAvailableGroups();
      },
      error: (error) => {
        console.error('Error loading results:', error);
        this.snackBar.open('Error loading election results', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  loadAvailableGroups(): void {
    this.loadingGroups = true;
    this.electionsApi.getElectionGroups(this.electionId).subscribe({
      next: (groups) => {
        this.availableGroups = groups;
        this.loadingGroups = false;

        // Load results for each group
        groups.forEach(group => {
          this.loadGroupResults(group.id);
        });
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.loadingGroups = false;
      }
    });
  }

  loadGroupResults(groupId: string): void {
    this.electionsApi.getElectionGroupResults(this.electionId, groupId).subscribe({
      next: (results) => {
        this.groupResults.set(groupId, results);
      },
      error: (error) => {
        console.error(`Error loading results for group ${groupId}:`, error);
      }
    });
  }

  createGeneralScore(): void {
    if (!this.generalResults) {
      this.snackBar.open('No general results available', 'Close', { duration: 3000 });
      return;
    }

    const scoreData = {
      name: `${this.election?.name} - General Score`,
      description: `General score derived from ${this.election?.name}`,
      results: this.generalResults
    };

    this.electionsApi.createGeneralScoreFromElection(this.electionId, scoreData).subscribe({
      next: (score) => {
        this.snackBar.open('General score created successfully!', 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error creating general score:', error);
        this.snackBar.open('Error creating general score', 'Close', { duration: 3000 });
      }
    });
  }

  createGroupScore(groupId: string, groupName: string): void {
    const results = this.groupResults.get(groupId);
    if (!results) {
      this.snackBar.open('No results available for this group', 'Close', { duration: 3000 });
      return;
    }

    const scoreData = {
      name: `${this.election?.name} - ${groupName} Score`,
      description: `Group-specific score for ${groupName} derived from ${this.election?.name}`,
      results: results
    };

    this.electionsApi.createGroupScoreFromElection(this.electionId, groupId, scoreData).subscribe({
      next: (score) => {
        this.snackBar.open(`Score created for ${groupName}!`, 'Close', { duration: 3000 });
      },
      error: (error) => {
        console.error('Error creating group score:', error);
        this.snackBar.open('Error creating group score', 'Close', { duration: 3000 });
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/worldview-elections']);
  }

  formatDate(date: string | undefined): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  }
}
