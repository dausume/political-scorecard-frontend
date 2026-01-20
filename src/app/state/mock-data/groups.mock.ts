import { Group } from '../../classes/group/group';

export const MOCK_POLITICAL_GROUPS: Group[] = [
  new Group({
    id: 'pg-pirate-party',
    name: 'Pirate Party',
    description: 'Advocating for digital rights, privacy, transparency, freedom of information, and reform of copyright and patent laws.',
    pscType: 'Political-Group',
    memberCount: 850,
    icon: 'sailing',
    color: '#7b1fa2',
    categories: ['Technology', 'Government Operations', 'Corruption', 'Social Justice']
  }),
  new Group({
    id: 'pg-transhumanist-party',
    name: 'Transhumanist Party',
    description: 'Promoting the ethical use of technology to expand human capabilities, longevity research, and science-based policy making.',
    pscType: 'Political-Group',
    memberCount: 620,
    icon: 'psychology',
    color: '#00bcd4',
    categories: ['Technology', 'Healthcare', 'Education', 'Environmental']
  })
];

export const MOCK_PROFESSIONAL_GROUPS: Group[] = [
  new Group({
    id: 'prof-economists',
    name: 'Policy Economists Association',
    description: 'Professional economists analyzing economic impacts of proposed policies.',
    pscType: 'Professional-Group',
    memberCount: 450,
    icon: 'insights',
    color: '#1976d2',
    categories: ['Economic Policy', 'Labor & Employment']
  }),
  new Group({
    id: 'prof-healthcare',
    name: 'Healthcare Policy Professionals',
    description: 'Medical professionals and health policy experts evaluating healthcare legislation.',
    pscType: 'Professional-Group',
    memberCount: 780,
    icon: 'medical_services',
    color: '#d32f2f',
    categories: ['Healthcare', 'Social Welfare']
  }),
  new Group({
    id: 'prof-legal',
    name: 'Legal Policy Review Board',
    description: 'Attorneys and legal scholars analyzing constitutional and legal implications of policies.',
    pscType: 'Professional-Group',
    memberCount: 320,
    icon: 'gavel',
    color: '#5d4037',
    categories: ['Government Operations', 'Social Justice', 'Corruption']
  }),
  new Group({
    id: 'prof-educators',
    name: 'Education Policy Institute',
    description: 'Educators and administrators providing expertise on education policy proposals.',
    pscType: 'Professional-Group',
    memberCount: 620,
    icon: 'school',
    color: '#7b1fa2',
    categories: ['Education']
  }),
  new Group({
    id: 'prof-engineers',
    name: 'Infrastructure Engineers Council',
    description: 'Civil engineers and urban planners evaluating infrastructure and development policies.',
    pscType: 'Professional-Group',
    memberCount: 290,
    icon: 'construction',
    color: '#ff9800',
    categories: ['Infrastructure', 'Housing', 'Environmental']
  }),
  new Group({
    id: 'prof-tech',
    name: 'Technology Policy Advisors',
    description: 'Tech industry professionals advising on digital policy, privacy, and cybersecurity.',
    pscType: 'Professional-Group',
    memberCount: 410,
    icon: 'computer',
    color: '#0097a7',
    categories: ['Technology', 'Government Operations']
  }),
  new Group({
    id: 'prof-environmental',
    name: 'Environmental Scientists Coalition',
    description: 'Climate scientists and environmental researchers providing evidence-based policy analysis.',
    pscType: 'Professional-Group',
    memberCount: 550,
    icon: 'science',
    color: '#388e3c',
    categories: ['Environmental', 'Energy', 'Agriculture']
  })
];

export const MOCK_ALL_GROUPS: Group[] = [...MOCK_POLITICAL_GROUPS, ...MOCK_PROFESSIONAL_GROUPS];
