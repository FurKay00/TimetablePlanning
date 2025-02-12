import { Component } from '@angular/core';
import {
  CalendarEvent,
  CalendarModule,
  CalendarView,
  DateAdapter,
  CalendarUtils,
  CalendarEventTimesChangedEvent
} from 'angular-calendar';
import {adapterFactory} from 'angular-calendar/date-adapters/date-fns';
import { subDays, addDays } from 'date-fns';
import {CommonModule} from '@angular/common';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
  imports: [CommonModule, CalendarModule],
  standalone: true
})
export class ScheduleComponent {
  view: CalendarView = CalendarView.Week;
  viewDate: Date = new Date();

  events: CalendarEvent[] = [
    {
      start: new Date(),
      end: addDays(new Date(), 1),
      title: 'Advanced Software Engineering',
      draggable:true,
      color: { primary: '#03A9F4', secondary: '#B3E5FC' },
      meta: { location: 'Building A - Room 135', lecturer: 'Max Mustermann' }
    },
    {
      start: subDays(new Date(), 1),
      end: new Date(),
      title: 'IT-Security',
      color: { primary: '#0288D1', secondary: '#81D4FA' },
      meta: { location: 'Building A - Room 230', lecturer: 'John Doe' }
    }
  ];
  refresh: Subject<void> = new Subject<void>();

  addEvent(): void {
    this.events.push({
      start: new Date(),
      end: addDays(new Date(), 1),
      title: 'New Course Added',
      color: { primary: '#FF9800', secondary: '#FFCC80' },
      meta: { location: 'Building C - Room 120', lecturer: 'Jane Doe' }
    });

    // 🔹 Trigger UI refresh
    this.refresh.next();
  }

  eventTimesChanged({
                      event,
                      newStart,
                      newEnd,
                    }: CalendarEventTimesChangedEvent): void {
    event.start = newStart;
    event.end = newEnd;
    this.refresh.next();
  }
}
