import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {GanttComponent} from '../gantt/gantt.component';
import {GanttGroup, GanttItem} from '@worktile/gantt';
import {CalendarEvent} from 'angular-calendar';
import {TimelineComponent} from '../timeline/timeline.component';
import {DataGroup, DataItem} from 'vis-timeline';
import {TimelineItem} from 'vis-timeline/types';

@Component({
  selector: 'app-conflict-view',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    GanttComponent,
    TimelineComponent
  ],
  templateUrl: './conflict-view.component.html',
  styleUrl: './conflict-view.component.css'
})
export class ConflictViewComponent implements OnInit{
  @Input() conflictData: CalendarEvent[] = [];
  @Input() conflictType : "Classes" | "Lecturers" | "Rooms" = "Classes";
  @Input() groupItems:GanttGroup[] = [];
  @Input() ganttItems:GanttItem[] = [];
  @Input() timelineGroups: DataGroup[] = [];
  @Input() timelineItems: DataItem[] = [];
  @Output() eventtimeChanged: EventEmitter<CalendarEvent> = new EventEmitter<CalendarEvent>();

  ngOnInit() {
  }


  signalEventDateChange($event: TimelineItem) {

    let eventItem:CalendarEvent = {
      start: $event.start instanceof Date ? $event.start : new Date($event.start as string),
      end: $event.end instanceof Date ? $event.end : new Date($event.end as string),
      title: ($event.id + "").split("_")[0]
    }
    this.eventtimeChanged.emit(eventItem);
  }
}

