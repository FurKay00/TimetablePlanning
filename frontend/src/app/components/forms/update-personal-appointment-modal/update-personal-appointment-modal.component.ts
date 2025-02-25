import { Component,  Inject, Input, OnInit,} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CalendarEvent, CalendarView, CalendarWeekModule} from 'angular-calendar';
import {ScheduleComponent} from '../../timetable/schedule/schedule.component';
import {formatDate, NgForOf, NgIf} from '@angular/common';
import {ToolbarComponent} from '../../general/toolbar/toolbar.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {RoleService} from '../../../services/role.service';
import {BasicAppointmentRequest, LecturerView, ModuleView, RoomView} from '../../../models/response_models';
import {RoomService} from '../../../services/room.service';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatLabel} from '@angular/material/input';
import {ScheduleService} from '../../../services/schedule.service';
import {Subject} from 'rxjs';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-update-appointment-modal',
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
    MatLabel,
    MatError,
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  templateUrl: './update-personal-appointment-modal.component.html',
  styleUrl: './update-personal-appointment-modal.component.css'
})
export class UpdatePersonalAppointmentModalComponent implements OnInit{
  @Input() previousEvents: CalendarEvent[] = [];
  @Input() pickedDate: Date = new Date();
  @Input() selectedLecturer: number;

  appointmentForm: FormGroup;
  events: CalendarEvent[] = [];
  selectedDay: Date = new Date();
  calendarView = CalendarView.Week;
  selectedWeekDays: Date[] = [];

  selectedEvent: CalendarEvent|null = null;

  changedEvents: CalendarEvent[] = [];
  refresh: Subject<void> = new Subject<void>();
  isLoaded:boolean = true;

  constructor(private fb: FormBuilder,
              public dialogRef: MatDialogRef<UpdatePersonalAppointmentModalComponent>,
              @Inject(MAT_DIALOG_DATA) public  data: any,
              private roleService: RoleService,
              private roomService: RoomService,
              private scheduleService: ScheduleService,
              private dialog:MatDialog
              ) {
    this.previousEvents = data.previousEvents;
    this.pickedDate = data.pickedDate;
    this.selectedLecturer = data.selectedLecturer;

    this.appointmentForm = this.initializeForm();

    this.events = this.previousEvents;
  }


  private initializeForm():FormGroup {
    return this.fb.group({
      title: ['New Appointment', [Validators.required]],
      date: [formatDate(this.pickedDate, "YYYY-MM-dd", "EN-US"), [Validators.required]],
      startTime: ['12:00', [Validators.required]],
      endTime: ['14:30', [Validators.required]],
    });
  }

  previewEvent() {
  }

  deleteEvent(){
    if(this.selectedEvent === null) return;
    if(this.isFormValid()){
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Confirm deletion',
          message: 'Are you sure you want to delete this appointment?'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('User confirmed');
          this.deleteSelectedEvent();
        } else {
          console.log('User canceled');
        }
      });
    }
  }

  updateEvent() {
    if (this.isFormValid()) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Update data',
          message: 'Are you sure you want to update the selected appointments?'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('User confirmed');
          this.updateAppointments();
        } else {
          console.log('User canceled');
        }
      });
    } else {
      console.error('Form is invalid. Please fill in all required fields.');
    }
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

  onEventMoved($event: CalendarEvent){
    const newStart = $event.start;
    const newEnd = $event.end;

    this.previousEvents.forEach(event => {
      if($event.id === event.id){
        event.start = newStart;
        event.end = newEnd;
      }
    });

    const newDate = newStart.toISOString().split('T')[0];
    const newStartTime = newStart.toTimeString().slice(0,5);
    const newEndTime = newEnd?.toTimeString().slice(0,5);

    this.appointmentForm.patchValue({
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
    });
    this.refreshView();
  }

  onEventClicked($event:CalendarEvent){
    if(this.selectedEvent !== null && !this.isFormValid() ){
      return;
    }else if(!$event.meta.isLecturerAppointment){
      return;
    }
    this.selectedEvent = $event;

    this.appointmentForm.patchValue({
      title: $event.title,
      date: [formatDate($event.start, "YYYY-MM-dd", "EN-US")],
      startTime: [formatDate($event.start, "hh:mm", "EN-US")],
      endTime: [formatDate($event.end as Date, "hh:mm", "EN-US")],
    });
    this.selectedEvent.draggable=true;

  }
  closeDialog():void{
    this.dialogRef.close();
  }

  ngOnInit() {
    this.appointmentForm = this.initializeForm();
  }

  refreshView() {
    const formData = this.appointmentForm?.value;
    if(this.selectedEvent === null) return;

    const eventIndex = this.changedEvents.findIndex(event => event.id === this.selectedEvent?.id);

    this.events.forEach(event => {
        if (this.selectedEvent?.id === event.id) {
          event.title = formData.title;
          event.start = new Date(`${formData.date}T${formData.startTime}:00`);
          event.end = new Date(`${formData.date}T${formData.endTime}:00`);
          event.color = this.scheduleService.personalColor
        }
    });
    if (eventIndex !== -1) {
      this.changedEvents[eventIndex] = this.selectedEvent;
    } else {
      this.changedEvents.push(this.selectedEvent);
    }
    console.log(this.changedEvents)
    this.refresh.next();
  }

  isFormValid(): boolean {
    this.appointmentForm.markAllAsTouched();

    return this.appointmentForm.valid;
  }

  private updateAppointments() {
    const changedEvents = this.changedEvents.map(event => this.scheduleService.mapEventToPersonalAppointment(event));
    console.log(changedEvents);

    this.scheduleService.updatePersonalAppointments(changedEvents).subscribe(data => {
      this.isLoaded = false;
      this.scheduleService.getFullAppointmentsByLecturer(this.selectedLecturer+"").subscribe(
        data => {
          this.previousEvents = this.scheduleService.createPreviousAppointments([...data.appointments, ...data.personalAppointments]);
          this.events = this.previousEvents;
          this.changedEvents = [];
          this.selectedEvent = null;
          this.isLoaded = true;
        }
      )

    });
  }

  private deleteSelectedEvent() {
    if(this.selectedEvent=== null || !this.selectedEvent.meta.isLecturerAppointment) return;
    const id = this.selectedEvent.id;
    console.log(id)
    this.scheduleService.deletePersonalAppointment(id as number).subscribe(data => {
      this.previousEvents = this.previousEvents.filter(event => event.id !== id)
      this.changedEvents = this.changedEvents.filter(event => event.id !== id);
      this.events = this.events.filter(event => event.id !== id);
      this.selectedEvent = null;
      this.refresh.next();
    });
  }
}
