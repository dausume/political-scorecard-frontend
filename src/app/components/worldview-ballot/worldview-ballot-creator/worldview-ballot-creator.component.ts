import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { forkJoin } from 'rxjs';

import { ContextsApiService, TermContextDTO } from '../../../services/api/contexts-api.service';
import { ContextualizedTermsApiService, ContextualizedTermDTO } from '../../../services/api/contextualized-terms-api.service';
import { WorldviewElectionsApiService, WorldviewElectionDTO } from '../../../services/api/worldview-elections-api.service';
import { WorldviewBallotsApiService, WorldviewBallotDTO } from '../../../services/api/worldview-ballots-api.service';
import { ContextualizedTermScoresApiService, ContextualizedTermScoreDTO } from '../../../services/api/contextualized-term-scores-api.service';
import { CriticalContextsApiService, CriticalContextDTO } from '../../../services/api/critical-contexts-api.service';

/**
 * Component for creating Worldview Ballots in a multi-step flow
 * Worldview Elections define the meaning and accountability systems for issues.
 * Users create ballots to express their understanding of how an issue should be measured.
 * Allows users to:
 * 1. Select an active worldview election (issue to define)
 * 2. Add personal contexts (their perspective)
 * 3. Select contextualized terms and assign weights (define accountability priorities)
 * 4. Optionally add critical contexts (scenario variations)
 * 5. Save the ballot (contribute to democratic meaning-making)
 */
@Component({
  selector: 'app-worldview-ballot-creator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatStepperModule,
    MatIconModule,
    MatChipsModule,
    MatRadioModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatExpansionModule
  ],
  templateUrl: './worldview-ballot-creator.component.html',
  styleUrls: ['./worldview-ballot-creator.component.scss']
})
export class WorldviewBallotCreatorComponent implements OnInit {
  // Form groups for each step
  electionForm!: FormGroup;
  personalContextsForm!: FormGroup;
  termScoresForm!: FormGroup;
  criticalContextsForm!: FormGroup;
  ballotDetailsForm!: FormGroup;

  // Available options loaded from backend
  activeElections: WorldviewElectionDTO[] = [];
  existingContexts: TermContextDTO[] = [];
  availableContextualizedTerms: ContextualizedTermDTO[] = [];

  // Loading states
  loading = false;
  loadingData = false;

  // Context types for selection
  contextTypes = ['TIMEFRAME', 'LOCATION', 'DEMOGRAPHIC', 'ECONOMIC', 'CUSTOM'];

  // Current user ID (should be fetched from auth service)
  currentUserId: string = 'current-user-id'; // TODO: Get from auth service

  constructor(
    private fb: FormBuilder,
    private electionsApi: WorldviewElectionsApiService,
    private ballotsApi: WorldviewBallotsApiService,
    private contextsApi: ContextsApiService,
    private contextualizedTermsApi: ContextualizedTermsApiService,
    private termScoresApi: ContextualizedTermScoresApiService,
    private criticalContextsApi: CriticalContextsApiService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadExistingData();
  }

  /**
   * Initialize all form groups
   */
  private initializeForms(): void {
    // Step 1: Select Election
    this.electionForm = this.fb.group({
      electionId: ['', Validators.required]
    });

    // Step 2: Personal Contexts
    this.personalContextsForm = this.fb.group({
      selectedContextIds: this.fb.array([])
    });

    // Step 3: Term Scores (Weights)
    this.termScoresForm = this.fb.group({
      termScores: this.fb.array([])
    });

    // Step 4: Critical Contexts (Optional)
    this.criticalContextsForm = this.fb.group({
      criticalContexts: this.fb.array([])
    });

    // Step 5: Ballot Details
    this.ballotDetailsForm = this.fb.group({
      name: ['', Validators.required],
      ballotType: ['']
    });
  }

  /**
   * Load existing elections, contexts, and contextualized terms
   */
  private loadExistingData(): void {
    this.loadingData = true;
    forkJoin({
      elections: this.electionsApi.getElectionsByStatus('ACTIVE'),
      contexts: this.contextsApi.getAllContexts(),
      terms: this.contextualizedTermsApi.getAllContextualizedTerms()
    }).subscribe({
      next: (data) => {
        this.activeElections = data.elections;
        this.existingContexts = data.contexts;
        this.availableContextualizedTerms = data.terms;
        this.loadingData = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.snackBar.open('Error loading data', 'Close', { duration: 3000 });
        this.loadingData = false;
      }
    });
  }

  // ============ Personal Contexts Management ============

  get selectedContextIdsArray(): FormArray {
    return this.personalContextsForm.get('selectedContextIds') as FormArray;
  }

  addPersonalContext(): void {
    this.selectedContextIdsArray.push(this.fb.control('', Validators.required));
  }

  removePersonalContext(index: number): void {
    this.selectedContextIdsArray.removeAt(index);
  }

  // ============ Term Scores Management ============

  get termScoresArray(): FormArray {
    return this.termScoresForm.get('termScores') as FormArray;
  }

  addTermScore(): void {
    const scoreGroup = this.fb.group({
      contextualizedTermId: ['', Validators.required],
      weight: [0.5, [Validators.required, Validators.min(0), Validators.max(1)]]
    });
    this.termScoresArray.push(scoreGroup);
  }

  removeTermScore(index: number): void {
    this.termScoresArray.removeAt(index);
  }

  /**
   * Calculate total weight across all term scores
   */
  getTotalWeight(): number {
    return this.termScoresArray.controls.reduce((sum, control) => {
      return sum + (control.get('weight')?.value || 0);
    }, 0);
  }

  /**
   * Check if weights sum to 1.0 (within tolerance)
   */
  isWeightValid(): boolean {
    const total = this.getTotalWeight();
    return Math.abs(total - 1.0) < 0.001;
  }

  /**
   * Normalize weights to sum to 1.0
   */
  normalizeWeights(): void {
    const total = this.getTotalWeight();
    if (total > 0) {
      this.termScoresArray.controls.forEach(control => {
        const currentWeight = control.get('weight')?.value || 0;
        control.get('weight')?.setValue(currentWeight / total);
      });
      this.snackBar.open('Weights normalized to 100%', 'Close', { duration: 2000 });
    }
  }

  // ============ Critical Contexts Management ============

  get criticalContextsArray(): FormArray {
    return this.criticalContextsForm.get('criticalContexts') as FormArray;
  }

  addCriticalContext(): void {
    const criticalContextGroup = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      contextVariationIds: this.fb.array([])
    });
    this.criticalContextsArray.push(criticalContextGroup);
  }

  removeCriticalContext(index: number): void {
    this.criticalContextsArray.removeAt(index);
  }

  getContextVariationsArray(criticalContextIndex: number): FormArray {
    return (this.criticalContextsArray.at(criticalContextIndex) as FormGroup)
      .get('contextVariationIds') as FormArray;
  }

  addContextVariation(criticalContextIndex: number): void {
    const variationsArray = this.getContextVariationsArray(criticalContextIndex);
    variationsArray.push(this.fb.control('', Validators.required));
  }

  removeContextVariation(criticalContextIndex: number, variationIndex: number): void {
    const variationsArray = this.getContextVariationsArray(criticalContextIndex);
    variationsArray.removeAt(variationIndex);
  }

  // ============ Final Submission ============

  /**
   * Create the worldview ballot
   */
  async createWorldviewBallot(): Promise<void> {
    if (!this.isFormValid()) {
      this.snackBar.open('Please fill in all required fields and ensure weights sum to 100%', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    try {
      // Step 1: Create term scores
      const termScoreIds = await this.createTermScores();

      // Step 2: Create critical contexts (if any)
      const criticalContextIds = await this.createCriticalContexts();

      // Step 3: Create the ballot
      const ballot: WorldviewBallotDTO = {
        electionId: this.electionForm.get('electionId')?.value,
        voterId: this.currentUserId,
        name: this.ballotDetailsForm.get('name')?.value,
        ballotType: this.ballotDetailsForm.get('ballotType')?.value || 'general',
        personalContextIds: this.selectedContextIdsArray.value.filter((id: string) => id),
        contextualizedTermScoreIds: termScoreIds,
        criticalContextIds: criticalContextIds
      };

      this.ballotsApi.createBallot(ballot).subscribe({
        next: (result) => {
          this.snackBar.open('Worldview ballot created successfully!', 'Close', { duration: 3000 });
          this.resetForms();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating ballot:', error);
          this.snackBar.open('Error creating ballot', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error in creation process:', error);
      this.snackBar.open('Error in creation process', 'Close', { duration: 3000 });
      this.loading = false;
    }
  }

  private async createTermScores(): Promise<string[]> {
    const scorePromises = this.termScoresArray.value.map((score: any) =>
      new Promise<string>((resolve, reject) => {
        const scoreDTO: ContextualizedTermScoreDTO = {
          contextualizedTermId: score.contextualizedTermId,
          weight: score.weight
        };
        this.termScoresApi.createScore(scoreDTO).subscribe({
          next: (created) => resolve(created.id!),
          error: reject
        });
      })
    );

    return await Promise.all(scorePromises);
  }

  private async createCriticalContexts(): Promise<string[]> {
    if (this.criticalContextsArray.length === 0) {
      return [];
    }

    const contextPromises = this.criticalContextsArray.value.map((context: any) =>
      new Promise<string>((resolve, reject) => {
        const contextDTO: CriticalContextDTO = {
          name: context.name,
          description: context.description,
          contextVariationIds: context.contextVariationIds.filter((id: string) => id)
        };
        this.criticalContextsApi.createCriticalContext(contextDTO).subscribe({
          next: (created) => resolve(created.id!),
          error: reject
        });
      })
    );

    return await Promise.all(contextPromises);
  }

  isFormValid(): boolean {
    return this.electionForm.valid &&
           this.personalContextsForm.valid &&
           this.termScoresForm.valid &&
           this.criticalContextsForm.valid &&
           this.ballotDetailsForm.valid &&
           this.selectedContextIdsArray.length > 0 &&
           this.termScoresArray.length > 0 &&
           this.isWeightValid();
  }

  private resetForms(): void {
    this.electionForm.reset();
    this.personalContextsForm.reset();
    this.selectedContextIdsArray.clear();
    this.termScoresForm.reset();
    this.termScoresArray.clear();
    this.criticalContextsForm.reset();
    this.criticalContextsArray.clear();
    this.ballotDetailsForm.reset();
  }
}
