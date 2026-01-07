import { CompetitiveScore, TermScore } from './competitive-score';
import { ContextualizedTerm, TermContext } from './terms/contextualized-term';

export interface CriticalContext {
  id: string;
  name: string;
  description: string;
  contextVariations: TermContext[];
}

export interface ContextualizedTermScore {
  contextualizedTermId: string;
  weight: number; // Weight in [0, 1] range
}

export class ContextualizedWorldviewBallot {
  id: string;
  electionId: string;
  competitiveScoreId: string;
  voterId: string;
  name: string;
  ballotType?: string; // Optional field to categorize the ballot (e.g., 'labor-quality', 'economic', etc.)
  // User-defined contexts for this worldview ballot
  personalContexts: TermContext[];
  // Scores assigned to specific contextualized terms, that the user has chosen to load and view.
  contextualizedTermScores: ContextualizedTermScore[];
  // Contexts that are foundationally impacted significantly and differentially from general scoring, suggested
  // by the system for the user to consider.
  criticalContexts: CriticalContext[];

  constructor(data: {
    id: string;
    electionId: string;
    competitiveScoreId: string;
    voterId: string;
    name: string;
    ballotType?: string;
    personalContexts: TermContext[];
    contextualizedTermScores: ContextualizedTermScore[];
    criticalContexts?: CriticalContext[];
  }) {
    this.id = data.id;
    this.electionId = data.electionId;
    this.competitiveScoreId = data.competitiveScoreId;
    this.voterId = data.voterId;
    this.name = data.name;
    this.ballotType = data.ballotType;
    this.personalContexts = data.personalContexts;
    this.contextualizedTermScores = data.contextualizedTermScores;
    this.criticalContexts = data.criticalContexts ?? [];
  }

  getContextualizedTermWeight(contextualizedTermId: string): number {
    return this.contextualizedTermScores.find(
      cts => cts.contextualizedTermId === contextualizedTermId
    )?.weight ?? 0;
  }

  calculateWeightedScore(
    competitiveScore: CompetitiveScore,
    contextualizedTerms: ContextualizedTerm[]
  ): number {
    let score = 0;

    for (const ctScore of this.contextualizedTermScores) {
      const contextualizedTerm = contextualizedTerms.find(
        ct => ct.id === ctScore.contextualizedTermId
      );

      if (!contextualizedTerm) continue;

      const sentiment = competitiveScore.getTermSentiment(contextualizedTerm.term.id);
      const normalizedValue = contextualizedTerm.postNormalizedValue;
      const weight = ctScore.weight;

      if (sentiment === 'positive') {
        score += normalizedValue * weight;
      } else if (sentiment === 'negative') {
        score -= normalizedValue * weight;
      }
    }

    return score;
  }

  calculateCriticalContextScore(
    criticalContext: CriticalContext,
    competitiveScore: CompetitiveScore,
    contextualizedTermsByContext: Map<string, ContextualizedTerm[]>
  ): Map<string, number> {
    const scores = new Map<string, number>();

    for (const contextVariation of criticalContext.contextVariations) {
      const contextKey = contextVariation.getValue();
      const contextualizedTerms = contextualizedTermsByContext.get(contextKey) ?? [];
      const score = this.calculateWeightedScore(competitiveScore, contextualizedTerms);
      scores.set(contextKey, score);
    }

    return scores;
  }

  getPersonalContextSummary(): string {
    return this.personalContexts
      .map(c => `${c.label}: ${c.getValue()}`)
      .join(' | ');
  }

  toString(): string {
    return `ContextualizedWorldviewBallot(id: ${this.id}, name: "${this.name}", voter: ${this.voterId}, contexts: ${this.personalContexts.length}, scores: ${this.contextualizedTermScores.length})`;
  }
}
