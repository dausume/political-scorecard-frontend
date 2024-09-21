import { Component } from '@angular/core';
import { TermsRowComponent } from './terms-row/terms-row.component';

@Component({
  selector: 'app-worldview-ballot',
  standalone: true,
  imports: [TermsRowComponent],
  templateUrl: './worldview-ballot.component.html',
  styleUrl: './worldview-ballot.component.scss'
})
export class WorldviewBallotComponent {
  // Define sets of terms for each row
  termsSet1 = [
    { name: 'Labor Quality', description: 'Labor quality description...', source: 'Link to labor quality source' },
    { name: 'Competitiveness', description: 'Competitiveness description...', source: 'Link to competitiveness source' }
  ];

  termsSet2 = [
    { name: 'Business Reliability', description: 'Business reliability description...', source: 'Link to business reliability source' }
  ];
}
