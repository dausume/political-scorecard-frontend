import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { ContextualizedWorldviewBallot } from '../../classes/contextualized-worldview-ballot';
import { TermContext } from '../../classes/terms/contextualized-term';
import { WeightedWorldviewTerm } from '../../classes/terms/weighted-worldview-term';
import { Term } from '../../classes/terms/term';

export const WorldviewBallotActions = createActionGroup({
  source: 'Worldview Ballot',
  events: {
    // Load ballots
    'Load All Ballots': emptyProps(), // loadAllBallots
    'Load Ballot By Id': props<{ ballotId: string }>(), // loadBallotById
    'Load Ballots Started': emptyProps(), // loadBallotsStarted
    'Load Ballots Success': props<{ ballots: ContextualizedWorldviewBallot[] }>(), // loadBallotsSuccess
    'Load Ballots Failure': props<{ error: string }>(), // loadBallotsFailure

    // Select current ballot
    'Select Ballot': props<{ ballot: ContextualizedWorldviewBallot }>(), // selectBallot
    'Clear Selected Ballot': emptyProps(), // clearSelectedBallot

    // Update ballot contexts
    'Update Personal Contexts': props<{ contexts: TermContext[] }>(), // updatePersonalContexts

    // Manage weighted terms
    'Add Positive Term': props<{ term: Term }>(), // addPositiveTerm
    'Add Negative Term': props<{ term: Term }>(), // addNegativeTerm
    'Remove Positive Term': props<{ termId: string }>(), // removePositiveTerm
    'Remove Negative Term': props<{ termId: string }>(), // removeNegativeTerm
    'Update Term Weight': props<{ termId: string; isPositive: boolean; weight: number }>(), // updateTermWeight
    'Clear Weighted Terms': emptyProps(), // clearWeightedTerms

    // Set weighted terms directly (for initialization)
    'Set Weighted Terms': props<{ weightedTerms: WeightedWorldviewTerm[] }>(), // setWeightedTerms

    // Draft ballot management (unsubmitted but saved progress)
    'Save Draft': emptyProps(),
    'Load Draft': props<{ ballotId: string }>(),
    'Delete Draft': props<{ ballotId: string }>(),
    'Clear Drafts': emptyProps(),
  },
});
