import { createActionGroup, props, emptyProps } from '@ngrx/store';
import { Term } from '../../classes/terms/term';
import { TermsQueryParams } from '../../classes/terms-query-params';

export const TermsActions = createActionGroup({
  source: 'Terms',
  events: {
    'loadAllTerms': emptyProps(),
    'loadTermsByWorldviewBallot': props<{ worldviewBallotId: string }>(),
    'loadTermsByCompetitiveScoring': props<{ competitiveScoringId: string }>(),
    'loadTermsStarted': emptyProps(),
    'loadTermsSuccess': props<{ terms: Term[] }>(),
    'loadTermsFailure': props<{ error: string }>(),
    'setTerms': props<{ terms: Term[] }>(),
    'clearTerms': emptyProps(),
  },
});
