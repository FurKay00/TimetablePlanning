import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ProfileInfo} from '../../../models/ProfileInfo';
import {NgForOf} from '@angular/common';
import {LecturerView} from '../../../models/response_models';

@Component({
  selector: 'app-lecturer-drop-down',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './lecturer-drop-down.component.html',
  styleUrl: './lecturer-drop-down.component.css'
})
export class LecturerDropDownComponent {
  @Input() lecturers: LecturerView[] | null = null;
  selectedLecturer: LecturerView | null = null;
  @Output() lecturerSelected = new EventEmitter<LecturerView>();


  onLecturerSelect(lecturer: LecturerView): void {
    this.lecturerSelected.emit(lecturer);
    this.selectedLecturer = lecturer;
  }
}
