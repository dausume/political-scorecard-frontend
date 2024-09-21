import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliticalCompetitorsComponent } from './political-competitors.component';

describe('PoliticalCompetitorsComponent', () => {
  let component: PoliticalCompetitorsComponent;
  let fixture: ComponentFixture<PoliticalCompetitorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliticalCompetitorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliticalCompetitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
