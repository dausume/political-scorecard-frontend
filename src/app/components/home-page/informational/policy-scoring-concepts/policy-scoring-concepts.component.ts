import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-policy-scoring-concepts',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatDividerModule, MatIconModule, MatButtonModule],
  templateUrl: './policy-scoring-concepts.component.html',
  styleUrl: './policy-scoring-concepts.component.scss'
})
export class PolicyScoringConceptsComponent {

}
