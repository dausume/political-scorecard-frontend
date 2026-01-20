export type CategoryPriority = 'high' | 'normal' | 'low';

export class PoliticalCategory {
  id: string;
  name: string;
  description: string;
  isRoot: boolean;
  parentCategories: string[];
  icon?: string;
  color?: string;

  constructor(data: {
    id: string;
    name: string;
    description: string;
    isRoot?: boolean;
    parentCategories?: string[];
    icon?: string;
    color?: string;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.description = data.description;
    this.isRoot = data.isRoot ?? true;
    this.parentCategories = data.parentCategories ?? [];
    this.icon = data.icon;
    this.color = data.color;
  }

  toString(): string {
    return `PoliticalCategory(id: ${this.id}, name: "${this.name}")`;
  }
}

export interface UserCategoryPreference {
  categoryId: string;
  priority: CategoryPriority;
}
