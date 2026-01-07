import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { ElectionsActions } from '../actions/elections.actions';
import { WorldviewElectionsApiService } from '../../services/api/worldview-elections-api.service';

@Injectable()
export class ElectionsEffects {

  loadAllElections$;
  loadActiveElections$;
  loadElectionsByStatus$;
  loadElection$;
  createElection$;
  updateElection$;
  deleteElection$;
  closeElection$;

  constructor(
    private actions$: Actions,
    private electionsApiService: WorldviewElectionsApiService
  ) {
    // Load all elections
    this.loadAllElections$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ElectionsActions.loadAllElections),
        switchMap(() =>
          this.electionsApiService.getAllElections().pipe(
            map(elections => ElectionsActions.loadElectionsSuccess({ elections })),
            catchError(error =>
              of(ElectionsActions.loadElectionsFailure({ error: error.message || 'Failed to load elections' }))
            )
          )
        )
      )
    );

    // Load active elections
    this.loadActiveElections$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ElectionsActions.loadActiveElections),
        switchMap(() =>
          this.electionsApiService.getElectionsByStatus('ACTIVE').pipe(
            map(elections => ElectionsActions.loadElectionsSuccess({ elections })),
            catchError(error =>
              of(ElectionsActions.loadElectionsFailure({ error: error.message || 'Failed to load active elections' }))
            )
          )
        )
      )
    );

    // Load elections by status
    this.loadElectionsByStatus$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ElectionsActions.loadElectionsByStatus),
        switchMap(({ status }) =>
          this.electionsApiService.getElectionsByStatus(status).pipe(
            map(elections => ElectionsActions.loadElectionsSuccess({ elections })),
            catchError(error =>
              of(ElectionsActions.loadElectionsFailure({ error: error.message || `Failed to load elections with status ${status}` }))
            )
          )
        )
      )
    );

    // Load single election
    this.loadElection$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ElectionsActions.loadElection),
        switchMap(({ electionId }) =>
          this.electionsApiService.getElection(electionId).pipe(
            map(election => ElectionsActions.loadElectionSuccess({ election })),
            catchError(error =>
              of(ElectionsActions.loadElectionFailure({ error: error.message || 'Failed to load election' }))
            )
          )
        )
      )
    );

    // Create election
    this.createElection$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ElectionsActions.createElection),
        switchMap(({ election }) =>
          this.electionsApiService.createElection(election).pipe(
            map(createdElection => ElectionsActions.createElectionSuccess({ election: createdElection })),
            catchError(error =>
              of(ElectionsActions.createElectionFailure({ error: error.message || 'Failed to create election' }))
            )
          )
        )
      )
    );

    // Update election
    this.updateElection$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ElectionsActions.updateElection),
        switchMap(({ electionId, election }) =>
          this.electionsApiService.updateElection(electionId, election).pipe(
            map(updatedElection => ElectionsActions.updateElectionSuccess({ election: updatedElection })),
            catchError(error =>
              of(ElectionsActions.updateElectionFailure({ error: error.message || 'Failed to update election' }))
            )
          )
        )
      )
    );

    // Delete election
    this.deleteElection$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ElectionsActions.deleteElection),
        switchMap(({ electionId }) =>
          this.electionsApiService.deleteElection(electionId).pipe(
            map(() => ElectionsActions.deleteElectionSuccess({ electionId })),
            catchError(error =>
              of(ElectionsActions.deleteElectionFailure({ error: error.message || 'Failed to delete election' }))
            )
          )
        )
      )
    );

    // Close election
    this.closeElection$ = createEffect(() =>
      this.actions$.pipe(
        ofType(ElectionsActions.closeElection),
        switchMap(({ electionId }) =>
          this.electionsApiService.closeElection(electionId).pipe(
            map(election => ElectionsActions.closeElectionSuccess({ election })),
            catchError(error =>
              of(ElectionsActions.closeElectionFailure({ error: error.message || 'Failed to close election' }))
            )
          )
        )
      )
    );
  }
}
