import { Component } from '@angular/core';
import {
  GanttDate,
  GanttGroup, GanttItem,
  NgxGanttModule,
} from "@worktile/gantt";
import {NgClass} from '@angular/common';

@Component({
  selector: 'app-gantt',
  standalone: true,
  imports: [NgxGanttModule, NgClass],
  templateUrl: './gantt.component.html',
  styleUrl: './gantt.component.css'
})
export class GanttComponent {
  constructor() {
    
  }
  items: GanttItem[] = [
    { id: '000000', title: 'Task 0', start: new GanttDate(1627729997).getUnixTime(), end: 1628421197, expandable: true },
    { id: '000001', title: 'Task 1', start: new GanttDate(1617361997).getUnixTime(), end: new GanttDate(1625483597).getUnixTime() , links: ['000003', '000004', '000000'], expandable: true },
    { id: '000002', title: 'Task 2', start: new GanttDate(1610536397).getUnixTime(), end: new GanttDate(1610622797).getUnixTime() },
    { id: '000003', title: 'Task 3', start: new GanttDate(1628507597).getUnixTime(), end: new GanttDate(1633345997).getUnixTime(), expandable: true }
  ];

  onTaskChanged(event: any) {
    if (event.task.fixed) {
      // Prevent modification of fixed tasks
      event.preventDefault();
    }
  }
}
