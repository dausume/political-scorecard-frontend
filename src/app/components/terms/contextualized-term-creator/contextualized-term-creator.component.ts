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
import { ContextsApiService, TermContextDTO } from '../../../services/api/contexts-api.service';
import { ContextualizedTermsApiService, ContextualizedTermDTO, ValueMetadataDTO, TermDTO } from '../../../services/api/contextualized-terms-api.service';
import { forkJoin } from 'rxjs';

/**
 * Component for creating Contextualized Terms with all dependencies in one flow
 * Allows users to:
 * 1. Create or select a base Term
 * 2. Create or select multiple Contexts
 * 3. Create or select Value Metadata
 * 4. Set pre/post normalized values
 * 5. Save the Contextualized Term
 */
@Component({
  selector: 'app-contextualized-term-creator',
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
  templateUrl: './contextualized-term-creator.component.html',
  styleUrls: ['./contextualized-term-creator.component.scss']
})
export class ContextualizedTermCreatorComponent implements OnInit {
  // Form groups for each step
  termForm!: FormGroup;
  contextsForm!: FormGroup;
  metadataForm!: FormGroup;
  valuesForm!: FormGroup;

  // Available options loaded from backend
  existingTerms: TermDTO[] = [];
  existingContexts: TermContextDTO[] = [];
  existingMetadata: ValueMetadataDTO[] = [];

  // Loading states
  loading = false;
  loadingData = false;

  // Context types for selection
  contextTypes = ['TIMEFRAME', 'LOCATION', 'DEMOGRAPHIC', 'ECONOMIC', 'CUSTOM'];

  // Value types for metadata
  valueTypes = ['PERCENTAGE', 'CURRENCY', 'COUNT', 'RATE', 'INDEX', 'RATIO', 'SCORE', 'CUSTOM'];

  // Timeframe types
  timeframeTypes = ['SINGLE_YEAR', 'YEAR_RANGE', 'SINGLE_DATE', 'DATE_RANGE'];

  constructor(
    private fb: FormBuilder,
    private contextsApi: ContextsApiService,
    private contextualizedTermsApi: ContextualizedTermsApiService,
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
    // Step 1: Term
    this.termForm = this.fb.group({
      useExisting: [false],
      existingTermId: [''],
      newTerm: this.fb.group({
        name: ['', Validators.required],
        description: [''],
        source: [''],
        category: ['']
      })
    });

    // Step 2: Contexts
    this.contextsForm = this.fb.group({
      selectedContexts: this.fb.array([]),
      newContexts: this.fb.array([])
    });

    // Step 3: Value Metadata
    this.metadataForm = this.fb.group({
      useExisting: [false],
      existingMetadataId: [''],
      newMetadata: this.fb.group({
        type: ['PERCENTAGE', Validators.required],
        unit: [''],
        label: ['', Validators.required],
        isPositive: [true, Validators.required]
      })
    });

    // Step 4: Values
    this.valuesForm = this.fb.group({
      preNormalizedValue: [0, [Validators.required, Validators.min(0)]],
      postNormalizedValue: [0, [Validators.required, Validators.min(0), Validators.max(1)]]
    });
  }

  /**
   * Load existing terms, contexts, and metadata from backend
   */
  private loadExistingData(): void {
    this.loadingData = true;
    forkJoin({
      terms: this.contextualizedTermsApi.getAllTerms(),
      contexts: this.contextsApi.getAllContexts(),
      metadata: this.contextualizedTermsApi.getAllValueMetadata()
    }).subscribe({
      next: (data) => {
        this.existingTerms = data.terms;
        this.existingContexts = data.contexts;
        this.existingMetadata = data.metadata;
        this.loadingData = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        this.snackBar.open('Error loading existing data', 'Close', { duration: 3000 });
        this.loadingData = false;
      }
    });
  }

  // ============ Term Management ============

  get usingExistingTerm(): boolean {
    return this.termForm.get('useExisting')?.value;
  }

  // ============ Context Management ============

  get selectedContextsArray(): FormArray {
    return this.contextsForm.get('selectedContexts') as FormArray;
  }

  get newContextsArray(): FormArray {
    return this.contextsForm.get('newContexts') as FormArray;
  }

  addSelectedContext(): void {
    this.selectedContextsArray.push(this.fb.control(''));
  }

  removeSelectedContext(index: number): void {
    this.selectedContextsArray.removeAt(index);
  }

  addNewContext(type?: string): void {
    const contextGroup = this.fb.group({
      type: [type || 'TIMEFRAME', Validators.required],
      label: ['', Validators.required]
    });

    // Add type-specific fields dynamically
    this.addTypeSpecificFields(contextGroup, type || 'TIMEFRAME');

    this.newContextsArray.push(contextGroup);
  }

  private addTypeSpecificFields(group: FormGroup, type: string): void {
    switch (type) {
      case 'TIMEFRAME':
        group.addControl('startDate', this.fb.control('', Validators.required));
        group.addControl('endDate', this.fb.control('', Validators.required));
        group.addControl('timeframeType', this.fb.control('SINGLE_YEAR', Validators.required));
        break;
      case 'LOCATION':
        group.addControl('country', this.fb.control(''));
        group.addControl('state', this.fb.control(''));
        group.addControl('city', this.fb.control(''));
        group.addControl('region', this.fb.control(''));
        break;
      case 'DEMOGRAPHIC':
        group.addControl('ageRange', this.fb.control(''));
        group.addControl('incomeLevel', this.fb.control(''));
        group.addControl('education', this.fb.control(''));
        group.addControl('occupation', this.fb.control(''));
        break;
      case 'ECONOMIC':
        group.addControl('gdpRange', this.fb.control(''));
        group.addControl('inflationRate', this.fb.control(''));
        group.addControl('unemploymentRate', this.fb.control(''));
        group.addControl('marketCondition', this.fb.control(''));
        break;
      case 'CUSTOM':
        group.addControl('value', this.fb.control('', Validators.required));
        group.addControl('metadata', this.fb.control({}));
        break;
    }
  }

  removeNewContext(index: number): void {
    this.newContextsArray.removeAt(index);
  }

  onContextTypeChange(index: number, newType: string): void {
    const contextGroup = this.newContextsArray.at(index) as FormGroup;

    // Remove old type-specific fields
    const fieldsToRemove = ['startDate', 'endDate', 'timeframeType', 'country', 'state', 'city', 'region',
                           'ageRange', 'incomeLevel', 'education', 'occupation', 'gdpRange', 'inflationRate',
                           'unemploymentRate', 'marketCondition', 'value', 'metadata'];
    fieldsToRemove.forEach(field => {
      if (contextGroup.contains(field)) {
        contextGroup.removeControl(field);
      }
    });

    // Add new type-specific fields
    this.addTypeSpecificFields(contextGroup, newType);
  }

  // ============ Metadata Management ============

  get usingExistingMetadata(): boolean {
    return this.metadataForm.get('useExisting')?.value;
  }

  // ============ Final Submission ============

  /**
   * Create all components and save contextualized term
   */
  async createContextualizedTerm(): Promise<void> {
    if (!this.isFormValid()) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;

    try {
      // Step 1: Create or get term
      const termId = await this.getOrCreateTerm();

      // Step 2: Create or get contexts
      const contextIds = await this.getOrCreateContexts();

      // Step 3: Create or get value metadata
      const metadataId = await this.getOrCreateMetadata();

      // Step 4: Create contextualized term
      const contextualizedTerm: ContextualizedTermDTO = {
        termId,
        contextIds,
        valueMetadataId: metadataId,
        preNormalizedValue: this.valuesForm.get('preNormalizedValue')?.value,
        postNormalizedValue: this.valuesForm.get('postNormalizedValue')?.value
      };

      this.contextualizedTermsApi.createContextualizedTerm(contextualizedTerm).subscribe({
        next: (result) => {
          this.snackBar.open('Contextualized term created successfully!', 'Close', { duration: 3000 });
          this.resetForms();
          this.loading = false;
        },
        error: (error) => {
          console.error('Error creating contextualized term:', error);
          this.snackBar.open('Error creating contextualized term', 'Close', { duration: 3000 });
          this.loading = false;
        }
      });
    } catch (error) {
      console.error('Error in creation process:', error);
      this.snackBar.open('Error in creation process', 'Close', { duration: 3000 });
      this.loading = false;
    }
  }

  private async getOrCreateTerm(): Promise<string> {
    if (this.usingExistingTerm) {
      return this.termForm.get('existingTermId')?.value;
    } else {
      const newTerm = this.termForm.get('newTerm')?.value;
      return new Promise((resolve, reject) => {
        this.contextualizedTermsApi.createTerm(newTerm).subscribe({
          next: (term) => resolve(term.id!),
          error: reject
        });
      });
    }
  }

  private async getOrCreateContexts(): Promise<string[]> {
    const contextIds: string[] = [];

    // Add selected existing contexts
    const selectedIds = this.selectedContextsArray.value.filter((id: string) => id);
    contextIds.push(...selectedIds);

    // Create new contexts
    const newContextsPromises = this.newContextsArray.value.map((context: any) =>
      new Promise<string>((resolve, reject) => {
        this.contextsApi.createContext(context).subscribe({
          next: (created) => resolve(created.id!),
          error: reject
        });
      })
    );

    const newContextIds = await Promise.all(newContextsPromises);
    contextIds.push(...newContextIds);

    return contextIds;
  }

  private async getOrCreateMetadata(): Promise<string> {
    if (this.usingExistingMetadata) {
      return this.metadataForm.get('existingMetadataId')?.value;
    } else {
      const newMetadata = this.metadataForm.get('newMetadata')?.value;
      return new Promise((resolve, reject) => {
        this.contextualizedTermsApi.createValueMetadata(newMetadata).subscribe({
          next: (metadata) => resolve(metadata.id!),
          error: reject
        });
      });
    }
  }

  private isFormValid(): boolean {
    return this.termForm.valid &&
           this.contextsForm.valid &&
           this.metadataForm.valid &&
           this.valuesForm.valid &&
           (this.selectedContextsArray.length > 0 || this.newContextsArray.length > 0);
  }

  private resetForms(): void {
    this.termForm.reset({ useExisting: false });
    this.contextsForm.reset();
    this.selectedContextsArray.clear();
    this.newContextsArray.clear();
    this.metadataForm.reset({ useExisting: false });
    this.valuesForm.reset({ preNormalizedValue: 0, postNormalizedValue: 0 });
  }
}
