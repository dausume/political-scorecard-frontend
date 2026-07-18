import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import {
  AuthorityApiService,
  AuthorityCheck,
  AuthorityVerdict,
  PolariInstance,
} from '../../../services/api/authority-api.service';

/**
 * The signal form: "we want to make this term available for this
 * context on the PSC." The verdict comes back check-by-check
 * (group-authority / instance-authority / binding-active) and is
 * rendered in full — an admission shows its provenance, a refusal
 * names exactly which check failed and why.
 */
@Component({
  selector: 'app-term-signal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatInputModule, MatSelectModule],
  templateUrl: './term-signal.component.html',
  styleUrls: ['./term-signal.component.scss'],
})
export class TermSignalComponent {
  @Input() instances: PolariInstance[] = [];
  @Output() admitted = new EventEmitter<void>();

  signal = {
    termName: '',
    contextName: '',
    groupName: '',
    instanceName: '',
    conceptName: '',
    description: '',
    category: '',
  };
  submitting = false;
  result: AuthorityVerdict | null = null;

  constructor(private authorityApi: AuthorityApiService) {}

  submit(): void {
    this.submitting = true;
    this.result = null;
    if (!this.signal.instanceName && this.instances.length > 0) {
      this.signal.instanceName = this.instances[0].name;
    }
    this.authorityApi.submitTermAvailability(this.signal).subscribe({
      next: (result) => {
        this.result = result;
        this.submitting = false;
        if (result['admitted']) {
          this.admitted.emit();
        }
      },
      error: (err) => {
        this.result = err?.error || { ok: false, error: 'Signal submission failed.' };
        this.submitting = false;
      },
    });
  }

  get verdictChecks(): AuthorityCheck[] {
    const verdict = (this.result?.['polariVerdict'] as AuthorityVerdict)?.['verdict'] as AuthorityVerdict;
    return (verdict?.checks as AuthorityCheck[]) || [];
  }

  asJson(value: unknown): string {
    return JSON.stringify(value, null, 1);
  }
}
