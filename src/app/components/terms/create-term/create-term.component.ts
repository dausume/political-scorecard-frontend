import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Term } from '../../../classes/terms/term';

@Component({
  selector: 'app-create-term',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './create-term.component.html',
  styleUrls: ['./create-term.component.scss']
})
export class CreateTermComponent implements OnInit {
  @Output() termCreated = new EventEmitter<Term>();
  @Output() cancelled = new EventEmitter<void>();

  termForm!: FormGroup;

  availableCategories = [
    'Economic Policy',
    'Healthcare',
    'Education',
    'Labor Quality',
    'Environmental',
    'Social Justice',
    'Infrastructure',
    'Public Safety',
    'Government Operations',
    'Housing',
    'Technology',
    'Foreign Policy'
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.termForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: [''],
      source: ['']
    });
  }

  createTerm(): void {
    if (!this.termForm.valid) {
      return;
    }

    const termData: Term = {
      id: this.generateId(),
      name: this.termForm.value.name,
      description: this.termForm.value.description,
      category: this.termForm.value.category,
      source: this.termForm.value.source
    };

    this.termCreated.emit(termData);
  }

  cancel(): void {
    this.cancelled.emit();
  }

  private generateId(): string {
    return 'term_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
}
