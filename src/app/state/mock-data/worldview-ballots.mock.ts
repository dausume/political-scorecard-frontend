export interface WorldviewBallot {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'pending' | 'closed';
  responseCount: number;
  createdDate: Date;
}

// Import Labor Quality Score ballot (based on real spreadsheet data)
import { LABOR_QUALITY_SCORE_BALLOT } from './labor-quality-worldview-ballot.mock';

export const MOCK_WORLDVIEW_BALLOTS: WorldviewBallot[] = [
  // Labor Quality Score ballot (based on real spreadsheet data)
  LABOR_QUALITY_SCORE_BALLOT,
  {
    id: '1',
    name: 'Economic Policy Framework 2025',
    description: 'This ballot focuses on evaluating economic policy approaches and their real-world impacts.',
    status: 'active',
    responseCount: 1247,
    createdDate: new Date('2025-01-15')
  },
  {
    id: '2',
    name: 'Healthcare System Evaluation',
    description: 'Comparing different healthcare policy approaches and their effectiveness in improving public health outcomes.',
    status: 'active',
    responseCount: 892,
    createdDate: new Date('2025-02-01')
  },
  {
    id: '3',
    name: 'Education Reform Assessment',
    description: 'Evaluating various educational policy proposals and their impact on student outcomes and teacher effectiveness.',
    status: 'active',
    responseCount: 634,
    createdDate: new Date('2025-02-10')
  },
  {
    id: '4',
    name: 'Climate Policy Comparison',
    description: 'Assessing different approaches to climate change mitigation and environmental protection policies.',
    status: 'pending',
    responseCount: 156,
    createdDate: new Date('2025-02-20')
  },
  {
    id: '5',
    name: 'Immigration Policy Analysis',
    description: 'Examining various immigration policy frameworks and their effects on economic and social integration.',
    status: 'closed',
    responseCount: 2103,
    createdDate: new Date('2024-12-01')
  }
];
