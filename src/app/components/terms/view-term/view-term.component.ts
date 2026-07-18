import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { Term } from '../../../classes/terms/term';
import { ContextualizedTerm } from '../../../classes/terms/contextualized-term';
import { AppState } from '../../../state/app.state';
import { TermsActions } from '../../../state/actions/terms.actions';
import * as TermsSelectors from '../../../state/selectors/terms.selectors';
import { ContextualizedTermTableComponent } from '../contextualized-term-table/contextualized-term-table.component';
import { ContextualizedTermsApiService } from '../../../services/api/contextualized-terms-api.service';
import { mapContextualizedTermDTOs } from '../../../services/api/contextualized-term-mapper';
import { AuthorityApiService, TermProvenance } from '../../../services/api/authority-api.service';

@Component({
  selector: 'app-view-term',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    ContextualizedTermTableComponent
  ],
  templateUrl: './view-term.component.html',
  styleUrls: ['./view-term.component.scss']
})
export class ViewTermComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  termId: string | null = null;
  term: Term | null = null;
  contextualizedTerms: ContextualizedTerm[] = [];
  provenance: TermProvenance[] = [];
  private loadedDataForTermId: string | null = null;

  // Observables from store
  allTerms$: Observable<Term[]>;
  loading$: Observable<boolean>;

  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: Store<AppState>,
    private contextualizedTermsApi: ContextualizedTermsApiService,
    private authorityApi: AuthorityApiService
  ) {
    this.allTerms$ = this.store.select(TermsSelectors.selectAllTerms);
    this.loading$ = this.store.select(TermsSelectors.selectTermsLoading);
  }

  ngOnInit(): void {
    // Load term from route
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.termId = params.get('id');
        this.loadTermData();
      });

    // Subscribe to loading state
    this.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => this.loading = loading);

    // Subscribe to all terms to find the specific term
    this.allTerms$
      .pipe(takeUntil(this.destroy$))
      .subscribe(terms => {
        if (this.termId) {
          this.term = terms.find(t => t.id === this.termId) || null;
          if (this.term && this.loadedDataForTermId !== this.term.id) {
            this.loadedDataForTermId = this.term.id;
            this.loadContextualizedTerms(this.term.id);
            this.loadProvenance(this.term.id);
          }
        }
      });
  }

  private loadContextualizedTerms(termId: string): void {
    this.contextualizedTermsApi.getContextualizedTermsByTermId(termId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (dtos) => this.contextualizedTerms = mapContextualizedTermDTOs(dtos),
        error: () => this.contextualizedTerms = []
      });
  }

  private loadProvenance(termId: string): void {
    this.authorityApi.getProvenance(termId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (rows) => this.provenance = rows || [],
        error: () => this.provenance = []
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadTermData(): void {
    // Dispatch action to load all terms if not already loaded
    this.store.dispatch(TermsActions.loadAllTerms());
  }

  goBack(): void {
    this.router.navigate(['/terms']);
  }

  getCategoryDisplay(category?: string): string {
    if (!category) return 'General';
    return category.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  openSource(): void {
    if (this.term?.source) {
      window.open(this.term.source, '_blank');
    }
  }
}
