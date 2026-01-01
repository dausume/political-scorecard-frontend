import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Term } from '../../classes/terms/term';
import { AppState } from '../../state/app.state';
import { TermsActions } from '../../state/actions/terms.actions';
import * as TermsSelectors from '../../state/selectors/terms.selectors';

@Component({
  selector: 'app-terms-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './terms-page.component.html',
  styleUrls: ['./terms-page.component.scss']
})
export class TermsPageComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Observables from store
  terms$: Observable<Term[]>;
  loading$: Observable<boolean>;
  error$: Observable<string | null>;

  // Local state for template access
  terms: Term[] = [];
  loading = false;
  error: string | null = null;

  // Table configuration
  displayedColumns: string[] = ['name', 'category', 'description', 'actions'];

  constructor(
    private router: Router,
    private store: Store<AppState>
  ) {
    // Initialize observables from store
    this.terms$ = this.store.select(TermsSelectors.selectAllTerms);
    this.loading$ = this.store.select(TermsSelectors.selectTermsLoading);
    this.error$ = this.store.select(TermsSelectors.selectTermsError);
  }

  ngOnInit(): void {
    // Subscribe to store state
    this.terms$
      .pipe(takeUntil(this.destroy$))
      .subscribe(terms => this.terms = terms);

    this.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    this.error$
      .pipe(takeUntil(this.destroy$))
      .subscribe(error => this.error = error);

    // Load all terms
    this.store.dispatch(TermsActions.loadAllTerms());
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  viewTerm(term: Term): void {
    this.router.navigate(['/terms', term.id]);
  }

  getCategoryDisplay(category?: string): string {
    if (!category) return 'General';
    return category.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }
}
