import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  selector: 'app-positive-terms-row',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './positive-terms-row.component.html',
  styleUrl: './positive-terms-row.component.scss'
})
// Contextualized-value display retired 2026-07-17 — live scoring was replaced
// by the Polari-backed Worldview Scorer (/worldview-scorer).
export class PositiveTermsRowComponent {
  @Input() terms: Term[] = [];
  @Output() removeTerm = new EventEmitter<Term>();
  @Output() weightChange = new EventEmitter<TermWeight>();

  // Track weights for each term (default to 50)
  termWeights: Map<string, number> = new Map();

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
}
