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
  templateUrl: './update-appointment-modal.component.html',
  styleUrl: './update-appointment-modal.component.css'
})
export class UpdateAppointmentModalComponent implements OnInit{
  @Input() previousEvents: CalendarEvent[] = [];
  @Input() pickedDate: Date = new Date();
  @Input() selectedClass: string = '';

  appointmentForm: FormGroup;
  events: CalendarEvent[] = [];
  selectedDay: Date = new Date();
  calendarView = CalendarView.Week;
  selectedWeekDays: Date[] = [];

  lecturers: LecturerView[] = [];
  rooms: RoomView[] = [];
  classes: string[] = [];
  modules: ModuleView[] = [];

  selectedEvent: CalendarEvent|null = null;
  selectedModule: ModuleView  = this.modules[0];
  selectedRooms: RoomView[] = [];
  selectedLecturers: LecturerView[] = [];
  selectedClasses: string[] = [];

  changedEvents: CalendarEvent[] = [];
  refresh: Subject<void> = new Subject<void>();
  isLoaded:boolean = true;

  constructor(private fb: FormBuilder,
              public dialogRef: MatDialogRef<UpdateAppointmentModalComponent>,
              @Inject(MAT_DIALOG_DATA) public  data: any,
              private roleService: RoleService,
              private roomService: RoomService,
              private scheduleService: ScheduleService,
              private dialog:MatDialog
              ) {
    this.previousEvents = data.previousEvents;
    this.pickedDate = data.pickedDate;
    this.selectedClass = data.selectedClass;
    this.selectedClasses.push(this.selectedClass);
    this.appointmentForm = this.initializeForm();

    this.events = this.previousEvents;

    this.getAllLecturers();
    this.getAllRooms();
    this.getAllClasses();
    this.getAllModules();
  }


  private initializeForm():FormGroup {
    return this.fb.group({
      type: ['Lecture', [Validators.required]],
      title: ['New Appointment', [Validators.required]],
      modules: [null],
      date: [formatDate(this.pickedDate, "YYYY-MM-dd", "EN-US"), [Validators.required]],
      startTime: ['12:00', [Validators.required]],
      endTime: ['14:30', [Validators.required]],
      lecturers: new FormControl([], [Validators.required]),
      rooms: new FormControl([], [Validators.required]),
      classes: new FormControl([this.selectedClass], [Validators.required]),
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
    if(this.selectedEvent !== null && !this.isFormValid()){
      return;
    }
    this.selectedEvent = $event;

    const selectedModule = this.modules.find(
      (module) => module.module_id === this.selectedEvent?.meta.module_id
    ) || null;


    const selectedLecturers = this.lecturers.filter((lecturer) =>
      $event.meta.lecturerRaw.some(
        (selectedLec:any) => selectedLec.lec_id === lecturer.lec_id
      )
    );

    const selectedRooms = this.rooms.filter((room) =>
      $event.meta.locationRaw.some(
        (selectedRoom:any) => selectedRoom.room_id === room.room_id
      )
    );

    const selectedClasses = this.classes.filter((class_) =>
      $event.meta.classesRaw.some(
        (selectedClass:any) => selectedClass.class_id === class_
      )
    );

    this.appointmentForm.patchValue({
      type: $event.meta.typeRaw,
      title: $event.title,
      modules: selectedModule,
      date: [formatDate($event.start, "YYYY-MM-dd", "EN-US")],
      startTime: [formatDate($event.start, "hh:mm", "EN-US")],
      endTime: [formatDate($event.end as Date, "hh:mm", "EN-US")],
      classes: selectedClasses,
      rooms: selectedRooms,
      lecturers: selectedLecturers,
    });
    this.selectedEvent.draggable=true;

  }
  closeDialog():void{
    this.dialogRef.close();
  }

  private getAllClasses() {
    this.roleService.retrieveAllClasses().subscribe(data => this.classes = data);
  }

  private getAllLecturers() {
    this.roleService.retrieveAllLecturers().subscribe(data => this.lecturers = data);
  }

  private getAllRooms(){
    this.roomService.retrieveAllRooms().subscribe(data => this.rooms = data);
  }

  private getAllModules() {
    this.roleService.retrieveAllModules().subscribe(data => this.modules = data);
  }

  onModuleChange($event: Event) {
    const selectedModule: ModuleView = this.appointmentForm.get('modules')?.value;
    this.selectedModule = selectedModule;

    if (selectedModule) {
      this.appointmentForm.patchValue({
        title: selectedModule.title
      });

      this.refreshView();


    }
  }

  updateLecturersSelection(selectedLecturers: any[]) {
    this.selectedLecturers = selectedLecturers;
    this.refreshView();
  }

  updateRoomsSelection(selectedRooms: any[]) {
    this.selectedRooms = selectedRooms;
    this.refreshView();
  }

  updateClassSelection(selectedClasses: string[]) {
    this.selectedClasses = selectedClasses;
    this.appointmentForm.patchValue({
      classes: selectedClasses
    });
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
          event.color = this.scheduleService.getAppointmentColor(formData.type.toUpperCase())
          event.meta = {
            typeRaw: this.scheduleService.toTitleCase(formData.type),
            type: formData.type,
            module_id: formData.module,
            locationRaw: formData.rooms,
            lecturerRaw: formData.lecturers,
            classesRaw: formData.classes,
            location: formData.rooms.map((room:any) => `${room.room_name}`).join('\n'),
            lecturer: formData.lecturers.map((lec:any) => lec.fullname).join('\n'),
            classes: formData.classes.map((class_:string) => class_).join('\n'),
          }
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

    const changedEvents = this.changedEvents.map(event => this.scheduleService.mapEventToAppointment(event));
    console.log(changedEvents);
    this.scheduleService.updateAppointments(changedEvents).subscribe(data => {
      this.isLoaded = false;
      this.scheduleService.getAppointmentsByClass(this.selectedClass).subscribe(
        data => {
          this.previousEvents = this.scheduleService.createPreviousAppointments(data);
          this.events = this.previousEvents;
          this.changedEvents = [];
          this.selectedEvent = null;
          this.isLoaded = true;
        }
      )

    });
  }

  private deleteSelectedEvent() {
    if(this.selectedEvent=== null) return;
    const id = this.selectedEvent.id;
    this.scheduleService.deleteAppointment(id as number).subscribe(data => {
      this.previousEvents = this.previousEvents.filter(event => event.id !== id)
      this.changedEvents = this.changedEvents.filter(event => event.id !== id);
      this.events = this.events.filter(event => event.id !== id);
      this.selectedEvent = null;
      this.refresh.next();
    });
  }
}
