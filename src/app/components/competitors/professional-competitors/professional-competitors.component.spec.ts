import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalGroupCompetitorsComponent } from './professional-competitors.component';

describe('ProfessionalGroupCompetitorsComponent', () => {
  let component: ProfessionalGroupCompetitorsComponent;
  let fixture: ComponentFixture<ProfessionalGroupCompetitorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalGroupCompetitorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionalGroupCompetitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
