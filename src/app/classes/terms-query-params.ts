export class TermsQueryParams {
  worldviewBallotId?: string;
  competitiveScoringId?: string;

  constructor(data?: { worldviewBallotId?: string; competitiveScoringId?: string }) {
    this.worldviewBallotId = data?.worldviewBallotId;
    this.competitiveScoringId = data?.competitiveScoringId;
  }

  toString(): string {
    const parts: string[] = [];
    if (this.worldviewBallotId) parts.push(`worldviewBallotId: ${this.worldviewBallotId}`);
    if (this.competitiveScoringId) parts.push(`competitiveScoringId: ${this.competitiveScoringId}`);
    return `TermsQueryParams(${parts.join(', ')})`;
  }
}
