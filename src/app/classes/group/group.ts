export type PscGroupType = 'Political-Group' | 'Professional-Group';

export class Group {
  id: string;
  name: string;
  description: string;
  pscType: PscGroupType;
  memberCount?: number;
  icon?: string;
  color?: string;
  createdAt?: Date;
  categories?: string[]; // Political categories this group focuses on

  constructor(data: {
    id: string;
    name: string;
    description: string;
    pscType: PscGroupType;
    memberCount?: number;
    icon?: string;
    color?: string;
    createdAt?: Date;
    categories?: string[];
  }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.pscType = data.pscType;
    this.memberCount = data.memberCount;
    this.icon = data.icon;
    this.color = data.color;
    this.createdAt = data.createdAt;
    this.categories = data.categories;
  }

  toString(): string {
    return `Group(id: ${this.id}, name: "${this.name}", type: ${this.pscType})`;
  }
}
