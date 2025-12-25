import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermWeightComponent } from './term-weight.component';

describe('TermWeightComponent', () => {
  let component: TermWeightComponent;
  let fixture: ComponentFixture<TermWeightComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermWeightComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermWeightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
