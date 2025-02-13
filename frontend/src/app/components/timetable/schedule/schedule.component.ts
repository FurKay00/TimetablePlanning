import {ChangeDetectorRef, Component, OnInit} from '@angular/core';
import {CalendarEvent, CalendarEventTimesChangedEvent, CalendarModule, CalendarView} from 'angular-calendar';
import {addDays, subDays} from 'date-fns';
import {CommonModule} from '@angular/common';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
  imports: [CommonModule, CalendarModule],
  standalone: true
})
export class ScheduleComponent implements OnInit{
  view: CalendarView = CalendarView.Week;
  viewDate: Date = new Date();

  events: CalendarEvent[] = [
    {
      id: 1,
      start: new Date(),
      end: addDays(new Date(), 1),
      title: 'Advanced Software Engineering',
      draggable:true,
      color: { primary: '#62D2DC', secondary: '#62D2DC' },
      meta: { location: 'Building A - Room 135', lecturer: 'Max Mustermann' },
      cssClass: 'custom-event-style'
    },
    {
      id: 2,
      start: subDays(new Date(), 1),
      end: new Date(),
      title: 'IT-Security',
      color: { primary: '#62D2DC', secondary: '#62D2DC' },
      meta: { location: 'Building A - Room 230', lecturer: 'John Doe' },
      cssClass: 'custom-event-style'
    }
  ];
  refresh: Subject<void> = new Subject<void>();

  addEvent(): void {
    this.events.push({
      start: new Date(),
      end: addDays(new Date(), 1),
      title: 'New Course Added',
      color: { primary: '#FF9800', secondary: '#FF9800' },
      meta: { location: 'Building C - Room 120', lecturer: 'Jane Doe' },
      cssClass: 'custom-event-style'
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

  trackByEventId(index: number, event: CalendarEvent): string | number {
    return event.id ?? index;
  }

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit(){
    this.cdr.detectChanges();
  }
}
