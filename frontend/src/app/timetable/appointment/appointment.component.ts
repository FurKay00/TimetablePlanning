import {Component, Input, OnInit} from '@angular/core';
import {CdkDrag, CdkDragEnd} from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-appointment',
  templateUrl: './appointment.component.html',
  styleUrls: ['./appointment.component.css'],
  imports: [
    CdkDrag
  ],
  standalone: true
})
export class AppointmentComponent implements OnInit {
  @Input() date!: Date;
  @Input() startTime!: string;
  @Input() endTime!: string;
  @Input() lecturers: string[] = [];
  @Input() courses: string[] = [];
  @Input() rooms: string[] = [];
  @Input() topic!: string;
  @Input() maxHours!: number;
  @Input() id!: string;
  @Input() draggable: boolean = false;

  height!: string;
  top!: string;
  width: string = '100%';
  left: string = '0';

  ngOnInit() {
    this.calculateDimensions();
  }

  calculateDimensions() {
    const startHour = parseFloat(this.startTime.split(':')[0]) + parseFloat(this.startTime.split(':')[1]) / 60;
    const endHour = parseFloat(this.endTime.split(':')[0]) + parseFloat(this.endTime.split(':')[1]) / 60;

    this.height = `${(endHour - startHour) * 100}px`;
    this.top = `${startHour * 100}px`;
  }

  onDragEnded(event: CdkDragEnd) {
    const newTop = event.source.getFreeDragPosition().y;
    const newHour = newTop / 100;

    const newStartHour = Math.floor(newHour);
    const newStartMinutes = Math.round((newHour - newStartHour) * 60);

    this.startTime = `${String(newStartHour).padStart(2, '0')}:${String(newStartMinutes).padStart(2, '0')}`;
    console.log(`Updated startTime: ${this.startTime}`);
  }
}
