import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PolicyScoringComponent } from './policy-scoring.component';

describe('PolicyScoringComponent', () => {
  let component: PolicyScoringComponent;
  let fixture: ComponentFixture<PolicyScoringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PolicyScoringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PolicyScoringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
