import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, RouterModule],  // Add necessary imports here
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']  // Corrected styleUrls
})
export class HomePageComponent { }