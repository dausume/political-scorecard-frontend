export class Term {
  id: string;
  name: string;
  description: string;
  source: string;
  category?: string; // Optional field to categorize terms (e.g., 'labor-quality', 'economic', etc.)

  constructor(data: { id: string; name: string; description: string; source: string; category?: string }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.source = data.source;
    this.category = data.category;
  }

  toString(): string {
    return `Term(id: ${this.id}, name: "${this.name}", description: "${this.description}", source: "${this.source}")`;
  }
}
