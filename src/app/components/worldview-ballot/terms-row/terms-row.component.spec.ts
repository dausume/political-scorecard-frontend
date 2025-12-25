import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsRowComponent } from './terms-row.component';

describe('TermWeightingRowComponent', () => {
  let component: TermsRowComponent;
  let fixture: ComponentFixture<TermsRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TermsRowComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
