import { createActionGroup, props, emptyProps } from '@ngrx/store';
import { CompetitiveScore } from '../../classes/competitive-score';
import { ContextualizedWorldviewBallot } from '../../classes/contextualized-worldview-ballot';
import { ContextualizedTerm } from '../../classes/terms/contextualized-term';

export const CompetitiveScoringActions = createActionGroup({
  source: 'CompetitiveScoring',
  events: {
    // Competitive Score CRUD
    'loadCompetitiveScores': emptyProps(),
    'loadCompetitiveScoreById': props<{ id: string }>(),
    'loadCompetitiveScoresSuccess': props<{ competitiveScores: CompetitiveScore[] }>(),
    'loadCompetitiveScoreSuccess': props<{ competitiveScore: CompetitiveScore }>(),
    'loadCompetitiveScoresFailure': props<{ error: string }>(),
    'setCurrentCompetitiveScore': props<{ competitiveScore: CompetitiveScore }>(),
    'clearCurrentCompetitiveScore': emptyProps(),

    // Contextualized Worldview Ballot CRUD
    'loadContextualizedWorldviewBallots': props<{ voterId: string }>(),
    'loadContextualizedWorldviewBallotById': props<{ id: string }>(),
    'loadContextualizedWorldviewBallotsSuccess': props<{ ballots: ContextualizedWorldviewBallot[] }>(),
    'loadContextualizedWorldviewBallotSuccess': props<{ ballot: ContextualizedWorldviewBallot }>(),
    'loadContextualizedWorldviewBallotsFailure': props<{ error: string }>(),
    'createContextualizedWorldviewBallot': props<{ ballot: ContextualizedWorldviewBallot }>(),
    'updateContextualizedWorldviewBallot': props<{ ballot: ContextualizedWorldviewBallot }>(),
    'deleteContextualizedWorldviewBallot': props<{ id: string }>(),
    'setCurrentContextualizedWorldviewBallot': props<{ ballot: ContextualizedWorldviewBallot }>(),
    'clearCurrentContextualizedWorldviewBallot': emptyProps(),

    // Contextualized Terms for current ballot
    'loadContextualizedTermsForBallot': props<{ ballotId: string }>(),
    'loadContextualizedTermsSuccess': props<{ contextualizedTerms: ContextualizedTerm[] }>(),
    'loadContextualizedTermsFailure': props<{ error: string }>(),

    // Clear all
    'clearAll': emptyProps(),
  },
});
