import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AboutPolariComponent } from './about-polari.component';

describe('AboutPolariComponent', () => {
  let component: AboutPolariComponent;
  let fixture: ComponentFixture<AboutPolariComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutPolariComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AboutPolariComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
