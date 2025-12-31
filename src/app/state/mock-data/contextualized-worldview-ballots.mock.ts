import { ContextualizedWorldviewBallot } from '../../classes/contextualized-worldview-ballot';
import { TimeframeContext, LocationContext } from '../../classes/terms/contextualized-term';

export const MOCK_CONTEXTUALIZED_WORLDVIEW_BALLOTS: ContextualizedWorldviewBallot[] = [
  new ContextualizedWorldviewBallot({
    id: 'cwb-1',
    competitiveScoreId: 'cs-1',
    voterId: 'voter-1',
    name: 'Labor Quality Per State 2022-2023',
    ballotType: 'labor-quality', // Added to identify ballot type
    personalContexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'State',
        state: 'California',
        country: 'United States'
      }),
      new LocationContext({
        label: 'Nation',
        country: 'United States'
      })
    ],
    contextualizedTermScores: [],
    criticalContexts: []
  }),
  new ContextualizedWorldviewBallot({
    id: 'cwb-2',
    competitiveScoreId: 'cs-2',
    voterId: 'voter-1',
    name: 'Economic Policy Assessment 2022-2023',
    ballotType: 'economic', // Economic ballot type
    personalContexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'State',
        state: 'California',
        country: 'United States'
      }),
      new LocationContext({
        label: 'Nation',
        country: 'United States'
      })
    ],
    contextualizedTermScores: [],
    criticalContexts: []
  }),
  new ContextualizedWorldviewBallot({
    id: 'cwb-3',
    competitiveScoreId: 'cs-3',
    voterId: 'voter-2',
    name: 'Education Reform Analysis 2023-2024',
    personalContexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2024-12-31')
      }),
      new LocationContext({
        label: 'State',
        state: 'New York',
        country: 'United States'
      })
    ],
    contextualizedTermScores: [],
    criticalContexts: []
  }),
  new ContextualizedWorldviewBallot({
    id: 'cwb-4',
    competitiveScoreId: 'cs-4',
    voterId: 'voter-2',
    name: 'Education Reform Analysis 2022-2023',
    personalContexts: [
      new TimeframeContext({
        label: 'Timeframe',
        startDate: new Date('2022-01-01'),
        endDate: new Date('2023-12-31')
      }),
      new LocationContext({
        label: 'State',
        state: 'New York',
        country: 'United States'
      })
    ],
    contextualizedTermScores: [],
    criticalContexts: []
  })
];
