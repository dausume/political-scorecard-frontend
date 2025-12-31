/**
 * LABOR QUALITY SCORE - DEMONSTRATION
 *
 * This file demonstrates how to use the Labor Quality Score mock data
 * for testing and validation against your spreadsheet.
 *
 * To run this demo:
 * 1. Import this file in your component or test
 * 2. Call the demonstration functions
 * 3. Compare results with your spreadsheet
 */

import { WorldviewScoringService } from '../../services/scoring/worldview-scoring.service';
import {
  printScoreComparisonTable,
  printStateDetailedBreakdown,
  runCompleteVerification,
  calculateAllStateScores
} from './labor-quality-score-test';
import {
  LABOR_QUALITY_SCORE_BALLOT,
  LABOR_QUALITY_WEIGHTED_TERMS,
  LABOR_QUALITY_RAW_WEIGHTS,
  LABOR_QUALITY_SCORE_SUMMARY
} from './labor-quality-worldview-ballot.mock';
import {
  LABOR_QUALITY_SCORE_CONTEXTUALIZED_TERMS,
  LABOR_QUALITY_BY_STATE
} from './labor-quality-contextualized-terms.mock';

/**
 * Quick Demo - Run this to see the complete Labor Quality Score analysis
 */
export function runLaborQualityScoreDemo() {
  console.log('\n\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║                                                                       ║');
  console.log('║              LABOR QUALITY SCORE - COMPLETE DEMONSTRATION             ║');
  console.log('║                                                                       ║');
  console.log('║  Based on real data from "Scorecard Sample Score.ods"                ║');
  console.log('║                                                                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝');

  // Create scoring service instance
  const scoringService = new WorldviewScoringService();

  // 1. Show ballot summary
  console.log('\n\n═══ 1. BALLOT SUMMARY ═══\n');
  console.log(`Name: ${LABOR_QUALITY_SCORE_BALLOT.name}`);
  console.log(`Description: ${LABOR_QUALITY_SCORE_BALLOT.description}`);
  console.log(`Status: ${LABOR_QUALITY_SCORE_BALLOT.status}`);
  console.log(`States Analyzed: ${LABOR_QUALITY_SCORE_SUMMARY.states.join(', ')}`);
  console.log(`\nTotal Weight: ${LABOR_QUALITY_RAW_WEIGHTS.total}`);
  console.log(`\nCompetitive Terms (Positive):`);
  LABOR_QUALITY_SCORE_SUMMARY.competitiveTerms.forEach(t => {
    console.log(`  - ${t.name} (weight: ${t.weight}): ${t.description}`);
  });
  console.log(`\nAnti-Competitive Terms (Negative - Inverted):`);
  LABOR_QUALITY_SCORE_SUMMARY.antiCompetitiveTerms.forEach(t => {
    console.log(`  - ${t.name} (weight: ${t.weight}): ${t.description}`);
  });

  // 2. Show all state scores in a comparison table
  console.log('\n\n═══ 2. STATE COMPARISON TABLE ═══');
  printScoreComparisonTable(scoringService);

  // 3. Show detailed breakdown for top and bottom states
  const allScores = calculateAllStateScores(scoringService);
  const sortedScores = [...allScores].sort((a, b) => (b.scoreOutOf100 || 0) - (a.scoreOutOf100 || 0));
  const topState = sortedScores[0].state;
  const bottomState = sortedScores[sortedScores.length - 1].state;

  console.log('\n═══ 3. DETAILED BREAKDOWNS ═══');
  printStateDetailedBreakdown(topState, scoringService);
  printStateDetailedBreakdown(bottomState, scoringService);

  // 4. Run verification against service
  console.log('\n═══ 4. SERVICE VERIFICATION ═══');
  const verification = runCompleteVerification(scoringService);

  // 5. Summary
  console.log('\n\n╔═══════════════════════════════════════════════════════════════════════╗');
  console.log('║                          DEMO COMPLETE                                ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════╝\n');

  console.log('What you can do next:');
  console.log('  1. Compare these scores with your spreadsheet to verify accuracy');
  console.log('  2. Use LABOR_QUALITY_WEIGHTED_TERMS in your worldview ballot component');
  console.log('  3. Use LABOR_QUALITY_BY_STATE to access contextualized data by state');
  console.log('  4. Call calculateStateScoreBreakdown() for detailed analysis');
  console.log('  5. Call verifyScoresMatchService() to test the scoring service\n');

  return {
    ballot: LABOR_QUALITY_SCORE_BALLOT,
    weightedTerms: LABOR_QUALITY_WEIGHTED_TERMS,
    allScores: allScores,
    verification: verification,
    topState: topState,
    bottomState: bottomState
  };
}

/**
 * Test a specific state's score calculation
 */
export function testStateScore(stateName: 'Alabama' | 'California' | 'Washington DC' | 'Idaho' | 'Texas') {
  const scoringService = new WorldviewScoringService();
  console.log(`\n\nTesting ${stateName}...\n`);
  printStateDetailedBreakdown(stateName, scoringService);
}

/**
 * Get the raw data for a state (useful for debugging)
 */
export function getStateRawData(stateName: 'Alabama' | 'California' | 'Washington DC' | 'Idaho' | 'Texas') {
  const stateData = LABOR_QUALITY_BY_STATE[stateName];
  return {
    state: stateName,
    terms: stateData.map(ct => ({
      termName: ct.term.name,
      rawValue: ct.preNormalizedValue,
      normalizedValue: ct.postNormalizedValue,
      valueType: ct.valueMetadata.type,
      unit: ct.valueMetadata.unit,
      formattedValue: ct.getFormattedPreNormalizedValue()
    }))
  };
}

/**
 * Example: How to use the scoring service with Labor Quality data
 */
export function exampleUsage() {
  const scoringService = new WorldviewScoringService();

  // Example 1: Calculate California's score
  const californiaContexts = [
    {
      type: 'TIMEFRAME',
      label: '2024',
      getValue: () => '01/01/2024 - 12/31/2024'
    } as any,
    {
      type: 'LOCATION',
      label: 'State',
      getValue: () => 'California',
      state: 'California',
      country: 'United States'
    } as any
  ];

  const californiaScore = scoringService.calculateContextScore(
    LABOR_QUALITY_WEIGHTED_TERMS,
    californiaContexts
  );

  console.log('\nExample: California Score');
  console.log('Initial Score:', californiaScore.initialScore.toFixed(4));
  console.log('Weighted Sum:', californiaScore.weightedSum.toFixed(4));
  console.log('Positive Contribution:', californiaScore.positiveContribution.toFixed(4));
  console.log('Negative Contribution:', californiaScore.negativeContribution.toFixed(4));
  console.log('Total Weight:', californiaScore.totalWeight);
  console.log('Terms Evaluated:', californiaScore.termsEvaluated);

  return californiaScore;
}

// Export key items for easy access
export const LaborQualityDemo = {
  runDemo: runLaborQualityScoreDemo,
  testState: testStateScore,
  getRawData: getStateRawData,
  example: exampleUsage
};

// Usage examples in comments:
/*

// Run the complete demo
import { runLaborQualityScoreDemo } from './path/to/LABOR_QUALITY_DEMO';
runLaborQualityScoreDemo();

// Test a specific state
import { testStateScore } from './path/to/LABOR_QUALITY_DEMO';
testStateScore('Washington DC');

// Get raw data for debugging
import { getStateRawData } from './path/to/LABOR_QUALITY_DEMO';
const data = getStateRawData('Alabama');
console.log(data);

// Use in your component
import { LaborQualityDemo } from './path/to/LABOR_QUALITY_DEMO';
const results = LaborQualityDemo.runDemo();

*/
