import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MOCK_TERMS } from '../../state/mock-data/terms.mock';
import { MOCK_CONTEXTUALIZED_WORLDVIEW_BALLOTS } from '../../state/mock-data/contextualized-worldview-ballots.mock';
import { PositiveTermsRowComponent } from './positive-terms-row/positive-terms-row.component';
import { NegativeTermsRowComponent } from './negative-terms-row/negative-terms-row.component';
import { TermsRowComponent } from './terms-row/terms-row.component';
import { ContextSectionComponent } from './context-section/context-section.component';
import { ContextualizedWorldviewBallot } from '../../classes/contextualized-worldview-ballot';
import { TermContext, ContextualizedTerm } from '../../classes/terms/contextualized-term';
import { WeightedWorldviewTerm } from '../../classes/terms/weighted-worldview-term';
import { WorldviewScoringService } from '../../services/scoring/worldview-scoring.service';
import { AppState } from '../../state/app.state';
import { WorldviewBallotActions } from '../../state/actions/worldview-ballot.actions';
import * as WorldviewBallotSelectors from '../../state/selectors/worldview-ballot.selectors';

export interface Term {
  id: string;
  name: string;
  description: string;
  source: string;
}

export interface TermWeight {
  termId: string;
  weight: number; // 0 to 100
}

@Component({
  selector: 'app-worldview-ballot',
  standalone: true,
  imports: [
    CommonModule,
    PositiveTermsRowComponent,
    NegativeTermsRowComponent,
    TermsRowComponent,
    ContextSectionComponent
  ],
  templateUrl: './worldview-ballot.component.html',
  styleUrl: './worldview-ballot.component.scss'
})
export class WorldviewBallotComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  // Observables from store
  currentBallot$: Observable<ContextualizedWorldviewBallot | null>;
  personalContexts$: Observable<TermContext[]>;
  positiveTerms$: Observable<Term[]>;
  negativeTerms$: Observable<Term[]>;
  weightedTerms$: Observable<WeightedWorldviewTerm[]>;
  categorizedTermIds$: Observable<string[]>;
  positiveContextualizedTermsMap$: Observable<Map<string, ContextualizedTerm | undefined>>;
  negativeContextualizedTermsMap$: Observable<Map<string, ContextualizedTerm | undefined>>;

  // Local state for template access
  currentBallot: ContextualizedWorldviewBallot | null = null;
  personalContexts: TermContext[] = [];
  positiveTerms: Term[] = [];
  negativeTerms: Term[] = [];
  weightedTerms: WeightedWorldviewTerm[] = [];
  categorizedTermIds: string[] = [];
  positiveContextualizedTermsMap: Map<string, ContextualizedTerm | undefined> = new Map();
  negativeContextualizedTermsMap: Map<string, ContextualizedTerm | undefined> = new Map();

  // Auto-selected ballot information
  get ballotName(): string {
    return this.currentBallot?.name || 'No ballot selected';
  }

  get ballotDescription(): string {
    if (!this.currentBallot) return '';
    // Return description based on ballot type
    if (this.currentBallot.ballotType === 'labor-quality') {
      return 'Evaluates labor quality across US states using union participation, labor force participation, minimum wage, and poverty rates.';
    } else if (this.currentBallot.ballotType === 'economic') {
      return 'This ballot focuses on evaluating economic policy approaches and their real-world impacts.';
    }
    return 'Participate in the democratic process by weighting terms according to your worldview.';
  }

  // Available terms to categorize - filtered by ballot type
  get availableTerms(): Term[] {
    if (!this.currentBallot) return [];
    // Filter terms based on the current ballot's type
    if (this.currentBallot.ballotType) {
      return MOCK_TERMS.filter(term => term.category === this.currentBallot?.ballotType);
    }
    // If no ballot type specified, return all terms
    return MOCK_TERMS;
  }

  constructor(
    private router: Router,
    private store: Store<AppState>,
    private scoringService: WorldviewScoringService
  ) {
    // Initialize observables from store
    this.currentBallot$ = this.store.select(WorldviewBallotSelectors.selectSelectedBallot);
    this.personalContexts$ = this.store.select(WorldviewBallotSelectors.selectPersonalContexts);
    this.positiveTerms$ = this.store.select(WorldviewBallotSelectors.selectPositiveTerms);
    this.negativeTerms$ = this.store.select(WorldviewBallotSelectors.selectNegativeTerms);
    this.weightedTerms$ = this.store.select(WorldviewBallotSelectors.selectWeightedTerms);
    this.categorizedTermIds$ = this.store.select(WorldviewBallotSelectors.selectCategorizedTermIds);
    this.positiveContextualizedTermsMap$ = this.store.select(WorldviewBallotSelectors.selectPositiveContextualizedTermsMap);
    this.negativeContextualizedTermsMap$ = this.store.select(WorldviewBallotSelectors.selectNegativeContextualizedTermsMap);
  }

  ngOnInit(): void {
    // Subscribe to store state and update local properties for template access
    this.currentBallot$
      .pipe(takeUntil(this.destroy$))
      .subscribe(ballot => this.currentBallot = ballot);

    this.personalContexts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(contexts => {
        console.log('[WORLDVIEW-BALLOT] 🟣 Store subscription fired - new personalContexts from store:', contexts);
        this.personalContexts = contexts;
        console.log('[WORLDVIEW-BALLOT] 🟣 Local personalContexts property updated. Angular change detection should propagate to children.');
      });

    this.positiveTerms$
      .pipe(takeUntil(this.destroy$))
      .subscribe(terms => this.positiveTerms = terms);

    this.negativeTerms$
      .pipe(takeUntil(this.destroy$))
      .subscribe(terms => this.negativeTerms = terms);

    this.weightedTerms$
      .pipe(takeUntil(this.destroy$))
      .subscribe(terms => this.weightedTerms = terms);

    this.categorizedTermIds$
      .pipe(takeUntil(this.destroy$))
      .subscribe(ids => this.categorizedTermIds = ids);

    this.positiveContextualizedTermsMap$
      .pipe(takeUntil(this.destroy$))
      .subscribe(map => {
        console.log('[WORLDVIEW-BALLOT] 🟢 Positive contextualized terms map updated:', map);
        this.positiveContextualizedTermsMap = map;
      });

    this.negativeContextualizedTermsMap$
      .pipe(takeUntil(this.destroy$))
      .subscribe(map => {
        console.log('[WORLDVIEW-BALLOT] 🟢 Negative contextualized terms map updated:', map);
        this.negativeContextualizedTermsMap = map;
      });

    // Load ballots and select the first one
    this.store.dispatch(WorldviewBallotActions.loadAllBallots());

    // Select the first ballot (simulating auto-selection)
    if (MOCK_CONTEXTUALIZED_WORLDVIEW_BALLOTS.length > 0) {
      this.store.dispatch(
        WorldviewBallotActions.selectBallot({ ballot: MOCK_CONTEXTUALIZED_WORLDVIEW_BALLOTS[0] })
      );
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  navigateToBrowseBallots() {
    this.router.navigate(['/browse-worldview-ballots']);
  }

  // Method to switch ballots for testing
  switchBallot(ballotIndex: number) {
    if (ballotIndex >= 0 && ballotIndex < MOCK_CONTEXTUALIZED_WORLDVIEW_BALLOTS.length) {
      const ballot = MOCK_CONTEXTUALIZED_WORLDVIEW_BALLOTS[ballotIndex];
      this.store.dispatch(WorldviewBallotActions.selectBallot({ ballot }));
    }
  }

  // Handle adding term to positive category
  handleAddPositive(term: Term) {
    if (!this.categorizedTermIds.includes(term.id)) {
      this.store.dispatch(WorldviewBallotActions.addPositiveTerm({ term }));
    }
  }

  // Handle adding term to negative category
  handleAddNegative(term: Term) {
    if (!this.categorizedTermIds.includes(term.id)) {
      this.store.dispatch(WorldviewBallotActions.addNegativeTerm({ term }));
    }
  }

  // Handle removing term from positive category
  handleRemovePositive(term: Term) {
    this.store.dispatch(WorldviewBallotActions.removePositiveTerm({ termId: term.id }));
  }

  // Handle removing term from negative category
  handleRemoveNegative(term: Term) {
    this.store.dispatch(WorldviewBallotActions.removeNegativeTerm({ termId: term.id }));
  }

  // Handle weight changes from positive terms
  handlePositiveWeightChange(event: TermWeight) {
    this.store.dispatch(
      WorldviewBallotActions.updateTermWeight({
        termId: event.termId,
        isPositive: true,
        weight: event.weight
      })
    );
  }

  // Handle weight changes from negative terms
  handleNegativeWeightChange(event: TermWeight) {
    this.store.dispatch(
      WorldviewBallotActions.updateTermWeight({
        termId: event.termId,
        isPositive: false,
        weight: event.weight
      })
    );
  }

  // Handle context changes - dispatch to store
  onContextsChange(newContexts: TermContext[]) {
    console.log('[WORLDVIEW-BALLOT] 🟡 Received contextsChange event:', newContexts);
    console.log('[WORLDVIEW-BALLOT] 🟡 Dispatching updatePersonalContexts action to store');
    this.store.dispatch(WorldviewBallotActions.updatePersonalContexts({ contexts: newContexts }));
  }

  // Save current progress as draft
  saveDraft() {
    this.store.dispatch(WorldviewBallotActions.saveDraft());
  }
}
