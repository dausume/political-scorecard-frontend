import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContextualizedTerm } from '../../../classes/terms/contextualized-term';

export interface Term {
  id: string;
  name: string;
  description: string;
  source: string;
}

export interface TermWeight {
  termId: string;
  weight: number; // 0 to 100
}

@Component({
  selector: 'app-negative-terms-row',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './negative-terms-row.component.html',
  styleUrl: './negative-terms-row.component.scss'
})
export class NegativeTermsRowComponent implements OnChanges {
  @Input() terms: Term[] = [];
  @Input() contextualizedTermsMap: Map<string, ContextualizedTerm | undefined> = new Map();
  @Output() removeTerm = new EventEmitter<Term>();
  @Output() weightChange = new EventEmitter<TermWeight>();

  // Track weights for each term (default to 50)
  termWeights: Map<string, number> = new Map();

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contextualizedTermsMap']) {
      console.log('[NEGATIVE-TERMS-ROW] 🔴 contextualizedTermsMap changed:', this.contextualizedTermsMap);
    }
  }

  onRemoveTerm(term: Term) {
    this.termWeights.delete(term.id);
    this.removeTerm.emit(term);
  }

  getTermWeight(termId: string): number {
    if (!this.termWeights.has(termId)) {
      this.termWeights.set(termId, 50); // Default weight
    }
    return this.termWeights.get(termId)!;
  }

  onWeightChange(term: Term, weight: number): void {
    this.termWeights.set(term.id, weight);
    this.weightChange.emit({ termId: term.id, weight });
  }

  incrementWeight(term: Term): void {
    const currentWeight = this.getTermWeight(term.id);
    const newWeight = Math.min(100, currentWeight + 5);
    this.onWeightChange(term, newWeight);
  }

  decrementWeight(term: Term): void {
    const currentWeight = this.getTermWeight(term.id);
    const newWeight = Math.max(0, currentWeight - 5);
    this.onWeightChange(term, newWeight);
  }

  hasContextualizedTerm(term: Term): boolean {
    return this.contextualizedTermsMap.get(term.id) !== undefined;
  }

  getContextualizedTerm(term: Term): ContextualizedTerm | undefined {
    return this.contextualizedTermsMap.get(term.id);
  }

  getMissingContextsMessage(term: Term): string {
    return 'Term not defined for this context';
  }
}
