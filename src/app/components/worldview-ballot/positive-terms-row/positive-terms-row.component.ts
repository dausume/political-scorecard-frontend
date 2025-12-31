import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TermContext, TermContextType, LocationContext, TimeframeContext, ContextualizedTerm } from '../../../classes/terms/contextualized-term';
import { MOCK_CONTEXTUALIZED_TERMS } from '../../../state/mock-data/contextualized-terms.mock';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './positive-terms-row.component.html',
  styleUrl: './positive-terms-row.component.scss'
})
export class PositiveTermsRowComponent {
  @Input() terms: Term[] = [];
  @Input() selectedContexts: TermContext[] = [];
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

  hasContextualizedTerm(term: Term): boolean {
    if (this.selectedContexts.length === 0) {
      return true; // No contexts selected, no error
    }

    // Check if there's a contextualized term for this term with matching contexts and isPositive
    return MOCK_CONTEXTUALIZED_TERMS.some(ct => {
      if (ct.term.id !== term.id) return false;

      // Check if the term has the correct positive/negative context
      // For positive terms, we want either undefined (not specified) or explicitly true
      if (ct.valueMetadata.isPositive !== undefined && ct.valueMetadata.isPositive !== true) {
        return false;
      }

      // Check if all selected contexts are present in the contextualized term
      return this.selectedContexts.every(selectedContext => {
        return ct.contexts.some(ctContext => {
          if (ctContext.type !== selectedContext.type) return false;

          // For location contexts, check specific location values
          if (ctContext.type === TermContextType.LOCATION && selectedContext.type === TermContextType.LOCATION) {
            const ctLoc = ctContext as LocationContext;
            const selectedLoc = selectedContext as LocationContext;

            // Check if the context matches (by state or country)
            if (selectedLoc.state && ctLoc.state === selectedLoc.state) return true;
            if (selectedLoc.country && ctLoc.country === selectedLoc.country) return true;
            return false;
          }

          // For timeframe contexts, check if date ranges match
          if (ctContext.type === TermContextType.TIMEFRAME && selectedContext.type === TermContextType.TIMEFRAME) {
            const ctTimeframe = ctContext as TimeframeContext;
            const selectedTimeframe = selectedContext as TimeframeContext;

            // Check if the date ranges match exactly
            return ctTimeframe.startDate.getTime() === selectedTimeframe.startDate.getTime() &&
                   ctTimeframe.endDate.getTime() === selectedTimeframe.endDate.getTime();
          }

          // For other contexts, check if labels match
          return ctContext.label === selectedContext.label;
        });
      });
    });
  }

  getContextualizedTerm(term: Term): ContextualizedTerm | undefined {
    if (this.selectedContexts.length === 0) {
      return undefined;
    }

    return MOCK_CONTEXTUALIZED_TERMS.find(ct => {
      if (ct.term.id !== term.id) return false;

      // Check if the term has the correct positive/negative context
      // For positive terms, we want either undefined (not specified) or explicitly true
      if (ct.valueMetadata.isPositive !== undefined && ct.valueMetadata.isPositive !== true) {
        return false;
      }

      // Check if all selected contexts are present in the contextualized term
      return this.selectedContexts.every(selectedContext => {
        return ct.contexts.some(ctContext => {
          if (ctContext.type !== selectedContext.type) return false;

          // For location contexts, check specific location values
          if (ctContext.type === TermContextType.LOCATION && selectedContext.type === TermContextType.LOCATION) {
            const ctLoc = ctContext as LocationContext;
            const selectedLoc = selectedContext as LocationContext;

            // Check if the context matches (by state or country)
            if (selectedLoc.state && ctLoc.state === selectedLoc.state) return true;
            if (selectedLoc.country && ctLoc.country === selectedLoc.country) return true;
            return false;
          }

          // For timeframe contexts, check if date ranges match
          if (ctContext.type === TermContextType.TIMEFRAME && selectedContext.type === TermContextType.TIMEFRAME) {
            const ctTimeframe = ctContext as TimeframeContext;
            const selectedTimeframe = selectedContext as TimeframeContext;

            // Check if the date ranges match exactly
            return ctTimeframe.startDate.getTime() === selectedTimeframe.startDate.getTime() &&
                   ctTimeframe.endDate.getTime() === selectedTimeframe.endDate.getTime();
          }

          // For other contexts, check if labels match
          return ctContext.label === selectedContext.label;
        });
      });
    });
  }

  getMissingContextsMessage(term: Term): string {
    return 'Term not defined for this context';
  }
}
