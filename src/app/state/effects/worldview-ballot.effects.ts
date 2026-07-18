import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators';
import { WorldviewBallotActions } from '../actions/worldview-ballot.actions';
import { AppState } from '../app.state';
import * as WorldviewBallotSelectors from '../selectors/worldview-ballot.selectors';
import { WorldviewBallotsApiService, WorldviewBallotDTO } from '../../services/api/worldview-ballots-api.service';
import { TermsApiService } from '../../services/api/terms-api.service';
import { mapTermContextDTO } from '../../services/api/contextualized-term-mapper';
import { ContextualizedWorldviewBallot } from '../../classes/contextualized-worldview-ballot';
import { TermContext, TimeframeContext, LocationContext } from '../../classes/terms/contextualized-term';

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
    private store: Store<AppState>,
    private ballotsApi: WorldviewBallotsApiService,
    private termsApi: TermsApiService
  ) {
    this.loadAllBallots$ = createEffect(() =>
      this.actions$.pipe(
        ofType(WorldviewBallotActions.loadAllBallots),
        switchMap(() =>
          this.ballotsApi.getAllBallots().pipe(
            map(dtos => (dtos || []).map(dto => this.mapBallotDTO(dto))),
            // No persisted ballots yet: fall back to a single default
            // ballot built from the real terms catalog.
            switchMap(ballots => ballots.length > 0 ? of(ballots) : this.buildDefaultBallots()),
            map(ballots => WorldviewBallotActions.loadBallotsSuccess({ ballots })),
            catchError(() =>
              this.buildDefaultBallots().pipe(
                map(ballots => WorldviewBallotActions.loadBallotsSuccess({ ballots })),
                catchError(error =>
                  of(
                    WorldviewBallotActions.loadBallotsFailure({
                      error: error instanceof Error ? error.message : 'Unknown error loading ballots',
                    })
                  )
                )
              )
            )
          )
        )
      )
    );

    this.loadBallotById$ = createEffect(() =>
      this.actions$.pipe(
        ofType(WorldviewBallotActions.loadBallotById),
        switchMap(({ ballotId }) =>
          this.ballotsApi.getBallot(ballotId).pipe(
            map(dto =>
              WorldviewBallotActions.loadBallotsSuccess({
                ballots: [this.mapBallotDTO(dto)],
              })
            ),
            catchError(() =>
              of(
                WorldviewBallotActions.loadBallotsFailure({
                  error: `Ballot with ID ${ballotId} not found`,
                })
              )
            )
          )
        )
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

  /** Rehydrate a backend ballot row into the real ballot class. */
  private mapBallotDTO(dto: WorldviewBallotDTO): ContextualizedWorldviewBallot {
    const personalContexts = (dto.personalContexts || [])
      .map(c => mapTermContextDTO(c))
      .filter((c): c is TermContext => c !== null);

    const contextualizedTermScores = (dto.contextualizedTermScores || [])
      .map((s: any) => ({
        contextualizedTermId: s?.contextualizedTermId ?? s?.id ?? '',
        weight: typeof s?.weight === 'number' ? s.weight : 0,
      }))
      .filter(s => !!s.contextualizedTermId);

    return new ContextualizedWorldviewBallot({
      id: dto.id || `ballot-${dto.electionId}-${dto.voterId}`,
      electionId: dto.electionId || '',
      competitiveScoreId: '',
      voterId: dto.voterId || '',
      name: dto.name || 'Worldview Ballot',
      ballotType: dto.ballotType,
      personalContexts,
      contextualizedTermScores,
      criticalContexts: [],
    });
  }

  /**
   * When the backend has no persisted ballots, build one default ballot
   * from the real terms catalog (no ballotType filter, so every real term
   * is available; weights stay neutral until the user assigns them).
   */
  private buildDefaultBallots(): Observable<ContextualizedWorldviewBallot[]> {
    return this.termsApi.loadAllTerms().pipe(
      map(terms => [
        new ContextualizedWorldviewBallot({
          id: 'default-worldview-ballot',
          electionId: '',
          competitiveScoreId: '',
          voterId: '',
          name: terms.length > 0 ? 'Worldview Ballot' : 'Worldview Ballot (no terms available)',
          personalContexts: [
            new TimeframeContext({
              label: 'Timeframe',
              startDate: new Date('2022-01-01'),
              endDate: new Date('2023-12-31'),
            }),
            new LocationContext({
              label: 'State',
              state: 'California',
              country: 'United States',
            }),
            new LocationContext({
              label: 'Nation',
              country: 'United States',
            }),
          ],
          contextualizedTermScores: [],
          criticalContexts: [],
        }),
      ])
    );
  }
}
