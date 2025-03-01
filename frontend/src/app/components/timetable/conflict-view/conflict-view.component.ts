import {Component, Input} from '@angular/core';
import {NgForOf, NgIf} from '@angular/common';
import {Conflict} from '../../../models/response_models';

@Component({
  selector: 'app-conflict-view',
  standalone: true,
  imports: [
    NgForOf,
    NgIf
  ],
  templateUrl: './conflict-view.component.html',
  styleUrl: './conflict-view.component.css'
})
export class ConflictViewComponent {
  @Input() conflictData: Conflict[] = [];
}
