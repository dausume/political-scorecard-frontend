import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AppState } from '../../../state/app.state';
import { LegislationActions } from '../../../state/actions/legislation.actions';
import { selectLegislationById, selectLegislationLoading, selectLegislationAnnotations } from '../../../state/selectors/legislation.selectors';
import { LegislationDTO, LegislationAnnotationDTO } from '../../../models/legislation.model';
import { LegislationApiService } from '../../../services/api/legislation-api.service';

@Component({
  selector: 'app-legislation-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  template: `
    <div class="legislation-detail-container" *ngIf="legislation; else loadingTemplate">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ legislation.title }}</h1>
        <span class="status-chip" [class]="'status-' + legislation.status.toLowerCase()">{{ legislation.status }}</span>
      </div>

      <mat-card class="metadata-card">
        <mat-card-content>
          <div class="meta-grid">
            <div *ngIf="legislation.description">
              <strong>Description</strong>
              <p>{{ legislation.description }}</p>
            </div>
            <div *ngIf="legislation.legislativeBodyId">
              <strong>Legislative Body</strong>
              <p>{{ legislation.legislativeBodyId }}</p>
            </div>
            <div *ngIf="legislation.validFromDate">
              <strong>Valid From</strong>
              <p>{{ legislation.validFromDate }}</p>
            </div>
            <div *ngIf="legislation.validToDate">
              <strong>Valid To</strong>
              <p>{{ legislation.validToDate }}</p>
            </div>
            <div *ngIf="legislation.url">
              <strong>Reference URL</strong>
              <p><a [href]="legislation.url" target="_blank">{{ legislation.url }}</a></p>
            </div>
            <div *ngIf="legislation.createdAt">
              <strong>Created</strong>
              <p>{{ legislation.createdAt }}</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="action-bar">
        <button mat-raised-button *ngIf="legislation.status === 'DRAFT'" (click)="editLegislation()">
          <mat-icon>edit</mat-icon> Edit
        </button>
        <button mat-raised-button color="primary" *ngIf="legislation.status === 'DRAFT'" (click)="submitForReview()">
          <mat-icon>send</mat-icon> Submit for Review
        </button>
        <button mat-raised-button color="primary" *ngIf="legislation.status === 'APPROVED' || legislation.status === 'LOCKED'" (click)="annotateLegislation()">
          <mat-icon>rate_review</mat-icon> Annotate
        </button>
        <button mat-raised-button [matMenuTriggerFor]="exportMenu">
          <mat-icon>download</mat-icon> Export
        </button>
        <mat-menu #exportMenu="matMenu">
          <button mat-menu-item (click)="exportPdf()">
            <mat-icon>picture_as_pdf</mat-icon> Export as PDF
          </button>
          <button mat-menu-item (click)="exportDocx()">
            <mat-icon>description</mat-icon> Export as DOCX
          </button>
        </mat-menu>
        <button mat-raised-button color="warn" *ngIf="legislation.status === 'DRAFT'" (click)="deleteLegislation()">
          <mat-icon>delete</mat-icon> Delete
        </button>
      </div>

      <mat-divider></mat-divider>

      <div class="annotation-legend" *ngIf="annotations.length > 0">
        <span class="legend-item">
          <span class="legend-color type-scoring-bg"></span> Scoring
        </span>
        <span class="legend-item">
          <span class="legend-color type-solution-bg"></span> Solution
        </span>
        <span class="legend-item">
          <span class="legend-color type-intent-bg"></span> Intent
        </span>
      </div>

      <mat-card class="content-card">
        <mat-card-header>
          <mat-card-title>Legislation Text</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="legislation-content" [innerHTML]="highlightedHtml"></div>
        </mat-card-content>
      </mat-card>
    </div>

    <ng-template #loadingTemplate>
      <div class="loading-spinner">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    </ng-template>
  `,
  styles: [`
    .legislation-detail-container { padding: 24px; max-width: 960px; margin: 0 auto; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .header h1 { margin: 0; flex: 1; }
    .status-chip { padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 500; text-transform: uppercase; }
    .status-draft { background: #e3f2fd; color: #1565c0; }
    .status-submitted { background: #fff3e0; color: #e65100; }
    .status-approved { background: #e8f5e9; color: #2e7d32; }
    .status-locked { background: #fce4ec; color: #c62828; }
    .metadata-card { margin-bottom: 16px; }
    .meta-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px; }
    .meta-grid strong { display: block; font-size: 12px; color: #666; text-transform: uppercase; }
    .meta-grid p { margin: 4px 0 0; }
    .action-bar { display: flex; gap: 8px; margin: 16px 0; flex-wrap: wrap; }
    .content-card { margin-top: 16px; }
    .legislation-content { padding: 16px; min-height: 200px; line-height: 1.6; }
    .loading-spinner { display: flex; justify-content: center; padding: 48px; }
    .annotation-legend { display: flex; gap: 16px; margin: 12px 0; align-items: center; font-size: 13px; color: #555; }
    .legend-item { display: flex; align-items: center; gap: 4px; }
    .legend-color { display: inline-block; width: 14px; height: 14px; border-radius: 3px; }
    .type-scoring-bg { background: #e3f2fd; }
    .type-solution-bg { background: #f3e5f5; }
    .type-intent-bg { background: #e8f5e9; }
  `]
})
export class LegislationDetailComponent implements OnInit, OnDestroy {
  legislation: LegislationDTO | null = null;
  annotations: LegislationAnnotationDTO[] = [];
  highlightedHtml = '<p>No content yet.</p>';
  private destroy$ = new Subject<void>();
  private legislationId: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private snackBar: MatSnackBar,
    private legislationApi: LegislationApiService
  ) {}

  ngOnInit(): void {
    this.legislationId = this.route.snapshot.paramMap.get('id') || '';

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
    this.store.dispatch(LegislationActions.loadAnnotations({ legislationId: this.legislationId }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  goBack(): void {
    this.router.navigate(['/policy-scoring']);
  }

  editLegislation(): void {
    this.router.navigate(['/policy-scoring', this.legislationId, 'edit']);
  }

  annotateLegislation(): void {
    this.router.navigate(['/policy-scoring', this.legislationId, 'annotate']);
  }

  submitForReview(): void {
    this.store.dispatch(LegislationActions.updateLegislationStatus({ id: this.legislationId, status: 'SUBMITTED' }));
    this.snackBar.open('Submitted for review', 'Close', { duration: 3000 });
  }

  deleteLegislation(): void {
    if (confirm('Are you sure you want to delete this legislation document?')) {
      this.store.dispatch(LegislationActions.deleteLegislation({ id: this.legislationId }));
      this.router.navigate(['/policy-scoring']);
      this.snackBar.open('Legislation deleted', 'Close', { duration: 3000 });
    }
  }

  exportPdf(): void {
    this.legislationApi.exportAsPdf(this.legislationId).subscribe(blob => {
      this.downloadBlob(blob, `legislation-${this.legislationId}.pdf`);
    });
    this.legislationApi.exportAnnotationsAsPdf(this.legislationId).subscribe(blob => {
      this.downloadBlob(blob, `annotations-${this.legislationId}.pdf`);
    });
  }

  exportDocx(): void {
    this.legislationApi.exportAsDocx(this.legislationId).subscribe(blob => {
      this.downloadBlob(blob, `legislation-${this.legislationId}.docx`);
    });
    this.legislationApi.exportAnnotationsAsDocx(this.legislationId).subscribe(blob => {
      this.downloadBlob(blob, `annotations-${this.legislationId}.docx`);
    });
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // --- Read-only highlight rendering ---

  private renderHighlights(): void {
    if (!this.legislation?.legislationText) {
      this.highlightedHtml = '<p>No content yet.</p>';
      return;
    }

    if (this.annotations.length === 0) {
      this.highlightedHtml = this.legislation.legislationText;
      return;
    }

    // Deduplicate annotations by exact text so each selection is highlighted once
    const selectionMap = new Map<string, string>();
    for (const annotation of this.annotations) {
      try {
        const target = JSON.parse(annotation.targetJson);
        const exact: string = target.selector?.exact;
        if (!exact || selectionMap.has(exact)) continue;
        selectionMap.set(exact, annotation.annotationType.toLowerCase());
      } catch {
        // skip malformed annotations
      }
    }

    // Use DOM-based approach to inject highlights while preserving original HTML
    const container = document.createElement('div');
    container.innerHTML = this.legislation.legislationText;

    for (const [exact, type] of selectionMap) {
      this.wrapTextInDom(container, exact, type);
    }

    this.highlightedHtml = container.innerHTML;
  }

  private wrapTextInDom(root: HTMLElement, searchText: string, type: string): void {
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
      matchNode.parentNode!.insertBefore(span, matchNode);
      span.appendChild(matchNode);
    }
  }
}
