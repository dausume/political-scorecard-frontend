import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { WorldviewBallot, MOCK_WORLDVIEW_BALLOTS } from '../../../state/mock-data/worldview-ballots.mock';

@Component({
  selector: 'app-browse-worldview-ballots',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './browse-worldview-ballots.component.html',
  styleUrl: './browse-worldview-ballots.component.scss'
})
export class BrowseWorldviewBallotsComponent {
  activeBallotsFilter: 'all' | 'active' | 'pending' | 'closed' = 'active';

  allBallots: WorldviewBallot[] = MOCK_WORLDVIEW_BALLOTS;

  constructor(private router: Router) {}

  get filteredBallots(): WorldviewBallot[] {
    if (this.activeBallotsFilter === 'all') {
      return this.allBallots;
    }
    return this.allBallots.filter(ballot => ballot.status === this.activeBallotsFilter);
  }

  setFilter(filter: 'all' | 'active' | 'pending' | 'closed') {
    this.activeBallotsFilter = filter;
  }

  selectBallot(ballotId: string) {
    this.router.navigate(['/worldview-ballot'], { queryParams: { ballotId } });
  }

  goBack() {
    this.router.navigate(['/worldview-ballot']);
  }
}
