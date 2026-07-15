import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { forkJoin } from 'rxjs';
import { PolariScoringService } from '../../../services/polari/polari-scoring.service';
import {
  PolariElectionSummary,
  PolariDisplayVoteSummary,
  PolariLogicForkVoteSummary,
} from '../../../models/polari-scoring/polari-scoring-types';

/** Local display shape the existing template/SCSS were built around
 *  (id/name/description/status/responseCount/createdDate) — kept as
 *  the mapping target so this page's markup didn't need a rewrite,
 *  only its data source. `kind` was added 2026-07-14 (Phase 4b) to
 *  unify WorldviewElections (mechanism B — term-weighting worldviews)
 *  and GroupDisplayVotes (mechanism A — explanatory Displays) in one
 *  browsable list, since they're both real Polari voting mechanisms
 *  a citizen would want to find from the same page, while still
 *  routing each to its own distinct results view. Extended the same
 *  day with `'logic-fork-vote'` (mechanism C — which alternate
 *  criterion a decision-procedure fork should use), for the same
 *  reason. */
export interface BrowsableBallot {
  id: string;
  kind: 'election' | 'display-vote' | 'logic-fork-vote';
  name: string;
  description: string;
  status: 'active' | 'pending' | 'closed';
  responseCount: number;
  createdDate: Date;
}

/**
 * 2026-07-14 (Democratic Scorecard revamp, Phase 3a + 4b): real Polari
 * WorldviewElections + GroupDisplayVotes, not MOCK_WORLDVIEW_BALLOTS.
 * Polari only distinguishes open/closed (no DRAFT/PENDING/ARCHIVED) —
 * 'open' maps to 'active' here; nothing currently maps to 'pending',
 * so that filter is honestly empty rather than faked.
 */
@Component({
  selector: 'app-browse-worldview-ballots',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule, MatIconModule],
  templateUrl: './browse-worldview-ballots.component.html',
  styleUrl: './browse-worldview-ballots.component.scss',
})
export class BrowseWorldviewBallotsComponent implements OnInit {
  activeBallotsFilter: 'all' | 'active' | 'pending' | 'closed' = 'all';

  allBallots: BrowsableBallot[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private polariScoring: PolariScoringService,
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  private loadAll(): void {
    this.loading = true;
    this.error = null;
    forkJoin({
      elections: this.polariScoring.getElections(),
      displayVotes: this.polariScoring.getDisplayVotes(),
      logicForkVotes: this.polariScoring.getLogicForkVotes(),
    }).subscribe({
      next: ({ elections, displayVotes, logicForkVotes }) => {
        this.allBallots = [
          ...elections.map(e => this.toBrowsableElection(e)),
          ...displayVotes.map(v => this.toBrowsableDisplayVote(v)),
          ...logicForkVotes.map(v => this.toBrowsableLogicForkVote(v)),
        ];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not reach Polari’s scoring engine — '
          + (err?.message || 'unknown error');
        this.allBallots = [];
        this.loading = false;
      },
    });
  }

  private toBrowsableElection(e: PolariElectionSummary): BrowsableBallot {
    return {
      id: e.name,
      kind: 'election',
      name: e.displayName,
      description: e.description,
      status: e.status === 'closed' ? 'closed' : 'active',
      responseCount: e.ballotsCast,
      createdDate: new Date(e.opensDate || e.closesDate || Date.now()),
    };
  }

  private toBrowsableDisplayVote(
    v: PolariDisplayVoteSummary,
  ): BrowsableBallot {
    return {
      id: v.name,
      kind: 'display-vote',
      name: v.displayName,
      description: v.description,
      status: v.status === 'closed' ? 'closed' : 'active',
      responseCount: v.ballotsCast,
      createdDate: new Date(v.opensDate || v.closesDate || Date.now()),
    };
  }

  private toBrowsableLogicForkVote(v: PolariLogicForkVoteSummary): BrowsableBallot {
    return {
      id: v.name,
      kind: 'logic-fork-vote',
      name: v.displayName,
      description: v.description,
      status: v.status === 'closed' ? 'closed' : 'active',
      responseCount: v.ballotsCast,
      createdDate: new Date(v.opensDate || v.closesDate || Date.now()),
    };
  }

  get filteredBallots(): BrowsableBallot[] {
    if (this.activeBallotsFilter === 'all') {
      return this.allBallots;
    }
    return this.allBallots.filter(ballot => ballot.status === this.activeBallotsFilter);
  }

  setFilter(filter: 'all' | 'active' | 'pending' | 'closed') {
    this.activeBallotsFilter = filter;
  }

  kindLabel(kind: BrowsableBallot['kind']): string {
    return {
      'election': 'Worldview Election',
      'display-vote': 'Display Vote',
      'logic-fork-vote': 'Logic-Fork Vote',
    }[kind];
  }

  selectBallot(ballot: BrowsableBallot) {
    const route = {
      'election': '/polari-elections',
      'display-vote': '/polari-display-votes',
      'logic-fork-vote': '/polari-logic-fork-votes',
    }[ballot.kind];
    this.router.navigate([route, ballot.id]);
  }

  goBack() {
    this.router.navigate(['/worldview-ballot']);
  }
}
