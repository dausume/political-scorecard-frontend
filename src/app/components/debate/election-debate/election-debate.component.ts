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
    private route: ActivatedRoute
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
  }

  ngOnDestroy(): void {
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

    this.store.dispatch(DebateActions.sendMessage({ message }));
  }

  onEditMessage(message: DebateMessageDTO): void {
    if (!message.id) return;

    const updatedText = prompt('Edit your message:', message.message);
    if (updatedText !== null && updatedText.trim() !== message.message) {
      const updatedMessage: DebateMessageDTO = {
        ...message,
        message: updatedText.trim()
      };
      this.store.dispatch(DebateActions.updateMessage({
        messageId: message.id,
        message: updatedMessage
      }));
    }
  }

  onDeleteMessage(messageId: string): void {
    this.store.dispatch(DebateActions.deleteMessage({ messageId }));
  }

  isOwnMessage(message: DebateMessageDTO): boolean {
    return this.currentUser !== null && message.userId === this.currentUser.id;
  }

  trackByMessageId(index: number, message: DebateMessageDTO): string {
    return message.id || `${message.electionId}-${index}`;
  }
}
