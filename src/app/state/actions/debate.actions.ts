import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { DebateMessageDTO } from '../mock-data/debate-messages.mock';

export const DebateActions = createActionGroup({
  source: 'Debate',
  events: {
    // Load messages for election
    'Load Messages For Election': props<{ electionId: string }>(),
    'Load Messages Success': props<{ electionId: string; messages: DebateMessageDTO[] }>(),
    'Load Messages Failure': props<{ error: string }>(),

    // Select election for debate
    'Select Election': props<{ electionId: string }>(),
    'Clear Selection': emptyProps(),

    // Send new message
    'Send Message': props<{ message: DebateMessageDTO }>(),
    'Send Message Success': props<{ message: DebateMessageDTO }>(),
    'Send Message Failure': props<{ error: string }>(),

    // Update message
    'Update Message': props<{ messageId: string; message: DebateMessageDTO }>(),
    'Update Message Success': props<{ message: DebateMessageDTO }>(),
    'Update Message Failure': props<{ error: string }>(),

    // Delete message
    'Delete Message': props<{ messageId: string }>(),
    'Delete Message Success': props<{ messageId: string }>(),
    'Delete Message Failure': props<{ error: string }>(),

    // Real-time message received (for WebSocket future)
    'Message Received': props<{ message: DebateMessageDTO }>(),
  },
});
