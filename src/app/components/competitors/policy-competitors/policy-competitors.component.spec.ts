import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyCompetitorsComponent } from './policy-competitors.component';

describe('PoliticalCompetitorsComponent', () => {
  let component: PolicyCompetitorsComponent;
  let fixture: ComponentFixture<PolicyCompetitorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyCompetitorsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyCompetitorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
