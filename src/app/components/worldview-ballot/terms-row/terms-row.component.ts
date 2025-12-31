import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Term {
  id: string;
  name: string;
  description: string;
  source: string;
}

@Component({
  selector: 'app-term-sorting-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './terms-row.component.html',
  styleUrl: './terms-row.component.scss'
})
export class TermsRowComponent {
  @Input() availableTerms: Term[] = [];
  @Input() categorizedTermIds: string[] = [];
  @Output() addPositive = new EventEmitter<Term>();
  @Output() addNegative = new EventEmitter<Term>();

  isTermCategorized(term: Term): boolean {
    return this.categorizedTermIds.includes(term.id);
  }

  onAddPositive(term: Term) {
    this.addPositive.emit(term);
  }

  onAddNegative(term: Term) {
    this.addNegative.emit(term);
  }

  getTermCategory(termId: string): string {
    return this.categorizedTermIds.includes(termId) ? 'categorized' : 'neutral';
  }
}
