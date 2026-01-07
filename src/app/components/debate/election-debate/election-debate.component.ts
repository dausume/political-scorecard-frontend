import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { AppState } from '../../../state/app.state';
import { DebateActions } from '../../../state/actions/debate.actions';
import {
  selectMessagesForElection,
  selectLoading,
  selectSending,
  selectError
} from '../../../state/selectors/debate.selectors';
import { selectAuthUser } from '../../../state/selectors/auth.selectors';
import { DebateInputComponent } from '../debate-input/debate-input.component';
import { DebateMessageComponent, DebateMessageDTO } from '../debate-message/debate-message.component';
import { AuthUser } from '../../../classes/auth-user';
import { DebateWebSocketService } from '../../../services/debate-websocket.service';

@Component({
  selector: 'app-election-debate',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    DebateInputComponent,
    DebateMessageComponent
  ],
  templateUrl: './election-debate.component.html',
  styleUrl: './election-debate.component.scss'
})
export class ElectionDebateComponent implements OnInit, OnDestroy {
  @Input() electionId?: string;
  @Input() mode: 'standalone' | 'sidepanel' = 'standalone';

  messages$!: Observable<DebateMessageDTO[]>;
  loading$!: Observable<boolean>;
  sending$!: Observable<boolean>;
  error$!: Observable<string | null>;

  currentUser: AuthUser | null = null;
  private destroy$ = new Subject<void>();
  private resolvedElectionId: string | null = null;

  constructor(
    private store: Store<AppState>,
    private route: ActivatedRoute,
    private wsService: DebateWebSocketService
  ) {}

  ngOnInit(): void {
    // Get electionId from @Input or route params
    if (this.electionId) {
      this.resolvedElectionId = this.electionId;
    } else {
      this.route.paramMap
        .pipe(takeUntil(this.destroy$))
        .subscribe(params => {
          this.resolvedElectionId = params.get('electionId');
          if (this.resolvedElectionId) {
            this.initializeDebate(this.resolvedElectionId);
          }
        });
      return; // Initialization will happen in subscription
    }

    if (!this.resolvedElectionId) {
      console.error('ElectionDebateComponent: electionId is required');
      return;
    }

    this.initializeDebate(this.resolvedElectionId);
  }

  private initializeDebate(electionId: string): void {
    // Set up observables
    this.messages$ = this.store.select(selectMessagesForElection(electionId));
    this.loading$ = this.store.select(selectLoading);
    this.sending$ = this.store.select(selectSending);
    this.error$ = this.store.select(selectError);

    // Get current user
    this.store.select(selectAuthUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        this.currentUser = user;
      });

    // Set selected election and load messages
    this.store.dispatch(DebateActions.selectElection({ electionId }));
    this.store.dispatch(DebateActions.loadMessagesForElection({ electionId }));

    // Initialize WebSocket connection
    this.initializeWebSocket(electionId);
  }

  private initializeWebSocket(electionId: string): void {
    console.log('[Debate] Initializing WebSocket for election:', electionId);

    // Connect to WebSocket if not already connected
    if (!this.wsService.isConnected()) {
      this.wsService.connect();
    }

    // Wait for connection and subscribe
    this.wsService.connectionStatus$
      .pipe(takeUntil(this.destroy$))
      .subscribe(isConnected => {
        if (isConnected) {
          console.log('[Debate] WebSocket connected, subscribing to election:', electionId);
          this.wsService.subscribeToElection(electionId);
        }
      });

    // Listen for new messages
    this.wsService.newMessage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message && message.electionId === electionId) {
          console.log('[Debate] Received new message via WebSocket:', message);
          this.store.dispatch(DebateActions.messageReceived({ message }));
        }
      });

    // Listen for updated messages
    this.wsService.updatedMessage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(message => {
        if (message && message.electionId === electionId) {
          console.log('[Debate] Received updated message via WebSocket:', message);
          this.store.dispatch(DebateActions.updateMessageSuccess({ message }));
        }
      });

    // Listen for deleted messages
    this.wsService.deletedMessage$
      .pipe(takeUntil(this.destroy$))
      .subscribe(messageId => {
        if (messageId) {
          console.log('[Debate] Received deleted message via WebSocket:', messageId);
          this.store.dispatch(DebateActions.deleteMessageSuccess({ messageId }));
        }
      });
  }

  ngOnDestroy(): void {
    // Unsubscribe from WebSocket
    if (this.resolvedElectionId) {
      this.wsService.unsubscribeFromElection(this.resolvedElectionId);
    }

    this.destroy$.next();
    this.destroy$.complete();
  }

  onSendMessage(messageText: string): void {
    if (!this.currentUser) {
      console.error('Cannot send message: user not authenticated');
      return;
    }

    if (!this.resolvedElectionId) {
      console.error('Cannot send message: electionId not available');
      return;
    }

    const message: DebateMessageDTO = {
      electionId: this.resolvedElectionId,
      userId: this.currentUser.id,
      username: this.currentUser.username || this.currentUser.name || 'Anonymous',
      message: messageText
    };

    // Use WebSocket if connected, otherwise fallback to REST API
    if (this.wsService.isConnected()) {
      console.log('[Debate] Sending message via WebSocket');
      this.wsService.sendMessage(this.resolvedElectionId, message);
    } else {
      console.log('[Debate] WebSocket not connected, using REST API');
      this.store.dispatch(DebateActions.sendMessage({ message }));
    }
  }

  onEditMessage(message: DebateMessageDTO): void {
    if (!message.id) return;

    const updatedText = prompt('Edit your message:', message.message);
    if (updatedText !== null && updatedText.trim() !== message.message) {
      const updatedMessage: DebateMessageDTO = {
        ...message,
        message: updatedText.trim()
      };

      // Use WebSocket if connected, otherwise fallback to REST API
      if (this.wsService.isConnected() && this.resolvedElectionId) {
        console.log('[Debate] Updating message via WebSocket');
        this.wsService.updateMessage(this.resolvedElectionId, updatedMessage);
      } else {
        console.log('[Debate] WebSocket not connected, using REST API');
        this.store.dispatch(DebateActions.updateMessage({
          messageId: message.id,
          message: updatedMessage
        }));
      }
    }
  }

  onDeleteMessage(messageId: string): void {
    // Use WebSocket if connected, otherwise fallback to REST API
    if (this.wsService.isConnected() && this.resolvedElectionId) {
      console.log('[Debate] Deleting message via WebSocket');
      this.wsService.deleteMessage(this.resolvedElectionId, messageId);
    } else {
      console.log('[Debate] WebSocket not connected, using REST API');
      this.store.dispatch(DebateActions.deleteMessage({ messageId }));
    }
  }

  isOwnMessage(message: DebateMessageDTO): boolean {
    return this.currentUser !== null && message.userId === this.currentUser.id;
  }

  trackByMessageId(index: number, message: DebateMessageDTO): string {
    return message.id || `${message.electionId}-${index}`;
  }
}
