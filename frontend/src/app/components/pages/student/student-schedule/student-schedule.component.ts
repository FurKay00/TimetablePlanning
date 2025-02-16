import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CalendarEvent, CalendarView} from 'angular-calendar';
import {DateService} from '../../../../services/date.service';
import {ScheduleService} from '../../../../services/schedule.service';
import {ScheduleComponent} from '../../../timetable/schedule/schedule.component';
import {ToolbarComponent} from '../../../general/toolbar/toolbar.component';

@Component({
  selector: 'app-student-schedule',
  standalone: true,
  imports: [
    ScheduleComponent,
    ToolbarComponent
  ],
  templateUrl: './student-schedule.component.html',
  styleUrl: './student-schedule.component.css'
})
export class StudentScheduleComponent implements OnInit{
  classId: string = "";
  screen: string = "";
  selectedWeekDays: Date[] = [];
  selectedDay: Date = new Date();
  calendarView = CalendarView.Week;
  classAppointments: CalendarEvent[] = []

  constructor(private route:ActivatedRoute, private dateService:DateService, private scheduleService:ScheduleService) {
    this.selectedWeekDays = dateService.initializeWeekDays();
  }

  ngOnInit():void{
    this.route.paramMap.subscribe((params) => {
      this.classId = params.get("classId") || "";
      this.loadClassSchedule();
    })
  }

  loadClassSchedule(){
    if(this.classId === "")
      return;
    this.scheduleService.getAppointmentsByClass(this.classId).subscribe(
      (data: any[]) => {
        this.classAppointments = data;
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
}
