import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../../state/app.state';
import { LegislationActions } from '../../../state/actions/legislation.actions';
import { selectAllLegislations, selectLegislationLoading, selectLegislationError } from '../../../state/selectors/legislation.selectors';
import { LegislationDTO } from '../../../models/legislation.model';

@Component({
  selector: 'app-legislation-list',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  template: `
    <div class="legislation-list-container">
      <div class="header">
        <h1>Legislation Documents</h1>
        <div class="header-actions">
          <button mat-raised-button color="primary" (click)="createNew()">
            <mat-icon>add</mat-icon> New Document
          </button>
        </div>
      </div>

      <div class="filter-bar">
        <mat-chip-listbox (change)="setFilter($event.value)">
          <mat-chip-option [value]="'all'" [selected]="statusFilter === 'all'">All</mat-chip-option>
          <mat-chip-option [value]="'DRAFT'" [selected]="statusFilter === 'DRAFT'">Draft</mat-chip-option>
          <mat-chip-option [value]="'SUBMITTED'" [selected]="statusFilter === 'SUBMITTED'">Submitted</mat-chip-option>
          <mat-chip-option [value]="'APPROVED'" [selected]="statusFilter === 'APPROVED'">Approved</mat-chip-option>
          <mat-chip-option [value]="'LOCKED'" [selected]="statusFilter === 'LOCKED'">Locked</mat-chip-option>
        </mat-chip-listbox>
      </div>

      <div *ngIf="loading" class="loading-spinner">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div class="legislation-grid" *ngIf="!loading">
        <mat-card *ngFor="let leg of filteredLegislations" class="legislation-card" (click)="viewLegislation(leg.id)">
          <mat-card-header>
            <mat-card-title>{{ leg.title }}</mat-card-title>
            <mat-card-subtitle>
              <span class="status-chip" [class]="'status-' + leg.status.toLowerCase()">{{ leg.status }}</span>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <p>{{ leg.description || 'No description provided.' }}</p>
            <div class="meta">
              <span *ngIf="leg.validFromDate">From: {{ leg.validFromDate }}</span>
              <span *ngIf="leg.validToDate">To: {{ leg.validToDate }}</span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-button *ngIf="leg.status === 'DRAFT'" (click)="editLegislation(leg.id, $event)">
              <mat-icon>edit</mat-icon> Edit
            </button>
            <button mat-button *ngIf="leg.status === 'APPROVED' || leg.status === 'LOCKED'" (click)="annotateLegislation(leg.id, $event)">
              <mat-icon>rate_review</mat-icon> Annotate
            </button>
          </mat-card-actions>
        </mat-card>

        <div *ngIf="filteredLegislations.length === 0" class="empty-state">
          <mat-icon>description</mat-icon>
          <p>No legislation documents found.</p>
          <button mat-raised-button color="primary" (click)="createNew()">Create Your First Document</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .legislation-list-container { padding: 24px; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .header h1 { margin: 0; }
    .filter-bar { margin-bottom: 24px; }
    .loading-spinner { display: flex; justify-content: center; padding: 48px; }
    .legislation-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 16px; }
    .legislation-card { cursor: pointer; transition: box-shadow 0.2s; }
    .legislation-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .status-chip { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; text-transform: uppercase; }
    .status-draft { background: #e3f2fd; color: #1565c0; }
    .status-submitted { background: #fff3e0; color: #e65100; }
    .status-approved { background: #e8f5e9; color: #2e7d32; }
    .status-locked { background: #fce4ec; color: #c62828; }
    .meta { display: flex; gap: 16px; font-size: 12px; color: #666; margin-top: 8px; }
    .empty-state { grid-column: 1 / -1; text-align: center; padding: 48px; color: #666; }
    .empty-state mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; }
  `]
})
export class LegislationListComponent implements OnInit, OnDestroy {
  legislations: LegislationDTO[] = [];
  loading = true;
  statusFilter: string = 'all';

  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private store: Store<AppState>,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.store.select(selectAllLegislations).pipe(takeUntil(this.destroy$)).subscribe(legislations => {
      this.legislations = legislations;
    });

    this.store.select(selectLegislationLoading).pipe(takeUntil(this.destroy$)).subscribe(loading => {
      this.loading = loading;
    });

    this.store.select(selectLegislationError).pipe(takeUntil(this.destroy$)).subscribe(error => {
      if (error) {
        this.snackBar.open(`Error: ${error}`, 'Close', { duration: 3000 });
      }
    });

    this.store.dispatch(LegislationActions.loadAllLegislations());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  get filteredLegislations(): LegislationDTO[] {
    if (this.statusFilter === 'all') return this.legislations;
    return this.legislations.filter(l => l.status === this.statusFilter);
  }

  setFilter(filter: string): void {
    this.statusFilter = filter || 'all';
  }

  createNew(): void {
    this.router.navigate(['/policy-scoring/create']);
  }

  viewLegislation(id: string): void {
    this.router.navigate(['/policy-scoring', id]);
  }

  editLegislation(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/policy-scoring', id, 'edit']);
  }

  annotateLegislation(id: string, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/policy-scoring', id, 'annotate']);
  }
}
