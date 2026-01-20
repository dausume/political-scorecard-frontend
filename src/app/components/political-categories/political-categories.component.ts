import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { PoliticalCategory, CategoryPriority, UserCategoryPreference } from '../../classes/political-category/political-category';
import { MOCK_POLITICAL_CATEGORIES } from '../../state/mock-data/political-categories.mock';

const STORAGE_KEY = 'political-category-preferences';

@Component({
  selector: 'app-political-categories',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatTooltipModule,
    MatFormFieldModule,
    MatInputModule,
    MatTabsModule,
    MatBadgeModule
  ],
  templateUrl: './political-categories.component.html',
  styleUrl: './political-categories.component.scss'
})
export class PoliticalCategoriesComponent implements OnInit {
  categories: PoliticalCategory[] = [];
  preferences: Map<string, CategoryPriority> = new Map();
  searchQuery: string = '';
  activeFilter: 'all' | 'high' | 'normal' | 'low' = 'all';

  ngOnInit(): void {
    this.categories = MOCK_POLITICAL_CATEGORIES;
    this.loadPreferences();
  }

  private loadPreferences(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const prefs: UserCategoryPreference[] = JSON.parse(stored);
        prefs.forEach(p => this.preferences.set(p.categoryId, p.priority));
      }
    } catch (e) {
      console.warn('Failed to load category preferences:', e);
    }
  }

  private savePreferences(): void {
    try {
      const prefs: UserCategoryPreference[] = [];
      this.preferences.forEach((priority, categoryId) => {
        prefs.push({ categoryId, priority });
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) {
      console.warn('Failed to save category preferences:', e);
    }
  }

  getPriority(categoryId: string): CategoryPriority {
    return this.preferences.get(categoryId) || 'normal';
  }

  setPriority(categoryId: string, priority: CategoryPriority): void {
    if (priority === 'normal') {
      this.preferences.delete(categoryId);
    } else {
      this.preferences.set(categoryId, priority);
    }
    this.savePreferences();
  }

  cyclePriority(categoryId: string): void {
    const current = this.getPriority(categoryId);
    const next: CategoryPriority = current === 'normal' ? 'high' : current === 'high' ? 'low' : 'normal';
    this.setPriority(categoryId, next);
  }

  get filteredCategories(): PoliticalCategory[] {
    let result = this.categories;

    // Filter by search query
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(cat =>
        cat.name.toLowerCase().includes(query) ||
        cat.description.toLowerCase().includes(query)
      );
    }

    // Filter by priority
    if (this.activeFilter !== 'all') {
      result = result.filter(cat => this.getPriority(cat.id) === this.activeFilter);
    }

    // Sort: high priority first, then normal, then low
    return result.sort((a, b) => {
      const priorityOrder = { high: 0, normal: 1, low: 2 };
      return priorityOrder[this.getPriority(a.id)] - priorityOrder[this.getPriority(b.id)];
    });
  }

  get prioritizedCount(): number {
    return this.categories.filter(cat => this.getPriority(cat.id) === 'high').length;
  }

  get deprioritizedCount(): number {
    return this.categories.filter(cat => this.getPriority(cat.id) === 'low').length;
  }

  setFilter(filter: 'all' | 'high' | 'normal' | 'low'): void {
    this.activeFilter = filter;
  }

  getPriorityIcon(priority: CategoryPriority): string {
    switch (priority) {
      case 'high': return 'star';
      case 'low': return 'star_border';
      default: return 'star_half';
    }
  }

  getPriorityLabel(priority: CategoryPriority): string {
    switch (priority) {
      case 'high': return 'Prioritized';
      case 'low': return 'De-prioritized';
      default: return 'Normal';
    }
  }

  resetAllPreferences(): void {
    this.preferences.clear();
    this.savePreferences();
  }
}
