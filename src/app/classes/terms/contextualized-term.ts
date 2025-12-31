import { Term } from './term';

export enum TermContextType {
  TIMEFRAME = 'TIMEFRAME',
  LOCATION = 'LOCATION',
  DEMOGRAPHIC = 'DEMOGRAPHIC',
  ECONOMIC = 'ECONOMIC',
  CUSTOM = 'CUSTOM'
}

export interface TermContext {
  type: TermContextType;
  label: string;
  getValue(): string;
}

export class TimeframeContext implements TermContext {
  type: TermContextType = TermContextType.TIMEFRAME;
  label: string;
  startDate: Date;
  endDate: Date;

  constructor(data: { label: string; startDate: Date; endDate: Date }) {
    this.label = data.label;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
  }

  getValue(): string {
    return `${this.startDate.toLocaleDateString()} - ${this.endDate.toLocaleDateString()}`;
  }

  toString(): string {
    return `TimeframeContext(${this.label}: ${this.getValue()})`;
  }
}

export class LocationContext implements TermContext {
  type: TermContextType = TermContextType.LOCATION;
  label: string;
  country?: string;
  state?: string;
  city?: string;
  region?: string;

  constructor(data: {
    label: string;
    country?: string;
    state?: string;
    city?: string;
    region?: string;
  }) {
    this.label = data.label;
    this.country = data.country;
    this.state = data.state;
    this.city = data.city;
    this.region = data.region;
  }

  getValue(): string {
    const parts = [this.city, this.state, this.country, this.region].filter(Boolean);
    return parts.join(', ');
  }

  toString(): string {
    return `LocationContext(${this.label}: ${this.getValue()})`;
  }
}

export class DemographicContext implements TermContext {
  type: TermContextType = TermContextType.DEMOGRAPHIC;
  label: string;
  ageRange?: string;
  incomeLevel?: string;
  education?: string;
  occupation?: string;

  constructor(data: {
    label: string;
    ageRange?: string;
    incomeLevel?: string;
    education?: string;
    occupation?: string;
  }) {
    this.label = data.label;
    this.ageRange = data.ageRange;
    this.incomeLevel = data.incomeLevel;
    this.education = data.education;
    this.occupation = data.occupation;
  }

  getValue(): string {
    const parts = [this.ageRange, this.incomeLevel, this.education, this.occupation].filter(Boolean);
    return parts.join(', ');
  }

  toString(): string {
    return `DemographicContext(${this.label}: ${this.getValue()})`;
  }
}

export class EconomicContext implements TermContext {
  type: TermContextType = TermContextType.ECONOMIC;
  label: string;
  gdpRange?: string;
  inflationRate?: string;
  unemploymentRate?: string;
  marketCondition?: string;

  constructor(data: {
    label: string;
    gdpRange?: string;
    inflationRate?: string;
    unemploymentRate?: string;
    marketCondition?: string;
  }) {
    this.label = data.label;
    this.gdpRange = data.gdpRange;
    this.inflationRate = data.inflationRate;
    this.unemploymentRate = data.unemploymentRate;
    this.marketCondition = data.marketCondition;
  }

  getValue(): string {
    const parts = [];
    if (this.gdpRange) parts.push(`GDP: ${this.gdpRange}`);
    if (this.inflationRate) parts.push(`Inflation: ${this.inflationRate}`);
    if (this.unemploymentRate) parts.push(`Unemployment: ${this.unemploymentRate}`);
    if (this.marketCondition) parts.push(this.marketCondition);
    return parts.join(', ');
  }

  toString(): string {
    return `EconomicContext(${this.label}: ${this.getValue()})`;
  }
}

export class CustomContext implements TermContext {
  type: TermContextType = TermContextType.CUSTOM;
  label: string;
  value: string;
  metadata?: Record<string, any>;

  constructor(data: { label: string; value: string; metadata?: Record<string, any> }) {
    this.label = data.label;
    this.value = data.value;
    this.metadata = data.metadata;
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return `CustomContext(${this.label}: ${this.value})`;
  }
}

export enum ValueType {
  PERCENTAGE = 'PERCENTAGE',
  CURRENCY = 'CURRENCY',
  COUNT = 'COUNT',
  RATE = 'RATE',
  INDEX = 'INDEX',
  RATIO = 'RATIO',
  SCORE = 'SCORE',
  CUSTOM = 'CUSTOM'
}

export interface ValueMetadata {
  type: ValueType;
  unit?: string;
  label: string;
  isPositive?: boolean;
}

export class ContextualizedTerm {
  id: string;
  term: Term;
  contexts: TermContext[];
  valueMetadata: ValueMetadata;
  preNormalizedValue: number;
  postNormalizedValue: number;

  constructor(data: {
    id: string;
    term: Term;
    contexts: TermContext[];
    valueMetadata: ValueMetadata;
    preNormalizedValue: number;
    postNormalizedValue?: number;
  }) {
    this.id = data.id;
    this.term = data.term;
    this.contexts = data.contexts;
    this.valueMetadata = data.valueMetadata;
    this.preNormalizedValue = data.preNormalizedValue;
    this.postNormalizedValue = data.postNormalizedValue ?? 0;
  }

  updatePreNormalizedValue(newValue: number): void {
    this.preNormalizedValue = newValue;
  }

  getFormattedPreNormalizedValue(): string {
    const { type, unit } = this.valueMetadata;
    switch (type) {
      case ValueType.PERCENTAGE:
        return `${this.preNormalizedValue}%`;
      case ValueType.CURRENCY:
        return `${unit ?? '$'}${this.preNormalizedValue.toLocaleString()}`;
      case ValueType.COUNT:
        return this.preNormalizedValue.toLocaleString();
      case ValueType.RATE:
        return `${this.preNormalizedValue}${unit ?? ''}`;
      default:
        return unit ? `${this.preNormalizedValue} ${unit}` : `${this.preNormalizedValue}`;
    }
  }

  getContextByType(type: TermContextType): TermContext | undefined {
    return this.contexts.find(c => c.type === type);
  }

  hasContextType(type: TermContextType): boolean {
    return this.contexts.some(c => c.type === type);
  }

  getContextSummary(): string {
    return this.contexts.map(c => `${c.label}: ${c.getValue()}`).join(' | ');
  }

  getFullDescription(): string {
    const contextSummary = this.getContextSummary();
    return contextSummary
      ? `${this.term.name} (${contextSummary})`
      : this.term.name;
  }

  toString(): string {
    return `ContextualizedTerm(id: ${this.id}, term: ${this.term.name}, value: ${this.getFormattedPreNormalizedValue()} -> ${this.postNormalizedValue.toFixed(4)} [0-1], contexts: [${this.contexts.map(c => c.label).join(', ')}])`;
  }
}
