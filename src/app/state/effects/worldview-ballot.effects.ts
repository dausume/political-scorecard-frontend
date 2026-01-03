import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators';
import { WorldviewBallotActions } from '../actions/worldview-ballot.actions';
import { MOCK_CONTEXTUALIZED_WORLDVIEW_BALLOTS } from '../mock-data/contextualized-worldview-ballots.mock';
import { AppState } from '../app.state';
import * as WorldviewBallotSelectors from '../selectors/worldview-ballot.selectors';

@Injectable()
export class WorldviewBallotEffects {
  // Load all ballots
  loadAllBallots$;

  // Load ballot by ID
  loadBallotById$;

  // Submit ballot
  submitBallot$;

  // Unsubmit ballot
  unsubmitBallot$;

  constructor(
    private actions$: Actions,
    private store: Store<AppState>
  ) {
    this.loadAllBallots$ = createEffect(() =>
      this.actions$.pipe(
        ofType(WorldviewBallotActions.loadAllBallots),
        switchMap(() => {
          // In a real app, this would be an API call
          // For now, use mock data
          try {
            return of(
              WorldviewBallotActions.loadBallotsSuccess({
                ballots: MOCK_CONTEXTUALIZED_WORLDVIEW_BALLOTS,
              })
            );
          } catch (error) {
            return of(
              WorldviewBallotActions.loadBallotsFailure({
                error: error instanceof Error ? error.message : 'Unknown error loading ballots',
              })
            );
          }
        })
      )
    );

    this.loadBallotById$ = createEffect(() =>
      this.actions$.pipe(
        ofType(WorldviewBallotActions.loadBallotById),
        switchMap(({ ballotId }) => {
          // In a real app, this would be an API call
          // For now, use mock data
          try {
            const ballot = MOCK_CONTEXTUALIZED_WORLDVIEW_BALLOTS.find(b => b.id === ballotId);
            if (ballot) {
              return of(
                WorldviewBallotActions.loadBallotsSuccess({
                  ballots: [ballot],
                })
              );
            } else {
              return of(
                WorldviewBallotActions.loadBallotsFailure({
                  error: `Ballot with ID ${ballotId} not found`,
                })
              );
            }
          } catch (error) {
            return of(
              WorldviewBallotActions.loadBallotsFailure({
                error: error instanceof Error ? error.message : 'Unknown error loading ballot',
              })
            );
          }
        })
      )
    );

    this.submitBallot$ = createEffect(() =>
      this.actions$.pipe(
        ofType(WorldviewBallotActions.submitBallot),
        withLatestFrom(this.store.select(WorldviewBallotSelectors.selectSelectedBallot)),
        switchMap(([_, selectedBallot]) => {
          if (!selectedBallot) {
            return of(
              WorldviewBallotActions.submitBallotFailure({
                error: 'No ballot selected',
              })
            );
          }

          // Simulate API call to submit ballot
          // In a real app, this would be an HTTP request to the backend
          try {
            const submittedAt = new Date();
            console.log('[EFFECTS] Submitting ballot:', selectedBallot.id, 'at', submittedAt);

            // Simulate successful submission
            return of(
              WorldviewBallotActions.submitBallotSuccess({
                ballotId: selectedBallot.id,
                submittedAt,
              })
            );
          } catch (error) {
            return of(
              WorldviewBallotActions.submitBallotFailure({
                error: error instanceof Error ? error.message : 'Unknown error submitting ballot',
              })
            );
          }
        })
      )
    );

    this.unsubmitBallot$ = createEffect(() =>
      this.actions$.pipe(
        ofType(WorldviewBallotActions.unsubmitBallot),
        withLatestFrom(this.store.select(WorldviewBallotSelectors.selectSelectedBallot)),
        switchMap(([_, selectedBallot]) => {
          if (!selectedBallot) {
            return of(
              WorldviewBallotActions.unsubmitBallotFailure({
                error: 'No ballot selected',
              })
            );
          }

          // Simulate API call to unsubmit ballot
          // In a real app, this would be an HTTP request to the backend
          try {
            console.log('[EFFECTS] Unsubmitting ballot:', selectedBallot.id);

            // Simulate successful unsubmission
            return of(
              WorldviewBallotActions.unsubmitBallotSuccess({
                ballotId: selectedBallot.id,
              })
            );
          } catch (error) {
            return of(
              WorldviewBallotActions.unsubmitBallotFailure({
                error: error instanceof Error ? error.message : 'Unknown error unsubmitting ballot',
              })
            );
          }
        })
      )
    );
  }
}
