import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContextSelectorRowComponent } from '../context-selector-row/context-selector-row.component';
import { TermContext } from '../../../classes/terms/contextualized-term';
import { WeightedWorldviewTerm } from '../../../classes/terms/weighted-worldview-term';

export interface ContextRow {
  id: string;
  contexts: TermContext[];
  isCore: boolean;
}

@Component({
  selector: 'app-context-section',
  standalone: true,
  imports: [CommonModule, ContextSelectorRowComponent],
  templateUrl: './context-section.component.html',
  styleUrl: './context-section.component.scss'
})
export class ContextSectionComponent {
  @Input() coreContexts: TermContext[] = [];
  @Input() weightedTerms: WeightedWorldviewTerm[] = [];
  @Output() coreContextsChange = new EventEmitter<TermContext[]>();

  comparativeContextRows: ContextRow[] = [];
  private nextRowId = 1;

  addComparativeContext(): void {
    // Create a new comparative context row with empty contexts
    const newRow: ContextRow = {
      id: `comparative-${this.nextRowId++}`,
      contexts: [],
      isCore: false
    };
    this.comparativeContextRows = [...this.comparativeContextRows, newRow];
  }

  removeComparativeContext(rowId: string): void {
    this.comparativeContextRows = this.comparativeContextRows.filter(row => row.id !== rowId);
  }

  onCoreContextsChange(newContexts: TermContext[]): void {
    this.coreContextsChange.emit(newContexts);
  }

  onComparativeContextsChange(rowId: string, newContexts: TermContext[]): void {
    const row = this.comparativeContextRows.find(r => r.id === rowId);
    if (row) {
      row.contexts = newContexts;
      // Trigger change detection
      this.comparativeContextRows = [...this.comparativeContextRows];
    }
  }
}
