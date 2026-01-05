import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

export interface ElectionTypeSelectorData {
  selectedTypes: string[];
  availableTypes: string[];
}

@Component({
  selector: 'app-election-type-selector-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    FormsModule
  ],
  templateUrl: './election-type-selector-dialog.component.html',
  styleUrls: ['./election-type-selector-dialog.component.scss']
})
export class ElectionTypeSelectorDialogComponent {
  selectedTypes: Set<string>;
  availableTypes: string[];

  constructor(
    public dialogRef: MatDialogRef<ElectionTypeSelectorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ElectionTypeSelectorData
  ) {
    this.selectedTypes = new Set(data.selectedTypes || []);
    this.availableTypes = data.availableTypes || [];
  }

  isSelected(type: string): boolean {
    return this.selectedTypes.has(type);
  }

  toggleType(type: string): void {
    if (this.selectedTypes.has(type)) {
      this.selectedTypes.delete(type);
    } else {
      this.selectedTypes.add(type);
    }
  }

  onConfirm(): void {
    this.dialogRef.close(Array.from(this.selectedTypes));
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
