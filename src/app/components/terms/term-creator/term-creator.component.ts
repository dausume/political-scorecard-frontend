import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ContextualizedTermsApiService, TermDTO } from '../../../services/api/contextualized-terms-api.service';

/**
 * Component for creating new Terms
 */
@Component({
  selector: 'app-term-creator',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatSnackBarModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './term-creator.component.html',
  styleUrls: ['./term-creator.component.scss']
})
export class TermCreatorComponent {
  termForm: FormGroup;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private termsApi: ContextualizedTermsApiService,
    private snackBar: MatSnackBar
  ) {
    this.termForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      source: [''],
      category: ['']
    });
  }

  createTerm(): void {
    if (!this.termForm.valid) {
      this.snackBar.open('Please fill in all required fields', 'Close', { duration: 3000 });
      return;
    }

    this.loading = true;
    const termData: TermDTO = this.termForm.value;

    this.termsApi.createTerm(termData).subscribe({
      next: (result) => {
        this.snackBar.open('Term created successfully!', 'Close', { duration: 3000 });
        this.router.navigate(['/terms', result.id]);
      },
      error: (error) => {
        console.error('Error creating term:', error);
        this.snackBar.open('Error creating term', 'Close', { duration: 3000 });
        this.loading = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/terms']);
  }
}
