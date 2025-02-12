import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulePerRoomComponent } from './schedule-per-room.component';

describe('SchedulePerRoomComponent', () => {
  let component: SchedulePerRoomComponent;
  let fixture: ComponentFixture<SchedulePerRoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedulePerRoomComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulePerRoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
