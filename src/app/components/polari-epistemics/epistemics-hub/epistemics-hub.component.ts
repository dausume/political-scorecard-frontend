import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

/**
 * Landing page for the epistemics & trust surfaces: how the scorecard
 * grounds its claims (term proofs, term competitions, credibility
 * bases, source trust, legislation tracking), with links into each
 * section page.
 */
@Component({
  selector: 'app-epistemics-hub',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule],
  templateUrl: './epistemics-hub.component.html',
  styleUrls: ['./epistemics-hub.component.scss'],
})
export class EpistemicsHubComponent {
  sections = [
    {
      title: 'Term Proofs',
      link: '/epistemics/proofs',
      description: 'Every scored term carries proofs of what it claims, readable per '
        + 'credibility basis — plus the catalog of known data-manipulation patterns.',
    },
    {
      title: 'Term Competition',
      link: '/epistemics/term-competition',
      description: 'Competing terms for the same concept, read side by side, with the '
        + 'relations any single term participates in.',
    },
    {
      title: 'Credibility',
      link: '/epistemics/credibility',
      description: 'Assertion credibility in group and individual units, never flattened '
        + 'across credibility bases, plus each contributor\'s standing.',
    },
    {
      title: 'Sources & Trust',
      link: '/epistemics/sources',
      description: 'The source glossary and provider-reliability readings behind every '
        + 'number the scorecard cites.',
    },
    {
      title: 'Legislation Trust',
      link: '/epistemics/legislation',
      description: 'Policy drafts and their carryover, venue-mismatch patterns, and '
        + 'legislation tracking with contributions, burial checks, and voting records.',
    },
  ];
}
