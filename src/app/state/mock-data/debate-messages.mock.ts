/**
 * Mock data for debate messages
 * Used for development and testing before real API integration
 */

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

export const MOCK_DEBATE_MESSAGES: DebateMessageDTO[] = [
  {
    id: 'msg-1',
    electionId: 'election-1',
    userId: 'user-1',
    username: 'john_voter',
    message: 'I think labor union participation is crucial for worker protection. The data shows states with higher union membership have better wage growth over the past decade.',
    timestamp: '2026-01-05T10:30:00',
    edited: false,
    deleted: false,
    createdAt: '2026-01-05T10:30:00',
    updatedAt: '2026-01-05T10:30:00',
  },
  {
    id: 'msg-2',
    electionId: 'election-1',
    userId: 'user-2',
    username: 'sarah_analyst',
    message: 'Interesting point! But we should also consider labor force participation rates. Some states with lower union membership still show strong economic indicators. The relationship might be more nuanced.',
    timestamp: '2026-01-05T10:35:00',
    edited: false,
    deleted: false,
    createdAt: '2026-01-05T10:35:00',
    updatedAt: '2026-01-05T10:35:00',
  },
  {
    id: 'msg-3',
    electionId: 'election-1',
    userId: 'user-3',
    username: 'policy_expert',
    message: 'The minimum wage factor cannot be ignored either. States with higher minimum wages tend to have better poverty reduction outcomes, which is a key labor quality metric.',
    timestamp: '2026-01-05T10:40:00',
    edited: false,
    deleted: false,
    createdAt: '2026-01-05T10:40:00',
    updatedAt: '2026-01-05T10:40:00',
  },
  {
    id: 'msg-4',
    electionId: 'election-1',
    userId: 'user-1',
    username: 'john_voter',
    message: 'Good points all around. The interconnection between these metrics is what makes this ballot so important for understanding labor quality holistically.',
    timestamp: '2026-01-05T10:45:00',
    edited: true,
    editedAt: '2026-01-05T10:46:00',
    deleted: false,
    createdAt: '2026-01-05T10:45:00',
    updatedAt: '2026-01-05T10:46:00',
  },
  {
    id: 'msg-5',
    electionId: 'election-1',
    userId: 'user-4',
    username: 'data_scientist',
    message: 'Has anyone looked at the correlation between workplace safety regulations and labor quality scores? I suspect there\'s a strong positive relationship.',
    timestamp: '2026-01-05T11:00:00',
    edited: false,
    deleted: false,
    createdAt: '2026-01-05T11:00:00',
    updatedAt: '2026-01-05T11:00:00',
  },
  {
    id: 'msg-6',
    electionId: 'election-1',
    userId: 'user-2',
    username: 'sarah_analyst',
    message: 'Great question! OSHA violation rates would be a valuable term to include. Lower violation rates often correlate with better overall labor conditions.',
    timestamp: '2026-01-05T11:15:00',
    edited: false,
    deleted: false,
    createdAt: '2026-01-05T11:15:00',
    updatedAt: '2026-01-05T11:15:00',
  },
  // Different election
  {
    id: 'msg-7',
    electionId: 'election-2',
    userId: 'user-5',
    username: 'voter_smith',
    message: 'Looking forward to discussing healthcare accountability metrics for this election!',
    timestamp: '2026-01-05T11:30:00',
    edited: false,
    deleted: false,
    createdAt: '2026-01-05T11:30:00',
    updatedAt: '2026-01-05T11:30:00',
  },
  {
    id: 'msg-8',
    electionId: 'election-2',
    userId: 'user-6',
    username: 'health_advocate',
    message: 'Access to preventive care should definitely be a key metric we consider.',
    timestamp: '2026-01-05T11:45:00',
    edited: false,
    deleted: false,
    createdAt: '2026-01-05T11:45:00',
    updatedAt: '2026-01-05T11:45:00',
  },
];

/**
 * Get messages for a specific election
 */
export function getDebateMessagesForElection(electionId: string): DebateMessageDTO[] {
  return MOCK_DEBATE_MESSAGES.filter(msg => msg.electionId === electionId && !msg.deleted);
}

/**
 * Get a single message by ID
 */
export function getDebateMessageById(messageId: string): DebateMessageDTO | undefined {
  return MOCK_DEBATE_MESSAGES.find(msg => msg.id === messageId);
}
