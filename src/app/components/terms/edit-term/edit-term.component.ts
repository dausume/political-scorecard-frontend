import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
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
  selector: 'app-edit-term',
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
  templateUrl: './edit-term.component.html',
  styleUrls: ['./edit-term.component.scss']
})
export class EditTermComponent implements OnInit {
  @Input() term!: Term;
  @Output() termUpdated = new EventEmitter<Term>();
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
    if (this.term) {
      this.populateForm(this.term);
    }
  }

  private initForm(): void {
    this.termForm = this.fb.group({
      name: ['', Validators.required],
      description: ['', Validators.required],
      category: [''],
      source: ['']
    });
  }

  private populateForm(term: Term): void {
    this.termForm.patchValue({
      name: term.name,
      description: term.description,
      category: term.category,
      source: term.source
    });
  }

  updateTerm(): void {
    if (!this.termForm.valid) {
      return;
    }

    const updatedTerm: Term = {
      id: this.term.id,
      name: this.termForm.value.name,
      description: this.termForm.value.description,
      category: this.termForm.value.category,
      source: this.termForm.value.source
    };

    this.termUpdated.emit(updatedTerm);
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
