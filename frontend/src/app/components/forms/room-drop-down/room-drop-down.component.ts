import {Component, EventEmitter, Input, Output} from '@angular/core';
import {LecturerView, RoomView} from '../../../models/response_models';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-room-drop-down',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './room-drop-down.component.html',
  styleUrl: './room-drop-down.component.css'
})
export class RoomDropDownComponent {
  @Input() rooms: RoomView[] | null = null;
  selectedRoom: RoomView | null = null;
  @Output() roomSelected = new EventEmitter<RoomView>();

  onRoomSelect(room: RoomView): void {
    this.roomSelected.emit(room);
    this.selectedRoom = room;
  }
}
