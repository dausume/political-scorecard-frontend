import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PolariVoteApiService } from '../../../services/api/polari-vote-api.service';
import { PolariVoteTopicDTO } from '../../../models/polari-vote/polari-vote-types';

/**
 * Browse PSC-hosted public votes — the real citizen-facing voting
 * flow (2026-07-14 ballot-hosting architecture move). Distinct from
 * `browse-worldview-ballots` (which browses POLARI's own elections/
 * display-votes, read-only, drafting side) — this page is PSC's own
 * hosted votes, where real ballots actually get cast.
 */
@Component({
  selector: 'app-polari-vote-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './polari-vote-list.component.html',
  styleUrl: './polari-vote-list.component.scss',
})
export class PolariVoteListComponent implements OnInit {
  topics: PolariVoteTopicDTO[] = [];
  loading = false;
  error: string | null = null;

  constructor(
    private router: Router,
    private voteApi: PolariVoteApiService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.error = null;
    this.voteApi.getAllTopics().subscribe({
      next: (topics) => {
        this.topics = topics;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Could not reach the vote service — ' + (err?.message || 'unknown error');
        this.loading = false;
      },
    });
  }

  openTopic(id: string): void {
    this.router.navigate(['/polari-votes', id]);
  }
}
