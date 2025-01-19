import {AfterViewInit, Component, OnInit} from '@angular/core';
import {AppointmentComponent} from '../appointment/appointment.component';
import {NgForOf} from '@angular/common';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css'],
  imports: [
    AppointmentComponent,
    NgForOf
  ],
  standalone: true
})
export class ScheduleComponent implements OnInit, AfterViewInit {
  appointments = [
    {
      date: new Date(),
      startTime: '08:30',
      endTime: '11:00',
      lecturers: ['Max Mustermann'],
      courses: ['Advanced Software Engineering'],
      rooms: ['Building A - Room 135'],
      topic: 'Module Z',
      maxHours: 3,
      id: 'appointment-1',
    },
    {
      date: new Date(),
      startTime: '09:30',
      endTime: '11:30',
      lecturers: ['John Doe'],
      courses: ['Software Quality'],
      rooms: ['Building B - Room 135'],
      topic: 'Module Y',
      maxHours: 2,
      id: 'appointment-2',
    },
  ];
  timeScale: string[] = [];
  weekDays: { name: string; date: string }[] = [];
  scheduleHeight: number = 0;
  gridWidth: number = 0;
  draggable: boolean = true;

  ngOnInit() {
    this.generateTimeScale();
    this.generateWeekDays();
    this.calculateScheduleHeight();
  }

  ngAfterViewInit() {
    this.calculateGridWidth();
    window.addEventListener('resize', () => this.calculateGridWidth());
  }

  generateTimeScale() {
    for (let hour = 8; hour <= 18; hour++) {
      this.timeScale.push(`${hour}:00`);
    }
  }

  generateWeekDays() {
    const startOfWeek = new Date();
    const dayOfWeek = startOfWeek.getDay();
    const offset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    startOfWeek.setDate(startOfWeek.getDate() + offset);

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      this.weekDays.push({
        name: day.toLocaleDateString('en-US', { weekday: 'long' }),
        date: day.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }),
      });
    }
  }

  calculateScheduleHeight() {
    const totalHours = 10; // Schedule spans 10 hours (08:00 to 18:00)
    const heightPerHour = 100; // Each hour block is 100px tall
    this.scheduleHeight = totalHours * heightPerHour;
  }

  calculateGridWidth() {
    const scheduleElement = document.querySelector('.schedule-grid') as HTMLElement;
    if (scheduleElement) {
      this.gridWidth = scheduleElement.offsetWidth / 7; // Divide total width by 7 days
    }
  }

  // New method to calculate overlaps for appointments
  calculateOverlaps() {
    const overlapInfo = this.appointments.map((appointment, index) => {
      const overlaps = this.appointments.filter((otherAppointment, otherIndex) => {
        if (index === otherIndex) return false; // Skip the same appointment
        return (
          appointment.date.getTime() === otherAppointment.date.getTime() && // Same day
          ((this.convertTimeToHours(appointment.startTime) < this.convertTimeToHours(otherAppointment.endTime) &&
              this.convertTimeToHours(appointment.startTime) >= this.convertTimeToHours(otherAppointment.startTime)) ||
            (this.convertTimeToHours(appointment.endTime) > this.convertTimeToHours(otherAppointment.startTime) &&
              this.convertTimeToHours(appointment.endTime) <= this.convertTimeToHours(otherAppointment.endTime)))
        );
      });

      return {
        appointment,
        overlapCount: overlaps.length + 1, // Total number of overlapping appointments
        overlapIndex: overlaps.findIndex((a) => a.id === appointment.id),
      };
    });

    return overlapInfo;
  }

  convertTimeToHours(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours + minutes / 60;
  }
}
