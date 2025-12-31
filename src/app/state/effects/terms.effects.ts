import { Injectable } from '@angular/core';
//Cannot find module '@ngrx/effects' or its corresponding type declarations.ts(2307)
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { TermsActions } from '../actions/terms.actions';
import { TermsApiService } from '../../services/api/terms-api.service';

@Injectable()
export class TermsEffects {

  /**
   * Effect: Load all terms
   * Listens for loadAllTerms action and calls the API service
   */
  loadAllTerms$;

  /**
   * Effect: Load terms by worldview ballot
   * Listens for loadTermsByWorldviewBallot action and calls the API service
   */
  loadTermsByWorldviewBallot$;

  /**
   * Effect: Load terms by competitive scoring
   * Listens for loadTermsByCompetitiveScoring action and calls the API service
   */
  loadTermsByCompetitiveScoring$;

  constructor(
    private actions$: Actions,
    private termsApi: TermsApiService
  ) {
    this.loadAllTerms$ = createEffect(() =>
      this.actions$.pipe(
        ofType(TermsActions.loadAllTerms),
        switchMap(() =>
          this.termsApi.loadAllTerms().pipe(
            map(terms => TermsActions.loadTermsSuccess({ terms })),
            catchError(error =>
              of(TermsActions.loadTermsFailure({ error: error.message || 'Failed to load terms' }))
            )
          )
        )
      )
    );

    this.loadTermsByWorldviewBallot$ = createEffect(() =>
      this.actions$.pipe(
        ofType(TermsActions.loadTermsByWorldviewBallot),
        switchMap(({ worldviewBallotId }) =>
          this.termsApi.loadTermsByWorldviewBallot(worldviewBallotId).pipe(
            map(terms => TermsActions.loadTermsSuccess({ terms })),
            catchError(error =>
              of(TermsActions.loadTermsFailure({ error: error.message || 'Failed to load terms' }))
            )
          )
        )
      )
    );

    this.loadTermsByCompetitiveScoring$ = createEffect(() =>
      this.actions$.pipe(
        ofType(TermsActions.loadTermsByCompetitiveScoring),
        switchMap(({ competitiveScoringId }) =>
          this.termsApi.loadTermsByCompetitiveScoring(competitiveScoringId).pipe(
            map(terms => TermsActions.loadTermsSuccess({ terms })),
            catchError(error =>
              of(TermsActions.loadTermsFailure({ error: error.message || 'Failed to load terms' }))
            )
          )
        )
      )
    );
  }
}
