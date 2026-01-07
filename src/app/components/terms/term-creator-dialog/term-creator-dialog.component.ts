import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Term } from '../../../classes/terms/term';
import { CreateTermComponent } from '../create-term/create-term.component';

export interface TermCreatorDialogData {
  // Empty for now - reserved for future options
}

/**
 * Dialog for creating new terms
 * Wraps the CreateTermComponent
 */
@Component({
  selector: 'app-term-creator-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    CreateTermComponent
  ],
  template: `
    <div class="term-creator-dialog">
      <app-create-term
        (termCreated)="onTermCreated($event)"
        (cancelled)="onCancel()">
      </app-create-term>
    </div>
  `,
  styles: [`
    .term-creator-dialog {
      min-width: 500px;
      max-width: 700px;
    }

    :host ::ng-deep .term-info-card {
      box-shadow: none !important;
      margin: 0 !important;
    }
  `]
})
export class TermCreatorDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TermCreatorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: TermCreatorDialogData
  ) {}

  onTermCreated(term: Term): void {
    this.dialogRef.close(term);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
