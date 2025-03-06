import {Component, Input, OnInit} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {AppointmentView, Conflict} from '../../../models/response_models';
import {GanttComponent} from '../gantt/gantt.component';
import {GanttGroup, GanttItem} from '@worktile/gantt';
import {CalendarEvent} from 'angular-calendar';

@Component({
  selector: 'app-conflict-view',
  standalone: true,
  imports: [
    NgForOf,
    NgIf,
    GanttComponent
  ],
  templateUrl: './conflict-view.component.html',
  styleUrl: './conflict-view.component.css'
})
export class ConflictViewComponent implements OnInit{
  @Input() conflictData: CalendarEvent[] = [];
  @Input() conflictType : "Classes" | "Lecturers" | "Rooms" = "Classes";
  @Input() groupItems:GanttGroup[] = [];
  @Input() ganttItems:GanttItem[] = [];

  ngOnInit() {
  }
}

