import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DebateActions } from '../actions/debate.actions';
import { DebateApiService } from '../../services/api/debate-api.service';

/**
 * Effects for debate messages using real API endpoints.
 */
@Injectable()
export class DebateEffects {

  loadMessagesForElection$;
  sendMessage$;
  updateMessage$;
  deleteMessage$;

  constructor(
    private actions$: Actions,
    private debateApi: DebateApiService
  ) {
    // Load messages for election
    this.loadMessagesForElection$ = createEffect(() =>
      this.actions$.pipe(
        ofType(DebateActions.loadMessagesForElection),
        switchMap(({ electionId }) =>
          this.debateApi.getMessagesByElectionId(electionId).pipe(
            map(messages => DebateActions.loadMessagesSuccess({ electionId, messages })),
            catchError(error =>
              of(DebateActions.loadMessagesFailure({ error: error.message || 'Failed to load messages' }))
            )
          )
        )
      )
    );

    // Send message
    this.sendMessage$ = createEffect(() =>
      this.actions$.pipe(
        ofType(DebateActions.sendMessage),
        switchMap(({ message }) =>
          this.debateApi.createMessage(message).pipe(
            map(createdMessage => DebateActions.sendMessageSuccess({ message: createdMessage })),
            catchError(error =>
              of(DebateActions.sendMessageFailure({ error: error.message || 'Failed to send message' }))
            )
          )
        )
      )
    );

    // Update message
    this.updateMessage$ = createEffect(() =>
      this.actions$.pipe(
        ofType(DebateActions.updateMessage),
        switchMap(({ messageId, message }) =>
          this.debateApi.updateMessage(messageId, message).pipe(
            map(updatedMessage => DebateActions.updateMessageSuccess({ message: updatedMessage })),
            catchError(error =>
              of(DebateActions.updateMessageFailure({ error: error.message || 'Failed to update message' }))
            )
          )
        )
      )
    );

    // Delete message
    this.deleteMessage$ = createEffect(() =>
      this.actions$.pipe(
        ofType(DebateActions.deleteMessage),
        switchMap(({ messageId }) =>
          this.debateApi.deleteMessage(messageId).pipe(
            map(() => DebateActions.deleteMessageSuccess({ messageId })),
            catchError(error =>
              of(DebateActions.deleteMessageFailure({ error: error.message || 'Failed to delete message' }))
            )
          )
        )
      )
    );
  }
}
