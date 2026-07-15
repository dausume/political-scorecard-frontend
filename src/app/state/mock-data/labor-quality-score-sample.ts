/**
 * Labor Quality Score Sample Data
 *
 * This file demonstrates the scorecard methodology based on the
 * "Scorecard Sample Score.ods" spreadsheet.
 *
 * Scoring Formula:
 * 1. Competitive terms (positive): Higher normalized values = better scores
 * 2. Anti-competitive terms (negative): Values are "already converted" (inverted)
 *    so that lower anti-competitive factors = higher scores
 * 3. Weighted sum = Σ(weight_i * normalizedValue_i) for ALL terms
 * 4. Initial score = Weighted sum / Total weights
 * 5. Levelized score = Initial score / Maximum initial score
 * 6. Final score = Levelized score * 100
 */

import {
  ContextualizedTerm,
  TimeframeContext,
  LocationContext,
  ValueType
} from '../../classes/terms/contextualized-term';

// Define the four terms used in the Labor Quality Score
export interface LaborQualityTerm {
  id: string;
  name: string;
  description: string;
  source: string;
  isCompetitive: boolean; // true for competitive (positive), false for anti-competitive (negative)
}

export const LABOR_QUALITY_TERMS: LaborQualityTerm[] = [
  {
    id: 'term-union-participation',
    name: 'Union Participation',
    description: 'Percentage of workforce in labor unions',
    source: 'Bureau of Labor Statistics',
    isCompetitive: true
  },
  {
    id: 'term-labor-force-participation',
    name: 'Labor Force Participation Rate',
    description: 'Percentage of working-age population actively in labor force',
    source: 'Bureau of Labor Statistics',
    isCompetitive: true
  },
  {
    id: 'term-minimum-wage',
    name: 'Minimum Wage',
    description: 'State minimum wage compared to federal minimum',
    source: 'Department of Labor',
    isCompetitive: true
  },
  {
    id: 'term-impoverished-workforce',
    name: 'Impoverished Workforce',
    description: 'Percentage of workers below poverty line (inverted in scoring)',
    source: 'Census Bureau',
    isCompetitive: false // Anti-competitive term
  }
];

// Sample state data matching the spreadsheet
// Values are the PRE-NORMALIZED raw data
export interface StateLaborData {
  state: string;
  unionParticipation: number; // Percentage
  laborForceParticipationRate: number; // Percentage
  minimumWage: number; // Dollars per hour
  impoverishedWorkforce: number; // Percentage (will be inverted)
}

export const STATE_LABOR_DATA: StateLaborData[] = [
  {
    state: 'Alabama',
    unionParticipation: 5.1, // Low union participation
    laborForceParticipationRate: 57.6,
    minimumWage: 7.25, // Federal minimum
    impoverishedWorkforce: 13.5 // High poverty - will be inverted
  },
  {
    state: 'California',
    unionParticipation: 16.4, // Higher union participation
    laborForceParticipationRate: 62.7,
    minimumWage: 16.00, // Well above federal minimum
    impoverishedWorkforce: 8.9 // Lower poverty - will be inverted
  },
  {
    state: 'Washington DC',
    unionParticipation: 18.7, // Highest union participation
    laborForceParticipationRate: 68.2,
    minimumWage: 17.50, // Highest minimum wage
    impoverishedWorkforce: 5.7 // Lowest poverty - will be inverted
  },
  {
    state: 'Idaho',
    unionParticipation: 22.9, // Actually the highest
    laborForceParticipationRate: 64.8,
    minimumWage: 7.25, // Federal minimum
    impoverishedWorkforce: 10.2
  },
  {
    state: 'Texas',
    unionParticipation: 4.0, // Very low
    laborForceParticipationRate: 63.2,
    minimumWage: 7.25,
    impoverishedWorkforce: 12.8
  }
];

// Normalization ranges (from the spreadsheet analysis)
const UNION_PARTICIPATION_RANGE = { min: 0, max: 22.9 }; // Idaho is max
const LFPR_RANGE = { min: 54.5, max: 70.1 };
const MIN_WAGE_RANGE = { min: 7.25, max: 17.50 };
const IMPOVERISHED_RANGE = { min: 5.0, max: 15.0 }; // Will be inverted

// User-defined weights (from spreadsheet Column headers)
export const LABOR_QUALITY_WEIGHTS = {
  unionParticipation: 5, // Ta weight
  laborForceParticipationRate: 2, // Tb weight
  minimumWage: 8, // Tc weight
  impoverishedWorkforce: 6 // Td weight (anti-competitive)
};

// Total weight
export const TOTAL_WEIGHT =
  LABOR_QUALITY_WEIGHTS.unionParticipation +
  LABOR_QUALITY_WEIGHTS.laborForceParticipationRate +
  LABOR_QUALITY_WEIGHTS.minimumWage +
  LABOR_QUALITY_WEIGHTS.impoverishedWorkforce;
// = 5 + 2 + 8 + 6 = 21

/**
 * Calculate the normalized score for a state
 * This matches the spreadsheet calculation exactly
 */
export function calculateStateLaborScore(stateData: StateLaborData): {
  state: string;
  // Normalized values [0, 1]
  unionNormalized: number;
  lfprNormalized: number;
  minWageNormalized: number;
  impoverishedNormalized: number; // Already inverted
  // Weighted values
  unionWeighted: number;
  lfprWeighted: number;
  minWageWeighted: number;
  impoverishedWeighted: number;
  // Contributions
  positiveContribution: number;
  negativeContribution: number;
  // Scores
  weightedSum: number;
  initialScore: number;
} {
  // Normalize union participation [0, 1]
  const unionNormalized = (stateData.unionParticipation - UNION_PARTICIPATION_RANGE.min) /
    (UNION_PARTICIPATION_RANGE.max - UNION_PARTICIPATION_RANGE.min);

  // Normalize LFPR [0, 1]
  const lfprNormalized = (stateData.laborForceParticipationRate - LFPR_RANGE.min) /
    (LFPR_RANGE.max - LFPR_RANGE.min);

  // Normalize minimum wage [0, 1]
  const minWageNormalized = (stateData.minimumWage - MIN_WAGE_RANGE.min) /
    (MIN_WAGE_RANGE.max - MIN_WAGE_RANGE.min);

  // Normalize impoverished workforce - INVERTED so low poverty = high score
  // Original: 13.5% poverty → 0.567 (bad)
  // Inverted: 13.5% poverty → 1 - 0.567 = 0.433 (contributes less to score)
  // OR better yet: use the inverted formula directly
  const impoverishedNormalized = 1 - ((stateData.impoverishedWorkforce - IMPOVERISHED_RANGE.min) /
    (IMPOVERISHED_RANGE.max - IMPOVERISHED_RANGE.min));

  // Calculate weighted values
  const unionWeighted = unionNormalized * LABOR_QUALITY_WEIGHTS.unionParticipation;
  const lfprWeighted = lfprNormalized * LABOR_QUALITY_WEIGHTS.laborForceParticipationRate;
  const minWageWeighted = minWageNormalized * LABOR_QUALITY_WEIGHTS.minimumWage;
  const impoverishedWeighted = impoverishedNormalized * LABOR_QUALITY_WEIGHTS.impoverishedWorkforce;

  // Contributions
  const positiveContribution = unionWeighted + lfprWeighted + minWageWeighted;
  const negativeContribution = impoverishedWeighted; // Despite the name, this adds to the score

  // Weighted sum (sum of all weighted terms)
  const weightedSum = positiveContribution + negativeContribution;

  // Initial score (weighted sum / total weights)
  const initialScore = weightedSum / TOTAL_WEIGHT;

  return {
    state: stateData.state,
    unionNormalized,
    lfprNormalized,
    minWageNormalized,
    impoverishedNormalized,
    unionWeighted,
    lfprWeighted,
    minWageWeighted,
    impoverishedWeighted,
    positiveContribution,
    negativeContribution,
    weightedSum,
    initialScore
  };
}

/**
 * Calculate levelized scores for all states
 */
export function calculateAllStateScores() {
  // Calculate initial scores for all states
  const stateScores = STATE_LABOR_DATA.map(calculateStateLaborScore);

  // Find maximum initial score
  const maxInitialScore = Math.max(...stateScores.map(s => s.initialScore));

  // Calculate levelized scores
  const levelizedScores = stateScores.map(score => ({
    ...score,
    levelizedScore: score.initialScore / maxInitialScore,
    scoreOutOf10: (score.initialScore / maxInitialScore) * 10,
    scoreOutOf100: (score.initialScore / maxInitialScore) * 100
  }));

  return {
    scores: levelizedScores,
    maxInitialScore,
    totalWeight: TOTAL_WEIGHT
  };
}

/**
 * Print a sample score table (for testing)
 */
export function printSampleScoreTable() {
  const result = calculateAllStateScores();

  console.log('\n=== LABOR QUALITY SCORE SAMPLE ===');
  console.log(`Total Weight: ${result.totalWeight}`);
  console.log(`Max Initial Score: ${result.maxInitialScore.toFixed(4)}\n`);

  console.log('State\t\t\tInitial\t\tLevelized\tScore/100');
  console.log('-'.repeat(70));

  result.scores
    .sort((a, b) => b.scoreOutOf100 - a.scoreOutOf100) // Sort by final score descending
    .forEach(score => {
      console.log(
        `${score.state.padEnd(20)}\t` +
        `${score.initialScore.toFixed(4)}\t` +
        `${score.levelizedScore.toFixed(4)}\t\t` +
        `${score.scoreOutOf100.toFixed(2)}`
      );
    });

  console.log('\n=== DETAILED BREAKDOWN (Top Scorer) ===');
  const topScorer = result.scores[0];
  console.log(`State: ${topScorer.state}`);
  console.log(`\nNormalized Values:`);
  console.log(`  Union Participation: ${topScorer.unionNormalized.toFixed(4)}`);
  console.log(`  LFPR: ${topScorer.lfprNormalized.toFixed(4)}`);
  console.log(`  Min Wage: ${topScorer.minWageNormalized.toFixed(4)}`);
  console.log(`  Impoverished (inverted): ${topScorer.impoverishedNormalized.toFixed(4)}`);
  console.log(`\nWeighted Values:`);
  console.log(`  Union (×5): ${topScorer.unionWeighted.toFixed(4)}`);
  console.log(`  LFPR (×2): ${topScorer.lfprWeighted.toFixed(4)}`);
  console.log(`  Min Wage (×8): ${topScorer.minWageWeighted.toFixed(4)}`);
  console.log(`  Impoverished (×6): ${topScorer.impoverishedWeighted.toFixed(4)}`);
  console.log(`\nContributions:`);
  console.log(`  Positive: ${topScorer.positiveContribution.toFixed(4)}`);
  console.log(`  Negative: ${topScorer.negativeContribution.toFixed(4)}`);
  console.log(`  Weighted Sum: ${topScorer.weightedSum.toFixed(4)}`);
  console.log(`\nFinal Scores:`);
  console.log(`  Initial: ${topScorer.initialScore.toFixed(4)}`);
  console.log(`  Levelized: ${topScorer.levelizedScore.toFixed(4)}`);
  console.log(`  Out of 100: ${topScorer.scoreOutOf100.toFixed(2)}`);
}

// Export for use in tests or demos
export const SAMPLE_SCORE_RESULTS = calculateAllStateScores();
