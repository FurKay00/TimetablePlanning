import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SchedulePerLecturerComponent } from './schedule-per-lecturer.component';

describe('SchedulePerLecturerComponent', () => {
  let component: SchedulePerLecturerComponent;
  let fixture: ComponentFixture<SchedulePerLecturerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SchedulePerLecturerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SchedulePerLecturerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
