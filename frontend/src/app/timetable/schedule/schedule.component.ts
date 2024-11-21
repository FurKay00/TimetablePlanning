import { Component, OnInit } from '@angular/core';
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
export class ScheduleComponent implements OnInit {
  draggable: boolean = true;
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

  ngOnInit() {
    this.generateTimeScale();
    this.generateWeekDays();
  }

  generateTimeScale() {
    for (let hour = 8; hour <= 18; hour++) {
      this.timeScale.push(`${hour}:00`);
    }
  }

  generateWeekDays() {
    const startOfWeek = this.getMondayOfCurrentWeek();
    for (let i = 0; i < 5; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      this.weekDays.push({
        name: day.toLocaleDateString('en-US', { weekday: 'long' }),
        date: day.toLocaleDateString('en-US', { day: '2-digit', month: '2-digit' }),
      });
    }
  }

  getMondayOfCurrentWeek(): Date {
    const today = new Date();
    const day = today.getDay();
    const diff = (day === 0 ? -6 : 1) - day;
    const monday = new Date(today.setDate(today.getDate() + diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }
}
