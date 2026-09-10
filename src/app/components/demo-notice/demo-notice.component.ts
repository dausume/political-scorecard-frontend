import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DemoNotice, environment, getDemoNotice, loadRuntimeConfig } from '../../../environment';

/** One document as Polari's /api/terms/active serves it. */
interface TermsDoc {
  name: string; title: string; kind: string; version: string; requires_acceptance: boolean;
  show_bar: boolean; bar_text: string; summary: string; body_md: string; body_sha256: string;
  effective_at: string; contact: string; page: string; accepted: boolean;
}
interface TermsActive { ok: boolean; subject_kind: string; documents: TermsDoc[]; pending: string[]; show_bar: boolean; bar_text: string; }

const APP = 'political-scorecard';
const SESSION_KEY = 'polari-terms-session';

/**
 * The terms gate (terms module on the Polari backend, 2026-09-09) and the
 * demo notice it grew from. Source 1: GET {polariApiUrl}/api/terms/active
 * for this app — every pending document is shown in turn and the click is
 * RECORDED (POST /api/terms/accept). Source 2, when the backend has no
 * terms module: the runtime-config `demo` stanza — bar + local-only
 * acknowledgement. Neither present: nothing shows.
 */
@Component({
  selector: 'app-demo-notice',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="demo-bar" *ngIf="showBar" role="note" aria-label="Demonstration instance notice">
      <span class="demo-bar-text">{{ barText }}</span>
      <a class="demo-bar-link" *ngIf="termsUrl" [href]="termsUrl" target="_blank" rel="noopener">Demo terms</a>
    </div>
    <div class="demo-backdrop" *ngIf="current">
      <div class="demo-dialog" role="dialog" aria-modal="true" aria-labelledby="terms-title">
        <span class="terms-eyebrow">Please read before continuing</span>
        <h2 id="terms-title">{{ current.title }}</h2>
        <p class="demo-message" *ngIf="current.summary">{{ current.summary }}</p>
        <div class="terms-body" [innerHTML]="currentHtml"></div>
        <p class="demo-terms">Version {{ current.version }} · <a [href]="pageUrl(current)" target="_blank" rel="noopener">open as a page</a>.
          Clicking the button records that you accepted this version of the text.</p>
        <p class="terms-error" *ngIf="!recorded">Your acceptance could not be recorded (the instance did not answer). Try again in a moment.</p>
        <div class="demo-actions">
          <button type="button" class="demo-button" (click)="accept()" [disabled]="busy">I have read and accept {{ current.title }}</button>
        </div>
      </div>
    </div>
    <div class="demo-backdrop" *ngIf="notice && showFallbackDialog">
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
          <button type="button" class="demo-button" (click)="acknowledgeFallback()">I understand — continue</button>
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
    .demo-dialog { max-width: 620px; width: 100%; max-height: 90vh; overflow: auto; background: var(--surface, #fff);
      color: var(--text-primary, #212529); border: 1px solid var(--border-light, rgba(0,0,0,0.12));
      border-top: 4px solid var(--brand-orange, #d48a0c); border-radius: 8px; padding: 1.4rem 1.6rem 1.2rem;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3); }
    .terms-eyebrow { font-size: 0.72rem; letter-spacing: 0.12em; text-transform: uppercase; color: var(--brand-orange, #d48a0c); }
    .demo-dialog h2 { margin: 0.2rem 0 0.6rem; font-size: 1.35rem; }
    .demo-message, .demo-terms { margin: 0 0 0.8rem; color: var(--text-secondary, #555b62); }
    .terms-body { max-height: 40vh; overflow: auto; padding: 0.6rem 0.9rem; margin: 0 0 0.8rem; font-size: 0.92rem;
      border: 1px solid var(--border-light, rgba(0,0,0,0.12)); border-radius: 6px; color: var(--text-secondary, #555b62); }
    .terms-body h3 { font-size: 1rem; margin: 0.9rem 0 0.3rem; color: var(--text-primary, #212529); }
    .terms-body p, .terms-body li { margin: 0.35rem 0; }
    .terms-error { color: var(--color-error, #b00020); margin: 0 0 0.8rem; }
    .demo-points { margin: 0 0 0.8rem; padding-left: 1.2rem; }
    .demo-points li { margin: 0.35rem 0; color: var(--text-secondary, #555b62); }
    .demo-points strong { color: var(--text-primary, #212529); }
    .demo-terms a { color: var(--brand-orange, #d48a0c); }
    .demo-actions { display: flex; justify-content: flex-end; }
    .demo-button { font: inherit; font-weight: 600; cursor: pointer; border: 0; border-radius: 6px; padding: 0.55rem 1.1rem;
      background: var(--brand-orange, #d48a0c); color: var(--brand-orange-text, var(--text-on-primary, #fff)); }
    .demo-button[disabled] { opacity: 0.6; cursor: wait; }
    .demo-button:focus-visible { outline: 2px solid var(--text-primary, #212529); outline-offset: 2px; }
  `]
})
export class DemoNoticeComponent implements OnInit {
  showBar = false;
  barText = '';
  termsUrl = '';
  queue: TermsDoc[] = [];
  current: TermsDoc | null = null;
  currentHtml = '';
  recorded = true;
  busy = false;
  notice: DemoNotice | null = null;
  showFallbackDialog = false;

  async ngOnInit(): Promise<void> {
    await loadRuntimeConfig();
    const active = await this.fetchActive();
    if (active) {
      this.showBar = active.show_bar;
      this.barText = active.bar_text || 'Demonstration instance. Do not enter personal information — anything you put here may be public and can be wiped at any time.';
      const demo = active.documents.find(d => d.kind === 'demo') || active.documents[0];
      this.termsUrl = demo ? this.pageUrl(demo) : '';
      this.queue = active.documents.filter(d => d.requires_acceptance && !d.accepted && !(active.subject_kind === 'anonymous' && this.cached(d)));
      this.next();
      return;
    }
    const notice = getDemoNotice();
    if (!notice || !notice.enabled) { return; }
    this.notice = notice;
    this.showBar = true;
    this.barText = 'Do not enter personal information — anything you put here may be public and can be wiped at any time.';
    this.termsUrl = notice.termsUrl || '';
    this.showFallbackDialog = !this.fallbackAcknowledged(notice);
  }

  private base(): string { return (environment.polariApiUrl || '').replace(/\/$/, ''); }

  private sessionId(): string {
    try {
      let id = localStorage.getItem(SESSION_KEY);
      if (!id) { id = (crypto && 'randomUUID' in crypto) ? crypto.randomUUID() : `s-${Date.now()}`; localStorage.setItem(SESSION_KEY, id); }
      return id;
    } catch { return `s-${Date.now()}`; }
  }

  private async fetchActive(): Promise<TermsActive | null> {
    if (!this.base()) { return null; }
    try {
      const r = await fetch(`${this.base()}/api/terms/active?app=${APP}&session=${encodeURIComponent(this.sessionId())}`, { credentials: 'omit' });
      if (!r.ok) { return null; }
      const j = await r.json() as TermsActive;
      return j && j.ok ? j : null;
    } catch { return null; }
  }

  pageUrl(doc: TermsDoc): string { return `${this.base()}${doc.page}`; }
  private cacheKey(doc: TermsDoc): string { return `polari-terms-ack:${doc.name}@${doc.version}`; }
  private cached(doc: TermsDoc): boolean { try { return localStorage.getItem(this.cacheKey(doc)) === 'yes'; } catch { return false; } }

  private next(): void {
    this.current = this.queue.shift() || null;
    this.currentHtml = this.current ? mdToHtml(this.current.body_md) : '';
    this.recorded = true;
  }

  async accept(): Promise<void> {
    if (!this.current || this.busy) { return; }
    this.busy = true;
    let ok = false;
    try {
      const r = await fetch(`${this.base()}/api/terms/accept`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ terms_name: this.current.name, terms_version: this.current.version,
                               body_sha256: this.current.body_sha256, session: this.sessionId(), app: APP })
      });
      ok = r.ok && ((await r.json()) as { ok: boolean }).ok;
    } catch { ok = false; }
    this.busy = false;
    if (!ok) { this.recorded = false; return; }
    try { localStorage.setItem(this.cacheKey(this.current), 'yes'); } catch { /* storage unavailable */ }
    this.next();
  }

  private fallbackKey(notice: DemoNotice): string { return `polari-demo-ack:${notice.version || 'v1'}`; }
  private fallbackAcknowledged(notice: DemoNotice): boolean { try { return localStorage.getItem(this.fallbackKey(notice)) === 'yes'; } catch { return false; } }
  acknowledgeFallback(): void {
    if (this.notice) { try { localStorage.setItem(this.fallbackKey(this.notice), 'yes'); } catch { /* prompt again next load */ } }
    this.showFallbackDialog = false;
  }
}

/** The small Markdown the terms documents use: ## headings, paragraphs, - lists; everything escaped. */
function mdToHtml(md: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const out: string[] = []; let para: string[] = []; let inList = false;
  const flush = () => { if (para.length) { out.push(`<p>${esc(para.join(' '))}</p>`); para = []; } };
  for (const raw of (md || '').split('\n')) {
    const s = raw.trim();
    if (s.startsWith('- ')) { flush(); if (!inList) { out.push('<ul>'); inList = true; } out.push(`<li>${esc(s.slice(2))}</li>`); continue; }
    if (inList) { out.push('</ul>'); inList = false; }
    const m = /^(#{1,6})\s+(.*)$/.exec(s);
    if (m) { flush(); const level = Math.min(6, m[1].length + 1); out.push(`<h${level}>${esc(m[2])}</h${level}>`); }
    else if (!s) { flush(); } else { para.push(s); }
  }
  flush(); if (inList) { out.push('</ul>'); }
  return out.join('\n');
}
