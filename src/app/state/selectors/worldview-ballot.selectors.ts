import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WorldviewBallotState } from '../reducers/worldview-ballot.reducer';
import { MOCK_CONTEXTUALIZED_TERMS } from '../mock-data/contextualized-terms.mock';
import { ContextualizedTerm, TermContext, TermContextType } from '../../classes/terms/contextualized-term';

export const selectWorldviewBallotState = createFeatureSelector<WorldviewBallotState>('worldviewBallot');

export const selectAllBallots = createSelector(
  selectWorldviewBallotState,
  (state: WorldviewBallotState) => state.ballots
);

export const selectSelectedBallot = createSelector(
  selectWorldviewBallotState,
  (state: WorldviewBallotState) => state.selectedBallot
);

export const selectPersonalContexts = createSelector(
  selectWorldviewBallotState,
  (state: WorldviewBallotState) => state.personalContexts
);

export const selectWeightedTerms = createSelector(
  selectWorldviewBallotState,
  (state: WorldviewBallotState) => state.weightedTerms
);

export const selectPositiveWeightedTerms = createSelector(
  selectWeightedTerms,
  (weightedTerms) => weightedTerms.filter(wt => wt.isPositive)
);

export const selectNegativeWeightedTerms = createSelector(
  selectWeightedTerms,
  (weightedTerms) => weightedTerms.filter(wt => !wt.isPositive)
);

export const selectPositiveTerms = createSelector(
  selectPositiveWeightedTerms,
  (weightedTerms) => weightedTerms.map(wt => wt.term)
);

export const selectNegativeTerms = createSelector(
  selectNegativeWeightedTerms,
  (weightedTerms) => weightedTerms.map(wt => wt.term)
);

export const selectCategorizedTermIds = createSelector(
  selectWeightedTerms,
  (weightedTerms) => weightedTerms.map(wt => wt.term.id)
);

export const selectWorldviewBallotStatus = createSelector(
  selectWorldviewBallotState,
  (state: WorldviewBallotState) => state.status
);

export const selectWorldviewBallotError = createSelector(
  selectWorldviewBallotState,
  (state: WorldviewBallotState) => state.error
);

export const selectWorldviewBallotLoading = createSelector(
  selectWorldviewBallotStatus,
  (status) => status === 'loading'
);

export const selectDrafts = createSelector(
  selectWorldviewBallotState,
  (state: WorldviewBallotState) => state.drafts
);

export const selectDraftByBallotId = (ballotId: string) => createSelector(
  selectDrafts,
  (drafts) => drafts.get(ballotId)
);

export const selectHasDraft = (ballotId: string) => createSelector(
  selectDrafts,
  (drafts) => drafts.has(ballotId)
);

/**
 * Helper function to find contextualized term matching given contexts
 * This matches the logic from WorldviewScoringService
 */
function findContextualizedTermForTermId(
  termId: string,
  contexts: TermContext[],
  isPositive: boolean
): ContextualizedTerm | undefined {
  console.log('[SELECTOR] Finding contextualized term for:', termId, 'isPositive:', isPositive);
  console.log('[SELECTOR] Selected contexts:', contexts.map(c => `${c.type}: ${(c as any).state || (c as any).country || c.label}`));

  const matches = MOCK_CONTEXTUALIZED_TERMS.filter(ct => {
    if (ct.term.id !== termId) return false;

    // Check if the term has the correct positive/negative context
    if (ct.valueMetadata.isPositive !== undefined && ct.valueMetadata.isPositive !== isPositive) {
      console.log('[SELECTOR] Skipping', ct.id, '- wrong isPositive:', ct.valueMetadata.isPositive, 'vs', isPositive);
      return false;
    }

    // Check if all selected contexts match the contextualized term's contexts
    let contextsMatchedDictionary: { [key: string]: boolean } = {};
    ct.contexts.forEach(ctContext => {
      contextsMatchedDictionary[ctContext.type] = false;
    });

    ct.contexts.forEach(ctContext => {
      const hasMatchingSelectedContext = contexts.some(selectedContext => {
        if (ctContext.type !== selectedContext.type) return false;

        // For location contexts, check specific location values
        if (ctContext.type === TermContextType.LOCATION && selectedContext.type === TermContextType.LOCATION) {
          const ctLoc = ctContext as any;
          const selectedLoc = selectedContext as any;

          // Match based on most specific level provided in selected context
          if (selectedLoc.city) {
            return ctLoc.city === selectedLoc.city;
          }
          if (selectedLoc.state) {
            return ctLoc.state === selectedLoc.state;
          }
          if (selectedLoc.country) {
            return ctLoc.country === selectedLoc.country && !ctLoc.state && !ctLoc.city;
          }
          if (selectedLoc.region) {
            return ctLoc.region === selectedLoc.region && !ctLoc.country && !ctLoc.state && !ctLoc.city;
          }
          return false;
        }

        // For timeframe contexts, check if date ranges match
        if (ctContext.type === TermContextType.TIMEFRAME && selectedContext.type === TermContextType.TIMEFRAME) {
          const ctTimeframe = ctContext as any;
          const selectedTimeframe = selectedContext as any;
          return ctTimeframe.startDate.getTime() === selectedTimeframe.startDate.getTime() &&
                 ctTimeframe.endDate.getTime() === selectedTimeframe.endDate.getTime();
        }

        // For other contexts, check if labels match
        return ctContext.label === selectedContext.label;
      });

      if (hasMatchingSelectedContext) {
        contextsMatchedDictionary[ctContext.type] = true;
      }
    });

    const allMatch = Object.values(contextsMatchedDictionary).every(matched => matched);
    if (allMatch) {
      console.log('[SELECTOR] ✅ MATCH:', ct.id, (ct.contexts.find(c => c.type === 'LOCATION') as any)?.state);
    }
    return allMatch;
  });

  console.log('[SELECTOR] Found', matches.length, 'matches');

  if (matches.length === 0) {
    console.log('[SELECTOR] ❌ No matches found');
    return undefined;
  }
  if (matches.length === 1) {
    console.log('[SELECTOR] ✅ Single match:', matches[0].id);
    return matches[0];
  }

  // Handle multiple matches - select by highest specificity
  const matchesWithSpecificity = matches.map(ct => {
    let score = 0;
    ct.contexts.forEach(context => {
      if (context.type === TermContextType.LOCATION) {
        const loc = context as any;
        if (loc.city) score += 8;
        if (loc.state) score += 4;
        if (loc.country) score += 2;
        if (loc.region) score += 1;
      } else if (context.type === TermContextType.TIMEFRAME) {
        const timeframe = context as any;
        const durationMs = timeframe.endDate.getTime() - timeframe.startDate.getTime();
        const durationDays = durationMs / (1000 * 60 * 60 * 24);
        if (durationDays <= 31) score += 8;
        else if (durationDays <= 92) score += 6;
        else if (durationDays <= 365) score += 4;
        else score += 2;
      } else {
        score += 1;
      }
    });
    return { ct, specificity: score };
  });

  matchesWithSpecificity.sort((a, b) => b.specificity - a.specificity);
  console.log('[SELECTOR] Multiple matches, selected by specificity:', matchesWithSpecificity[0].ct.id, 'score:', matchesWithSpecificity[0].specificity);
  return matchesWithSpecificity[0].ct;
}

/**
 * Selector to get contextualized terms for all weighted terms based on current contexts
 * Returns a map of termId -> ContextualizedTerm
 */
export const selectContextualizedTermsMap = createSelector(
  selectWeightedTerms,
  selectPersonalContexts,
  (weightedTerms, contexts) => {
    const map = new Map<string, ContextualizedTerm | undefined>();

    weightedTerms.forEach(wt => {
      const contextualizedTerm = findContextualizedTermForTermId(
        wt.term.id,
        contexts,
        wt.isPositive
      );
      map.set(wt.term.id, contextualizedTerm);
    });

    return map;
  }
);

/**
 * Selector to get contextualized terms for positive weighted terms
 */
export const selectPositiveContextualizedTermsMap = createSelector(
  selectPositiveWeightedTerms,
  selectPersonalContexts,
  (weightedTerms, contexts) => {
    const map = new Map<string, ContextualizedTerm | undefined>();

    weightedTerms.forEach(wt => {
      const contextualizedTerm = findContextualizedTermForTermId(
        wt.term.id,
        contexts,
        true
      );
      map.set(wt.term.id, contextualizedTerm);
    });

    return map;
  }
);

/**
 * Selector to get contextualized terms for negative weighted terms
 */
export const selectNegativeContextualizedTermsMap = createSelector(
  selectNegativeWeightedTerms,
  selectPersonalContexts,
  (weightedTerms, contexts) => {
    const map = new Map<string, ContextualizedTerm | undefined>();

    weightedTerms.forEach(wt => {
      const contextualizedTerm = findContextualizedTermForTermId(
        wt.term.id,
        contexts,
        false
      );
      map.set(wt.term.id, contextualizedTerm);
    });

    return map;
  }
);
