import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutTheScorecardComponent } from './about-the-scorecard.component';

describe('AboutTheScorecardComponent', () => {
  let component: AboutTheScorecardComponent;
  let fixture: ComponentFixture<AboutTheScorecardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutTheScorecardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutTheScorecardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
