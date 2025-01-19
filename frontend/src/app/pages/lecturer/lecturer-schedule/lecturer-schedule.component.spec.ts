import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LecturerScheduleComponent } from './lecturer-schedule.component';

describe('LecturerScheduleComponent', () => {
  let component: LecturerScheduleComponent;
  let fixture: ComponentFixture<LecturerScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LecturerScheduleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LecturerScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
