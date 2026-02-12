import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Renderer2, AfterViewChecked } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { Store, ActionsSubject } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';
import { AppState } from '../../../state/app.state';
import { LegislationActions } from '../../../state/actions/legislation.actions';
import { selectLegislationById, selectLegislationAnnotations } from '../../../state/selectors/legislation.selectors';
import { selectAuthUser } from '../../../state/selectors/auth.selectors';
import { AuthUser } from '../../../classes/auth-user';
import { LegislationDTO, LegislationAnnotationDTO, AnnotationBody } from '../../../models/legislation.model';
import { WorldviewElectionsApiService, WorldviewElectionDTO } from '../../../services/api/worldview-elections-api.service';
import { AuthSessionService } from '../../../services/auth/auth-session.service';
import { MOCK_POLITICAL_CATEGORIES } from '../../../state/mock-data/political-categories.mock';
import { MOCK_ALL_GROUPS } from '../../../state/mock-data/groups.mock';
import { PoliticalCategory } from '../../../classes/political-category/political-category';
import { Group } from '../../../classes/group/group';

@Component({
  selector: 'app-legislation-annotator',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSidenavModule,
    MatListModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
    MatButtonToggleModule
  ],
  template: `
    <mat-sidenav-container class="annotator-container">
      <mat-sidenav mode="side" opened position="end" class="annotation-sidebar">
        <div class="sidebar-header">
          <h3>Annotations</h3>
          <span class="annotation-count">{{ annotations.length }}</span>
        </div>

        <!-- Sign-in prompt when not authenticated -->
        <div class="auth-prompt" *ngIf="!isAuthenticated">
          <mat-card class="auth-prompt-card">
            <mat-card-content>
              <mat-icon class="auth-icon">lock</mat-icon>
              <p>Sign in to create and manage annotations on this legislation.</p>
              <button mat-raised-button color="primary" (click)="signIn()">
                <mat-icon>login</mat-icon> Sign In
              </button>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- New annotation form (only when authenticated and text selected) -->
        <div class="new-annotation" *ngIf="isAuthenticated && selectedText">
          <mat-card class="new-annotation-card">
            <mat-card-header>
              <mat-card-title>New Annotation</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="selected-text-preview">"{{ selectedText }}"</p>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Type</mat-label>
                <mat-select [(ngModel)]="newAnnotationType">
                  <mat-option value="SCORING">Scoring</mat-option>
                  <mat-option value="SOLUTION">Solution</mat-option>
                  <mat-option value="INTENT">Intent</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- SCORING fields -->
              <ng-container *ngIf="newAnnotationType === 'SCORING'">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Election</mat-label>
                  <mat-select [(ngModel)]="scoringElectionId">
                    <mat-option *ngFor="let election of elections" [value]="election.id">
                      {{ election.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Ballot ID (optional)</mat-label>
                  <input matInput [(ngModel)]="scoringBallotId">
                </mat-form-field>
              </ng-container>

              <!-- SOLUTION fields -->
              <ng-container *ngIf="newAnnotationType === 'SOLUTION'">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Title</mat-label>
                  <input matInput [(ngModel)]="solutionTitle">
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Description</mat-label>
                  <textarea matInput [(ngModel)]="solutionDescription" rows="3"></textarea>
                </mat-form-field>
              </ng-container>

              <!-- INTENT fields -->
              <ng-container *ngIf="newAnnotationType === 'INTENT'">
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Category</mat-label>
                  <mat-select [(ngModel)]="intentCategoryId">
                    <mat-option *ngFor="let cat of categories" [value]="cat.id">
                      {{ cat.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Group</mat-label>
                  <mat-select [(ngModel)]="intentGroupId">
                    <mat-option *ngFor="let group of groups" [value]="group.id">
                      {{ group.name }}
                    </mat-option>
                  </mat-select>
                </mat-form-field>
                <div class="sentiment-toggle">
                  <label class="sentiment-label">Sentiment</label>
                  <mat-button-toggle-group [(ngModel)]="intentSentiment">
                    <mat-button-toggle value="GOOD">Good</mat-button-toggle>
                    <mat-button-toggle value="BAD">Bad</mat-button-toggle>
                    <mat-button-toggle value="NEUTRAL">Neutral</mat-button-toggle>
                  </mat-button-toggle-group>
                </div>
              </ng-container>
            </mat-card-content>
            <mat-card-actions>
              <button mat-button (click)="clearSelection()">Cancel</button>
              <button mat-raised-button color="primary" (click)="saveAnnotation()">Save</button>
            </mat-card-actions>
          </mat-card>
        </div>

        <mat-divider></mat-divider>

        <mat-list>
          <mat-list-item *ngFor="let annotation of annotations"
                         class="annotation-item"
                         [class.active]="activeAnnotationId === annotation.id"
                         [attr.data-sidebar-annotation-id]="annotation.id"
                         (click)="onSidebarAnnotationClick(annotation.id)">
            <div class="annotation-content">
              <div class="annotation-header">
                <span class="annotation-type-chip" [class]="'type-' + annotation.annotationType.toLowerCase()">
                  {{ annotation.annotationType }}
                </span>
                <button mat-icon-button *ngIf="isAuthenticated" (click)="deleteAnnotation(annotation.id); $event.stopPropagation()">
                  <mat-icon>delete</mat-icon>
                </button>
              </div>
              <p class="annotation-summary">{{ getAnnotationSummary(annotation) }}</p>
              <p class="annotation-quote">"{{ getAnnotationQuote(annotation) }}"</p>
              <span class="annotation-date">{{ annotation.createdAt }}</span>
            </div>
          </mat-list-item>
        </mat-list>

        <div *ngIf="annotations.length === 0" class="empty-annotations">
          <p *ngIf="isAuthenticated">No annotations yet. Select text in the document to create one.</p>
          <p *ngIf="!isAuthenticated">No annotations yet.</p>
        </div>
      </mat-sidenav>

      <mat-sidenav-content class="main-content">
        <div class="header">
          <button mat-icon-button (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
          </button>
          <h1>{{ legislation?.title || 'Loading...' }}</h1>
          <span class="status-chip" *ngIf="legislation" [class]="'status-' + legislation.status.toLowerCase()">
            {{ legislation.status }}
          </span>
        </div>

        <mat-card class="document-card">
          <mat-card-content>
            <div #documentContent
                 class="legislation-content"
                 [innerHTML]="highlightedHtml"
                 (mouseup)="onTextSelected()">
            </div>
          </mat-card-content>
        </mat-card>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .annotator-container { height: calc(100vh - 64px); }
    .annotation-sidebar { width: 360px; padding: 16px; }
    .sidebar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
    .sidebar-header h3 { margin: 0; }
    .annotation-count { background: #e0e0e0; border-radius: 12px; padding: 2px 8px; font-size: 12px; }
    .main-content { padding: 24px; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .header h1 { margin: 0; flex: 1; }
    .status-chip { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; text-transform: uppercase; }
    .status-draft { background: #e3f2fd; color: #1565c0; }
    .status-submitted { background: #fff3e0; color: #e65100; }
    .status-approved { background: #e8f5e9; color: #2e7d32; }
    .status-locked { background: #fce4ec; color: #c62828; }
    .document-card { max-width: 800px; }
    .legislation-content { padding: 16px; min-height: 400px; line-height: 1.6; cursor: text; user-select: text; }
    .full-width { width: 100%; }
    .new-annotation-card { margin-bottom: 16px; }
    .selected-text-preview { font-style: italic; color: #666; font-size: 13px; border-left: 3px solid #1976d2; padding-left: 8px; }
    .sentiment-toggle { margin-bottom: 16px; }
    .sentiment-label { display: block; font-size: 12px; color: #666; margin-bottom: 8px; }
    .annotation-item { height: auto !important; margin-bottom: 8px; cursor: pointer; }
    .annotation-item.active { background: #f5f5f5; }
    .annotation-content { width: 100%; padding: 8px 0; }
    .annotation-header { display: flex; justify-content: space-between; align-items: center; }
    .annotation-type-chip { padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 500; text-transform: uppercase; }
    .type-scoring { background: #e3f2fd; color: #1565c0; }
    .type-solution { background: #f3e5f5; color: #7b1fa2; }
    .type-intent { background: #e8f5e9; color: #2e7d32; }
    .annotation-summary { margin: 4px 0; font-size: 13px; font-weight: 500; }
    .annotation-quote { margin: 2px 0; font-size: 12px; font-style: italic; color: #666; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 300px; }
    .annotation-date { font-size: 11px; color: #999; }
    .empty-annotations { padding: 24px; text-align: center; color: #999; }
    .auth-prompt { margin-bottom: 16px; }
    .auth-prompt-card { text-align: center; }
    .auth-prompt-card mat-card-content { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 16px; }
    .auth-icon { font-size: 36px; height: 36px; width: 36px; color: #9e9e9e; }
    .auth-prompt-card p { margin: 0; color: #666; font-size: 14px; }
  `]
})
export class LegislationAnnotatorComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('documentContent') documentContent!: ElementRef;

  legislation: LegislationDTO | null = null;
  annotations: LegislationAnnotationDTO[] = [];
  isAuthenticated = false;
  currentUser: AuthUser | null = null;
  selectedText = '';
  newAnnotationType: 'SCORING' | 'SOLUTION' | 'INTENT' = 'SCORING';
  activeAnnotationId: string | null = null;
  highlightedHtml = '<p>No content.</p>';

  // SCORING form fields
  elections: WorldviewElectionDTO[] = [];
  scoringElectionId = '';
  scoringBallotId = '';

  // SOLUTION form fields
  solutionTitle = '';
  solutionDescription = '';

  // INTENT form fields
  categories: PoliticalCategory[] = MOCK_POLITICAL_CATEGORIES;
  groups: Group[] = MOCK_ALL_GROUPS;
  intentCategoryId = '';
  intentGroupId = '';
  intentSentiment: 'GOOD' | 'BAD' | 'NEUTRAL' = 'NEUTRAL';

  private legislationId = '';
  private selectionPrefix = '';
  private selectionSuffix = '';
  private destroy$ = new Subject<void>();
  private highlightListeners: (() => void)[] = [];
  private needsHighlightListenerSetup = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private snackBar: MatSnackBar,
    private renderer: Renderer2,
    private electionsApi: WorldviewElectionsApiService,
    private actionsSubject: ActionsSubject,
    private authSession: AuthSessionService
  ) {}

  ngOnInit(): void {
    this.legislationId = this.route.snapshot.paramMap.get('id') || '';

    // Track auth state and user
    this.store.select(selectAuthUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        const wasAuthenticated = this.isAuthenticated;
        this.currentUser = user;
        this.isAuthenticated = !!user;
        // Load annotations and elections once we know we're authenticated
        if (this.isAuthenticated && !wasAuthenticated) {
          this.store.dispatch(LegislationActions.loadAnnotations({ legislationId: this.legislationId }));
          this.electionsApi.getAllElections()
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (elections) => this.elections = elections.filter(e => e.status === 'ACTIVE'),
              error: () => this.elections = []
            });
        }
      });

    this.store.select(selectLegislationById(this.legislationId))
      .pipe(takeUntil(this.destroy$))
      .subscribe(legislation => {
        if (legislation) {
          this.legislation = legislation;
          this.renderHighlights();
        }
      });

    this.store.select(selectLegislationAnnotations)
      .pipe(takeUntil(this.destroy$))
      .subscribe(annotations => {
        this.annotations = annotations;
        this.renderHighlights();
      });

    this.store.dispatch(LegislationActions.loadLegislation({ id: this.legislationId }));
  }

  ngAfterViewChecked(): void {
    if (this.needsHighlightListenerSetup && this.documentContent) {
      this.setupHighlightListeners();
      this.needsHighlightListenerSetup = false;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanupHighlightListeners();
  }

  goBack(): void {
    this.router.navigate(['/policy-scoring', this.legislationId]);
  }

  signIn(): void {
    this.authSession.login();
  }

  onTextSelected(): void {
    if (!this.isAuthenticated) return;
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      this.selectedText = selection.toString().trim();

      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer.textContent || '';
      const startOffset = range.startOffset;
      const endOffset = range.endOffset;
      this.selectionPrefix = container.substring(Math.max(0, startOffset - 32), startOffset);
      this.selectionSuffix = container.substring(endOffset, Math.min(container.length, endOffset + 32));
    }
  }

  clearSelection(): void {
    this.selectedText = '';
    this.newAnnotationType = 'SCORING';
    this.scoringElectionId = '';
    this.scoringBallotId = '';
    this.solutionTitle = '';
    this.solutionDescription = '';
    this.intentCategoryId = '';
    this.intentGroupId = '';
    this.intentSentiment = 'NEUTRAL';
    window.getSelection()?.removeAllRanges();
  }

  saveAnnotation(): void {
    if (!this.selectedText) return;

    if (this.checkOverlap(this.selectedText)) {
      this.snackBar.open('Annotations cannot overlap. Please select non-annotated text.', 'Close', { duration: 4000 });
      return;
    }

    const body = this.buildAnnotationBody();
    if (!body) return;

    const target = {
      selector: {
        type: 'TextQuoteSelector',
        exact: this.selectedText,
        prefix: this.selectionPrefix,
        suffix: this.selectionSuffix,
      }
    };

    // Listen for success or failure before showing feedback
    this.actionsSubject.pipe(
      filter((action: any) =>
        action.type === LegislationActions.createAnnotationSuccess.type ||
        action.type === LegislationActions.createAnnotationFailure.type
      ),
      take(1),
      takeUntil(this.destroy$)
    ).subscribe((action: any) => {
      if (action.type === LegislationActions.createAnnotationSuccess.type) {
        this.snackBar.open('Annotation saved', 'Close', { duration: 2000 });
      } else {
        this.snackBar.open('Failed to save annotation: ' + (action.error || 'Unknown error'), 'Close', { duration: 4000 });
      }
    });

    this.store.dispatch(LegislationActions.createAnnotation({
      legislationId: this.legislationId,
      annotation: {
        legislationId: this.legislationId,
        userId: this.currentUser?.id || '',
        annotationType: this.newAnnotationType,
        bodyJson: JSON.stringify(body),
        targetJson: JSON.stringify(target),
      }
    }));

    this.clearSelection();
  }

  deleteAnnotation(annotationId: string): void {
    this.store.dispatch(LegislationActions.deleteAnnotation({
      legislationId: this.legislationId,
      annotationId
    }));
    if (this.activeAnnotationId === annotationId) {
      this.activeAnnotationId = null;
    }
    this.snackBar.open('Annotation deleted', 'Close', { duration: 2000 });
  }

  getAnnotationSummary(annotation: LegislationAnnotationDTO): string {
    try {
      const body: AnnotationBody = JSON.parse(annotation.bodyJson);
      switch (body.type) {
        case 'SCORING':
          return body.electionName || body.electionId || 'Scoring annotation';
        case 'SOLUTION':
          return body.title;
        case 'INTENT': {
          return `${body.categoryName} \u00d7 ${body.groupName}: ${body.sentiment}`;
        }
        default:
          return annotation.annotationType;
      }
    } catch {
      return annotation.annotationType;
    }
  }

  getAnnotationQuote(annotation: LegislationAnnotationDTO): string {
    try {
      const target = JSON.parse(annotation.targetJson);
      return target.selector?.exact || '';
    } catch {
      return '';
    }
  }

  onSidebarAnnotationClick(annotationId: string): void {
    this.activeAnnotationId = annotationId;
    this.scrollToInlineHighlight(annotationId);
  }

  // --- Highlight rendering ---

  renderHighlights(): void {
    if (!this.legislation?.legislationText) {
      this.highlightedHtml = '<p>No content.</p>';
      return;
    }

    if (this.annotations.length === 0) {
      this.highlightedHtml = this.legislation.legislationText;
      return;
    }

    // Use DOM-based approach to inject highlights while preserving original HTML
    const container = document.createElement('div');
    container.innerHTML = this.legislation.legislationText;

    for (const annotation of this.annotations) {
      try {
        const target = JSON.parse(annotation.targetJson);
        const exact: string = target.selector?.exact;
        if (!exact) continue;

        this.wrapTextInDom(container, exact, annotation.annotationType.toLowerCase(), annotation.id);
      } catch {
        // skip malformed annotations
      }
    }

    this.highlightedHtml = container.innerHTML;
    this.needsHighlightListenerSetup = true;
  }

  private wrapTextInDom(root: HTMLElement, searchText: string, type: string, id: string): void {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      textNodes.push(node);
    }

    // Build a concatenated plain text and track which text node owns each character
    let fullText = '';
    const nodeMap: { node: Text; startOffset: number }[] = [];
    for (const tn of textNodes) {
      nodeMap.push({ node: tn, startOffset: fullText.length });
      fullText += tn.textContent || '';
    }

    const matchIndex = fullText.indexOf(searchText);
    if (matchIndex < 0) return;

    const matchEnd = matchIndex + searchText.length;

    // Find which text nodes the match spans
    for (let i = nodeMap.length - 1; i >= 0; i--) {
      const entry = nodeMap[i];
      const nodeText = entry.node.textContent || '';
      const nodeStart = entry.startOffset;
      const nodeEnd = nodeStart + nodeText.length;

      // Skip nodes that don't overlap the match
      if (nodeEnd <= matchIndex || nodeStart >= matchEnd) continue;

      const overlapStart = Math.max(matchIndex, nodeStart) - nodeStart;
      const overlapEnd = Math.min(matchEnd, nodeEnd) - nodeStart;

      // Split the text node and wrap the matching portion
      const textNode = entry.node;
      if (overlapEnd < nodeText.length) {
        textNode.splitText(overlapEnd);
      }
      const matchNode = overlapStart > 0 ? textNode.splitText(overlapStart) : textNode;

      const span = document.createElement('span');
      span.className = `annotation-highlight type-${type}`;
      span.setAttribute('data-annotation-id', id);
      matchNode.parentNode!.insertBefore(span, matchNode);
      span.appendChild(matchNode);
    }
  }

  private getPlainText(): string {
    if (!this.legislation?.legislationText) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = this.legislation.legislationText;
    return tmp.textContent || tmp.innerText || '';
  }

  private checkOverlap(selectedText: string): boolean {
    if (!this.legislation?.legislationText) return false;

    const plainText = this.getPlainText();
    const selectedStart = plainText.indexOf(selectedText);
    if (selectedStart < 0) return false;
    const selectedEnd = selectedStart + selectedText.length;

    for (const annotation of this.annotations) {
      try {
        const target = JSON.parse(annotation.targetJson);
        const exact: string = target.selector?.exact;
        if (!exact) continue;

        const existingStart = plainText.indexOf(exact);
        if (existingStart < 0) continue;
        const existingEnd = existingStart + exact.length;

        if (selectedStart < existingEnd && selectedEnd > existingStart) {
          return true;
        }
      } catch {
        // skip
      }
    }
    return false;
  }

  // --- Highlight interaction listeners ---

  private setupHighlightListeners(): void {
    this.cleanupHighlightListeners();

    if (!this.documentContent?.nativeElement) return;

    const highlights = this.documentContent.nativeElement.querySelectorAll('.annotation-highlight');
    highlights.forEach((el: HTMLElement) => {
      const annotationId = el.getAttribute('data-annotation-id');
      if (!annotationId) return;

      const mouseenterUnsub = this.renderer.listen(el, 'mouseenter', () => {
        this.activeAnnotationId = annotationId;
        this.scrollSidebarToAnnotation(annotationId);
      });
      const mouseleaveUnsub = this.renderer.listen(el, 'mouseleave', () => {
        if (this.activeAnnotationId === annotationId) {
          this.activeAnnotationId = null;
        }
      });
      const clickUnsub = this.renderer.listen(el, 'click', (event: Event) => {
        event.stopPropagation();
        this.activeAnnotationId = annotationId;
        this.scrollSidebarToAnnotation(annotationId);
      });

      this.highlightListeners.push(mouseenterUnsub, mouseleaveUnsub, clickUnsub);
    });
  }

  private cleanupHighlightListeners(): void {
    this.highlightListeners.forEach(unsub => unsub());
    this.highlightListeners = [];
  }

  private scrollSidebarToAnnotation(annotationId: string): void {
    setTimeout(() => {
      const sidebarItem = document.querySelector(`[data-sidebar-annotation-id="${annotationId}"]`);
      sidebarItem?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  private scrollToInlineHighlight(annotationId: string): void {
    if (!this.documentContent?.nativeElement) return;
    const highlight = this.documentContent.nativeElement.querySelector(`[data-annotation-id="${annotationId}"]`);
    if (highlight) {
      highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Flash effect
      highlight.classList.add('flash');
      setTimeout(() => highlight.classList.remove('flash'), 1500);
    }
  }

  // --- Build annotation body ---

  private buildAnnotationBody(): AnnotationBody | null {
    switch (this.newAnnotationType) {
      case 'SCORING': {
        const selectedElection = this.elections.find(e => e.id === this.scoringElectionId);
        return {
          type: 'SCORING',
          electionId: this.scoringElectionId || undefined,
          electionName: selectedElection?.name || undefined,
          ballotId: this.scoringBallotId || undefined,
        };
      }
      case 'SOLUTION': {
        if (!this.solutionTitle.trim()) {
          this.snackBar.open('Please enter a title for the solution.', 'Close', { duration: 3000 });
          return null;
        }
        return {
          type: 'SOLUTION',
          title: this.solutionTitle.trim(),
          description: this.solutionDescription.trim(),
        };
      }
      case 'INTENT': {
        if (!this.intentCategoryId || !this.intentGroupId) {
          this.snackBar.open('Please select both a category and group.', 'Close', { duration: 3000 });
          return null;
        }
        const selectedCat = this.categories.find(c => c.id === this.intentCategoryId);
        const selectedGroup = this.groups.find(g => g.id === this.intentGroupId);
        return {
          type: 'INTENT',
          categoryId: this.intentCategoryId,
          categoryName: selectedCat?.name || this.intentCategoryId,
          groupId: this.intentGroupId,
          groupName: selectedGroup?.name || this.intentGroupId,
          sentiment: this.intentSentiment,
        };
      }
    }
  }
}
