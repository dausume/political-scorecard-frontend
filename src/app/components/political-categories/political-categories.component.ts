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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PoliticalCategory, CategoryPriority, UserCategoryPreference } from '../../classes/political-category/political-category';
import { PolariScoringService } from '../../services/polari/polari-scoring.service';
import { ScoreConceptSummary } from '../../models/polari-scoring/polari-scoring-types';

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
    MatBadgeModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './political-categories.component.html',
  styleUrl: './political-categories.component.scss'
})
export class PoliticalCategoriesComponent implements OnInit {
  categories: PoliticalCategory[] = [];
  preferences: Map<string, CategoryPriority> = new Map();
  searchQuery: string = '';
  activeFilter: 'all' | 'high' | 'normal' | 'low' = 'all';

  /** 2026-07-14 (Democratic Scorecard revamp): categories are now
   *  Polari ScoreConcepts, live from Polari's scoring engine, not
   *  MOCK_POLITICAL_CATEGORIES. See DEMOCRATIC_SCORECARD_REVAMP_PLAN.md. */
  loading = false;
  error: string | null = null;

  constructor(private polariScoring: PolariScoringService) {}

  ngOnInit(): void {
    this.loadPreferences();
    this.loadCategories();
  }

  private loadCategories(): void {
    this.loading = true;
    this.error = null;
    this.polariScoring.getConcepts().subscribe({
      next: (concepts) => {
        this.categories = concepts.map(c => this.toPoliticalCategory(c));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not reach Polari’s scoring engine — '
          + (err?.message || 'unknown error');
        this.categories = [];
        this.loading = false;
      },
    });
  }

  /** ScoreConcept → PoliticalCategory. `parentCategories` is left empty:
   *  Polari's nesting is parent-knows-children (a concept's own
   *  term_weights_json can reference a child concept), not child-knows-
   *  parents, so there's no direct field to read a concept's parents
   *  from without scanning every OTHER concept's term list — not worth
   *  doing until a real page needs the hierarchy rendered as a tree. */
  private toPoliticalCategory(concept: ScoreConceptSummary): PoliticalCategory {
    return new PoliticalCategory({
      id: concept.name,
      name: concept.displayName || concept.name,
      description: concept.description,
      isRoot: true,
      parentCategories: [],
      // Polari's ScoreConcept carries no icon/color — mock data had a
      // hand-picked one per category; a neutral shared default here is
      // honest (no per-concept metadata exists yet) rather than a
      // guessed name→icon mapping that would silently misrepresent
      // concepts it doesn't recognize.
      icon: 'topic',
      color: '#5c6bc0',
    });
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
