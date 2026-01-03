import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environment';

@Injectable({
  providedIn: 'root'
})
export class CompetitiveScoringService {

  constructor(private http: HttpClient) {}

  getTerms(): Observable<any> {
    return this.http.get(`${environment.backendUri}/terms`);
  }

  getScores(): Observable<any> {
    return this.http.get(`${environment.backendUri}/scores`);
  }

  getWorldViewBallots(): Observable<any> {
    return this.http.get(`${environment.backendUri}/worldview-ballots`);
  }

  getCategories(): Observable<any> {
    return this.http.get(`${environment.backendUri}/categories`);
  }
}