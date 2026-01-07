import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, delay } from 'rxjs/operators';
import { DebateActions } from '../actions/debate.actions';
import { getDebateMessagesForElection, MOCK_DEBATE_MESSAGES } from '../mock-data/debate-messages.mock';

/**
 * Effects for debate messages.
 * Currently using mock data - will be updated to use DebateApiService in Phase 3.
 */
@Injectable()
export class DebateEffects {

  loadMessagesForElection$;
  sendMessage$;
  updateMessage$;
  deleteMessage$;

  constructor(
    private actions$: Actions
  ) {
    // Load messages for election (using mock data)
    this.loadMessagesForElection$ = createEffect(() =>
      this.actions$.pipe(
        ofType(DebateActions.loadMessagesForElection),
        switchMap(({ electionId }) =>
          // Simulate API call with delay
          of(getDebateMessagesForElection(electionId)).pipe(
            delay(300), // Simulate network delay
            map(messages => DebateActions.loadMessagesSuccess({ electionId, messages })),
            catchError(error =>
              of(DebateActions.loadMessagesFailure({ error: error.message || 'Failed to load messages' }))
            )
          )
        )
      )
    );

    // Send message (using mock data)
    this.sendMessage$ = createEffect(() =>
      this.actions$.pipe(
        ofType(DebateActions.sendMessage),
        switchMap(({ message }) => {
          // Generate mock response with ID and timestamp
          const createdMessage = {
            ...message,
            id: message.id || `msg-${Date.now()}`,
            timestamp: message.timestamp || new Date().toISOString(),
            edited: false,
            deleted: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Simulate API call with delay
          return of(createdMessage).pipe(
            delay(300),
            map(msg => DebateActions.sendMessageSuccess({ message: msg })),
            catchError(error =>
              of(DebateActions.sendMessageFailure({ error: error.message || 'Failed to send message' }))
            )
          );
        })
      )
    );

    // Update message (using mock data)
    this.updateMessage$ = createEffect(() =>
      this.actions$.pipe(
        ofType(DebateActions.updateMessage),
        switchMap(({ messageId, message }) => {
          // Create updated message with edited flags
          const updatedMessage = {
            ...message,
            id: messageId,
            edited: true,
            editedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // Simulate API call with delay
          return of(updatedMessage).pipe(
            delay(300),
            map(msg => DebateActions.updateMessageSuccess({ message: msg })),
            catchError(error =>
              of(DebateActions.updateMessageFailure({ error: error.message || 'Failed to update message' }))
            )
          );
        })
      )
    );

    // Delete message (using mock data)
    this.deleteMessage$ = createEffect(() =>
      this.actions$.pipe(
        ofType(DebateActions.deleteMessage),
        switchMap(({ messageId }) =>
          // Simulate API call with delay
          of(messageId).pipe(
            delay(300),
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
