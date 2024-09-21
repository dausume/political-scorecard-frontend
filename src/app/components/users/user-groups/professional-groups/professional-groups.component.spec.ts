import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfessionalGroupsComponent } from './professional-groups.component';

describe('ProfessionalGroupsComponent', () => {
  let component: ProfessionalGroupsComponent;
  let fixture: ComponentFixture<ProfessionalGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfessionalGroupsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfessionalGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
