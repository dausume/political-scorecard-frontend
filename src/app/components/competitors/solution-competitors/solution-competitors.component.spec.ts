import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionCompetitorsComponent } from './solution-competitors.component';

describe('SolutionCompetitorsComponent', () => {
  let component: SolutionCompetitorsComponent;
  let fixture: ComponentFixture<SolutionCompetitorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolutionCompetitorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolutionCompetitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
