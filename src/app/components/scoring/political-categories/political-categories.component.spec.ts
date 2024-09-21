import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliticalCategoriesComponent } from './political-categories.component';

describe('PoliticalCategoriesComponent', () => {
  let component: PoliticalCategoriesComponent;
  let fixture: ComponentFixture<PoliticalCategoriesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliticalCategoriesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliticalCategoriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
