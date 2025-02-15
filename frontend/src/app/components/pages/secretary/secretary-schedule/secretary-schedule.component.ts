import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DateService} from '../../../../services/date.service';
import {ToolbarComponent} from '../../../general/toolbar/toolbar.component';
import {CalendarEvent, CalendarView} from 'angular-calendar';
import {ScheduleComponent} from '../../../timetable/schedule/schedule.component';
import {ScheduleService} from '../../../../services/schedule.service';

@Component({
  selector: 'app-secretary-schedule',
  standalone: true,
  imports: [
    ToolbarComponent,
    ScheduleComponent
  ],
  templateUrl: './secretary-schedule.component.html',
  styleUrl: './secretary-schedule.component.css'
})
export class SecretaryScheduleComponent implements OnInit{
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
      this.loadLecturerSchedule();
    })
  }

  loadLecturerSchedule() {
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
