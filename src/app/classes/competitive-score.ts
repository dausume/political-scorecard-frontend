import { Term } from './terms/term';

export type TermSentiment = 'positive' | 'negative';

export interface TermRating {
  termId: string;
  sentiment: TermSentiment;
}

export class CompetitiveScore {
  id: string;
  name: string;
  description: string;
  termRatings: TermRating[];

  constructor(data: {
    id: string;
    name: string;
    description: string;
    termRatings: TermRating[];
  }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.termRatings = data.termRatings;
  }

  getPositiveTermIds(): string[] {
    return this.termRatings
      .filter(tr => tr.sentiment === 'positive')
      .map(tr => tr.termId);
  }

  getNegativeTermIds(): string[] {
    return this.termRatings
      .filter(tr => tr.sentiment === 'negative')
      .map(tr => tr.termId);
  }

  getTermSentiment(termId: string): TermSentiment | undefined {
    return this.termRatings.find(tr => tr.termId === termId)?.sentiment;
  }

  toString(): string {
    return `CompetitiveScore(id: ${this.id}, name: "${this.name}", termRatings: ${this.termRatings.length})`;
  }
}

export interface TermScore {
  termId: string;
  weight: number; // Weight in [0, 1] range
}

export class VoterCompetitiveScore {
  competitiveScoreId: string;
  voterId: string;
  termScores: TermScore[];

  constructor(data: {
    competitiveScoreId: string;
    voterId: string;
    termScores: TermScore[];
  }) {
    this.competitiveScoreId = data.competitiveScoreId;
    this.voterId = data.voterId;
    this.termScores = data.termScores;
  }

  getWeightedScore(competitiveScore: CompetitiveScore): number {
    let score = 0;
    for (const termScore of this.termScores) {
      const sentiment = competitiveScore.getTermSentiment(termScore.termId);
      if (sentiment === 'positive') {
        score += termScore.weight;
      } else if (sentiment === 'negative') {
        score -= termScore.weight;
      }
    }
    return score;
  }

  getTermWeight(termId: string): number {
    return this.termScores.find(ts => ts.termId === termId)?.weight ?? 0;
  }

  toString(): string {
    return `VoterCompetitiveScore(competitiveScoreId: ${this.competitiveScoreId}, voterId: ${this.voterId}, termScores: ${this.termScores.length})`;
  }
}
