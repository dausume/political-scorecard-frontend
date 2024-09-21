import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompetitiveScoringComponent } from './competitive-scoring.component';

describe('CompetitiveScoringComponent', () => {
  let component: CompetitiveScoringComponent;
  let fixture: ComponentFixture<CompetitiveScoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitiveScoringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompetitiveScoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
