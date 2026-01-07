import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { WorldviewElectionsApiService, WorldviewElectionDTO } from '../../../services/api/worldview-elections-api.service';
import { ElectionTypeSelectorDialogComponent } from '../election-type-selector-dialog/election-type-selector-dialog.component';
import { TermCreatorDialogComponent } from '../../terms/term-creator-dialog/term-creator-dialog.component';
import { Term } from '../../../classes/terms/term';

/**
 * Component for creating new Worldview Elections
 * Worldview Elections are NOT traditional political elections.
 * They are democratic processes to define the meaning and accountability
 * systems for specific issues or states of society.
 */
@Component({
  selector: 'app-election-creator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatDialogModule,
    MatCheckboxModule,
    MatExpansionModule
  ],
  templateUrl: './election-creator.component.html',
  styleUrls: ['./election-creator.component.scss']
})
export class ElectionCreatorComponent {
  electionForm: FormGroup;
  loading = false;

  electionStatuses = ['DRAFT', 'ACTIVE', 'CLOSED', 'ARCHIVED'];
  currentUserId = 'current-user-id'; // TODO: Get from auth service

  selectedElectionTypes: string[] = [];
  availableElectionTypes = [
    'Economic Policy',
    'Healthcare System',
    'Education Accountability',
    'Environmental Protection',
    'Social Justice',
    'Infrastructure Development',
    'Public Safety',
    'Government Transparency',
    'Labor Rights',
    'Housing Policy',
    'Technology Regulation',
    'Foreign Policy'
  ];

  // Abstract Context Specifications
  selectedLocationGranularities: string[] = [];
  selectedTimeGranularities: string[] = [];
  selectedDemographicGranularities: string[] = [];
  selectedEconomicGranularities: string[] = [];

  availableLocationGranularities = ['COUNTRY', 'STATE', 'CITY', 'REGION'];
  availableTimeGranularities = ['SINGLE_YEAR', 'YEAR_RANGE', 'SINGLE_DATE', 'DATE_RANGE'];
  availableDemographicGranularities = ['AGE_RANGE', 'INCOME_LEVEL', 'EDUCATION', 'OCCUPATION'];
  availableEconomicGranularities = ['GDP_RANGE', 'INFLATION_RATE', 'UNEMPLOYMENT_RATE', 'MARKET_CONDITION'];

  // Valid Terms (terms that make sense for this worldview)
  selectedValidTerms: Term[] = [];

  // Group terms by category for easier selection
  termsByCategory: { [category: string]: Term[] } = {
    'Labor Quality': [],
    'Economic Policy': [],
    'Healthcare': [],
    'Education': [],
    'Environmental': [],
    'Social Justice': [],
    'Infrastructure': [],
    'Housing': []
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private electionsApi: WorldviewElectionsApiService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.electionForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      electionTypes: [[], Validators.required],
      status: ['DRAFT', Validators.required],
      startDate: [''],
      endDate: ['']
    });
  }

  openElectionTypeSelector(): void {
    const dialogRef = this.dialog.open(ElectionTypeSelectorDialogComponent, {
      width: '500px',
      data: {
        selectedTypes: this.selectedElectionTypes,
        availableTypes: this.availableElectionTypes
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result !== null && result !== undefined) {
        this.selectedElectionTypes = result;
        this.electionForm.patchValue({ electionTypes: result });
      }
    });
  }

  removeElectionType(type: string): void {
    this.selectedElectionTypes = this.selectedElectionTypes.filter(t => t !== type);
    this.electionForm.patchValue({ electionTypes: this.selectedElectionTypes });
  }

  // Abstract Context Methods
  toggleLocationGranularity(granularity: string): void {
    const index = this.selectedLocationGranularities.indexOf(granularity);
    if (index >= 0) {
      this.selectedLocationGranularities.splice(index, 1);
    } else {
      this.selectedLocationGranularities.push(granularity);
    }
  }

  toggleTimeGranularity(granularity: string): void {
    const index = this.selectedTimeGranularities.indexOf(granularity);
    if (index >= 0) {
      this.selectedTimeGranularities.splice(index, 1);
    } else {
      this.selectedTimeGranularities.push(granularity);
    }
  }

  toggleDemographicGranularity(granularity: string): void {
    const index = this.selectedDemographicGranularities.indexOf(granularity);
    if (index >= 0) {
      this.selectedDemographicGranularities.splice(index, 1);
    } else {
      this.selectedDemographicGranularities.push(granularity);
    }
  }

  toggleEconomicGranularity(granularity: string): void {
    const index = this.selectedEconomicGranularities.indexOf(granularity);
    if (index >= 0) {
      this.selectedEconomicGranularities.splice(index, 1);
    } else {
      this.selectedEconomicGranularities.push(granularity);
    }
  }

  isLocationGranularitySelected(granularity: string): boolean {
    return this.selectedLocationGranularities.includes(granularity);
  }

  isTimeGranularitySelected(granularity: string): boolean {
    return this.selectedTimeGranularities.includes(granularity);
  }

  isDemographicGranularitySelected(granularity: string): boolean {
    return this.selectedDemographicGranularities.includes(granularity);
  }

  isEconomicGranularitySelected(granularity: string): boolean {
    return this.selectedEconomicGranularities.includes(granularity);
  }

  // Valid Terms Methods
  addValidTerm(term: Term): void {
    if (!this.selectedValidTerms.find(t => t.id === term.id)) {
      this.selectedValidTerms.push(term);
    }
  }

  removeValidTerm(termId: string): void {
    this.selectedValidTerms = this.selectedValidTerms.filter(t => t.id !== termId);
  }

  toggleTermSelection(term: Term): void {
    const index = this.selectedValidTerms.findIndex(t => t.id === term.id);
    if (index >= 0) {
      this.selectedValidTerms.splice(index, 1);
    } else {
      this.selectedValidTerms.push(term);
    }
  }

  isTermSelected(term: Term): boolean {
    return this.selectedValidTerms.some(t => t.id === term.id);
  }

  getCategoryKeys(): string[] {
    return Object.keys(this.termsByCategory);
  }

  openTermCreatorDialog(): void {
    const dialogRef = this.dialog.open(TermCreatorDialogComponent, {
      width: '700px',
      data: {}
    });

    dialogRef.afterClosed().subscribe((result: Term | null) => {
      if (result) {
        // Add the newly created term to the list and select it
        const category = result.category || 'Labor Quality';
        if (!this.termsByCategory[category]) {
          this.termsByCategory[category] = [];
        }
        this.termsByCategory[category].push(result);
        this.addValidTerm(result);
        this.snackBar.open('Term created and added to election', 'Close', { duration: 3000 });
      }
    });
  }

  createElection(): void {
    if (!this.electionForm.valid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    // Validate required abstract contexts
    if (this.selectedLocationGranularities.length === 0) {
      this.snackBar.open('Please select at least one location context granularity', 'Close', { duration: 3000 });
      return;
    }

    if (this.selectedTimeGranularities.length === 0) {
      this.snackBar.open('Please select at least one time context granularity', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    const electionData: WorldviewElectionDTO = {
      ...this.electionForm.value,
      createdBy: this.currentUserId,
      startDate: this.electionForm.value.startDate?.toISOString(),
      endDate: this.electionForm.value.endDate?.toISOString()
    };

    this.electionsApi.createElection(electionData).subscribe({
      next: (result) => {
        this.snackBar.open('Worldview election created successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/worldview-elections']);
      },
      error: (error) => {
        console.error('Error creating election:', error);
        this.snackBar.open('Error creating election', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/worldview-elections']);
  }
}
