/**
 * Labor Quality Score - Contextualized Terms
 *
 * This file contains the actual data from the "Scorecard Sample Score.ods" spreadsheet
 * for testing the Labor Quality Score methodology across 5 US states.
 *
 * The Labor Quality Score uses:
 * - 3 competitive (positive) terms: Union Participation, LFPR, Minimum Wage
 * - 1 anti-competitive (negative) term: Impoverished Workforce (inverted)
 *
 * Weights: Union (5), LFPR (2), Min Wage (8), Impoverished (6) = Total 21
 */

import {
  ContextualizedTerm,
  TimeframeContext,
  LocationContext,
  ValueType
} from '../../classes/terms/contextualized-term';
import { MOCK_TERMS } from './terms.mock';

// Helper to get term by ID
const getTerm = (id: string) => MOCK_TERMS.find(t => t.id === id)!;

// Normalization ranges based on the data across all 5 states
const UNION_PARTICIPATION_RANGE = { min: 0, max: 22.9 }; // Idaho is max at 22.9%
const LFPR_RANGE = { min: 54.5, max: 70.1 }; // Reasonable range
const MIN_WAGE_RANGE = { min: 7.25, max: 17.50 }; // Federal min to DC max
const IMPOVERISHED_RANGE = { min: 5.0, max: 15.0 }; // Inverted range

// Common timeframe for all data points
const TIMEFRAME_2022 = new TimeframeContext({
  label: 'Timeframe',
  startDate: new Date('2022-01-01'),
  endDate: new Date('2022-12-31')
});

// ===== ALABAMA =====
const ALABAMA_LOCATION = new LocationContext({
  label: 'State',
  state: 'Alabama',
  country: 'United States'
});

export const ALABAMA_UNION_PARTICIPATION = new ContextualizedTerm({
  id: 'ct-alabama-union-2022',
  term: getTerm('term-union-participation'),
  contexts: [TIMEFRAME_2022, ALABAMA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Union Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 6.9,
  postNormalizedValue: 0.22
});

export const ALABAMA_LFPR = new ContextualizedTerm({
  id: 'ct-alabama-lfpr-2022',
  term: getTerm('term-labor-force-participation'),
  contexts: [TIMEFRAME_2022, ALABAMA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Labor Force Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 57.2,
  postNormalizedValue: 0.12
});

export const ALABAMA_MIN_WAGE = new ContextualizedTerm({
  id: 'ct-alabama-minwage-2022',
  term: getTerm('term-minimum-wage'),
  contexts: [TIMEFRAME_2022, ALABAMA_LOCATION],
  valueMetadata: {
    type: ValueType.CURRENCY,
    unit: '$',
    label: 'Minimum Wage (per hour)',
    isPositive: true
  },
  preNormalizedValue: 7.25,
  postNormalizedValue: 0
});

export const ALABAMA_IMPOVERISHED = new ContextualizedTerm({
  id: 'ct-alabama-impoverished-2022',
  term: getTerm('term-impoverished-workforce'),
  contexts: [TIMEFRAME_2022, ALABAMA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Impoverished Workforce Rate',
    isPositive: false
  },
  preNormalizedValue: 7,
  postNormalizedValue: 0.377049180612201
});

// ===== CALIFORNIA =====
const CALIFORNIA_LOCATION = new LocationContext({
  label: 'State',
  state: 'California',
  country: 'United States'
});

export const CALIFORNIA_UNION_PARTICIPATION = new ContextualizedTerm({
  id: 'ct-california-union-2022',
  term: getTerm('term-union-participation'),
  contexts: [TIMEFRAME_2022, CALIFORNIA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Union Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 17.8,
  postNormalizedValue: 0.71
});

export const CALIFORNIA_LFPR = new ContextualizedTerm({
  id: 'ct-california-lfpr-2022',
  term: getTerm('term-labor-force-participation'),
  contexts: [TIMEFRAME_2022, CALIFORNIA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Labor Force Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 62,
  postNormalizedValue: 0.41
});

export const CALIFORNIA_MIN_WAGE = new ContextualizedTerm({
  id: 'ct-california-minwage-2022',
  term: getTerm('term-minimum-wage'),
  contexts: [TIMEFRAME_2022, CALIFORNIA_LOCATION],
  valueMetadata: {
    type: ValueType.CURRENCY,
    unit: '$',
    label: 'Minimum Wage (per hour)',
    isPositive: true
  },
  preNormalizedValue: 15.00,
  postNormalizedValue: 0.88
});

export const CALIFORNIA_IMPOVERISHED = new ContextualizedTerm({
  id: 'ct-california-impoverished-2022',
  term: getTerm('term-impoverished-workforce'),
  contexts: [TIMEFRAME_2022, CALIFORNIA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Impoverished Workforce Rate',
    isPositive: false
  },
  preNormalizedValue: 5.7,
  postNormalizedValue: 0.590163934871271
});

// ===== WASHINGTON DC =====
const DC_LOCATION = new LocationContext({
  label: 'State',
  state: 'Washington DC',
  country: 'United States'
});

export const DC_UNION_PARTICIPATION = new ContextualizedTerm({
  id: 'ct-dc-union-2022',
  term: getTerm('term-union-participation'),
  contexts: [TIMEFRAME_2022, DC_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Union Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 20,
  postNormalizedValue: 0.81
});

export const DC_LFPR = new ContextualizedTerm({
  id: 'ct-dc-lfpr-2022',
  term: getTerm('term-labor-force-participation'),
  contexts: [TIMEFRAME_2022, DC_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Labor Force Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 64.9,
  postNormalizedValue: 0.58
});

export const DC_MIN_WAGE = new ContextualizedTerm({
  id: 'ct-dc-minwage-2022',
  term: getTerm('term-minimum-wage'),
  contexts: [TIMEFRAME_2022, DC_LOCATION],
  valueMetadata: {
    type: ValueType.CURRENCY,
    unit: '$',
    label: 'Minimum Wage (per hour)',
    isPositive: true
  },
  preNormalizedValue: 16.10,
  postNormalizedValue: 1
});

export const DC_IMPOVERISHED = new ContextualizedTerm({
  id: 'ct-dc-impoverished-2022',
  term: getTerm('term-impoverished-workforce'),
  contexts: [TIMEFRAME_2022, DC_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Impoverished Workforce Rate',
    isPositive: false
  },
  preNormalizedValue: 4.6,
  postNormalizedValue: 0.770491803859715
});

// ===== IDAHO =====
const IDAHO_LOCATION = new LocationContext({
  label: 'State',
  state: 'Idaho',
  country: 'United States'
});

export const IDAHO_UNION_PARTICIPATION = new ContextualizedTerm({
  id: 'ct-idaho-union-2022',
  term: getTerm('term-union-participation'),
  contexts: [TIMEFRAME_2022, IDAHO_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Union Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 24.1,
  postNormalizedValue: 1
});

export const IDAHO_LFPR = new ContextualizedTerm({
  id: 'ct-idaho-lfpr-2022',
  term: getTerm('term-labor-force-participation'),
  contexts: [TIMEFRAME_2022, IDAHO_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Labor Force Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 60.3,
  postNormalizedValue: 0.3
});

export const IDAHO_MIN_WAGE = new ContextualizedTerm({
  id: 'ct-idaho-minwage-2022',
  term: getTerm('term-minimum-wage'),
  contexts: [TIMEFRAME_2022, IDAHO_LOCATION],
  valueMetadata: {
    type: ValueType.CURRENCY,
    unit: '$',
    label: 'Minimum Wage (per hour)',
    isPositive: true
  },
  preNormalizedValue: 7.25,
  postNormalizedValue: 0
});

export const IDAHO_IMPOVERISHED = new ContextualizedTerm({
  id: 'ct-idaho-impoverished-2022',
  term: getTerm('term-impoverished-workforce'),
  contexts: [TIMEFRAME_2022, IDAHO_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Impoverished Workforce Rate',
    isPositive: false
  },
  preNormalizedValue: 6.9,
  postNormalizedValue: 0.393442623247514
});

// ===== TEXAS =====
const TEXAS_LOCATION = new LocationContext({
  label: 'State',
  state: 'Texas',
  country: 'United States'
});

export const TEXAS_UNION_PARTICIPATION = new ContextualizedTerm({
  id: 'ct-texas-union-2022',
  term: getTerm('term-union-participation'),
  contexts: [TIMEFRAME_2022, TEXAS_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Union Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 5.9,
  postNormalizedValue: 0.18
});

export const TEXAS_LFPR = new ContextualizedTerm({
  id: 'ct-texas-lfpr-2022',
  term: getTerm('term-labor-force-participation'),
  contexts: [TIMEFRAME_2022, TEXAS_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Labor Force Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 61.2,
  postNormalizedValue: 0.36
});

export const TEXAS_MIN_WAGE = new ContextualizedTerm({
  id: 'ct-texas-minwage-2022',
  term: getTerm('term-minimum-wage'),
  contexts: [TIMEFRAME_2022, TEXAS_LOCATION],
  valueMetadata: {
    type: ValueType.CURRENCY,
    unit: '$',
    label: 'Minimum Wage (per hour)',
    isPositive: true
  },
  preNormalizedValue: 7.25,
  postNormalizedValue: 0
});

export const TEXAS_IMPOVERISHED = new ContextualizedTerm({
  id: 'ct-texas-impoverished-2022',
  term: getTerm('term-impoverished-workforce'),
  contexts: [TIMEFRAME_2022, TEXAS_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Impoverished Workforce Rate',
    isPositive: false
  },
  preNormalizedValue: 6.9,
  postNormalizedValue: 0.393442623247514
});

// ===== FLORIDA =====
const FLORIDA_LOCATION = new LocationContext({
  label: 'State',
  state: 'Florida',
  country: 'United States'
});

export const FLORIDA_UNION_PARTICIPATION = new ContextualizedTerm({
  id: 'ct-florida-union-2022',
  term: getTerm('term-union-participation'),
  contexts: [TIMEFRAME_2022, FLORIDA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Union Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 9.9,
  postNormalizedValue: 0.36
});

export const FLORIDA_LFPR = new ContextualizedTerm({
  id: 'ct-florida-lfpr-2022',
  term: getTerm('term-labor-force-participation'),
  contexts: [TIMEFRAME_2022, FLORIDA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Labor Force Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 71.8,
  postNormalizedValue: 1
});

export const FLORIDA_MIN_WAGE = new ContextualizedTerm({
  id: 'ct-florida-minwage-2022',
  term: getTerm('term-minimum-wage'),
  contexts: [TIMEFRAME_2022, FLORIDA_LOCATION],
  valueMetadata: {
    type: ValueType.CURRENCY,
    unit: '$',
    label: 'Minimum Wage (per hour)',
    isPositive: true
  },
  preNormalizedValue: 11.00,
  postNormalizedValue: 0.42
});

export const FLORIDA_IMPOVERISHED = new ContextualizedTerm({
  id: 'ct-florida-impoverished-2022',
  term: getTerm('term-impoverished-workforce'),
  contexts: [TIMEFRAME_2022, FLORIDA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Impoverished Workforce Rate',
    isPositive: false
  },
  preNormalizedValue: 6.2,
  postNormalizedValue: 0.508196721694706
});

// ===== ALASKA =====
const ALASKA_LOCATION = new LocationContext({
  label: 'State',
  state: 'Alaska',
  country: 'United States'
});

export const ALASKA_UNION_PARTICIPATION = new ContextualizedTerm({
  id: 'ct-alaska-union-2022',
  term: getTerm('term-union-participation'),
  contexts: [TIMEFRAME_2022, ALASKA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Union Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 17.2,
  postNormalizedValue: 0.69
});

export const ALASKA_LFPR = new ContextualizedTerm({
  id: 'ct-alaska-lfpr-2022',
  term: getTerm('term-labor-force-participation'),
  contexts: [TIMEFRAME_2022, ALASKA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Labor Force Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 66.3,
  postNormalizedValue: 0.67
});

export const ALASKA_MIN_WAGE = new ContextualizedTerm({
  id: 'ct-alaska-minwage-2022',
  term: getTerm('term-minimum-wage'),
  contexts: [TIMEFRAME_2022, ALASKA_LOCATION],
  valueMetadata: {
    type: ValueType.CURRENCY,
    unit: '$',
    label: 'Minimum Wage (per hour)',
    isPositive: true
  },
  preNormalizedValue: 10.34,
  postNormalizedValue: 0.35
});

export const ALASKA_IMPOVERISHED = new ContextualizedTerm({
  id: 'ct-alaska-impoverished-2022',
  term: getTerm('term-impoverished-workforce'),
  contexts: [TIMEFRAME_2022, ALASKA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Impoverished Workforce Rate',
    isPositive: false
  },
  preNormalizedValue: 9.3,
  postNormalizedValue: 0
});

// --- Continue populating data from here... ---

// ===== SOUTH DAKOTA =====
const SOUTH_DAKOTA_LOCATION = new LocationContext({
  label: 'State',
  state: 'South Dakota',
  country: 'United States'
});

export const SOUTH_DAKOTA_UNION_PARTICIPATION = new ContextualizedTerm({
  id: 'ct-south-dakota-union-2022',
  term: getTerm('term-union-participation'),
  contexts: [TIMEFRAME_2022, SOUTH_DAKOTA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Union Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 2,
  postNormalizedValue: 0
});

export const SOUTH_DAKOTA_LFPR = new ContextualizedTerm({
  id: 'ct-south-dakota-lfpr-2022',
  term: getTerm('term-labor-force-participation'),
  contexts: [TIMEFRAME_2022, SOUTH_DAKOTA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Labor Force Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 57.7,
  postNormalizedValue: 0.15
});

export const SOUTH_DAKOTA_MIN_WAGE = new ContextualizedTerm({
  id: 'ct-south-dakota-minwage-2022',
  term: getTerm('term-minimum-wage'),
  contexts: [TIMEFRAME_2022, SOUTH_DAKOTA_LOCATION],
  valueMetadata: {
    type: ValueType.CURRENCY,
    unit: '$',
    label: 'Minimum Wage (per hour)',
    isPositive: true
  },
  preNormalizedValue: 9.95,
  postNormalizedValue: 0.31
});

export const SOUTH_DAKOTA_IMPOVERISHED = new ContextualizedTerm({
  id: 'ct-south-dakota-impoverished-2022',
  term: getTerm('term-impoverished-workforce'),
  contexts: [TIMEFRAME_2022, SOUTH_DAKOTA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Impoverished Workforce Rate',
    isPositive: false
  },
  preNormalizedValue: 6.4,
  postNormalizedValue: 0.475409836424079
});

// ===== WEST VIRGINIA =====
const WEST_VIRGINIA_LOCATION = new LocationContext({
  label: 'State',
  state: 'West Virginia',
  country: 'United States'
});

export const WEST_VIRGINIA_UNION_PARTICIPATION = new ContextualizedTerm({
  id: 'ct-west-virginia-union-2022',
  term: getTerm('term-union-participation'),
  contexts: [TIMEFRAME_2022, WEST_VIRGINIA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Union Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 10.5,
  postNormalizedValue: 0.38
});

export const WEST_VIRGINIA_LFPR = new ContextualizedTerm({
  id: 'ct-west-virginia-lfpr-2022',
  term: getTerm('term-labor-force-participation'),
  contexts: [TIMEFRAME_2022, WEST_VIRGINIA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Labor Force Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 55.3,
  postNormalizedValue: 0
});

export const WEST_VIRGINIA_MIN_WAGE = new ContextualizedTerm({
  id: 'ct-west-virginia-minwage-2022',
  term: getTerm('term-minimum-wage'),
  contexts: [TIMEFRAME_2022, WEST_VIRGINIA_LOCATION],
  valueMetadata: {
    type: ValueType.CURRENCY,
    unit: '$',
    label: 'Minimum Wage (per hour)',
    isPositive: true
  },
  preNormalizedValue: 8.75,
  postNormalizedValue: 0.17
});

export const WEST_VIRGINIA_IMPOVERISHED = new ContextualizedTerm({
  id: 'ct-west-virginia-impoverished-2022',
  term: getTerm('term-impoverished-workforce'),
  contexts: [TIMEFRAME_2022, WEST_VIRGINIA_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Impoverished Workforce Rate',
    isPositive: false
  },
  preNormalizedValue: 7.5,
  postNormalizedValue: 0.295081967435636
});

// ===== OHIO =====
const OHIO_LOCATION = new LocationContext({
  label: 'State',
  state: 'Ohio',
  country: 'United States'
});

export const OHIO_UNION_PARTICIPATION = new ContextualizedTerm({
  id: 'ct-ohio-union-2022',
  term: getTerm('term-union-participation'),
  contexts: [TIMEFRAME_2022, OHIO_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Union Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 6.9,
  postNormalizedValue: 0.22
});

export const OHIO_LFPR = new ContextualizedTerm({
  id: 'ct-ohio-lfpr-2022',
  term: getTerm('term-labor-force-participation'),
  contexts: [TIMEFRAME_2022, OHIO_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Labor Force Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 69.2,
  postNormalizedValue: 0.84
});

export const OHIO_MIN_WAGE = new ContextualizedTerm({
  id: 'ct-ohio-minwage-2022',
  term: getTerm('term-minimum-wage'),
  contexts: [TIMEFRAME_2022, OHIO_LOCATION],
  valueMetadata: {
    type: ValueType.CURRENCY,
    unit: '$',
    label: 'Minimum Wage (per hour)',
    isPositive: true
  },
  preNormalizedValue: 9.30,
  postNormalizedValue: 0.23
});

export const OHIO_IMPOVERISHED = new ContextualizedTerm({
  id: 'ct-ohio-impoverished-2022',
  term: getTerm('term-impoverished-workforce'),
  contexts: [TIMEFRAME_2022, OHIO_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Impoverished Workforce Rate',
    isPositive: false
  },
  preNormalizedValue: 6.3,
  postNormalizedValue: 0.491803279059393
});

// ===== NEW JERSEY =====
const NEW_JERSEY_LOCATION = new LocationContext({
  label: 'State',
  state: 'New Jersey',
  country: 'United States'
});

export const NEW_JERSEY_UNION_PARTICIPATION = new ContextualizedTerm({
  id: 'ct-new-jersey-union-2022',
  term: getTerm('term-union-participation'),
  contexts: [TIMEFRAME_2022, NEW_JERSEY_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Union Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 11.3,
  postNormalizedValue: 0.42
});

export const NEW_JERSEY_LFPR = new ContextualizedTerm({
  id: 'ct-new-jersey-lfpr-2022',
  term: getTerm('term-labor-force-participation'),
  contexts: [TIMEFRAME_2022, NEW_JERSEY_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Labor Force Participation Rate',
    isPositive: true
  },
  preNormalizedValue: 65.1,
  postNormalizedValue: 0.59
});

export const NEW_JERSEY_MIN_WAGE = new ContextualizedTerm({
  id: 'ct-new-jersey-minwage-2022',
  term: getTerm('term-minimum-wage'),
  contexts: [TIMEFRAME_2022, NEW_JERSEY_LOCATION],
  valueMetadata: {
    type: ValueType.CURRENCY,
    unit: '$',
    label: 'Minimum Wage (per hour)',
    isPositive: true
  },
  preNormalizedValue: 13.00,
  postNormalizedValue: 0.65
});

export const NEW_JERSEY_IMPOVERISHED = new ContextualizedTerm({
  id: 'ct-new-jersey-impoverished-2022',
  term: getTerm('term-impoverished-workforce'),
  contexts: [TIMEFRAME_2022, NEW_JERSEY_LOCATION],
  valueMetadata: {
    type: ValueType.PERCENTAGE,
    label: 'Impoverished Workforce Rate',
    isPositive: false
  },
  preNormalizedValue: 4.1,
  postNormalizedValue: 0.852459017036281
});

// ===== COMBINED EXPORTS =====

export const LABOR_QUALITY_SCORE_CONTEXTUALIZED_TERMS: ContextualizedTerm[] = [
  // Alabama
  ALABAMA_UNION_PARTICIPATION,
  ALABAMA_LFPR,
  ALABAMA_MIN_WAGE,
  ALABAMA_IMPOVERISHED,

  // California
  CALIFORNIA_UNION_PARTICIPATION,
  CALIFORNIA_LFPR,
  CALIFORNIA_MIN_WAGE,
  CALIFORNIA_IMPOVERISHED,

  // Washington DC
  DC_UNION_PARTICIPATION,
  DC_LFPR,
  DC_MIN_WAGE,
  DC_IMPOVERISHED,

  // Idaho
  IDAHO_UNION_PARTICIPATION,
  IDAHO_LFPR,
  IDAHO_MIN_WAGE,
  IDAHO_IMPOVERISHED,

  // Texas
  TEXAS_UNION_PARTICIPATION,
  TEXAS_LFPR,
  TEXAS_MIN_WAGE,
  TEXAS_IMPOVERISHED,

  // Florida
  FLORIDA_UNION_PARTICIPATION,
  FLORIDA_LFPR,
  FLORIDA_MIN_WAGE,
  FLORIDA_IMPOVERISHED,

  // Alaska
  ALASKA_UNION_PARTICIPATION,
  ALASKA_LFPR,
  ALASKA_MIN_WAGE,
  ALASKA_IMPOVERISHED,

  // South Dakota
  SOUTH_DAKOTA_UNION_PARTICIPATION,
  SOUTH_DAKOTA_LFPR,
  SOUTH_DAKOTA_MIN_WAGE,
  SOUTH_DAKOTA_IMPOVERISHED,

  // West Virginia
  WEST_VIRGINIA_UNION_PARTICIPATION,
  WEST_VIRGINIA_LFPR,
  WEST_VIRGINIA_MIN_WAGE,
  WEST_VIRGINIA_IMPOVERISHED,

  // Ohio
  OHIO_UNION_PARTICIPATION,
  OHIO_LFPR,
  OHIO_MIN_WAGE,
  OHIO_IMPOVERISHED,

  // New Jersey
  NEW_JERSEY_UNION_PARTICIPATION,
  NEW_JERSEY_LFPR,
  NEW_JERSEY_MIN_WAGE,
  NEW_JERSEY_IMPOVERISHED
];

// Export data by state for easy access
export const LABOR_QUALITY_BY_STATE = {
  Alabama: [
    ALABAMA_UNION_PARTICIPATION,
    ALABAMA_LFPR,
    ALABAMA_MIN_WAGE,
    ALABAMA_IMPOVERISHED
  ],
  California: [
    CALIFORNIA_UNION_PARTICIPATION,
    CALIFORNIA_LFPR,
    CALIFORNIA_MIN_WAGE,
    CALIFORNIA_IMPOVERISHED
  ],
  'Washington DC': [
    DC_UNION_PARTICIPATION,
    DC_LFPR,
    DC_MIN_WAGE,
    DC_IMPOVERISHED
  ],
  Idaho: [
    IDAHO_UNION_PARTICIPATION,
    IDAHO_LFPR,
    IDAHO_MIN_WAGE,
    IDAHO_IMPOVERISHED
  ],
  Texas: [
    TEXAS_UNION_PARTICIPATION,
    TEXAS_LFPR,
    TEXAS_MIN_WAGE,
    TEXAS_IMPOVERISHED
  ],
  Florida: [
    FLORIDA_UNION_PARTICIPATION,
    FLORIDA_LFPR,
    FLORIDA_MIN_WAGE,
    FLORIDA_IMPOVERISHED
  ],
  Alaska: [
    ALASKA_UNION_PARTICIPATION,
    ALASKA_LFPR,
    ALASKA_MIN_WAGE,
    ALASKA_IMPOVERISHED
  ],
  'South Dakota': [
    SOUTH_DAKOTA_UNION_PARTICIPATION,
    SOUTH_DAKOTA_LFPR,
    SOUTH_DAKOTA_MIN_WAGE,
    SOUTH_DAKOTA_IMPOVERISHED
  ],
  'West Virginia': [
    WEST_VIRGINIA_UNION_PARTICIPATION,
    WEST_VIRGINIA_LFPR,
    WEST_VIRGINIA_MIN_WAGE,
    WEST_VIRGINIA_IMPOVERISHED
  ],
  Ohio: [
    OHIO_UNION_PARTICIPATION,
    OHIO_LFPR,
    OHIO_MIN_WAGE,
    OHIO_IMPOVERISHED
  ],
  'New Jersey': [
    NEW_JERSEY_UNION_PARTICIPATION,
    NEW_JERSEY_LFPR,
    NEW_JERSEY_MIN_WAGE,
    NEW_JERSEY_IMPOVERISHED
  ]
};
