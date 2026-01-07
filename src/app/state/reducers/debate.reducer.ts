import { createReducer, on } from '@ngrx/store';
import { DebateActions } from '../actions/debate.actions';
import { DebateMessageDTO } from '../mock-data/debate-messages.mock';

export interface DebateState {
  messagesByElection: { [electionId: string]: DebateMessageDTO[] };
  selectedElectionId: string | null;
  loading: boolean;
  sending: boolean;
  error: string | null;
}

const initialState: DebateState = {
  messagesByElection: {},
  selectedElectionId: null,
  loading: false,
  sending: false,
  error: null,
};

export const debateReducer = createReducer(
  initialState,

  // Select election
  on(DebateActions.selectElection, (state, { electionId }) => ({
    ...state,
    selectedElectionId: electionId,
  })),
  on(DebateActions.clearSelection, (state) => ({
    ...state,
    selectedElectionId: null,
  })),

  // Load messages
  on(DebateActions.loadMessagesForElection, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(DebateActions.loadMessagesSuccess, (state, { electionId, messages }) => ({
    ...state,
    messagesByElection: {
      ...state.messagesByElection,
      [electionId]: messages,
    },
    loading: false,
    error: null,
  })),
  on(DebateActions.loadMessagesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Send message
  on(DebateActions.sendMessage, (state) => ({
    ...state,
    sending: true,
    error: null,
  })),
  on(DebateActions.sendMessageSuccess, (state, { message }) => {
    const electionId = message.electionId;
    const currentMessages = state.messagesByElection[electionId] || [];
    return {
      ...state,
      messagesByElection: {
        ...state.messagesByElection,
        [electionId]: [...currentMessages, message],
      },
      sending: false,
      error: null,
    };
  }),
  on(DebateActions.sendMessageFailure, (state, { error }) => ({
    ...state,
    sending: false,
    error,
  })),

  // Update message
  on(DebateActions.updateMessage, (state) => ({
    ...state,
    error: null,
  })),
  on(DebateActions.updateMessageSuccess, (state, { message }) => {
    const electionId = message.electionId;
    const currentMessages = state.messagesByElection[electionId] || [];
    return {
      ...state,
      messagesByElection: {
        ...state.messagesByElection,
        [electionId]: currentMessages.map(m => m.id === message.id ? message : m),
      },
      error: null,
    };
  }),
  on(DebateActions.updateMessageFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  // Delete message
  on(DebateActions.deleteMessage, (state) => ({
    ...state,
    error: null,
  })),
  on(DebateActions.deleteMessageSuccess, (state, { messageId }) => {
    // Remove message from all elections
    const updatedMessagesByElection = Object.keys(state.messagesByElection).reduce((acc, electionId) => {
      acc[electionId] = state.messagesByElection[electionId].filter(m => m.id !== messageId);
      return acc;
    }, {} as { [electionId: string]: DebateMessageDTO[] });

    return {
      ...state,
      messagesByElection: updatedMessagesByElection,
      error: null,
    };
  }),
  on(DebateActions.deleteMessageFailure, (state, { error }) => ({
    ...state,
    error,
  })),

  // Real-time message received
  on(DebateActions.messageReceived, (state, { message }) => {
    const electionId = message.electionId;
    const currentMessages = state.messagesByElection[electionId] || [];

    // Avoid duplicates
    if (currentMessages.some(m => m.id === message.id)) {
      return state;
    }

    return {
      ...state,
      messagesByElection: {
        ...state.messagesByElection,
        [electionId]: [...currentMessages, message],
      },
    };
  })
);
