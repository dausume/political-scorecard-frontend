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
import { WorldviewElectionsApiService, WorldviewElectionDTO } from '../../../services/api/worldview-elections-api.service';
import { ElectionTypeSelectorDialogComponent } from '../election-type-selector-dialog/election-type-selector-dialog.component';

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
    MatCheckboxModule
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

  createElection(): void {
    if (!this.electionForm.valid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
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
