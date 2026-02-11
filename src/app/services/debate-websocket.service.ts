import { Injectable } from '@angular/core';
import { Client, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environment';

export interface DebateMessageDTO {
  id?: string;
  electionId: string;
  userId: string;
  username: string;
  message: string;
  timestamp?: string;
  edited?: boolean;
  editedAt?: string;
  deleted?: boolean;
  deletedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * WebSocket service for real-time debate messaging
 * Uses STOMP over WebSocket (with SockJS fallback)
 */
@Injectable({
  providedIn: 'root'
})
export class DebateWebSocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();

  // Observables for real-time updates
  private newMessageSubject = new BehaviorSubject<DebateMessageDTO | null>(null);
  private updatedMessageSubject = new BehaviorSubject<DebateMessageDTO | null>(null);
  private deletedMessageSubject = new BehaviorSubject<string | null>(null);
  private connectionStatusSubject = new BehaviorSubject<boolean>(false);

  public newMessage$ = this.newMessageSubject.asObservable();
  public updatedMessage$ = this.updatedMessageSubject.asObservable();
  public deletedMessage$ = this.deletedMessageSubject.asObservable();
  public connectionStatus$ = this.connectionStatusSubject.asObservable();

  constructor() {}

  /**
   * Connect to WebSocket server
   */
  connect(): void {
    if (this.client && this.client.connected) {
      console.log('[WebSocket] Already connected');
      return;
    }

    console.log('[WebSocket] Connecting to debate WebSocket...');

    const wsUrl = `${environment.backendUri.replace(/^http/, 'ws')}ws-debate/websocket`;

    this.client = new Client({
      brokerURL: wsUrl,
      debug: (str: string) => {
        console.log('[WebSocket Debug]', str);
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        console.log('[WebSocket] Connected successfully');
        this.connectionStatusSubject.next(true);
      },
      onDisconnect: () => {
        console.log('[WebSocket] Disconnected');
        this.connectionStatusSubject.next(false);
      },
      onStompError: (frame: any) => {
        console.error('[WebSocket] STOMP error', frame);
        this.connectionStatusSubject.next(false);
      }
    });

    this.client.activate();
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.client) {
      console.log('[WebSocket] Disconnecting...');
      this.unsubscribeAll();
      this.client.deactivate();
      this.client = null;
      this.connectionStatusSubject.next(false);
    }
  }

  /**
   * Subscribe to debate messages for a specific election
   */
  subscribeToElection(electionId: string): void {
    if (!this.client || !this.client.connected) {
      console.warn('[WebSocket] Cannot subscribe - not connected');
      return;
    }

    const subscriptionKey = `debate-${electionId}`;

    // Avoid duplicate subscriptions
    if (this.subscriptions.has(subscriptionKey)) {
      console.log('[WebSocket] Already subscribed to election:', electionId);
      return;
    }

    console.log('[WebSocket] Subscribing to election:', electionId);

    // Subscribe to new messages
    const newMessageSub = this.client.subscribe(
      `/topic/debate/${electionId}`,
      (message: any) => {
        console.log('[WebSocket] New message received:', message.body);
        const debateMessage: DebateMessageDTO = JSON.parse(message.body);
        this.newMessageSubject.next(debateMessage);
      }
    );

    // Subscribe to updated messages
    const updatedMessageSub = this.client.subscribe(
      `/topic/debate/${electionId}/updated`,
      (message: any) => {
        console.log('[WebSocket] Message updated:', message.body);
        const debateMessage: DebateMessageDTO = JSON.parse(message.body);
        this.updatedMessageSubject.next(debateMessage);
      }
    );

    // Subscribe to deleted messages
    const deletedMessageSub = this.client.subscribe(
      `/topic/debate/${electionId}/deleted`,
      (message: any) => {
        console.log('[WebSocket] Message deleted:', message.body);
        const messageId: string = JSON.parse(message.body);
        this.deletedMessageSubject.next(messageId);
      }
    );

    // Store subscriptions for cleanup
    this.subscriptions.set(subscriptionKey, newMessageSub);
    this.subscriptions.set(`${subscriptionKey}-updated`, updatedMessageSub);
    this.subscriptions.set(`${subscriptionKey}-deleted`, deletedMessageSub);
  }

  /**
   * Unsubscribe from a specific election
   */
  unsubscribeFromElection(electionId: string): void {
    const subscriptionKey = `debate-${electionId}`;

    const keys = [subscriptionKey, `${subscriptionKey}-updated`, `${subscriptionKey}-deleted`];
    keys.forEach(key => {
      const subscription = this.subscriptions.get(key);
      if (subscription) {
        console.log('[WebSocket] Unsubscribing from:', key);
        subscription.unsubscribe();
        this.subscriptions.delete(key);
      }
    });
  }

  /**
   * Unsubscribe from all topics
   */
  private unsubscribeAll(): void {
    console.log('[WebSocket] Unsubscribing from all topics');
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  /**
   * Send a new message via WebSocket
   */
  sendMessage(electionId: string, message: DebateMessageDTO): void {
    if (!this.client || !this.client.connected) {
      console.warn('[WebSocket] Cannot send message - not connected');
      return;
    }

    console.log('[WebSocket] Sending message to election:', electionId);
    this.client.publish({
      destination: `/app/debate/${electionId}/send`,
      body: JSON.stringify(message)
    });
  }

  /**
   * Update a message via WebSocket
   */
  updateMessage(electionId: string, message: DebateMessageDTO): void {
    if (!this.client || !this.client.connected) {
      console.warn('[WebSocket] Cannot update message - not connected');
      return;
    }

    console.log('[WebSocket] Updating message:', message.id);
    this.client.publish({
      destination: `/app/debate/${electionId}/update`,
      body: JSON.stringify(message)
    });
  }

  /**
   * Delete a message via WebSocket
   */
  deleteMessage(electionId: string, messageId: string): void {
    if (!this.client || !this.client.connected) {
      console.warn('[WebSocket] Cannot delete message - not connected');
      return;
    }

    console.log('[WebSocket] Deleting message:', messageId);
    this.client.publish({
      destination: `/app/debate/${electionId}/delete`,
      body: JSON.stringify(messageId)
    });
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.client !== null && this.client.connected;
  }
}
