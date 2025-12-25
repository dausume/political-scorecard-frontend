import { Component, Input } from '@angular/core';

@Component({
  selector: 'polari-terms-row',
  standalone: true,
  imports: [],
  templateUrl: './terms-row.component.html',
  styleUrl: './terms-row.component.scss'
})
export class TermsRowComponent {
  @Input() terms: any[];  // Receive terms as input
}
