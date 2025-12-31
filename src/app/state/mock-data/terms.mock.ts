import { Term } from '../../classes/terms/term';

export interface TermData {
  name: string;
  description: string;
  source: string;
}

export const MOCK_POSITIVE_TERMS: TermData[] = [
  {
    name: 'Labor Quality',
    description: 'Labor quality description...',
    source: 'Link to labor quality source'
  },
  {
    name: 'Competitiveness',
    description: 'Competitiveness description...',
    source: 'Link to competitiveness source'
  }
];

export const MOCK_NEGATIVE_TERMS: TermData[] = [
  {
    name: 'Business Reliability',
    description: 'Business reliability description...',
    source: 'Link to business reliability source'
  }
];

// Mock Terms for API responses
export const MOCK_TERMS: Term[] = [
  new Term({
    id: 'term-1',
    name: 'Labor Quality',
    description: 'Measures the skill level, education, and productivity of the workforce in a given economic system.',
    source: 'https://example.com/labor-quality',
    category: 'economic'
  }),
  new Term({
    id: 'term-2',
    name: 'Competitiveness',
    description: 'The ability of businesses and industries to compete effectively in domestic and international markets.',
    source: 'https://example.com/competitiveness',
    category: 'economic'
  }),
  new Term({
    id: 'term-3',
    name: 'Business Reliability',
    description: 'The consistency and dependability of businesses in delivering goods, services, and meeting commitments.',
    source: 'https://example.com/business-reliability',
    category: 'economic'
  }),
  new Term({
    id: 'term-4',
    name: 'Innovation Rate',
    description: 'The pace at which new ideas, technologies, and processes are developed and implemented.',
    source: 'https://example.com/innovation-rate',
    category: 'economic'
  }),
  new Term({
    id: 'term-5',
    name: 'Market Efficiency',
    description: 'How effectively markets allocate resources and reflect information in prices.',
    source: 'https://example.com/market-efficiency',
    category: 'economic'
  }),
  // Labor Quality Score component terms (from spreadsheet)
  new Term({
    id: 'term-union-participation',
    name: 'Union Participation',
    description: 'Percentage of workforce in labor unions',
    source: 'Bureau of Labor Statistics',
    category: 'labor-quality'
  }),
  new Term({
    id: 'term-labor-force-participation',
    name: 'Labor Force Participation Rate',
    description: 'Percentage of working-age population actively in labor force',
    source: 'Bureau of Labor Statistics',
    category: 'labor-quality'
  }),
  new Term({
    id: 'term-minimum-wage',
    name: 'Minimum Wage',
    description: 'State minimum wage compared to federal minimum',
    source: 'Department of Labor',
    category: 'labor-quality'
  }),
  new Term({
    id: 'term-impoverished-workforce',
    name: 'Impoverished Workforce',
    description: 'Percentage of workers below poverty line (anti-competitive term - inverted in scoring)',
    source: 'Census Bureau',
    category: 'labor-quality'
  })
];
