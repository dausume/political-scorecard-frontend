import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { LegislationActions } from '../actions/legislation.actions';
import { LegislationApiService } from '../../services/api/legislation-api.service';

@Injectable()
export class LegislationEffects {

  loadAllLegislations$;
  loadLegislationsByStatus$;
  loadLegislation$;
  createLegislation$;
  updateLegislation$;
  deleteLegislation$;
  updateLegislationStatus$;
  loadAnnotations$;
  createAnnotation$;
  updateAnnotation$;
  deleteAnnotation$;

  constructor(
    private actions$: Actions,
    private legislationApi: LegislationApiService
  ) {
    this.loadAllLegislations$ = createEffect(() =>
      this.actions$.pipe(
        ofType(LegislationActions.loadAllLegislations),
        switchMap(() =>
          this.legislationApi.getAllLegislations().pipe(
            map(legislations => LegislationActions.loadLegislationsSuccess({ legislations })),
            catchError(error =>
              of(LegislationActions.loadLegislationsFailure({ error: error.message || 'Failed to load legislations' }))
            )
          )
        )
      )
    );

    this.loadLegislationsByStatus$ = createEffect(() =>
      this.actions$.pipe(
        ofType(LegislationActions.loadLegislationsByStatus),
        switchMap(({ status }) =>
          this.legislationApi.getLegislationsByStatus(status).pipe(
            map(legislations => LegislationActions.loadLegislationsSuccess({ legislations })),
            catchError(error =>
              of(LegislationActions.loadLegislationsFailure({ error: error.message || 'Failed to load legislations by status' }))
            )
          )
        )
      )
    );

    this.loadLegislation$ = createEffect(() =>
      this.actions$.pipe(
        ofType(LegislationActions.loadLegislation),
        switchMap(({ id }) =>
          this.legislationApi.getLegislation(id).pipe(
            map(legislation => LegislationActions.loadLegislationSuccess({ legislation })),
            catchError(error =>
              of(LegislationActions.loadLegislationFailure({ error: error.message || 'Failed to load legislation' }))
            )
          )
        )
      )
    );

    this.createLegislation$ = createEffect(() =>
      this.actions$.pipe(
        ofType(LegislationActions.createLegislation),
        switchMap(({ legislation }) =>
          this.legislationApi.createLegislation(legislation).pipe(
            map(created => LegislationActions.createLegislationSuccess({ legislation: created })),
            catchError(error =>
              of(LegislationActions.createLegislationFailure({ error: error.message || 'Failed to create legislation' }))
            )
          )
        )
      )
    );

    this.updateLegislation$ = createEffect(() =>
      this.actions$.pipe(
        ofType(LegislationActions.updateLegislation),
        switchMap(({ id, legislation }) =>
          this.legislationApi.updateLegislation(id, legislation).pipe(
            map(updated => LegislationActions.updateLegislationSuccess({ legislation: updated })),
            catchError(error =>
              of(LegislationActions.updateLegislationFailure({ error: error.message || 'Failed to update legislation' }))
            )
          )
        )
      )
    );

    this.deleteLegislation$ = createEffect(() =>
      this.actions$.pipe(
        ofType(LegislationActions.deleteLegislation),
        switchMap(({ id }) =>
          this.legislationApi.deleteLegislation(id).pipe(
            map(() => LegislationActions.deleteLegislationSuccess({ id })),
            catchError(error =>
              of(LegislationActions.deleteLegislationFailure({ error: error.message || 'Failed to delete legislation' }))
            )
          )
        )
      )
    );

    this.updateLegislationStatus$ = createEffect(() =>
      this.actions$.pipe(
        ofType(LegislationActions.updateLegislationStatus),
        switchMap(({ id, status }) =>
          this.legislationApi.updateStatus(id, status).pipe(
            map(legislation => LegislationActions.updateLegislationStatusSuccess({ legislation })),
            catchError(error =>
              of(LegislationActions.updateLegislationStatusFailure({ error: error.message || 'Failed to update status' }))
            )
          )
        )
      )
    );

    this.loadAnnotations$ = createEffect(() =>
      this.actions$.pipe(
        ofType(LegislationActions.loadAnnotations),
        switchMap(({ legislationId, groupId }) =>
          this.legislationApi.getAnnotations(legislationId, groupId).pipe(
            map(annotations => LegislationActions.loadAnnotationsSuccess({ annotations })),
            catchError(error =>
              of(LegislationActions.loadAnnotationsFailure({ error: error.message || 'Failed to load annotations' }))
            )
          )
        )
      )
    );

    this.createAnnotation$ = createEffect(() =>
      this.actions$.pipe(
        ofType(LegislationActions.createAnnotation),
        switchMap(({ legislationId, annotation }) =>
          this.legislationApi.createAnnotation(legislationId, annotation).pipe(
            map(created => LegislationActions.createAnnotationSuccess({ annotation: created })),
            catchError(error =>
              of(LegislationActions.createAnnotationFailure({ error: error.message || 'Failed to create annotation' }))
            )
          )
        )
      )
    );

    this.updateAnnotation$ = createEffect(() =>
      this.actions$.pipe(
        ofType(LegislationActions.updateAnnotation),
        switchMap(({ legislationId, annotationId, annotation }) =>
          this.legislationApi.updateAnnotation(legislationId, annotationId, annotation).pipe(
            map(updated => LegislationActions.updateAnnotationSuccess({ annotation: updated })),
            catchError(error =>
              of(LegislationActions.updateAnnotationFailure({ error: error.message || 'Failed to update annotation' }))
            )
          )
        )
      )
    );

    this.deleteAnnotation$ = createEffect(() =>
      this.actions$.pipe(
        ofType(LegislationActions.deleteAnnotation),
        switchMap(({ legislationId, annotationId }) =>
          this.legislationApi.deleteAnnotation(legislationId, annotationId).pipe(
            map(() => LegislationActions.deleteAnnotationSuccess({ annotationId })),
            catchError(error =>
              of(LegislationActions.deleteAnnotationFailure({ error: error.message || 'Failed to delete annotation' }))
            )
          )
        )
      )
    );
  }
}
