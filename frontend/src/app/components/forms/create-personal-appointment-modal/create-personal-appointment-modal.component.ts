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
import {
  BasicAppointmentRequest,
  LecturerView,
  ModuleView, PersonalAppointmentRequest,
  PersonalAppointmentView,
  RoomView
} from '../../../models/response_models';
import {RoomService} from '../../../services/room.service';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatLabel} from '@angular/material/input';
import {ScheduleService} from '../../../services/schedule.service';
import {Subject} from 'rxjs';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';

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
    MatLabel,
    MatError,
    MatButtonToggleGroup,
    MatButtonToggle
  ],
  templateUrl: './create-personal-appointment-modal.component.html',
  styleUrl: './create-personal-appointment-modal.component.css'
})
export class CreatePersonalAppointmentModalComponent implements OnInit{
  @Input() previousEvents: CalendarEvent[] = [];
  @Input() pickedDate: Date = new Date();
  @Input() selectedLecturer: number;

  appointmentForm: FormGroup;
  appointmentType: 'single' | 'block' = 'single';
  events: CalendarEvent[] = [];
  selectedDay: Date = new Date();
  calendarView = CalendarView.Week;
  selectedWeekDays: Date[] = [];

  newEvent: CalendarEvent;

  isLoaded:boolean = true;
  refresh: Subject<void> = new Subject<void>();

  constructor(private fb: FormBuilder,
              public dialogRef: MatDialogRef<CreatePersonalAppointmentModalComponent>,
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

    this.newEvent = this.createInitialEvent();
    this.events = [this.newEvent].concat(this.previousEvents);

  }


  private initializeForm():FormGroup {
    return this.fb.group({
      title: ['New Appointment', [Validators.required]],
      date: [formatDate(this.pickedDate, "YYYY-MM-dd", "EN-US"), [Validators.required]],
      startTime: ['12:00', [Validators.required]],
      endTime: ['14:30', [Validators.required]],
    });
  }


  submitEvent() {
    if (this.isFormValid()) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '400px',
        data: {
          title: 'Confirm data',
          message: 'Are you sure you want to submit this appointment?'
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          console.log('User confirmed');
          this.submitNewEvent();
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
  }

  closeDialog():void{
    this.dialogRef.close();
  }

  createInitialEvent():CalendarEvent {
     const formData = this.appointmentForm?.value;
     return {
       id: "T1",
       start: new Date(`${formData.date}T${formData.startTime}:00`),
       end:   new Date(`${formData.date}T${formData.endTime}:00`),
       title: formData.title,
       draggable: true,
       color: this.scheduleService.personalColor,
       meta: {
         isLecturer:true,
       },
       cssClass: 'custom-event-style'
     };
  }

  ngOnInit() {
    this.appointmentForm = this.initializeForm();

  }

  refreshView() {
    const formData = this.appointmentForm?.value;
    this.events.forEach(event => {
      if(this.newEvent.id === event.id){
        event.title= formData.title;
        event.start = new Date(`${formData.date}T${formData.startTime}:00`);
        event.end = new Date(`${formData.date}T${formData.endTime}:00`);
        event.color = this.scheduleService.personalColor
      }
    });
    this.events = [this.newEvent].concat(this.previousEvents);
    this.refresh.next();
  }

  isFormValid(): boolean {
    this.appointmentForm.markAllAsTouched();

    return this.appointmentForm.valid;
  }

  submitNewEvent(){

    let newAppointment: PersonalAppointmentRequest = {
        lec_id: this.selectedLecturer as number,
        date: this.appointmentForm.get("date")?.value,
        end_time:  this.appointmentForm.get("endTime")?.value + ":00.000Z",
        start_time: this.appointmentForm.get("startTime")?.value + ":00.000Z",
        title: this.appointmentForm.get("title")?.value,
      }
      console.log(newAppointment)
      this.isLoaded = false;

      this.scheduleService.createNewPersonalAppointment(newAppointment).subscribe(()=> {
        this.scheduleService.getFullAppointmentsByLecturer(this.selectedLecturer+"").subscribe(data => {
          this.previousEvents = this.scheduleService.createPreviousAppointments([...data.appointments, ...data.personalAppointments]);
          this.newEvent = this.createInitialEvent();
          this.events = [this.newEvent].concat(this.previousEvents);
          this.isLoaded = true;
        })
      })
  }
}
