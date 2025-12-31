import { Injectable } from '@angular/core';
import { WeightedWorldviewTerm } from '../../classes/terms/weighted-worldview-term';
import { ContextualizedTerm, TermContext } from '../../classes/terms/contextualized-term';
import { MOCK_CONTEXTUALIZED_TERMS } from '../../state/mock-data/contextualized-terms.mock';

export interface ContextScore {
  totalScore: number; // Final levelized score [0, 1] - normalized by maximum score
  initialScore: number; // Weighted sum / total weights [0, 1]
  positiveContribution: number; // Sum of competitive (positive) weighted terms
  negativeContribution: number; // Sum of anti-competitive (negative) weighted terms
  weightedSum: number; // Total of positive + negative contributions
  totalWeight: number; // Sum of all term weights
  termsEvaluated: number; // Number of terms with contextualized data
  termsMissing: number; // Number of terms without contextualized data
}

export interface Term {
  id: string;
  name: string;
  description: string;
  source: string;
}

/**
 * Service for calculating worldview ballot scores based on weighted terms
 * and their contextualized values.
 *
 * Scoring Formula (based on spreadsheet methodology):
 * 1. All terms have normalized values [0, 1] where higher = better
 * 2. Anti-competitive terms are "already converted" (inverted) so low values become high scores
 * 3. Weighted sum = Σ(weight_i * normalizedValue_i) for ALL terms (positive + anti-competitive)
 * 4. Initial score = Weighted sum / Total weights [0, 1]
 * 5. Levelized score = Initial score / Maximum initial score (for normalization across entities)
 * 6. Final score = Levelized score * 100
 *
 * Note: Anti-competitive terms are pre-inverted in the data, so they contribute
 * positively when the anti-competitive factor is low.
 */
@Injectable({
  providedIn: 'root'
})
export class WorldviewScoringService {
  // Default weight for new weighted terms (50%)
  private readonly DEFAULT_WEIGHT = 0.5;

  constructor() { }

  /**
   * Calculate the score for a given set of weighted terms in a specific context
   * @param weightedTerms - Array of weighted terms (both positive and negative)
   * @param contexts - The contexts to evaluate (timeframe, location, etc.)
   * @param maxScore - Optional maximum initial score for levelization (defaults to 1.0 if not provided)
   * @returns ContextScore with detailed scoring breakdown
   */
  calculateContextScore(
    weightedTerms: WeightedWorldviewTerm[],
    contexts: TermContext[],
    maxScore?: number
  ): ContextScore {

    console.log('Calculating context score with terms:', weightedTerms);

    let positiveContribution = 0;
    let negativeContribution = 0;
    let termsEvaluated = 0;
    let termsMissing = 0;

    // Separate positive (competitive) and negative (anti-competitive) terms
    const positiveTerms = weightedTerms.filter(wt => wt.isPositive);
    const negativeTerms = weightedTerms.filter(wt => !wt.isPositive);

    // Calculate positive (competitive) contribution
    // These are terms where higher values are better (e.g., union participation, min wage)
    positiveTerms.forEach(weightedTerm => {
      const contextualizedTerm = this.findContextualizedTerm(weightedTerm.term.id, contexts, weightedTerm.isPositive);
      console.log("Found contextualized term for", weightedTerm.term.name, ":", contextualizedTerm);
      if (contextualizedTerm) {
        console.log(`Term ${weightedTerm.term.name} found with value:`, contextualizedTerm.postNormalizedValue, 'and weight:', weightedTerm.weight);
        positiveContribution += weightedTerm.weight * contextualizedTerm.postNormalizedValue;
        termsEvaluated++;
      } else {
        termsMissing++;
      }
    });

    console.log('Positive contribution:', positiveContribution);

    // Calculate negative (anti-competitive) contribution
    // These are terms that are "already competitive converted" (inverted)
    // So they also contribute positively when the anti-competitive factor is low
    // Example: "Impoverished Workforce" is inverted so low poverty = high score
    negativeTerms.forEach(weightedTerm => {
      const contextualizedTerm = this.findContextualizedTerm(weightedTerm.term.id, contexts, weightedTerm.isPositive);
      if (contextualizedTerm) {
        console.log(`Term ${weightedTerm.term.name} found with value:`, contextualizedTerm.postNormalizedValue, 'and weight:', weightedTerm.weight);
        negativeContribution += weightedTerm.weight * contextualizedTerm.postNormalizedValue;
        termsEvaluated++;
      } else {
        termsMissing++;
      }
    });

    console.log('Negative contribution:', negativeContribution);

    // Get the count of positive and negative terms for re-normalization.
    const totalTermCount = positiveTerms.length;

    // Total score is the sum of positive and negative contributions divided by total weights
    const weightedSum = positiveContribution + negativeContribution;
    const initialScore = weightedSum / totalTermCount;

    // Track total weight for reference
    const totalWeight = totalTermCount;

    // Levelize the score based on maximum initial score (if provided)
    const levelizedScore = maxScore && maxScore > 0 ? initialScore / maxScore : initialScore;


    return {
      totalScore: Math.max(0, Math.min(1, levelizedScore)), // Clamp to [0, 1]
      initialScore: Math.max(0, Math.min(1, initialScore)), // Clamp to [0, 1]
      positiveContribution,
      negativeContribution,
      weightedSum,
      totalWeight,
      termsEvaluated,
      termsMissing
    };
  }

  /**
   * Find a contextualized term matching the given term ID and contexts
   * When multiple matches are found, selects the one with highest specificity
   */
  private findContextualizedTerm(
    termId: string,
    contexts: TermContext[],
    isPositive: boolean
  ): ContextualizedTerm | undefined {
    console.log('=== findContextualizedTerm ===');
    console.log('Searching for term ID:', termId);
    console.log('isPositive:', isPositive);
    console.log('Required contexts:', contexts.map(c => `${c.type}: ${c.label}`));

    // Find ALL matching contextualized terms
    const matches = MOCK_CONTEXTUALIZED_TERMS.filter(ct => {
      console.log('\nChecking contextualized term:', ct.id);
      console.log('  Term ID:', ct.term.id, '(match:', ct.term.id === termId, ')');

      if (ct.term.id !== termId) {
        console.log('  ❌ Term ID mismatch, skipping');
        return false;
      }

      console.log('  Contexts in this CT:', ct.contexts.map(c => `${c.type}: ${c.label}`));

      // Initialize dictionary with all CT context types set to false
      // This tracks which CT contexts have found a match in the selected contexts
      let contextsMatchedDictionary: { [key: string]: boolean } = {};
      ct.contexts.forEach(ctContext => {
        contextsMatchedDictionary[ctContext.type] = false;
      });

      console.log('  Initialized contextsMatchedDictionary:', contextsMatchedDictionary);

      // For each CT context, try to find a matching selected context
      ct.contexts.forEach(ctContext => {
        console.log(`  Checking CT context: ${ctContext.type} - ${ctContext.label}`);

        const hasMatchingSelectedContext = contexts.some(selectedContext => {
          console.log(`    Comparing with selected context: ${selectedContext.type} - ${selectedContext.label}`);

          if (ctContext.type !== selectedContext.type) {
            console.log('    ❌ Type mismatch');
            return false;
          }

          // For location contexts, check specific location values
          if (ctContext.type === 'LOCATION' && selectedContext.type === 'LOCATION') {
            const ctLoc = ctContext as any;
            const selectedLoc = selectedContext as any;

            console.log('    Location comparison:');
            console.log('      Selected Location Context:', { city: selectedLoc.city, state: selectedLoc.state, country: selectedLoc.country, region: selectedLoc.region });
            console.log('      ContextualizedTerm:', { city: ctLoc.city, state: ctLoc.state, country: ctLoc.country, region: ctLoc.region });

            // Match based on most specific level provided in selected context
            // Priority: city > state > country > region
            if (selectedLoc.city) {
              // If city is specified, must match exactly on city
              if (ctLoc.city === selectedLoc.city) {
                console.log('    ✅ City match');
                return true;
              }
              console.log('    ❌ City specified but no match');
              return false;
            }

            if (selectedLoc.state) {
              // If state is specified, must match exactly on state
              if (ctLoc.state === selectedLoc.state) {
                console.log('    ✅ State match');
                return true;
              }
              console.log('    ❌ State specified but no match');
              return false;
            }

            if (selectedLoc.country) {
              // If only country is specified, match on country
              // But only if the CT doesn't have a more specific state/city
              if (ctLoc.country === selectedLoc.country && !ctLoc.state && !ctLoc.city) {
                console.log('    ✅ Country match (CT has no state/city)');
                return true;
              }
              console.log('    ❌ Country match rejected (CT is more specific or different country)');
              return false;
            }

            if (selectedLoc.region) {
              // If only region is specified, match on region
              if (ctLoc.region === selectedLoc.region && !ctLoc.country && !ctLoc.state && !ctLoc.city) {
                console.log('    ✅ Region match');
                return true;
              }
              console.log('    ❌ Region match rejected');
              return false;
            }

            console.log('    ❌ No location match');
            return false;
          }

          // For timeframe contexts, check if date ranges match
          if (ctContext.type === 'TIMEFRAME' && selectedContext.type === 'TIMEFRAME') {
            const ctTimeframe = ctContext as any;
            const selectedTimeframe = selectedContext as any;

            console.log('    Timeframe comparison:');
            console.log('      Selected:', selectedTimeframe.startDate, '-', selectedTimeframe.endDate);
            console.log('      CT:', ctTimeframe.startDate, '-', ctTimeframe.endDate);

            // Check if the date ranges match exactly
            const matches = ctTimeframe.startDate.getTime() === selectedTimeframe.startDate.getTime() &&
                   ctTimeframe.endDate.getTime() === selectedTimeframe.endDate.getTime();
            console.log('    ' + (matches ? '✅' : '❌') + ' Timeframe match:', matches);
            return matches;
          }

          // For other contexts, check if labels match
          const labelMatch = ctContext.label === selectedContext.label;
          console.log('    ' + (labelMatch ? '✅' : '❌') + ' Label match:', labelMatch);
          return labelMatch;
        });

        if (hasMatchingSelectedContext) {
          console.log(`  ✅ CT context "${ctContext.label}" found match in selected contexts`);
          contextsMatchedDictionary[ctContext.type] = true;
        } else {
          console.log(`  ❌ CT context "${ctContext.label}" has no match in selected contexts`);
        }
      });

      console.log('  Final contextsMatchedDictionary:', contextsMatchedDictionary);

      // We iterate through the dictionary to ensure ALL context types were matched (value is true)
      // The every method returns true only if all context type keys iterate and return true as their value.
      const allContextsMatch = Object.values(contextsMatchedDictionary).every(matched => matched);

      console.log('  All contexts match:', allContextsMatch);
      if (allContextsMatch) {
        console.log('  ✅ FOUND MATCH:', ct.id);
      }

      return allContextsMatch;
    });

    // Handle no matches
    if (matches.length === 0) {
      console.log('\n❌ No matching contextualized terms found');
      console.log('=== End findContextualizedTerm ===\n');
      return undefined;
    }

    // Handle single match
    if (matches.length === 1) {
      const result = matches[0];
      console.log('\n✅ Found single match:', result.id);
      console.log('   Pre-normalized value:', result.preNormalizedValue);
      console.log('   Post-normalized value:', result.postNormalizedValue);
      console.log('=== End findContextualizedTerm ===\n');
      return result;
    }

    // Handle multiple matches - select by highest specificity
    console.log(`\n⚠️ Found ${matches.length} matching contextualized terms`);
    console.log('Calculating specificity scores to select most specific match...');

    const matchesWithSpecificity = matches.map(ct => {
      const specificity = this.calculateContextSpecificity(ct);
      console.log(`  ${ct.id}: specificity score = ${specificity}`);
      return { ct, specificity };
    });

    // Sort by specificity (highest first)
    matchesWithSpecificity.sort((a, b) => b.specificity - a.specificity);

    const selected = matchesWithSpecificity[0].ct;
    console.log('\n✅ Selected most specific match:', selected.id);
    console.log('   Specificity score:', matchesWithSpecificity[0].specificity);
    console.log('   Pre-normalized value:', selected.preNormalizedValue);
    console.log('   Post-normalized value:', selected.postNormalizedValue);
    console.log('=== End findContextualizedTerm ===\n');

    return selected;
  }

  /**
   * Calculate specificity score for a contextualized term
   * Higher scores indicate more specific contexts
   * Hierarchy: City > State > Country > Region
   */
  private calculateContextSpecificity(ct: ContextualizedTerm): number {
    let score = 0;

    ct.contexts.forEach(context => {
      if (context.type === 'LOCATION') {
        const loc = context as any;
        // More specific location components get higher scores
        if (loc.city) score += 8;      // City is most specific
        if (loc.state) score += 4;     // State is more specific than country
        if (loc.country) score += 2;   // Country is less specific
        if (loc.region) score += 1;    // Region is least specific
      } else if (context.type === 'TIMEFRAME') {
        const timeframe = context as any;
        // Shorter time ranges are more specific
        const durationMs = timeframe.endDate.getTime() - timeframe.startDate.getTime();
        const durationDays = durationMs / (1000 * 60 * 60 * 24);

        if (durationDays <= 31) score += 8;      // Month or less
        else if (durationDays <= 92) score += 6; // Quarter
        else if (durationDays <= 365) score += 4; // Year
        else score += 2;                          // Multi-year
      } else if (context.type === 'DEMOGRAPHIC') {
        score += 3; // Demographic contexts are fairly specific
      } else if (context.type === 'ECONOMIC') {
        score += 3; // Economic contexts are fairly specific
      } else {
        score += 1; // Other contexts get base score
      }
    });

    return score;
  }

  /**
   * Format score as percentage
   */
  formatScoreAsPercentage(score: number): string {
    return `${Math.round(score * 100)}%`;
  }

  /**
   * Get a qualitative description of the score
   */
  getScoreDescription(score: number): string {
    if (score >= 0.8) return 'Excellent';
    if (score >= 0.6) return 'Good';
    if (score >= 0.4) return 'Fair';
    if (score >= 0.2) return 'Poor';
    return 'Very Poor';
  }

  /**
   * Calculate detailed score breakdown with term-by-term contributions
   * This is useful for debugging and displaying detailed scoring information
   */
  calculateDetailedScoreBreakdown(
    weightedTerms: WeightedWorldviewTerm[],
    contexts: TermContext[]
  ): {
    contextScore: ContextScore;
    termBreakdowns: Array<{
      termId: string;
      termName: string;
      isPositive: boolean;
      weight: number;
      rawWeight?: number;
      normalizedValue?: number;
      weightedValue: number;
      found: boolean;
    }>;
  } {
    const termBreakdowns: Array<{
      termId: string;
      termName: string;
      isPositive: boolean;
      weight: number;
      rawWeight?: number;
      normalizedValue?: number;
      weightedValue: number;
      found: boolean;
    }> = [];

    weightedTerms.forEach(weightedTerm => {
      const contextualizedTerm = this.findContextualizedTerm(weightedTerm.term.id, contexts, weightedTerm.isPositive);

      if (contextualizedTerm) {
        const normalizedValue = contextualizedTerm.postNormalizedValue;
        const weightedValue = weightedTerm.weight * normalizedValue;

        termBreakdowns.push({
          termId: weightedTerm.term.id,
          termName: weightedTerm.term.name,
          isPositive: weightedTerm.isPositive,
          weight: weightedTerm.weight,
          normalizedValue: normalizedValue,
          weightedValue: weightedValue,
          found: true
        });
      } else {
        termBreakdowns.push({
          termId: weightedTerm.term.id,
          termName: weightedTerm.term.name,
          isPositive: weightedTerm.isPositive,
          weight: weightedTerm.weight,
          weightedValue: 0,
          found: false
        });
      }
    });

    const contextScore = this.calculateContextScore(weightedTerms, contexts);

    return {
      contextScore,
      termBreakdowns
    };
  }

  /**
   * Calculate scores for multiple contexts (e.g., multiple states) and return with levelization
   * This is useful for comparative analysis
   */
  calculateMultiContextScores(
    weightedTerms: WeightedWorldviewTerm[],
    contextsArray: Array<{ label: string; contexts: TermContext[] }>
  ): Array<{
    label: string;
    contexts: TermContext[];
    initialScore: number;
    levelizedScore: number;
    scoreOutOf100: number;
    contextScore: ContextScore;
  }> {
    // Calculate initial scores for all contexts
    const results = contextsArray.map(({ label, contexts }) => {
      const contextScore = this.calculateContextScore(weightedTerms, contexts);
      return {
        label,
        contexts,
        initialScore: contextScore.initialScore,
        contextScore
      };
    });

    // Find maximum initial score for levelization
    const maxInitialScore = Math.max(...results.map(r => r.initialScore));

    // Add levelized scores
    return results.map(result => ({
      ...result,
      levelizedScore: maxInitialScore > 0 ? result.initialScore / maxInitialScore : 0,
      scoreOutOf100: maxInitialScore > 0 ? (result.initialScore / maxInitialScore) * 100 : 0
    }));
  }

  /**
   * Get the contextualized term for a specific term ID and contexts
   * (Exposed version of private method for external use)
   */
  getContextualizedTerm(
    termId: string,
    contexts: TermContext[],
    isPositive: boolean
  ): ContextualizedTerm | undefined {
    return this.findContextualizedTerm(termId, contexts, isPositive);
  }

  /**
   * Create a new weighted term for a ballot
   * @param term - The term to weight
   * @param ballotId - The ballot ID this term belongs to
   * @param isPositive - Whether this is a positive or negative term
   * @param weight - Optional custom weight (defaults to 0.5)
   * @returns A new WeightedWorldviewTerm
   */
  createWeightedTerm(
    term: Term,
    ballotId: string,
    isPositive: boolean,
    weight?: number
  ): WeightedWorldviewTerm {
    return new WeightedWorldviewTerm({
      id: `wt-${term.id}-${Date.now()}`,
      term: term,
      weight: weight ?? this.DEFAULT_WEIGHT,
      worldviewBallotId: ballotId,
      isPositive: isPositive
    });
  }

  /**
   * Add a weighted term to an existing array
   * @param weightedTerms - The current array of weighted terms
   * @param term - The term to add
   * @param ballotId - The ballot ID
   * @param isPositive - Whether this is a positive or negative term
   * @returns A new array with the added weighted term
   */
  addWeightedTerm(
    weightedTerms: WeightedWorldviewTerm[],
    term: Term,
    ballotId: string,
    isPositive: boolean
  ): WeightedWorldviewTerm[] {
    const weightedTerm = this.createWeightedTerm(term, ballotId, isPositive);
    return [...weightedTerms, weightedTerm];
  }

  /**
   * Remove a weighted term from the array
   * @param weightedTerms - The current array of weighted terms
   * @param termId - The ID of the term to remove
   * @param isPositive - Whether to remove from positive or negative terms
   * @returns A new array without the specified term
   */
  removeWeightedTerm(
    weightedTerms: WeightedWorldviewTerm[],
    termId: string,
    isPositive: boolean
  ): WeightedWorldviewTerm[] {
    return weightedTerms.filter(wt => wt.term.id !== termId || wt.isPositive !== isPositive);
  }

  /**
   * Update the weight of a specific weighted term
   * @param weightedTerms - The current array of weighted terms
   * @param termId - The ID of the term to update
   * @param isPositive - Whether this is a positive or negative term
   * @param weightPercentage - The new weight as a percentage (0-100)
   * @returns A new array with the updated weight
   */
  updateWeightedTermWeight(
    weightedTerms: WeightedWorldviewTerm[],
    termId: string,
    isPositive: boolean,
    weightPercentage: number
  ): WeightedWorldviewTerm[] {
    const weightedTerm = weightedTerms.find(wt => wt.term.id === termId && wt.isPositive === isPositive);
    if (weightedTerm) {
      weightedTerm.setWeightFromPercentage(weightPercentage);
      // Return new array to trigger change detection
      return [...weightedTerms];
    }
    return weightedTerms;
  }
}
