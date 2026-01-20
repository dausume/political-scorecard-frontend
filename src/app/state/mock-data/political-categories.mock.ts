import { PoliticalCategory } from '../../classes/political-category/political-category';

export const MOCK_POLITICAL_CATEGORIES: PoliticalCategory[] = [
  new PoliticalCategory({
    id: 'cat-economic',
    name: 'Economic Policy',
    description: 'Policies related to taxation, trade, fiscal policy, monetary policy, and economic development.',
    isRoot: true,
    icon: 'account_balance',
    color: '#1976d2'
  }),
  new PoliticalCategory({
    id: 'cat-healthcare',
    name: 'Healthcare',
    description: 'Policies concerning health insurance, medical care access, public health, and pharmaceutical regulations.',
    isRoot: true,
    icon: 'local_hospital',
    color: '#d32f2f'
  }),
  new PoliticalCategory({
    id: 'cat-education',
    name: 'Education',
    description: 'Policies related to public schools, higher education, vocational training, and educational funding.',
    isRoot: true,
    icon: 'school',
    color: '#7b1fa2'
  }),
  new PoliticalCategory({
    id: 'cat-labor',
    name: 'Labor & Employment',
    description: 'Policies concerning worker rights, minimum wage, unions, workplace safety, and employment regulations.',
    isRoot: true,
    icon: 'work',
    color: '#388e3c'
  }),
  new PoliticalCategory({
    id: 'cat-environment',
    name: 'Environmental',
    description: 'Policies related to climate change, pollution control, conservation, and renewable energy.',
    isRoot: true,
    icon: 'eco',
    color: '#2e7d32'
  }),
  new PoliticalCategory({
    id: 'cat-social-justice',
    name: 'Social Justice',
    description: 'Policies addressing civil rights, equality, discrimination, and social equity.',
    isRoot: true,
    icon: 'balance',
    color: '#f57c00'
  }),
  new PoliticalCategory({
    id: 'cat-infrastructure',
    name: 'Infrastructure',
    description: 'Policies concerning transportation, utilities, public works, and broadband access.',
    isRoot: true,
    icon: 'construction',
    color: '#5d4037'
  }),
  new PoliticalCategory({
    id: 'cat-public-safety',
    name: 'Public Safety',
    description: 'Policies related to law enforcement, criminal justice, emergency services, and community safety.',
    isRoot: true,
    icon: 'security',
    color: '#455a64'
  }),
  new PoliticalCategory({
    id: 'cat-government',
    name: 'Government Operations',
    description: 'Policies concerning government efficiency, transparency, elections, and administrative procedures.',
    isRoot: true,
    icon: 'account_balance_wallet',
    color: '#616161'
  }),
  new PoliticalCategory({
    id: 'cat-housing',
    name: 'Housing',
    description: 'Policies related to affordable housing, rent control, zoning, and homelessness.',
    isRoot: true,
    icon: 'home',
    color: '#00796b'
  }),
  new PoliticalCategory({
    id: 'cat-technology',
    name: 'Technology',
    description: 'Policies concerning data privacy, AI regulation, cybersecurity, and digital infrastructure.',
    isRoot: true,
    icon: 'computer',
    color: '#0097a7'
  }),
  new PoliticalCategory({
    id: 'cat-foreign-policy',
    name: 'Foreign Policy',
    description: 'Policies related to international relations, diplomacy, defense, and global trade agreements.',
    isRoot: true,
    icon: 'public',
    color: '#512da8'
  }),
  new PoliticalCategory({
    id: 'cat-immigration',
    name: 'Immigration',
    description: 'Policies concerning border security, refugee programs, visa policies, and citizenship pathways.',
    isRoot: true,
    icon: 'flight_land',
    color: '#c2185b'
  }),
  new PoliticalCategory({
    id: 'cat-agriculture',
    name: 'Agriculture',
    description: 'Policies related to farming subsidies, food safety, rural development, and agricultural trade.',
    isRoot: true,
    icon: 'agriculture',
    color: '#689f38'
  }),
  new PoliticalCategory({
    id: 'cat-energy',
    name: 'Energy',
    description: 'Policies concerning energy production, fossil fuels, renewable energy, and grid modernization.',
    isRoot: true,
    icon: 'bolt',
    color: '#ffa000'
  }),
  new PoliticalCategory({
    id: 'cat-veterans',
    name: 'Veterans Affairs',
    description: 'Policies related to veteran healthcare, benefits, employment, and support services.',
    isRoot: true,
    icon: 'military_tech',
    color: '#303f9f'
  }),
  new PoliticalCategory({
    id: 'cat-corruption',
    name: 'Corruption',
    description: 'Policies addressing government corruption, bribery, ethics violations, lobbying reform, and accountability measures.',
    isRoot: true,
    icon: 'report_problem',
    color: '#b71c1c'
  }),
  new PoliticalCategory({
    id: 'cat-social-welfare',
    name: 'Social Welfare',
    description: 'Policies concerning social safety nets, poverty assistance, disability support, unemployment benefits, and community services.',
    isRoot: true,
    icon: 'volunteer_activism',
    color: '#e91e63'
  })
];
