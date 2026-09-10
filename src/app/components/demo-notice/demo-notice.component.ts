import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoNotice, getDemoNotice, loadRuntimeConfig } from '../../../environment';

/**
 * Demo notice (2026-09-09): when runtime-config.json carries a `demo`
 * stanza with `enabled: true`, show a first-visit acknowledgement dialog
 * (remembered per terms version in localStorage) and a persistent bar:
 * "Demonstration instance — do not enter personal information", with
 * the demo terms link. Mirrors the Polari frontend's component; the text
 * and the terms URL are the operator's (staging/prod setup scripts).
 */
@Component({
  selector: 'app-demo-notice',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="demo-bar" *ngIf="notice" role="note" aria-label="Demonstration instance notice">
      <span class="demo-bar-text">
        <strong>{{ notice.title || 'Demonstration instance' }}.</strong>
        Do not enter personal information — anything you put here may be public and can be wiped at any time.
      </span>
      <a class="demo-bar-link" *ngIf="notice.termsUrl" [href]="notice.termsUrl" target="_blank" rel="noopener">Demo terms</a>
    </div>
    <div class="demo-backdrop" *ngIf="notice && showDialog">
      <div class="demo-dialog" role="dialog" aria-modal="true" aria-labelledby="demo-title">
        <h2 id="demo-title">{{ notice.title || 'Demonstration instance' }}</h2>
        <p class="demo-message">{{ notice.message || 'This is a public demonstration. It exists so you can try the software, not to hold anyone\\'s data.' }}</p>
        <ul class="demo-points">
          <li><strong>No personal information.</strong> Do not enter names, addresses, contact details, health, financial or other information about yourself or anyone else.</li>
          <li><strong>Nothing here is private or kept.</strong> What you enter may be visible to other visitors and can be reset or deleted at any time without notice.</li>
          <li><strong>Demo accounts only.</strong> Use a throwaway login; never reuse a password you use anywhere else.</li>
          <li><strong>No warranty.</strong> The software is free and open source (GPLv3), provided as is, with no promise of availability, accuracy or fitness for any purpose.</li>
        </ul>
        <p class="demo-terms" *ngIf="notice.termsUrl">The full <a [href]="notice.termsUrl" target="_blank" rel="noopener">demo terms</a> say the rest. Continuing means you have read them.</p>
        <div class="demo-actions">
          <button type="button" class="demo-button" (click)="acknowledge()">I understand — continue</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .demo-bar { display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; padding: 0.35rem 0.9rem;
      font-size: 0.86rem; line-height: 1.35; background: var(--brand-orange, #d48a0c);
      color: var(--brand-orange-text, var(--text-on-primary, #fff)); border-bottom: 1px solid var(--border-light, rgba(0,0,0,0.12)); }
    .demo-bar-text { flex: 1 1 320px; min-width: 0; }
    .demo-bar-link { color: inherit; font-weight: 600; text-decoration: underline; white-space: nowrap; }
    .demo-backdrop { position: fixed; inset: 0; z-index: 3000; display: flex; align-items: center; justify-content: center;
      padding: 1rem; background: rgba(0, 0, 0, 0.55); }
    .demo-dialog { max-width: 560px; width: 100%; max-height: 90vh; overflow: auto; background: var(--surface, #fff);
      color: var(--text-primary, #212529); border: 1px solid var(--border-light, rgba(0,0,0,0.12));
      border-top: 4px solid var(--brand-orange, #d48a0c); border-radius: 8px; padding: 1.4rem 1.6rem 1.2rem;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3); }
    .demo-dialog h2 { margin: 0 0 0.6rem; font-size: 1.35rem; }
    .demo-message, .demo-terms { margin: 0 0 0.8rem; color: var(--text-secondary, #555b62); }
    .demo-points { margin: 0 0 0.8rem; padding-left: 1.2rem; }
    .demo-points li { margin: 0.35rem 0; color: var(--text-secondary, #555b62); }
    .demo-points strong { color: var(--text-primary, #212529); }
    .demo-terms a { color: var(--brand-orange, #d48a0c); }
    .demo-actions { display: flex; justify-content: flex-end; }
    .demo-button { font: inherit; font-weight: 600; cursor: pointer; border: 0; border-radius: 6px; padding: 0.55rem 1.1rem;
      background: var(--brand-orange, #d48a0c); color: var(--brand-orange-text, var(--text-on-primary, #fff)); }
    .demo-button:focus-visible { outline: 2px solid var(--text-primary, #212529); outline-offset: 2px; }
  `]
})
export class DemoNoticeComponent implements OnInit {
  notice: DemoNotice | null = null;
  showDialog = false;

  async ngOnInit(): Promise<void> {
    await loadRuntimeConfig();
    const notice = getDemoNotice();
    if (!notice || !notice.enabled) { return; }
    this.notice = notice;
    this.showDialog = !this.acknowledged(notice);
  }

  private key(notice: DemoNotice): string { return `polari-demo-ack:${notice.version || 'v1'}`; }

  private acknowledged(notice: DemoNotice): boolean {
    try { return localStorage.getItem(this.key(notice)) === 'yes'; } catch { return false; }
  }

  acknowledge(): void {
    if (this.notice) { try { localStorage.setItem(this.key(this.notice), 'yes'); } catch { /* prompt again next load */ } }
    this.showDialog = false;
  }
}
