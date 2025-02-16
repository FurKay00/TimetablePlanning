import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CalendarEvent, CalendarView} from 'angular-calendar';
import {DateService} from '../../../../services/date.service';
import {ScheduleService} from '../../../../services/schedule.service';
import {ScheduleComponent} from '../../../timetable/schedule/schedule.component';
import {ToolbarComponent} from '../../../general/toolbar/toolbar.component';

@Component({
  selector: 'app-lecturer-schedule',
  standalone: true,
  imports: [
    ScheduleComponent,
    ToolbarComponent
  ],
  templateUrl: './lecturer-schedule.component.html',
  styleUrl: './lecturer-schedule.component.css'
})
export class LecturerScheduleComponent implements OnInit{
  lecturerId: string = "";
  screen: string = "";
  selectedWeekDays: Date[] = [];
  selectedDay: Date = new Date();
  calendarView = CalendarView.Week;
  lecturerAppointments: CalendarEvent[] = [];
  personalAppointments: CalendarEvent[] = [];
  fullAppointments: CalendarEvent[] = []

  constructor(private route:ActivatedRoute, private dateService:DateService, private scheduleService:ScheduleService) {
    this.selectedWeekDays = dateService.initializeWeekDays();
  }


  ngOnInit():void{
    this.route.paramMap.subscribe((params) => {
      this.lecturerId = params.get("lecturerId") || "";
      this.loadLecturerSchedule();
    })
  }


  loadLecturerSchedule() {
    if(this.lecturerId === "")
      return;
    this.scheduleService.getFullAppointmentsByLecturer(this.lecturerId).subscribe(
      (data) => {
        this.lecturerAppointments = data.appointments;
        this.personalAppointments = data.personalAppointments;
        this.fullAppointments = [...this.lecturerAppointments, ...this.personalAppointments];
      },
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
}
