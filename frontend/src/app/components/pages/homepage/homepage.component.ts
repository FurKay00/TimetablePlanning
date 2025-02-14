import { Component } from '@angular/core';
import {ToolbarComponent} from '../../general/toolbar/toolbar.component';
import {ScheduleComponent} from '../../timetable/schedule/schedule.component';
import {ActivatedRoute} from '@angular/router';
import {DateService} from '../../../services/date.service';
import { CalendarView} from 'angular-calendar';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    ToolbarComponent,
    ScheduleComponent
  ],
  templateUrl: './homepage.component.html',
  styleUrl: './homepage.component.css'
})
export class HomepageComponent {
  selectedWeekDays: Date[] = [];
  selectedDay: Date = new Date();
  calendarView = CalendarView.Week;

  constructor(private route:ActivatedRoute, private dateService:DateService) {
    this.selectedWeekDays = dateService.initializeWeekDays();
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
