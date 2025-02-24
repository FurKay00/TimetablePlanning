import {ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output} from '@angular/core';
import {
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarModule,
  CalendarView, CalendarWeekViewAllDayEventRow
} from 'angular-calendar';
import {addDays, addHours, subDays} from 'date-fns';
import {CommonModule} from '@angular/common';
import {Subject} from 'rxjs';
import { MatProgressSpinnerModule} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
  imports: [CommonModule, CalendarModule, MatProgressSpinnerModule],
  standalone: true
})
export class ScheduleComponent implements OnInit, OnChanges{
  @Input() pickedView:CalendarView = CalendarView.Week;
  @Input() pickedDate: Date = new Date();
  @Input() refresh: Subject<void> = new Subject<void>();
  @Input() isLoaded: boolean = true;

  @Output() eventMoved: EventEmitter<CalendarEvent> = new EventEmitter<CalendarEvent>();
  @Output() eventClicked: EventEmitter<CalendarEvent> = new EventEmitter<CalendarEvent>();

  selectedEvent: CalendarEvent | null = null;

  view: CalendarView = CalendarView.Week;
  viewDate: Date = new Date();
  excludeDays: number[] = [0, 6];
  @Input() events: CalendarEvent[] = [
    {
      id: 1,
      start: new Date(),
      end: addHours(new Date(), 4),
      title: 'Advanced Software Engineering',
      draggable:true,
      color: { primary: '#62D2DC', secondary: '#62D2DC' },
      meta: { location: 'Building A - Room 135', lecturer: 'Max Mustermann' },
      cssClass: 'custom-event-style'
    },
    {
      id: 2,
      start: subDays(new Date(), 1),
      end: addHours(subDays(new Date(), 1), 6),
      title: 'IT-Security',
      color: { primary: '#62D2DC', secondary: '#62D2DC' },
      meta: { location: 'Building A - Room 230', lecturer: 'John Doe' },
      cssClass: 'custom-event-style'
    }
  ];


  eventTimesChanged({
                      event,
                      newStart,
                      newEnd,
                    }: CalendarEventTimesChangedEvent): void {
    if(typeof newStart === "undefined" || typeof newEnd === "undefined")
      return;
    event.start = newStart;
    event.end = newEnd;
    this.refresh.next();
    this.eventMoved.emit(event);
  }

  onEventClicked(clickedEvent: CalendarEvent){
    console.log(clickedEvent)
    if(this.selectedEvent === clickedEvent){
      this.selectedEvent = null;
      return;
    }
    this.selectedEvent = clickedEvent;
    this.eventClicked.emit(clickedEvent);
    this.refresh.next();
  }

  isSelected(event:CalendarEvent){
    return this.selectedEvent && this.selectedEvent.id === event.id;
  }

  constructor(private cdr: ChangeDetectorRef) {
  }

  ngOnInit(){
    this.cdr.detectChanges();
    if(this.pickedDate !== null){
      this.viewDate = this.pickedDate;
    }
  }

  ngOnChanges(){
    this.viewDate = this.pickedDate;
    this.view = this.pickedView;
  }

  protected readonly CalendarView = CalendarView;
}
