/**
 * Labor Quality Score - Test & Verification Functions
 *
 * This file provides helper functions to calculate and verify the Labor Quality Score
 * against the spreadsheet data, ensuring the scoring methodology is correctly implemented.
 */

import { WorldviewScoringService, ContextScore } from '../../services/scoring/worldview-scoring.service';
import { LABOR_QUALITY_WEIGHTED_TERMS, LABOR_QUALITY_RAW_WEIGHTS } from './labor-quality-worldview-ballot.mock';
import { LABOR_QUALITY_BY_STATE } from './labor-quality-contextualized-terms.mock';
import { TimeframeContext, LocationContext, TermContext } from '../../classes/terms/contextualized-term';

// State names
export type StateName = 'Alabama' | 'California' | 'Washington DC' | 'Idaho' | 'Texas';

/**
 * Detailed breakdown of a state's score calculation
 */
export interface StateScoreBreakdown {
  state: StateName;

  // Raw values from spreadsheet
  rawValues: {
    unionParticipation: number;
    laborForceParticipationRate: number;
    minimumWage: number;
    impoverishedWorkforce: number;
  };

  // Normalized values [0, 1]
  normalizedValues: {
    unionParticipation: number;
    laborForceParticipationRate: number;
    minimumWage: number;
    impoverishedWorkforce: number; // Already inverted
  };

  // Weighted values
  weightedValues: {
    unionParticipation: number;
    laborForceParticipationRate: number;
    minimumWage: number;
    impoverishedWorkforce: number;
  };

  // Score calculations
  positiveContribution: number;
  negativeContribution: number;
  weightedSum: number;
  initialScore: number; // Weighted sum / total weights
  levelizedScore?: number; // Initial score / max initial score (if provided)
  scoreOutOf100?: number; // Levelized score * 100

  // Context used
  contexts: TermContext[];
}

/**
 * Calculate detailed score breakdown for a specific state
 */
export function calculateStateScoreBreakdown(
  stateName: StateName,
  scoringService: WorldviewScoringService
): StateScoreBreakdown {
  // Get the contextualized terms for this state
  const stateTerms = LABOR_QUALITY_BY_STATE[stateName];

  if (!stateTerms || stateTerms.length !== 4) {
    throw new Error(`Invalid state data for ${stateName}`);
  }

  // Extract raw values
  const rawValues = {
    unionParticipation: stateTerms[0].preNormalizedValue,
    laborForceParticipationRate: stateTerms[1].preNormalizedValue,
    minimumWage: stateTerms[2].preNormalizedValue,
    impoverishedWorkforce: stateTerms[3].preNormalizedValue
  };

  // Extract normalized values
  const normalizedValues = {
    unionParticipation: stateTerms[0].postNormalizedValue,
    laborForceParticipationRate: stateTerms[1].postNormalizedValue,
    minimumWage: stateTerms[2].postNormalizedValue,
    impoverishedWorkforce: stateTerms[3].postNormalizedValue // Already inverted
  };

  // Calculate weighted values
  const weightedValues = {
    unionParticipation: normalizedValues.unionParticipation * LABOR_QUALITY_RAW_WEIGHTS.unionParticipation,
    laborForceParticipationRate: normalizedValues.laborForceParticipationRate * LABOR_QUALITY_RAW_WEIGHTS.laborForceParticipationRate,
    minimumWage: normalizedValues.minimumWage * LABOR_QUALITY_RAW_WEIGHTS.minimumWage,
    impoverishedWorkforce: normalizedValues.impoverishedWorkforce * LABOR_QUALITY_RAW_WEIGHTS.impoverishedWorkforce
  };

  // Calculate contributions
  const positiveContribution =
    weightedValues.unionParticipation +
    weightedValues.laborForceParticipationRate +
    weightedValues.minimumWage;

  const negativeContribution = weightedValues.impoverishedWorkforce;

  const weightedSum = positiveContribution + negativeContribution;
  const initialScore = weightedSum / LABOR_QUALITY_RAW_WEIGHTS.total;

  // Build contexts for this state
  const contexts: TermContext[] = [
    new TimeframeContext({
      label: '2024',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    }),
    new LocationContext({
      label: 'State',
      state: stateName,
      country: 'United States'
    })
  ];

  return {
    state: stateName,
    rawValues,
    normalizedValues,
    weightedValues,
    positiveContribution,
    negativeContribution,
    weightedSum,
    initialScore,
    contexts
  };
}

/**
 * Calculate scores for all states and add levelization
 */
export function calculateAllStateScores(
  scoringService: WorldviewScoringService
): StateScoreBreakdown[] {
  const states: StateName[] = ['Alabama', 'California', 'Washington DC', 'Idaho', 'Texas'];

  // Calculate initial scores for all states
  const breakdowns = states.map(state => calculateStateScoreBreakdown(state, scoringService));

  // Find maximum initial score for levelization
  const maxInitialScore = Math.max(...breakdowns.map(b => b.initialScore));

  // Add levelized scores
  return breakdowns.map(breakdown => ({
    ...breakdown,
    levelizedScore: breakdown.initialScore / maxInitialScore,
    scoreOutOf100: (breakdown.initialScore / maxInitialScore) * 100
  }));
}

/**
 * Verify that the scoring service calculates the same scores as manual calculation
 */
export function verifyScoresMatchService(
  stateName: StateName,
  scoringService: WorldviewScoringService
): {
  matches: boolean;
  manual: StateScoreBreakdown;
  service: ContextScore;
  differences?: {
    initialScore?: number;
    weightedSum?: number;
    positiveContribution?: number;
    negativeContribution?: number;
  };
} {
  // Calculate manually
  const manualBreakdown = calculateStateScoreBreakdown(stateName, scoringService);

  // Calculate using service
  const serviceScore = scoringService.calculateContextScore(
    LABOR_QUALITY_WEIGHTED_TERMS,
    manualBreakdown.contexts
  );

  // Compare results (allowing for small floating point differences)
  const epsilon = 0.0001;
  const differences: any = {};

  let matches = true;

  if (Math.abs(serviceScore.initialScore - manualBreakdown.initialScore) > epsilon) {
    matches = false;
    differences.initialScore = Math.abs(serviceScore.initialScore - manualBreakdown.initialScore);
  }

  if (Math.abs(serviceScore.weightedSum - manualBreakdown.weightedSum) > epsilon) {
    matches = false;
    differences.weightedSum = Math.abs(serviceScore.weightedSum - manualBreakdown.weightedSum);
  }

  if (Math.abs(serviceScore.positiveContribution - manualBreakdown.positiveContribution) > epsilon) {
    matches = false;
    differences.positiveContribution = Math.abs(serviceScore.positiveContribution - manualBreakdown.positiveContribution);
  }

  if (Math.abs(serviceScore.negativeContribution - manualBreakdown.negativeContribution) > epsilon) {
    matches = false;
    differences.negativeContribution = Math.abs(serviceScore.negativeContribution - manualBreakdown.negativeContribution);
  }

  return {
    matches,
    manual: manualBreakdown,
    service: serviceScore,
    differences: Object.keys(differences).length > 0 ? differences : undefined
  };
}

/**
 * Print a formatted comparison table of all states
 */
export function printScoreComparisonTable(
  scoringService: WorldviewScoringService
): void {
  const allScores = calculateAllStateScores(scoringService);

  console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║        LABOR QUALITY SCORE - STATE COMPARISON TABLE                   ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

  console.log('Total Weight:', LABOR_QUALITY_RAW_WEIGHTS.total);
  console.log('Max Initial Score:', Math.max(...allScores.map(s => s.initialScore)).toFixed(4), '\n');

  console.log('┌─────────────────┬──────────┬──────────┬────────────┐');
  console.log('│ State           │ Initial  │ Levelized│ Score/100  │');
  console.log('├─────────────────┼──────────┼──────────┼────────────┤');

  // Sort by final score descending
  const sorted = [...allScores].sort((a, b) => (b.scoreOutOf100 || 0) - (a.scoreOutOf100 || 0));

  sorted.forEach((score, index) => {
    const rank = index + 1;
    const state = score.state.padEnd(15);
    const initial = score.initialScore.toFixed(4);
    const levelized = (score.levelizedScore || 0).toFixed(4);
    const final = (score.scoreOutOf100 || 0).toFixed(2);

    console.log(`│ ${rank}. ${state}│ ${initial}   │ ${levelized}   │ ${final}      │`);
  });

  console.log('└─────────────────┴──────────┴──────────┴────────────┘\n');
}

/**
 * Print detailed breakdown for a specific state
 */
export function printStateDetailedBreakdown(
  stateName: StateName,
  scoringService: WorldviewScoringService
): void {
  const breakdown = calculateStateScoreBreakdown(stateName, scoringService);

  console.log(`\n╔═══════════════════════════════════════════════════════════════════════╗`);
  console.log(`║  LABOR QUALITY SCORE - DETAILED BREAKDOWN: ${stateName.toUpperCase().padEnd(26)}║`);
  console.log(`╚═══════════════════════════════════════════════════════════════════════╝\n`);

  console.log('RAW VALUES:');
  console.log(`  Union Participation:       ${breakdown.rawValues.unionParticipation}%`);
  console.log(`  Labor Force Participation: ${breakdown.rawValues.laborForceParticipationRate}%`);
  console.log(`  Minimum Wage:              $${breakdown.rawValues.minimumWage}/hr`);
  console.log(`  Impoverished Workforce:    ${breakdown.rawValues.impoverishedWorkforce}%\n`);

  console.log('NORMALIZED VALUES [0, 1]:');
  console.log(`  Union Participation:       ${breakdown.normalizedValues.unionParticipation.toFixed(4)}`);
  console.log(`  LFPR:                      ${breakdown.normalizedValues.laborForceParticipationRate.toFixed(4)}`);
  console.log(`  Min Wage:                  ${breakdown.normalizedValues.minimumWage.toFixed(4)}`);
  console.log(`  Impoverished (inverted):   ${breakdown.normalizedValues.impoverishedWorkforce.toFixed(4)}\n`);

  console.log('WEIGHTED VALUES (normalized × weight):');
  console.log(`  Union (×${LABOR_QUALITY_RAW_WEIGHTS.unionParticipation}):                  ${breakdown.weightedValues.unionParticipation.toFixed(4)}`);
  console.log(`  LFPR (×${LABOR_QUALITY_RAW_WEIGHTS.laborForceParticipationRate}):                   ${breakdown.weightedValues.laborForceParticipationRate.toFixed(4)}`);
  console.log(`  Min Wage (×${LABOR_QUALITY_RAW_WEIGHTS.minimumWage}):               ${breakdown.weightedValues.minimumWage.toFixed(4)}`);
  console.log(`  Impoverished (×${LABOR_QUALITY_RAW_WEIGHTS.impoverishedWorkforce}):            ${breakdown.weightedValues.impoverishedWorkforce.toFixed(4)}\n`);

  console.log('CONTRIBUTIONS:');
  console.log(`  Positive:                  ${breakdown.positiveContribution.toFixed(4)}`);
  console.log(`  Negative:                  ${breakdown.negativeContribution.toFixed(4)}`);
  console.log(`  Weighted Sum:              ${breakdown.weightedSum.toFixed(4)}\n`);

  console.log('FINAL SCORES:');
  console.log(`  Initial:                   ${breakdown.initialScore.toFixed(4)} (weighted sum / ${LABOR_QUALITY_RAW_WEIGHTS.total})`);
  if (breakdown.levelizedScore !== undefined) {
    console.log(`  Levelized:                 ${breakdown.levelizedScore.toFixed(4)}`);
  }
  if (breakdown.scoreOutOf100 !== undefined) {
    console.log(`  Score out of 100:          ${breakdown.scoreOutOf100.toFixed(2)}`);
  }
  console.log('');
}

/**
 * Run complete verification test
 */
export function runCompleteVerification(
  scoringService: WorldviewScoringService
): {
  allMatch: boolean;
  results: ReturnType<typeof verifyScoresMatchService>[];
} {
  const states: StateName[] = ['Alabama', 'California', 'Washington DC', 'Idaho', 'Texas'];

  console.log('\n╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║           LABOR QUALITY SCORE - VERIFICATION TEST                     ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

  const results = states.map(state => {
    const verification = verifyScoresMatchService(state, scoringService);

    console.log(`${state}:`);
    console.log(`  Manual Initial Score:  ${verification.manual.initialScore.toFixed(4)}`);
    console.log(`  Service Initial Score: ${verification.service.initialScore.toFixed(4)}`);
    console.log(`  Match: ${verification.matches ? '✓ YES' : '✗ NO'}`);

    if (!verification.matches && verification.differences) {
      console.log(`  Differences:`);
      Object.entries(verification.differences).forEach(([key, value]) => {
        console.log(`    ${key}: ${value}`);
      });
    }
    console.log('');

    return verification;
  });

  const allMatch = results.every(r => r.matches);

  console.log('═══════════════════════════════════════════════════════════════════════');
  console.log(`Overall Result: ${allMatch ? '✓ ALL TESTS PASSED' : '✗ SOME TESTS FAILED'}`);
  console.log('═══════════════════════════════════════════════════════════════════════\n');

  return { allMatch, results };
}
