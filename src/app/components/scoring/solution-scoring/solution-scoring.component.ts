import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { environment } from '../../../../environment';

@Component({
  selector: 'app-solution-scoring',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatDividerModule, MatIconModule, MatButtonModule],
  templateUrl: './solution-scoring.component.html',
  styleUrl: './solution-scoring.component.scss'
})
export class SolutionScoringComponent {
  polariResearchFrameworkUrl = environment.polariResearchFrameworkUrl;
}
