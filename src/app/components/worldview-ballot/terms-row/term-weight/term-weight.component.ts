import { Component, Input } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms'; // For ngModel

@Component({
  selector: 'app-term-weight',
  standalone: true,
  imports: [MatFormFieldModule, MatIconModule, FormsModule],
  templateUrl: './term-weight.component.html',
  styleUrl: './term-weight.component.scss'
})
export class TermWeightComponent {
  @Input() term: any;  // Term details are passed as input

  weight: number = 0;  // Default weight set to 0

  // This method would open a more detailed view of the term
  showDetailedInfo() {
    console.log(`Showing detailed info for: ${this.term.name}`);
    // Logic for displaying a modal or additional details
  }
}
