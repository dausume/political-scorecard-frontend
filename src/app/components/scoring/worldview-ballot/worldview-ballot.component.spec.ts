import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorldviewBallotComponent } from './worldview-ballot.component';

describe('WorldviewBallotComponent', () => {
  let component: WorldviewBallotComponent;
  let fixture: ComponentFixture<WorldviewBallotComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorldviewBallotComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorldviewBallotComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
