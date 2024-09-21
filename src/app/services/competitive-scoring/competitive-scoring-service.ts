import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompetitiveScoringService {
  private apiUrl = 'http://your-api-url/api'; // Adjust to your backend API

  constructor(private http: HttpClient) {}

  getTerms(): Observable<any> {
    return this.http.get(`${this.apiUrl}/terms`);
  }

  getScores(): Observable<any> {
    return this.http.get(`${this.apiUrl}/scores`);
  }

  getWorldViewBallots(): Observable<any> {
    return this.http.get(`${this.apiUrl}/worldview-ballots`);
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`);
  }
}