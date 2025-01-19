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
  @Input() scheduleHeight!: number;
  @Input() gridWidth!: number;
  @Input() overlapCount!: number;
  @Input() overlapIndex!: number;

  height!: string;
  top!: string;
  width!: string;
  left!: string;

  ngOnInit() {
    this.calculateDimensions();
  }

  calculateDimensions() {
    const startHour = this.convertTimeToHours(this.startTime);
    const endHour = this.convertTimeToHours(this.endTime);
    const scheduleStartHour = 8;

    this.height = `${(endHour - startHour) * 100}px`;
    this.top = `${(startHour - scheduleStartHour) * 100}px`;

    const columnIndex = (this.date.getDay() + 6) % 7;
    this.width = `${this.gridWidth / this.overlapCount}px`;
    this.left = `${columnIndex * this.gridWidth + this.overlapIndex * (this.gridWidth / this.overlapCount)}px`;
  }

  convertTimeToHours(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  }
}
