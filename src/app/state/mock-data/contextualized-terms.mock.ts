import { ContextualizedTerm, TimeframeContext, LocationContext, ValueType } from '../../classes/terms/contextualized-term';
import { MOCK_TERMS } from './terms.mock';

// Helper to get term by name
const getTerm = (name: string) => MOCK_TERMS.find(t => t.name === name)!;

// Contextualized terms for Labor Quality across different nations (international competitiveness)
export const LABOR_QUALITY_CONTEXTUALIZED_TERMS: ContextualizedTerm[] = [
  // 2023-2024 data
  new ContextualizedTerm({
    id: 'ct-labor-quality-us-2023-2024',
    term: getTerm('Labor Quality'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'United States'
      })
    ],
    valueMetadata: {
      type: ValueType.INDEX,
      unit: 'pts',
      label: 'Labor Quality Index'
    },
    preNormalizedValue: 85
  }),
  new ContextualizedTerm({
    id: 'ct-labor-quality-china-2023-2024',
    term: getTerm('Labor Quality'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'China'
      })
    ],
    valueMetadata: {
      type: ValueType.INDEX,
      unit: 'pts',
      label: 'Labor Quality Index'
    },
    preNormalizedValue: 72
  }),
  new ContextualizedTerm({
    id: 'ct-labor-quality-germany-2023-2024',
    term: getTerm('Labor Quality'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'Germany'
      })
    ],
    valueMetadata: {
      type: ValueType.INDEX,
      unit: 'pts',
      label: 'Labor Quality Index'
    },
    preNormalizedValue: 88
  }),
  new ContextualizedTerm({
    id: 'ct-labor-quality-india-2023-2024',
    term: getTerm('Labor Quality'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'India'
      })
    ],
    valueMetadata: {
      type: ValueType.INDEX,
      unit: 'pts',
      label: 'Labor Quality Index'
    },
    preNormalizedValue: 65
  }),
  new ContextualizedTerm({
    id: 'ct-labor-quality-california-2023-2024',
    term: getTerm('Labor Quality'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31')
      }),
      new LocationContext({
        label: 'State',
        state: 'California',
        country: 'United States'
      })
    ],
    valueMetadata: {
      type: ValueType.INDEX,
      unit: 'pts',
      label: 'Labor Quality Index'
    },
    preNormalizedValue: 90
  }),

  // 2022-2023 data
  new ContextualizedTerm({
    id: 'ct-labor-quality-us-2022-2023',
    term: getTerm('Labor Quality'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'United States'
      })
    ],
    valueMetadata: {
      type: ValueType.INDEX,
      unit: 'pts',
      label: 'Labor Quality Index'
    },
    preNormalizedValue: 83
  }),
  new ContextualizedTerm({
    id: 'ct-labor-quality-china-2022-2023',
    term: getTerm('Labor Quality'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'China'
      })
    ],
    valueMetadata: {
      type: ValueType.INDEX,
      unit: 'pts',
      label: 'Labor Quality Index'
    },
    preNormalizedValue: 70
  }),
  new ContextualizedTerm({
    id: 'ct-labor-quality-germany-2022-2023',
    term: getTerm('Labor Quality'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'Germany'
      })
    ],
    valueMetadata: {
      type: ValueType.INDEX,
      unit: 'pts',
      label: 'Labor Quality Index'
    },
    preNormalizedValue: 87
  }),
  new ContextualizedTerm({
    id: 'ct-labor-quality-india-2022-2023',
    term: getTerm('Labor Quality'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'India'
      })
    ],
    valueMetadata: {
      type: ValueType.INDEX,
      unit: 'pts',
      label: 'Labor Quality Index'
    },
    preNormalizedValue: 63
  }),
  new ContextualizedTerm({
    id: 'ct-labor-quality-california-2022-2023',
    term: getTerm('Labor Quality'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'State',
        state: 'California',
        country: 'United States'
      })
    ],
    valueMetadata: {
      type: ValueType.INDEX,
      unit: 'pts',
      label: 'Labor Quality Index'
    },
    preNormalizedValue: 89
  })
];

// Contextualized terms for Competitiveness across different nations
export const COMPETITIVENESS_CONTEXTUALIZED_TERMS: ContextualizedTerm[] = [
  // 2023-2024 data
  new ContextualizedTerm({
    id: 'ct-competitiveness-us-2023-2024',
    term: getTerm('Competitiveness'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'United States'
      })
    ],
    valueMetadata: {
      type: ValueType.SCORE,
      unit: 'pts',
      label: 'Global Competitiveness Score'
    },
    preNormalizedValue: 82
  }),
  new ContextualizedTerm({
    id: 'ct-competitiveness-china-2023-2024',
    term: getTerm('Competitiveness'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'China'
      })
    ],
    valueMetadata: {
      type: ValueType.SCORE,
      unit: 'pts',
      label: 'Global Competitiveness Score'
    },
    preNormalizedValue: 78
  }),
  new ContextualizedTerm({
    id: 'ct-competitiveness-germany-2023-2024',
    term: getTerm('Competitiveness'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'Germany'
      })
    ],
    valueMetadata: {
      type: ValueType.SCORE,
      unit: 'pts',
      label: 'Global Competitiveness Score'
    },
    preNormalizedValue: 86
  }),
  new ContextualizedTerm({
    id: 'ct-competitiveness-india-2023-2024',
    term: getTerm('Competitiveness'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'India'
      })
    ],
    valueMetadata: {
      type: ValueType.SCORE,
      unit: 'pts',
      label: 'Global Competitiveness Score'
    },
    preNormalizedValue: 68
  }),
  new ContextualizedTerm({
    id: 'ct-competitiveness-california-2023-2024',
    term: getTerm('Competitiveness'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31')
      }),
      new LocationContext({
        label: 'State',
        state: 'California',
        country: 'United States'
      })
    ],
    valueMetadata: {
      type: ValueType.SCORE,
      unit: 'pts',
      label: 'State Competitiveness Score'
    },
    preNormalizedValue: 92
  }),

  // 2022-2023 data
  new ContextualizedTerm({
    id: 'ct-competitiveness-us-2022-2023',
    term: getTerm('Competitiveness'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'United States'
      })
    ],
    valueMetadata: {
      type: ValueType.SCORE,
      unit: 'pts',
      label: 'Global Competitiveness Score'
    },
    preNormalizedValue: 80
  }),
  new ContextualizedTerm({
    id: 'ct-competitiveness-china-2022-2023',
    term: getTerm('Competitiveness'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'China'
      })
    ],
    valueMetadata: {
      type: ValueType.SCORE,
      unit: 'pts',
      label: 'Global Competitiveness Score'
    },
    preNormalizedValue: 76
  }),
  new ContextualizedTerm({
    id: 'ct-competitiveness-germany-2022-2023',
    term: getTerm('Competitiveness'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'Germany'
      })
    ],
    valueMetadata: {
      type: ValueType.SCORE,
      unit: 'pts',
      label: 'Global Competitiveness Score'
    },
    preNormalizedValue: 85
  }),
  new ContextualizedTerm({
    id: 'ct-competitiveness-india-2022-2023',
    term: getTerm('Competitiveness'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'India'
      })
    ],
    valueMetadata: {
      type: ValueType.SCORE,
      unit: 'pts',
      label: 'Global Competitiveness Score'
    },
    preNormalizedValue: 66
  }),
  new ContextualizedTerm({
    id: 'ct-competitiveness-california-2022-2023',
    term: getTerm('Competitiveness'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'State',
        state: 'California',
        country: 'United States'
      })
    ],
    valueMetadata: {
      type: ValueType.SCORE,
      unit: 'pts',
      label: 'State Competitiveness Score'
    },
    preNormalizedValue: 91
  })
];

// Contextualized terms for Business Reliability (negative term) across different nations
export const BUSINESS_RELIABILITY_CONTEXTUALIZED_TERMS: ContextualizedTerm[] = [
  // 2023-2024 data
  new ContextualizedTerm({
    id: 'ct-business-reliability-us-2023-2024',
    term: getTerm('Business Reliability'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'United States'
      })
    ],
    valueMetadata: {
      type: ValueType.PERCENTAGE,
      label: 'Business Default Rate'
    },
    preNormalizedValue: 2.5
  }),
  new ContextualizedTerm({
    id: 'ct-business-reliability-china-2023-2024',
    term: getTerm('Business Reliability'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'China'
      })
    ],
    valueMetadata: {
      type: ValueType.PERCENTAGE,
      label: 'Business Default Rate'
    },
    preNormalizedValue: 4.2
  }),
  new ContextualizedTerm({
    id: 'ct-business-reliability-germany-2023-2024',
    term: getTerm('Business Reliability'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'Germany'
      })
    ],
    valueMetadata: {
      type: ValueType.PERCENTAGE,
      label: 'Business Default Rate'
    },
    preNormalizedValue: 1.8
  }),
  new ContextualizedTerm({
    id: 'ct-business-reliability-india-2023-2024',
    term: getTerm('Business Reliability'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'India'
      })
    ],
    valueMetadata: {
      type: ValueType.PERCENTAGE,
      label: 'Business Default Rate'
    },
    preNormalizedValue: 5.5
  }),
  new ContextualizedTerm({
    id: 'ct-business-reliability-california-2023-2024',
    term: getTerm('Business Reliability'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31')
      }),
      new LocationContext({
        label: 'State',
        state: 'California',
        country: 'United States'
      })
    ],
    valueMetadata: {
      type: ValueType.PERCENTAGE,
      label: 'Business Default Rate'
    },
    preNormalizedValue: 2.1
  }),

  // 2022-2023 data
  new ContextualizedTerm({
    id: 'ct-business-reliability-us-2022-2023',
    term: getTerm('Business Reliability'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'United States'
      })
    ],
    valueMetadata: {
      type: ValueType.PERCENTAGE,
      label: 'Business Default Rate'
    },
    preNormalizedValue: 2.8
  }),
  new ContextualizedTerm({
    id: 'ct-business-reliability-china-2022-2023',
    term: getTerm('Business Reliability'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'China'
      })
    ],
    valueMetadata: {
      type: ValueType.PERCENTAGE,
      label: 'Business Default Rate'
    },
    preNormalizedValue: 4.5
  }),
  new ContextualizedTerm({
    id: 'ct-business-reliability-germany-2022-2023',
    term: getTerm('Business Reliability'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'Germany'
      })
    ],
    valueMetadata: {
      type: ValueType.PERCENTAGE,
      label: 'Business Default Rate'
    },
    preNormalizedValue: 2.0
  }),
  new ContextualizedTerm({
    id: 'ct-business-reliability-india-2022-2023',
    term: getTerm('Business Reliability'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'Nation',
        country: 'India'
      })
    ],
    valueMetadata: {
      type: ValueType.PERCENTAGE,
      label: 'Business Default Rate'
    },
    preNormalizedValue: 6.0
  }),
  new ContextualizedTerm({
    id: 'ct-business-reliability-california-2022-2023',
    term: getTerm('Business Reliability'),
    contexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'State',
        state: 'California',
        country: 'United States'
      })
    ],
    valueMetadata: {
      type: ValueType.PERCENTAGE,
      label: 'Business Default Rate'
    },
    preNormalizedValue: 2.3
  })
];

// Import Labor Quality Score contextualized terms (from spreadsheet data)
import { LABOR_QUALITY_SCORE_CONTEXTUALIZED_TERMS } from './labor-quality-contextualized-terms.mock';

// All mock contextualized terms
export const MOCK_CONTEXTUALIZED_TERMS: ContextualizedTerm[] = [
  ...LABOR_QUALITY_CONTEXTUALIZED_TERMS,
  ...COMPETITIVENESS_CONTEXTUALIZED_TERMS,
  ...BUSINESS_RELIABILITY_CONTEXTUALIZED_TERMS,
  ...LABOR_QUALITY_SCORE_CONTEXTUALIZED_TERMS
];

// Helper function to find contextualized terms by term ID and contexts
export function findContextualizedTerm(
  termId: string,
  contexts: { type: string; value: string }[]
): ContextualizedTerm | undefined {
  return MOCK_CONTEXTUALIZED_TERMS.find(ct => {
    if (ct.term.id !== termId) return false;

    // Check if all required contexts match
    return contexts.every(reqContext => {
      return ct.contexts.some(ctxContext => {
        if (ctxContext.type !== reqContext.type) return false;

        // For location contexts, check the specific location value
        if (ctxContext.type === 'LOCATION') {
          const locContext = ctxContext as LocationContext;
          return locContext.country === reqContext.value ||
                 locContext.state === reqContext.value;
        }

        return true;
      });
    });
  });
}

// Helper function to get all contextualized terms for a specific term
export function getContextualizedTermsForTerm(termId: string): ContextualizedTerm[] {
  return MOCK_CONTEXTUALIZED_TERMS.filter(ct => ct.term.id === termId);
}
