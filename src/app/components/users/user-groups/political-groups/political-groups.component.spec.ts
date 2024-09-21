import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PoliticalGroupsComponent } from './political-groups.component';

describe('PoliticalGroupsComponent', () => {
  let component: PoliticalGroupsComponent;
  let fixture: ComponentFixture<PoliticalGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PoliticalGroupsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PoliticalGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
