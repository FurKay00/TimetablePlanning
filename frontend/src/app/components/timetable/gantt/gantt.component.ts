import {Component, Input, OnChanges, OnInit} from '@angular/core';
import {
  GANTT_GLOBAL_CONFIG,
  GanttDate,
  GanttGroup, GanttItem, GanttViewDate, GanttViewOptions, GanttViewType,
  NgxGanttModule,
} from "@worktile/gantt";
import {DatePipe, NgClass} from '@angular/common';
import {Subject} from 'rxjs';

@Component({
  selector: 'app-gantt',
  standalone: true,
  imports: [NgxGanttModule, NgClass, DatePipe],
  templateUrl: './gantt.component.html',
  styleUrl: './gantt.component.css'
})
export class GanttComponent implements OnInit, OnChanges{

  @Input() items: GanttItem =
    {
      id: "Ressource1",
      title: "Ressource 1",
      children:
      [{
      id: '000000',
      title: 'Task 0',
      start: new GanttDate(new Date()).getUnixTime(),
      end: new GanttDate(new Date()).addHours(2).getUnixTime(),
      itemDraggable: true,
      group_id: "1"
    },
    {
      id: '000001',
      title: 'Task 1',
      start: new GanttDate(new Date()).getUnixTime(),
      end: new GanttDate(new Date()).addHours(5).getUnixTime(),
      itemDraggable: true,
      group_id: "1"
    },
    {
      id: '000002',
      title: 'Task 2',
      start: new GanttDate(new Date()).getUnixTime(),
      end: new GanttDate(new Date()).addDays(1).getUnixTime(),
      itemDraggable: true,
      group_id: "1"
    },
    {
      id: '000003',
      title: 'Task 3',
      start: new GanttDate(new Date()).getUnixTime(),
      end: new GanttDate(new Date()).addDays(2).getUnixTime(),
      itemDraggable: true,
      group_id: "1"
    }]
}
  @Input() groupItems:GanttGroup[] = [
    {id:"1", title:"Resource 1"},
    {id:"2", title:"Resource 2"},
    {id:"3", title:"Resource 3"},
    {id:"4", title:"Resource 4"},

  ];
  @Input() ganttItems: GanttItem[] = [];
  refresh: Subject<void> = new Subject<void>();
  @Input() ganttTitle: string = ""
  protected readonly GanttViewType = GanttViewType;
  viewOptions: GanttViewOptions = {};

  ngOnInit() {
    this.items.children?.forEach(child => console.log(child))
    this.viewOptions = {
      min: new GanttDate(new Date()).startOfWeek()
    };
  }

  ngOnChanges(){
    this.refresh.next();
    console.log('Groups:', JSON.stringify(this.groupItems, null, 2));
    console.log('Items:', JSON.stringify(this.ganttItems, null, 2));
  }
}
