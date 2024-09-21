import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionScoringComponent } from './solution-scoring.component';

describe('SolutionScoringComponent', () => {
  let component: SolutionScoringComponent;
  let fixture: ComponentFixture<SolutionScoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolutionScoringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolutionScoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
