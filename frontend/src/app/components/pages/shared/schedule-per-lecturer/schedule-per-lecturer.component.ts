import { Component } from '@angular/core';
import {RoleService} from '../../../../services/role.service';
import {ActivatedRoute, Router} from '@angular/router';
import {LecturerView} from '../../../../models/response_models';
import {ScheduleComponent} from '../../../timetable/schedule/schedule.component';
import {ToolbarComponent} from '../../../general/toolbar/toolbar.component';
import {CalendarEvent, CalendarView} from 'angular-calendar';
import {DateService} from '../../../../services/date.service';
import {ScheduleService} from '../../../../services/schedule.service';

@Component({
  selector: 'app-schedule-per-lecturer',
  standalone: true,
  imports: [
    ScheduleComponent,
    ToolbarComponent
  ],
  templateUrl: './schedule-per-lecturer.component.html',
  styleUrl: './schedule-per-lecturer.component.css'
})
export class SchedulePerLecturerComponent {
  currentLecturers: LecturerView[] = []
  selectedWeekDays: Date[] = [];
  selectedDay: Date = new Date();
  calendarView = CalendarView.Week;
  lecturerAppointments: CalendarEvent[] = []

  constructor(private roleService:RoleService, private scheduleService:ScheduleService) {
    roleService.retrieveAllLecturers().subscribe(data=> this.currentLecturers = data);
  }

  loadLecturerSchedule(lec_id: string) {
    if(lec_id === null)
      return;
    this.scheduleService.getPartialAppointmentsByLecturer(lec_id).subscribe(
      data => {
        this.lecturerAppointments = [...data.personalAppointments, ...data.appointments];
      }
    )
  }

  onWeekDaysSelected(weekDays: Date[]):void{
    this.selectedWeekDays = weekDays;
  }

  onDaySelected(day: Date):void{
    this.selectedDay = day;
  }

  onViewSelected($event: CalendarView) {
    this.calendarView = $event;
  }

  onLecturerSelected($event: LecturerView){
    this.loadLecturerSchedule($event.lec_id +"");
  }
}
