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
import { MatExpansionModule } from '@angular/material/expansion';
import { Store, ActionsSubject } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil, filter, take } from 'rxjs/operators';
import { AppState } from '../../../state/app.state';
import { LegislationActions } from '../../../state/actions/legislation.actions';
import { selectLegislationById, selectLegislationAnnotations } from '../../../state/selectors/legislation.selectors';
import { selectAuthUser } from '../../../state/selectors/auth.selectors';
import { AuthUser } from '../../../classes/auth-user';
import { LegislationDTO, LegislationAnnotationDTO, AnnotationBody, AnnotationSelection } from '../../../models/legislation.model';
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
    MatButtonToggleModule,
    MatExpansionModule
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

        <!-- New annotation form -->
        <div class="new-annotation" *ngIf="isAuthenticated && showAnnotationForm">
          <mat-card class="new-annotation-card">
            <mat-card-header>
              <mat-card-title>{{ addingToSelectionKey ? 'Add Annotation' : 'New Annotation' }}</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <p class="selected-text-preview">"{{ formSelectedText }}"</p>

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
              <button mat-button (click)="cancelForm()">Cancel</button>
              <button mat-raised-button color="primary" (click)="saveAnnotation()">Save</button>
            </mat-card-actions>
          </mat-card>
        </div>

        <mat-divider></mat-divider>

        <!-- Selections list -->
        <mat-accordion multi class="selections-list">
          <mat-expansion-panel *ngFor="let selection of selections"
                               [expanded]="activeSelectionKey === selection.key"
                               [attr.data-sidebar-selection-key]="selection.key"
                               (opened)="onSelectionPanelOpened(selection.key)"
                               [class.active]="activeSelectionKey === selection.key">
            <mat-expansion-panel-header>
              <mat-panel-title class="selection-title">
                <span class="selection-quote">"{{ truncate(selection.exact, 40) }}"</span>
              </mat-panel-title>
              <mat-panel-description>
                {{ selection.annotations.length }} annotation{{ selection.annotations.length !== 1 ? 's' : '' }}
              </mat-panel-description>
            </mat-expansion-panel-header>

            <div class="selection-annotations">
              <div *ngFor="let annotation of selection.annotations" class="annotation-entry">
                <div class="annotation-header">
                  <span class="annotation-type-chip" [class]="'type-' + annotation.annotationType.toLowerCase()">
                    {{ annotation.annotationType }}
                  </span>
                  <button mat-icon-button *ngIf="isAuthenticated"
                          (click)="deleteAnnotation(annotation.id); $event.stopPropagation()"
                          matTooltip="Delete annotation">
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
                <p class="annotation-summary">{{ getAnnotationSummary(annotation) }}</p>
              </div>
            </div>

            <mat-action-row *ngIf="isAuthenticated">
              <button mat-button color="primary" (click)="addAnnotationToSelection(selection)">
                <mat-icon>add</mat-icon> Add annotation
              </button>
              <button mat-button color="warn" (click)="deleteSelection(selection)">
                <mat-icon>delete</mat-icon> Delete selection
              </button>
            </mat-action-row>
          </mat-expansion-panel>
        </mat-accordion>

        <div *ngIf="selections.length === 0" class="empty-annotations">
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
    .annotation-sidebar { width: 380px; padding: 16px; overflow-y: auto; }
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
    .selected-text-preview { font-style: italic; color: #666; font-size: 13px; border-left: 3px solid #1976d2; padding-left: 8px; margin-bottom: 12px; }
    .sentiment-toggle { margin-bottom: 16px; }
    .sentiment-label { display: block; font-size: 12px; color: #666; margin-bottom: 8px; }
    .selections-list { margin-top: 8px; }
    .selection-title { font-size: 13px; }
    .selection-quote { font-style: italic; color: #555; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .selection-annotations { padding: 4px 0; }
    .annotation-entry { padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
    .annotation-entry:last-child { border-bottom: none; }
    .annotation-header { display: flex; justify-content: space-between; align-items: center; }
    .annotation-type-chip { padding: 2px 8px; border-radius: 8px; font-size: 11px; font-weight: 500; text-transform: uppercase; }
    .type-scoring { background: #e3f2fd; color: #1565c0; }
    .type-solution { background: #f3e5f5; color: #7b1fa2; }
    .type-intent { background: #e8f5e9; color: #2e7d32; }
    .annotation-summary { margin: 2px 0 0; font-size: 13px; }
    .empty-annotations { padding: 24px; text-align: center; color: #999; }
    .auth-prompt { margin-bottom: 16px; }
    .auth-prompt-card { text-align: center; }
    .auth-prompt-card mat-card-content { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 16px; }
    .auth-icon { font-size: 36px; height: 36px; width: 36px; color: #9e9e9e; }
    .auth-prompt-card p { margin: 0; color: #666; font-size: 14px; }
    mat-expansion-panel.active { border-left: 3px solid #1976d2; }
  `]
})
export class LegislationAnnotatorComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('documentContent') documentContent!: ElementRef;

  legislation: LegislationDTO | null = null;
  annotations: LegislationAnnotationDTO[] = [];
  selections: AnnotationSelection[] = [];
  isAuthenticated = false;
  currentUser: AuthUser | null = null;
  highlightedHtml = '<p>No content.</p>';

  // Selection / form state
  activeSelectionKey: string | null = null;
  showAnnotationForm = false;
  addingToSelectionKey: string | null = null;  // non-null when adding to existing selection
  formSelectedText = '';
  private formPrefix = '';
  private formSuffix = '';

  // Annotation form fields
  newAnnotationType: 'SCORING' | 'SOLUTION' | 'INTENT' = 'SCORING';

  elections: WorldviewElectionDTO[] = [];
  scoringElectionId = '';
  scoringBallotId = '';

  solutionTitle = '';
  solutionDescription = '';

  categories: PoliticalCategory[] = MOCK_POLITICAL_CATEGORIES;
  groups: Group[] = MOCK_ALL_GROUPS;
  intentCategoryId = '';
  intentGroupId = '';
  intentSentiment: 'GOOD' | 'BAD' | 'NEUTRAL' = 'NEUTRAL';

  private legislationId = '';
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

    this.store.select(selectAuthUser)
      .pipe(takeUntil(this.destroy$))
      .subscribe(user => {
        const wasAuthenticated = this.isAuthenticated;
        this.currentUser = user;
        this.isAuthenticated = !!user;
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
        this.buildSelections();
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

  truncate(text: string, maxLen: number): string {
    return text.length > maxLen ? text.substring(0, maxLen) + '...' : text;
  }

  // --- Text selection (new highlight) ---

  onTextSelected(): void {
    if (!this.isAuthenticated) return;
    const selection = window.getSelection();
    if (!selection || selection.toString().trim().length === 0) return;

    const selectedText = selection.toString().trim();

    // Check if user selected text that matches an existing selection exactly
    const existingSelection = this.selections.find(s => s.exact === selectedText);
    if (existingSelection) {
      this.addAnnotationToSelection(existingSelection);
      window.getSelection()?.removeAllRanges();
      return;
    }

    // Check for overlap with existing selections
    if (this.checkOverlap(selectedText)) {
      this.snackBar.open('Selections cannot overlap. Click an existing highlight to add annotations to it.', 'Close', { duration: 4000 });
      return;
    }

    // Capture prefix/suffix context
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer.textContent || '';
    const startOffset = range.startOffset;
    const endOffset = range.endOffset;

    this.formSelectedText = selectedText;
    this.formPrefix = container.substring(Math.max(0, startOffset - 32), startOffset);
    this.formSuffix = container.substring(endOffset, Math.min(container.length, endOffset + 32));
    this.addingToSelectionKey = null;
    this.showAnnotationForm = true;
    window.getSelection()?.removeAllRanges();
  }

  // --- Add annotation to existing selection ---

  addAnnotationToSelection(selection: AnnotationSelection): void {
    this.formSelectedText = selection.exact;
    this.formPrefix = selection.prefix;
    this.formSuffix = selection.suffix;
    this.addingToSelectionKey = selection.key;
    this.activeSelectionKey = selection.key;
    this.showAnnotationForm = true;
    this.resetFormFields();
  }

  // --- Form actions ---

  cancelForm(): void {
    this.showAnnotationForm = false;
    this.addingToSelectionKey = null;
    this.formSelectedText = '';
    this.formPrefix = '';
    this.formSuffix = '';
    this.resetFormFields();
  }

  private resetFormFields(): void {
    this.newAnnotationType = 'SCORING';
    this.scoringElectionId = '';
    this.scoringBallotId = '';
    this.solutionTitle = '';
    this.solutionDescription = '';
    this.intentCategoryId = '';
    this.intentGroupId = '';
    this.intentSentiment = 'NEUTRAL';
  }

  saveAnnotation(): void {
    if (!this.formSelectedText) return;

    const body = this.buildAnnotationBody();
    if (!body) return;

    const target = {
      selector: {
        type: 'TextQuoteSelector',
        exact: this.formSelectedText,
        prefix: this.formPrefix,
        suffix: this.formSuffix,
      }
    };

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

    this.cancelForm();
  }

  // --- Delete ---

  deleteAnnotation(annotationId: string): void {
    this.store.dispatch(LegislationActions.deleteAnnotation({
      legislationId: this.legislationId,
      annotationId
    }));
    this.snackBar.open('Annotation deleted', 'Close', { duration: 2000 });
  }

  deleteSelection(selection: AnnotationSelection): void {
    const count = selection.annotations.length;
    const msg = count === 1
      ? 'Delete this selection and its annotation?'
      : `Delete this selection and all ${count} annotations?`;

    if (!confirm(msg)) return;

    for (const annotation of selection.annotations) {
      this.store.dispatch(LegislationActions.deleteAnnotation({
        legislationId: this.legislationId,
        annotationId: annotation.id
      }));
    }
    this.activeSelectionKey = null;
    this.snackBar.open('Selection deleted', 'Close', { duration: 2000 });
  }

  // --- Selection grouping ---

  private buildSelections(): void {
    const map = new Map<string, AnnotationSelection>();
    for (const a of this.annotations) {
      try {
        const target = JSON.parse(a.targetJson);
        const exact: string = target.selector?.exact || '';
        if (!exact) continue;

        if (!map.has(exact)) {
          map.set(exact, {
            key: exact,
            exact,
            prefix: target.selector?.prefix || '',
            suffix: target.selector?.suffix || '',
            annotations: []
          });
        }
        map.get(exact)!.annotations.push(a);
      } catch {
        // skip malformed
      }
    }
    this.selections = Array.from(map.values());
  }

  // --- Sidebar interaction ---

  onSelectionPanelOpened(key: string): void {
    this.activeSelectionKey = key;
    this.scrollToInlineHighlight(key);
  }

  getAnnotationSummary(annotation: LegislationAnnotationDTO): string {
    try {
      const body: AnnotationBody = JSON.parse(annotation.bodyJson);
      switch (body.type) {
        case 'SCORING':
          return body.electionName || body.electionId || 'Scoring annotation';
        case 'SOLUTION':
          return body.title;
        case 'INTENT':
          return `${body.categoryName} \u00d7 ${body.groupName}: ${body.sentiment}`;
        default:
          return annotation.annotationType;
      }
    } catch {
      return annotation.annotationType;
    }
  }

  // --- Highlight rendering (one per selection) ---

  renderHighlights(): void {
    if (!this.legislation?.legislationText) {
      this.highlightedHtml = '<p>No content.</p>';
      return;
    }

    if (this.selections.length === 0) {
      this.highlightedHtml = this.legislation.legislationText;
      return;
    }

    const container = document.createElement('div');
    container.innerHTML = this.legislation.legislationText;

    for (const selection of this.selections) {
      // Determine highlight color from the first annotation's type
      const primaryType = selection.annotations[0]?.annotationType?.toLowerCase() || 'scoring';
      this.wrapTextInDom(container, selection.exact, primaryType, selection.key);
    }

    this.highlightedHtml = container.innerHTML;
    this.needsHighlightListenerSetup = true;
  }

  private wrapTextInDom(root: HTMLElement, searchText: string, type: string, selectionKey: string): void {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    const textNodes: Text[] = [];
    let node: Text | null;
    while ((node = walker.nextNode() as Text | null)) {
      textNodes.push(node);
    }

    let fullText = '';
    const nodeMap: { node: Text; startOffset: number }[] = [];
    for (const tn of textNodes) {
      nodeMap.push({ node: tn, startOffset: fullText.length });
      fullText += tn.textContent || '';
    }

    const matchIndex = fullText.indexOf(searchText);
    if (matchIndex < 0) return;

    const matchEnd = matchIndex + searchText.length;

    for (let i = nodeMap.length - 1; i >= 0; i--) {
      const entry = nodeMap[i];
      const nodeText = entry.node.textContent || '';
      const nodeStart = entry.startOffset;
      const nodeEnd = nodeStart + nodeText.length;

      if (nodeEnd <= matchIndex || nodeStart >= matchEnd) continue;

      const overlapStart = Math.max(matchIndex, nodeStart) - nodeStart;
      const overlapEnd = Math.min(matchEnd, nodeEnd) - nodeStart;

      const textNode = entry.node;
      if (overlapEnd < nodeText.length) {
        textNode.splitText(overlapEnd);
      }
      const matchNode = overlapStart > 0 ? textNode.splitText(overlapStart) : textNode;

      const span = document.createElement('span');
      span.className = `annotation-highlight type-${type}`;
      span.setAttribute('data-selection-key', selectionKey);
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

    for (const selection of this.selections) {
      const existingStart = plainText.indexOf(selection.exact);
      if (existingStart < 0) continue;
      const existingEnd = existingStart + selection.exact.length;

      if (selectedStart < existingEnd && selectedEnd > existingStart) {
        return true;
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
      const selectionKey = el.getAttribute('data-selection-key');
      if (!selectionKey) return;

      const mouseenterUnsub = this.renderer.listen(el, 'mouseenter', () => {
        this.activeSelectionKey = selectionKey;
        this.scrollSidebarToSelection(selectionKey);
      });
      const mouseleaveUnsub = this.renderer.listen(el, 'mouseleave', () => {
        if (this.activeSelectionKey === selectionKey) {
          this.activeSelectionKey = null;
        }
      });
      const clickUnsub = this.renderer.listen(el, 'click', (event: Event) => {
        event.stopPropagation();
        this.activeSelectionKey = selectionKey;
        this.scrollSidebarToSelection(selectionKey);
      });

      this.highlightListeners.push(mouseenterUnsub, mouseleaveUnsub, clickUnsub);
    });
  }

  private cleanupHighlightListeners(): void {
    this.highlightListeners.forEach(unsub => unsub());
    this.highlightListeners = [];
  }

  private scrollSidebarToSelection(key: string): void {
    setTimeout(() => {
      const panel = document.querySelector(`[data-sidebar-selection-key="${key}"]`);
      panel?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }

  private scrollToInlineHighlight(key: string): void {
    if (!this.documentContent?.nativeElement) return;
    const highlight = this.documentContent.nativeElement.querySelector(`[data-selection-key="${key}"]`);
    if (highlight) {
      highlight.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
