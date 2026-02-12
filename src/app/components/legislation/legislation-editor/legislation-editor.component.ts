import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import { AppState } from '../../../state/app.state';
import { LegislationActions } from '../../../state/actions/legislation.actions';
import { selectLegislationById } from '../../../state/selectors/legislation.selectors';
import { LegislationDTO } from '../../../models/legislation.model';

@Component({
  selector: 'app-legislation-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatToolbarModule,
    MatTooltipModule
  ],
  template: `
    <div class="editor-container">
      <div class="header">
        <button mat-icon-button (click)="goBack()">
          <mat-icon>arrow_back</mat-icon>
        </button>
        <h1>{{ isEditMode ? 'Edit Legislation' : 'New Legislation' }}</h1>
      </div>

      <mat-card class="metadata-form">
        <mat-card-content>
          <form [formGroup]="legislationForm">
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Title</mat-label>
                <input matInput formControlName="title" placeholder="Enter legislation title">
              </mat-form-field>
            </div>
            <div class="form-row">
              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Description</mat-label>
                <textarea matInput formControlName="description" rows="3" placeholder="Brief description of the legislation"></textarea>
              </mat-form-field>
            </div>
            <div class="form-row-split">
              <mat-form-field appearance="outline">
                <mat-label>Legislative Body ID</mat-label>
                <input matInput formControlName="legislativeBodyId">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Reference URL</mat-label>
                <input matInput formControlName="url" placeholder="https://...">
              </mat-form-field>
            </div>
            <div class="form-row-split">
              <mat-form-field appearance="outline">
                <mat-label>Valid From</mat-label>
                <input matInput formControlName="validFromDate" type="date">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Valid To</mat-label>
                <input matInput formControlName="validToDate" type="date">
              </mat-form-field>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <mat-card class="editor-card">
        <mat-card-header>
          <mat-card-title>Legislation Text</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          <div class="toolbar">
            <button mat-icon-button matTooltip="Bold" (click)="toggleBold()">
              <mat-icon>format_bold</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Italic" (click)="toggleItalic()">
              <mat-icon>format_italic</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Underline" (click)="toggleUnderline()">
              <mat-icon>format_underlined</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Highlight" (click)="toggleHighlight()">
              <mat-icon>highlight</mat-icon>
            </button>
            <span class="toolbar-separator"></span>
            <button mat-icon-button matTooltip="Heading 1" (click)="setHeading(1)">
              <span class="heading-btn">H1</span>
            </button>
            <button mat-icon-button matTooltip="Heading 2" (click)="setHeading(2)">
              <span class="heading-btn">H2</span>
            </button>
            <button mat-icon-button matTooltip="Heading 3" (click)="setHeading(3)">
              <span class="heading-btn">H3</span>
            </button>
            <button mat-icon-button matTooltip="Paragraph" (click)="setParagraph()">
              <mat-icon>notes</mat-icon>
            </button>
            <span class="toolbar-separator"></span>
            <button mat-icon-button matTooltip="Bullet List" (click)="toggleBulletList()">
              <mat-icon>format_list_bulleted</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Ordered List" (click)="toggleOrderedList()">
              <mat-icon>format_list_numbered</mat-icon>
            </button>
            <span class="toolbar-separator"></span>
            <button mat-icon-button matTooltip="Align Left" (click)="setTextAlign('left')">
              <mat-icon>format_align_left</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Align Center" (click)="setTextAlign('center')">
              <mat-icon>format_align_center</mat-icon>
            </button>
            <button mat-icon-button matTooltip="Align Right" (click)="setTextAlign('right')">
              <mat-icon>format_align_right</mat-icon>
            </button>
          </div>
          <div #editorElement class="tiptap-editor"></div>
        </mat-card-content>
      </mat-card>

      <div class="action-bar">
        <button mat-button (click)="goBack()">Cancel</button>
        <button mat-raised-button (click)="saveDraft()">
          <mat-icon>save</mat-icon> Save Draft
        </button>
        <button mat-raised-button color="primary" (click)="saveAndSubmit()">
          <mat-icon>send</mat-icon> Save & Submit for Review
        </button>
      </div>
    </div>
  `,
  styles: [`
    .editor-container { padding: 24px; max-width: 960px; margin: 0 auto; }
    .header { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
    .header h1 { margin: 0; }
    .metadata-form { margin-bottom: 16px; }
    .form-row { margin-bottom: 8px; }
    .form-row-split { display: flex; gap: 16px; margin-bottom: 8px; }
    .form-row-split mat-form-field { flex: 1; }
    .full-width { width: 100%; }
    .editor-card { margin-bottom: 16px; }
    .toolbar { display: flex; align-items: center; flex-wrap: wrap; padding: 8px; border-bottom: 1px solid #e0e0e0; gap: 2px; }
    .toolbar-separator { width: 1px; height: 24px; background: #e0e0e0; margin: 0 4px; }
    .heading-btn { font-weight: bold; font-size: 14px; }
    .tiptap-editor { min-height: 400px; padding: 16px; outline: none; }
    .tiptap-editor :first-child { margin-top: 0; }
    :host ::ng-deep .tiptap { min-height: 400px; outline: none; padding: 16px; }
    :host ::ng-deep .tiptap p.is-editor-empty:first-child::before {
      color: #adb5bd; content: attr(data-placeholder); float: left; height: 0; pointer-events: none;
    }
    .action-bar { display: flex; gap: 8px; justify-content: flex-end; }
  `]
})
export class LegislationEditorComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('editorElement') editorElement!: ElementRef;

  legislationForm: FormGroup;
  editor: Editor | null = null;
  isEditMode = false;
  legislationId: string | null = null;

  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store<AppState>,
    private snackBar: MatSnackBar
  ) {
    this.legislationForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      legislativeBodyId: [''],
      url: [''],
      validFromDate: [''],
      validToDate: [''],
    });
  }

  ngOnInit(): void {
    this.legislationId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.legislationId;

    if (this.isEditMode && this.legislationId) {
      this.store.select(selectLegislationById(this.legislationId))
        .pipe(takeUntil(this.destroy$))
        .subscribe(legislation => {
          if (legislation) {
            this.legislationForm.patchValue({
              title: legislation.title,
              description: legislation.description,
              legislativeBodyId: legislation.legislativeBodyId,
              url: legislation.url,
              validFromDate: legislation.validFromDate,
              validToDate: legislation.validToDate,
            });
            if (this.editor && legislation.legislationText) {
              this.editor.commands.setContent(legislation.legislationText);
            }
          }
        });

      this.store.dispatch(LegislationActions.loadLegislation({ id: this.legislationId }));
    }
  }

  ngAfterViewInit(): void {
    this.editor = new Editor({
      element: this.editorElement.nativeElement,
      extensions: [
        StarterKit,
        Highlight,
        Underline,
        TextAlign.configure({ types: ['heading', 'paragraph'] }),
        Placeholder.configure({ placeholder: 'Start drafting your legislation text here...' }),
      ],
      content: '',
    });
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Toolbar actions
  toggleBold(): void { this.editor?.chain().focus().toggleBold().run(); }
  toggleItalic(): void { this.editor?.chain().focus().toggleItalic().run(); }
  toggleUnderline(): void { this.editor?.chain().focus().toggleUnderline().run(); }
  toggleHighlight(): void { this.editor?.chain().focus().toggleHighlight().run(); }
  setHeading(level: 1 | 2 | 3): void { this.editor?.chain().focus().toggleHeading({ level }).run(); }
  setParagraph(): void { this.editor?.chain().focus().setParagraph().run(); }
  toggleBulletList(): void { this.editor?.chain().focus().toggleBulletList().run(); }
  toggleOrderedList(): void { this.editor?.chain().focus().toggleOrderedList().run(); }
  setTextAlign(alignment: string): void { this.editor?.chain().focus().setTextAlign(alignment).run(); }

  goBack(): void {
    if (this.isEditMode) {
      this.router.navigate(['/policy-scoring', this.legislationId]);
    } else {
      this.router.navigate(['/policy-scoring']);
    }
  }

  private getLegislationData(): Partial<LegislationDTO> {
    return {
      ...this.legislationForm.value,
      legislationText: this.editor?.getHTML() || '',
      status: 'DRAFT',
    };
  }

  saveDraft(): void {
    if (!this.legislationForm.valid) {
      this.snackBar.open('Please fill in the title field', 'Close', { duration: 3000 });
      return;
    }

    const data = this.getLegislationData();

    if (this.isEditMode && this.legislationId) {
      this.store.dispatch(LegislationActions.updateLegislation({ id: this.legislationId, legislation: data }));
    } else {
      this.store.dispatch(LegislationActions.createLegislation({ legislation: data }));
    }

    this.snackBar.open('Draft saved', 'Close', { duration: 3000 });
    this.router.navigate(['/policy-scoring']);
  }

  saveAndSubmit(): void {
    if (!this.legislationForm.valid) {
      this.snackBar.open('Please fill in the title field', 'Close', { duration: 3000 });
      return;
    }

    const data = { ...this.getLegislationData(), status: 'SUBMITTED' as const };

    if (this.isEditMode && this.legislationId) {
      this.store.dispatch(LegislationActions.updateLegislation({ id: this.legislationId, legislation: data }));
    } else {
      this.store.dispatch(LegislationActions.createLegislation({ legislation: data }));
    }

    this.snackBar.open('Submitted for review', 'Close', { duration: 3000 });
    this.router.navigate(['/policy-scoring']);
  }
}
