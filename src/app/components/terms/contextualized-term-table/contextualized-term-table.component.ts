import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCardModule } from '@angular/material/card';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ContextualizedTerm, TermContextType, TermContext } from '../../../classes/terms/contextualized-term';
import { Term } from '../../../classes/terms/term';

interface ContextualizedTermRow {
  contextualizedTerm?: ContextualizedTerm;
  contexts: string;
  preNormalizedValue: string;
  postNormalizedValue: string;
  valueType: string;
  isMissing: boolean;
  missingContextTypes: TermContextType[];
}

@Component({
  selector: 'app-contextualized-term-table',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCardModule,
    MatChipListbox,
    MatChipOption,
    MatSortModule
  ],
  templateUrl: './contextualized-term-table.component.html',
  styleUrls: ['./contextualized-term-table.component.scss']
})
export class ContextualizedTermTableComponent implements OnChanges, AfterViewInit {
  @Input() term?: Term;
  @Input() contextualizedTerms: ContextualizedTerm[] = [];
  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns: string[] = ['contexts', 'preNormalizedValue', 'postNormalizedValue', 'valueType', 'status'];
  dataSource = new MatTableDataSource<ContextualizedTermRow>([]);

  // All possible context types that could be applied
  allContextTypes = Object.values(TermContextType);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contextualizedTerms'] || changes['term']) {
      this.updateDataSource();
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;

    // Custom sorting accessor to handle numeric values properly
    this.dataSource.sortingDataAccessor = (row: ContextualizedTermRow, columnName: string): string | number => {
      switch (columnName) {
        case 'postNormalizedValue':
          // Parse the numeric value, missing rows get -1 to sort to bottom
          return row.isMissing ? -1 : parseFloat(row.postNormalizedValue);
        case 'preNormalizedValue':
          // Parse the numeric value, missing rows get -1 to sort to bottom
          return row.isMissing ? -1 : parseFloat(row.preNormalizedValue);
        case 'contexts':
          return row.contexts;
        case 'valueType':
          return row.valueType;
        case 'status':
          return row.isMissing ? 'Missing' : 'Available';
        default:
          return '';
      }
    };
  }

  private updateDataSource(): void {
    const existingRows: ContextualizedTermRow[] = this.contextualizedTerms.map(ct => ({
      contextualizedTerm: ct,
      contexts: this.formatContexts(ct.contexts),
      preNormalizedValue: ct.getFormattedPreNormalizedValue(),
      postNormalizedValue: ct.postNormalizedValue.toFixed(4),
      valueType: this.formatValueType(ct.valueMetadata.type),
      isMissing: false,
      missingContextTypes: []
    }));

    // Find missing context combinations
    const missingRows = this.findMissingContextCombinations();

    this.dataSource.data = [...existingRows, ...missingRows];
  }

  private formatContexts(contexts: TermContext[]): string {
    if (contexts.length === 0) return 'No context';
    return contexts.map(c => `${c.label}: ${c.getValue()}`).join(' | ');
  }

  private formatValueType(valueType: string): string {
    return valueType.charAt(0).toUpperCase() + valueType.slice(1).toLowerCase();
  }

  private findMissingContextCombinations(): ContextualizedTermRow[] {
    // This is a simplified version - you might want to implement more sophisticated logic
    // to find specific missing context combinations based on your business rules
    const missingRows: ContextualizedTermRow[] = [];

    // Example: Check if we have data for all context types
    const existingContextTypes = new Set<TermContextType>();
    this.contextualizedTerms.forEach(ct => {
      ct.contexts.forEach(context => {
        existingContextTypes.add(context.type);
      });
    });

    // Find missing context types
    const missingContextTypes = this.allContextTypes.filter(
      type => !existingContextTypes.has(type)
    );

    if (missingContextTypes.length > 0) {
      missingRows.push({
        contexts: 'Missing contexts: ' + missingContextTypes.join(', '),
        preNormalizedValue: 'N/A',
        postNormalizedValue: 'N/A',
        valueType: 'N/A',
        isMissing: true,
        missingContextTypes: missingContextTypes
      });
    }

    return missingRows;
  }

  getContextTypeLabel(contextType: TermContextType): string {
    return contextType.charAt(0).toUpperCase() + contextType.slice(1).toLowerCase();
  }
}
