import {Component, Input} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {Conflict} from '../../../models/response_models';
import {GanttComponent} from '../gantt/gantt.component';

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
export class ConflictViewComponent {
  @Input() conflictData: Conflict[] = [];
}
