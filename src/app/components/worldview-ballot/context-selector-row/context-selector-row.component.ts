import { Component, Input, Output, EventEmitter, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TermContext, TermContextType, TimeframeContext, LocationContext } from '../../../classes/terms/contextualized-term';
import { WeightedWorldviewTerm } from '../../../classes/terms/weighted-worldview-term';

// Per-context score chips were removed 2026-07-17 — the client-side scorer
// was replaced by the Polari-backed Worldview Scorer (/worldview-scorer).

interface TimeframeOption {
  label: string;
  startDate: Date;
  endDate: Date;
}

interface LocationOption {
  label: string;
  state?: string;
  country?: string;
}

@Component({
  selector: 'app-context-selector-row',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './context-selector-row.component.html',
  styleUrl: './context-selector-row.component.scss'
})
export class ContextSelectorRowComponent implements OnInit, OnChanges {
  @Input() contexts: TermContext[] = [];
  @Input() weightedTerms: WeightedWorldviewTerm[] = [];
  @Input() isCore: boolean = true; // True for core context, false for comparative
  @Output() contextsChange = new EventEmitter<TermContext[]>();

  TermContextType = TermContextType;

  // Available timeframe options
  timeframeOptions: TimeframeOption[] = [
    {
      label: '2022',
      startDate: new Date('2022-01-01'),
      endDate: new Date('2023-12-31')
    }
  ];

  // Available location options (matching Labor Quality Score data)
  locationOptions: LocationOption[] = [
    { label: 'Alabama, United States', state: 'Alabama', country: 'United States' },
    { label: 'California, United States', state: 'California', country: 'United States' },
    { label: 'Washington DC, United States', state: 'Washington DC', country: 'United States' },
    { label: 'Idaho, United States', state: 'Idaho', country: 'United States' },
    { label: 'Texas, United States', state: 'Texas', country: 'United States' }
  ];

  selectedTimeframe: string = '';
  selectedLocation: string = '';

  ngOnInit() {
    this.initializeSelections();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Re-initialize selections if contexts changed
    if (changes['contexts']) {
      this.initializeSelections();
    }
  }

  initializeSelections() {
    const timeframeContext = this.getTimeframeContext();
    if (timeframeContext) {
      const option = this.timeframeOptions.find(opt =>
        opt.startDate.getTime() === timeframeContext.startDate.getTime() &&
        opt.endDate.getTime() === timeframeContext.endDate.getTime()
      );
      this.selectedTimeframe = option?.label || '';
    }

    const locationContext = this.getLocationContext();
    if (locationContext) {
      const option = this.locationOptions.find(opt =>
        opt.country === locationContext.country &&
        opt.state === locationContext.state
      );
      this.selectedLocation = option?.label || '';
    }
  }

  getContextByType(type: TermContextType): TermContext | undefined {
    return this.contexts.find(c => c.type === type);
  }

  getTimeframeContext(): TimeframeContext | undefined {
    const context = this.getContextByType(TermContextType.TIMEFRAME);
    return context instanceof TimeframeContext ? context : undefined;
  }

  getLocationContext(): LocationContext | undefined {
    const context = this.getContextByType(TermContextType.LOCATION);
    return context instanceof LocationContext ? context : undefined;
  }

  onTimeframeChange(selectedLabel: string): void {
    const option = this.timeframeOptions.find(opt => opt.label === selectedLabel);
    if (option) {
      const newContext = new TimeframeContext({
        label: 'Timeframe',
        startDate: option.startDate,
        endDate: option.endDate
      });
      this.updateContext(newContext);
    }
  }

  onLocationChange(selectedLabel: string): void {
    console.log('[CONTEXT-SELECTOR] 🔵 Location dropdown changed to:', selectedLabel);
    const option = this.locationOptions.find(opt => opt.label === selectedLabel);
    if (option) {
      console.log('[CONTEXT-SELECTOR] 🔵 Creating new LocationContext:', option);
      const newContext = new LocationContext({
        label: option.state ? 'State' : 'Nation',
        country: option.country,
        state: option.state
      });
      this.updateContext(newContext);
    }
  }

  updateContext(updatedContext: TermContext): void {
    const index = this.contexts.findIndex(c => c.type === updatedContext.type);
    if (index !== -1) {
      const newContexts = [...this.contexts];
      newContexts[index] = updatedContext;
      console.log('[CONTEXT-SELECTOR] 🟢 Emitting updated contexts (replaced at index', index, '):', newContexts);
      this.contextsChange.emit(newContexts);
    } else {
      // Add new context if it doesn't exist
      const newContexts = [...this.contexts, updatedContext];
      console.log('[CONTEXT-SELECTOR] 🟢 Emitting updated contexts (added new):', newContexts);
      this.contextsChange.emit(newContexts);
    }
  }
}
