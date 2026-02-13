export interface LegislationDTO {
  id: string;
  title: string;
  description: string;
  legislativeBodyId: string;
  validFromDate: string;
  validToDate: string;
  legislationText: string;
  url: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'LOCKED';
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface LegislationAnnotationDTO {
  id: string;
  legislationId: string;
  userId: string;
  groupId: string;
  annotationType: 'SCORING' | 'SOLUTION' | 'INTENT';
  bodyJson: string;
  targetJson: string;
  createdAt: string;
  updatedAt: string;
}

export interface ScoringAnnotationBody {
  type: 'SCORING';
  electionId?: string;
  electionName?: string;
  ballotId?: string;
}

export interface SolutionAnnotationBody {
  type: 'SOLUTION';
  title: string;
  description: string;
}

export interface IntentAnnotationBody {
  type: 'INTENT';
  categoryId: string;
  categoryName: string;
  groupId: string;
  groupName: string;
  sentiment: 'GOOD' | 'BAD' | 'NEUTRAL';
}

export type AnnotationBody = ScoringAnnotationBody | SolutionAnnotationBody | IntentAnnotationBody;

export interface AnnotationSelection {
  key: string;
  exact: string;
  prefix: string;
  suffix: string;
  annotations: LegislationAnnotationDTO[];
}
