import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { WorldviewBallotActions } from '../actions/worldview-ballot.actions';
import { MOCK_CONTEXTUALIZED_WORLDVIEW_BALLOTS } from '../mock-data/contextualized-worldview-ballots.mock';

@Injectable()
export class WorldviewBallotEffects {
  // Load all ballots
  loadAllBallots$;

  // Load ballot by ID
  loadBallotById$;

  constructor(private actions$: Actions) {
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
  }
}
