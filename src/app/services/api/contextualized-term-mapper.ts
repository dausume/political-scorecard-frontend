import { Term } from '../../classes/terms/term';
import {
  ContextualizedTerm,
  TermContext,
  TimeframeContext,
  LocationContext,
  DemographicContext,
  EconomicContext,
  CustomContext,
  ValueMetadata,
  ValueType
} from '../../classes/terms/contextualized-term';
import { TermContextDTO } from './contexts-api.service';
import { ContextualizedTermDTO, ValueMetadataDTO } from './contextualized-terms-api.service';

/**
 * Rehydrates backend DTO rows into the real frontend domain classes.
 *
 * The scoring service and selectors rely on class behavior (e.g.
 * TimeframeContext.startDate.getTime(), ct.getContextByType(), ...),
 * so raw DTOs must never flow into them directly.
 */

/** Map a single context DTO into a real TermContext class instance.
 *  Unknown/malformed payloads fall back to CustomContext, or null when
 *  even that is not salvageable. */
export function mapTermContextDTO(dto: TermContextDTO | null | undefined): TermContext | null {
  if (!dto || !dto.type) return null;
  const label = dto.label || dto.type;

  try {
    switch (dto.type) {
      case 'TIMEFRAME': {
        const startDate = new Date(dto['startDate']);
        const endDate = new Date(dto['endDate']);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
        return new TimeframeContext({ label, startDate, endDate });
      }
      case 'LOCATION':
        return new LocationContext({
          label,
          country: dto['country'] || undefined,
          state: dto['state'] || undefined,
          city: dto['city'] || undefined,
          region: dto['region'] || undefined
        });
      case 'DEMOGRAPHIC':
        return new DemographicContext({
          label,
          ageRange: dto['ageRange'] || undefined,
          incomeLevel: dto['incomeLevel'] || undefined,
          education: dto['education'] || undefined,
          occupation: dto['occupation'] || undefined
        });
      case 'ECONOMIC':
        return new EconomicContext({
          label,
          gdpRange: dto['gdpRange'] || undefined,
          inflationRate: dto['inflationRate'] || undefined,
          unemploymentRate: dto['unemploymentRate'] || undefined,
          marketCondition: dto['marketCondition'] || undefined
        });
      case 'CUSTOM':
      default:
        // Unknown context types degrade gracefully into CustomContext.
        return new CustomContext({
          label,
          value: dto['value'] != null ? String(dto['value']) : '',
          metadata: dto['metadata'] || undefined
        });
    }
  } catch {
    return null;
  }
}

function mapValueMetadataDTO(dto: ValueMetadataDTO | null | undefined): ValueMetadata {
  const type = dto?.type && dto.type in ValueType
    ? ValueType[dto.type as keyof typeof ValueType]
    : ValueType.CUSTOM;
  return {
    type,
    unit: dto?.unit || undefined,
    label: dto?.label || 'Value',
    isPositive: dto?.isPositive ?? true
  };
}

/** Map one contextualized-term row; returns null when the row cannot
 *  be turned into a usable class instance. */
export function mapContextualizedTermDTO(dto: ContextualizedTermDTO | null | undefined): ContextualizedTerm | null {
  if (!dto) return null;

  const termId = dto.term?.id || dto.termId;
  if (!termId) return null;

  const term = new Term({
    id: termId,
    name: dto.term?.name || termId,
    description: dto.term?.description ?? '',
    source: dto.term?.source ?? '',
    category: dto.term?.category ?? undefined
  });

  const contexts = (dto.contexts || [])
    .map(c => mapTermContextDTO(c))
    .filter((c): c is TermContext => c !== null);

  return new ContextualizedTerm({
    id: dto.id || `ct-${termId}-${dto.contextIds?.join('-') ?? 'unidentified'}`,
    term,
    contexts,
    valueMetadata: mapValueMetadataDTO(dto.valueMetadata),
    preNormalizedValue: dto.preNormalizedValue ?? 0,
    postNormalizedValue: dto.postNormalizedValue ?? 0
  });
}

/** Map a batch of rows, silently skipping unusable ones. */
export function mapContextualizedTermDTOs(dtos: ContextualizedTermDTO[] | null | undefined): ContextualizedTerm[] {
  return (dtos || [])
    .map(dto => mapContextualizedTermDTO(dto))
    .filter((ct): ct is ContextualizedTerm => ct !== null);
}
