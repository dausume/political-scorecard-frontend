import { Term } from './term';

/**
 * Represents a term with user-assigned weight for a specific worldview ballot.
 * This tracks how much importance a user gives to this term in their scoring.
 */
export class WeightedWorldviewTerm {
  id: string;
  term: Term;
  weight: number; // 0.0 to 1.0 scale
  worldviewBallotId: string;
  isPositive: boolean; // true for positive contribution, false for negative

  constructor(data: {
    id: string;
    term: Term;
    weight?: number;
    worldviewBallotId: string;
    isPositive: boolean;
  }) {
    this.id = data.id;
    this.term = data.term;
    this.weight = data.weight ?? 0.5; // Default to 0.5 (middle weight)
    this.worldviewBallotId = data.worldviewBallotId;
    this.isPositive = data.isPositive;
  }

  /**
   * Update the weight for this term
   * @param newWeight - Value between 0.0 and 1.0
   */
  updateWeight(newWeight: number): void {
    this.weight = Math.max(0, Math.min(1, newWeight));
  }

  /**
   * Get weight as a percentage (0-100)
   */
  getWeightPercentage(): number {
    return Math.round(this.weight * 100);
  }

  /**
   * Set weight from percentage (0-100)
   */
  setWeightFromPercentage(percentage: number): void {
    this.weight = Math.max(0, Math.min(100, percentage)) / 100;
  }

  toString(): string {
    return `WeightedWorldviewTerm(id: ${this.id}, term: ${this.term.name}, weight: ${this.weight.toFixed(2)}, ballot: ${this.worldviewBallotId}, ${this.isPositive ? 'positive' : 'negative'})`;
  }
}
