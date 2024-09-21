import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { HomePageComponent } from './home-page.component';
import { RouterLinkDirectiveStub } from '../../test/router-link-directive-stub';

describe('HomePageComponent', () => {
  let component: HomePageComponent;
  let fixture: ComponentFixture<HomePageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HomePageComponent,
        RouterTestingModule,  // Mock RouterModule to prevent real navigation
        MatCardModule,
        MatButtonModule
      ],
      declarations: [RouterLinkDirectiveStub],  // Use stub for routerLink testing
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomePageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Check component creation
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Check the presence of the informational section
  it('should render informational card with the correct text', () => {
    const infoCard = fixture.debugElement.query(By.css('.info-card'));
    const infoCardText = infoCard.nativeElement.textContent;
    expect(infoCard).toBeTruthy();
    expect(infoCardText).toContain('Political Scorecard');
  });

  // Check that the scoring card is rendered
  it('should render the scoring card with three columns', () => {
    const scoringCard = fixture.debugElement.query(By.css('.scoring-card'));
    expect(scoringCard).toBeTruthy();

    const columns = fixture.debugElement.queryAll(By.css('.scoring-column'));
    expect(columns.length).toBe(3);
  });

  // Check that the policy scoring button exists and links to the correct route
  it('should have a Policy Scoring button that routes to /policy-scoring', () => {
    const policyButton = fixture.debugElement.query(By.css('button[routerLink="/policy-scoring"]'));
    expect(policyButton).toBeTruthy();
  });

  // Check that the competitive scoring button exists and links to the correct route
  it('should have a Competitive Scoring button that routes to /competitive-scoring', () => {
    const competitiveButton = fixture.debugElement.query(By.css('button[routerLink="/competitive-scoring"]'));
    expect(competitiveButton).toBeTruthy();
  });

  // Check that the solution scoring button exists and links to the correct route
  it('should have a Solution Scoring button that routes to /solution-scoring', () => {
    const solutionButton = fixture.debugElement.query(By.css('button[routerLink="/solution-scoring"]'));
    expect(solutionButton).toBeTruthy();
  });
});