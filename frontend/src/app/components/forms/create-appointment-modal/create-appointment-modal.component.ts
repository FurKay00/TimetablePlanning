import {Component, Inject} from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CalendarEvent, CalendarView, CalendarWeekModule} from 'angular-calendar';
import {addDays, addHours} from 'date-fns';
import {ScheduleComponent} from '../../timetable/schedule/schedule.component';
import {NgIf} from '@angular/common';
import {ToolbarComponent} from '../../general/toolbar/toolbar.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';


@Component({
  selector: 'app-create-appointment-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CalendarWeekModule,
    ScheduleComponent,
    NgIf,
    ToolbarComponent,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './create-appointment-modal.component.html',
  styleUrl: './create-appointment-modal.component.css'
})
export class CreateAppointmentModalComponent {
  appointmentForm: FormGroup;
  appointmentType: 'single' | 'block' = 'single';
  events: CalendarEvent[] = [];
  selectedDay: Date = new Date();
  calendarView = CalendarView.Week;
  selectedWeekDays: Date[] = [];

  constructor(private fb: FormBuilder, public dialogRef: MatDialogRef<CreateAppointmentModalComponent>, @Inject(MAT_DIALOG_DATA) public  data: any) {
    this.appointmentForm = this.fb.group({
      type: ['Lecture'],
      title: [''],
      date: [new Date()],
      startTime: ['12:00'],
      endTime: ['13:15'],
      lecturer: [''],
      room: [''],
      // Block-specific fields
      maxHours: [4],
      frequency: [4],
    });
  }


  toggleAppointmentType(type: 'single' | 'block') {
    this.appointmentType = type;
  }

  previewEvent() {
    const formData = this.appointmentForm?.value;

    this.events = [
      {
        start: new Date(formData.date + ' ' + formData.startTime),
        end: new Date(formData.date + ' ' + formData.endTime),
        title: formData.title,
        color: { primary: '#228B22', secondary: '#90EE90' }, // Green
        meta: { location: formData.room, lecturer: formData.lecturer },
      },
    ];

    if (this.appointmentType === 'block') {
      // 🔹 Add multiple events based on frequency and max hours
      for (let i = 1; i < formData.frequency; i++) {
        this.events.push({
          start: addDays(new Date(formData.date + ' ' + formData.startTime), i),
          end: addHours(addDays(new Date(formData.date + ' ' + formData.startTime), i), formData.maxHours),
          title: formData.title + ' (Repeated)',
          color: { primary: '#FFD700', secondary: '#FFFACD' }, // Yellow for block appointments
          meta: { location: formData.room, lecturer: formData.lecturer },
        });
      }
    }
  }

  submitEvent() {
    console.log('Event Submitted:', this.events);
    // Send this data to the backend or store in state
  }

  onWeekDaysSelected(weekDays: Date[]):void{
    this.selectedWeekDays = weekDays;
  }

  onDaySelected(day: Date):void{
    this.selectedDay = day;
  }

  onViewSelected($event: CalendarView) {
    this.calendarView = $event;
  }

  closeDialog():void{
    this.dialogRef.close();
  }
}
