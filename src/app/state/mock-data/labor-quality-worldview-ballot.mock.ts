/**
 * Labor Quality Score - Mock Worldview Ballot
 *
 * This file creates a complete worldview ballot based on the "Scorecard Sample Score.ods"
 * spreadsheet for testing the Labor Quality Score methodology.
 *
 * The ballot includes:
 * - 3 competitive (positive) terms with weights: Union Participation (5), LFPR (2), Min Wage (8)
 * - 1 anti-competitive (negative) term with weight: Impoverished Workforce (6)
 * - Total weight: 21
 */

import { WorldviewBallot } from './worldview-ballots.mock';
import { WeightedWorldviewTerm } from '../../classes/terms/weighted-worldview-term';
import { MOCK_TERMS } from './terms.mock';

// Helper to get term by ID
const getTerm = (id: string) => MOCK_TERMS.find(t => t.id === id)!;

// The ballot ID
const LABOR_QUALITY_BALLOT_ID = 'ballot-labor-quality';

/**
 * Labor Quality Score Worldview Ballot
 * Based on real-world data from the spreadsheet
 */
export const LABOR_QUALITY_SCORE_BALLOT: WorldviewBallot = {
  id: LABOR_QUALITY_BALLOT_ID,
  name: 'Labor Quality Score 2024',
  description: 'Evaluates labor quality across US states using union participation, labor force participation, minimum wage, and poverty rates. Based on real-world data from 5 sample states: Alabama, California, Washington DC, Idaho, and Texas.',
  status: 'active',
  responseCount: 5, // One for each state we're testing
  createdDate: new Date('2024-01-01')
};

/**
 * Weighted terms for the Labor Quality Score
 * Weights match the spreadsheet exactly
 */
export const LABOR_QUALITY_WEIGHTED_TERMS: WeightedWorldviewTerm[] = [
  // COMPETITIVE (POSITIVE) TERMS
  // These contribute positively when higher
  new WeightedWorldviewTerm({
    id: 'wt-labor-quality-union-participation',
    term: getTerm('term-union-participation'),
    weight: 5 / 21, // Weight 5, normalized to [0, 1] by dividing by total weight 21
    worldviewBallotId: LABOR_QUALITY_BALLOT_ID,
    isPositive: true
  }),

  new WeightedWorldviewTerm({
    id: 'wt-labor-quality-lfpr',
    term: getTerm('term-labor-force-participation'),
    weight: 2 / 21, // Weight 2, normalized to [0, 1]
    worldviewBallotId: LABOR_QUALITY_BALLOT_ID,
    isPositive: true
  }),

  new WeightedWorldviewTerm({
    id: 'wt-labor-quality-minimum-wage',
    term: getTerm('term-minimum-wage'),
    weight: 8 / 21, // Weight 8, normalized to [0, 1]
    worldviewBallotId: LABOR_QUALITY_BALLOT_ID,
    isPositive: true
  }),

  // ANTI-COMPETITIVE (NEGATIVE) TERM
  // This is inverted in the data, so it contributes positively when poverty is low
  new WeightedWorldviewTerm({
    id: 'wt-labor-quality-impoverished-workforce',
    term: getTerm('term-impoverished-workforce'),
    weight: 6 / 21, // Weight 6, normalized to [0, 1]
    worldviewBallotId: LABOR_QUALITY_BALLOT_ID,
    isPositive: false // This is an anti-competitive term
  })
];

/**
 * Raw weights from the spreadsheet (for reference and calculations)
 */
export const LABOR_QUALITY_RAW_WEIGHTS = {
  unionParticipation: 5,
  laborForceParticipationRate: 2,
  minimumWage: 8,
  impoverishedWorkforce: 6,
  total: 21
};

/**
 * Helper function to get weighted term by term ID
 */
export function getLaborQualityWeightedTerm(termId: string): WeightedWorldviewTerm | undefined {
  return LABOR_QUALITY_WEIGHTED_TERMS.find(wt => wt.term.id === termId);
}

/**
 * Helper function to get the raw weight for a term
 */
export function getLaborQualityRawWeight(termId: string): number {
  switch (termId) {
    case 'term-union-participation':
      return LABOR_QUALITY_RAW_WEIGHTS.unionParticipation;
    case 'term-labor-force-participation':
      return LABOR_QUALITY_RAW_WEIGHTS.laborForceParticipationRate;
    case 'term-minimum-wage':
      return LABOR_QUALITY_RAW_WEIGHTS.minimumWage;
    case 'term-impoverished-workforce':
      return LABOR_QUALITY_RAW_WEIGHTS.impoverishedWorkforce;
    default:
      return 0;
  }
}

/**
 * Summary of the Labor Quality Score methodology
 */
export const LABOR_QUALITY_SCORE_SUMMARY = {
  name: 'Labor Quality Score',
  description: 'A composite score measuring the quality of labor markets across US states',
  competitiveTerms: [
    { name: 'Union Participation', weight: 5, description: 'Higher union participation = better score' },
    { name: 'Labor Force Participation Rate', weight: 2, description: 'Higher LFPR = better score' },
    { name: 'Minimum Wage', weight: 8, description: 'Higher minimum wage = better score' }
  ],
  antiCompetitiveTerms: [
    { name: 'Impoverished Workforce', weight: 6, description: 'Lower poverty rate = better score (inverted)' }
  ],
  totalWeight: 21,
  formula: 'Initial Score = (Σ weighted terms) / Total Weight, then levelized by max score',
  states: ['Alabama', 'California', 'Washington DC', 'Idaho', 'Texas']
};
