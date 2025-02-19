import {Component, Inject, Input} from '@angular/core';
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {CalendarEvent, CalendarView, CalendarWeekModule} from 'angular-calendar';
import {addDays, addHours} from 'date-fns';
import {ScheduleComponent} from '../../timetable/schedule/schedule.component';
import {NgForOf, NgIf} from '@angular/common';
import {ToolbarComponent} from '../../general/toolbar/toolbar.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {RoleService} from '../../../services/role.service';
import {LecturerView, RoomView} from '../../../models/response_models';
import {RoomService} from '../../../services/room.service';
import {MatFormField} from '@angular/material/form-field';
import {MatOption, MatSelect, MatSelectChange} from '@angular/material/select';
import {MatLabel} from '@angular/material/input';


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
    MatIconButton,
    MatFormField,
    MatSelect,
    MatOption,
    NgForOf,
    MatLabel
  ],
  templateUrl: './create-appointment-modal.component.html',
  styleUrl: './create-appointment-modal.component.css'
})
export class CreateAppointmentModalComponent {
  @Input() previousEvents: CalendarEvent[] = [];
  @Input() pickedDate: Date = new Date();

  appointmentForm: FormGroup;
  appointmentType: 'single' | 'block' = 'single';
  events: CalendarEvent[] = [];
  selectedDay: Date = new Date();
  calendarView = CalendarView.Week;
  selectedWeekDays: Date[] = [];
  lecturers: LecturerView[] = [];
  rooms: RoomView[] = [];
  classes: string[] = [];

  constructor(private fb: FormBuilder,
              public dialogRef: MatDialogRef<CreateAppointmentModalComponent>,
              @Inject(MAT_DIALOG_DATA) public  data: any,
              private roleService: RoleService,
              private roomService: RoomService) {
    this.previousEvents = data.previousEvents;
    this.pickedDate = data.pickedDate;

    this.appointmentForm = this.fb.group({
      type: ['Lecture'],
      title: ['New Appointment'],
      date: [new Date()],
      startTime: ['12:00'],
      endTime: ['13:15'],
      lecturers: this.fb.array([]),
      rooms: this.fb.array([]),
      // Block-specific fields
      maxHours: [4],
      frequency: [4],
    });
    this.getAllLecturers();
    this.getAllRooms();
    this.getAllClasses();
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
        color: { primary: '#228B22', secondary: '#90EE90' },
        meta: { location: formData.room, lecturer: formData.lecturer },
      },
    ];

    if (this.appointmentType === 'block') {

      for (let i = 1; i < formData.frequency; i++) {
        this.events.push({
          start: addDays(new Date(formData.date + ' ' + formData.startTime), i),
          end: addHours(addDays(new Date(formData.date + ' ' + formData.startTime), i), formData.maxHours),
          title: formData.title + ' (Repeated)',
          color: { primary: '#FFD700', secondary: '#FFFACD' },
          meta: { location: formData.room, lecturer: formData.lecturer },
        });
      }
    }
  }

  submitEvent() {
    console.log('Event Submitted:', this.events);
  }

  onWeekDaysSelected(weekDays: Date[]):void{
    this.selectedWeekDays = weekDays;
  }

  onDaySelected(day: Date):void{
    this.pickedDate = day;
  }

  onViewSelected($event: CalendarView) {
    this.calendarView = $event;
  }

  closeDialog():void{
    this.dialogRef.close();
  }

  private getAllClasses() {
    //TODO Service
  }

  private getAllLecturers() {
    this.roleService.retrieveAllLecturers().subscribe(data => this.lecturers = data);
  }

  private getAllRooms(){
    this.roomService.retrieveAllRooms().subscribe(data => this.rooms = data);
  }

  onLecturerSelection(event: any) {
    const selectedOptions = event.value;
    const lecturersArray = this.appointmentForm.get('lecturers') as FormArray;
    lecturersArray.clear();
    selectedOptions.forEach((lecturer: LecturerView) =>
      lecturersArray.push(this.fb.control(lecturer.lec_id))
    );
  }

  onRoomSelection(event: any) {
    const selectedOptions = event.value;
    const roomsArray = this.appointmentForm.get('rooms') as FormArray;
    roomsArray.clear();
    selectedOptions.forEach((room: RoomView) =>
      roomsArray.push(this.fb.control(room.room_id))
    );
  }
}
