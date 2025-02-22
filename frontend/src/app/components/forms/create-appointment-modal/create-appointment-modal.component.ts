import { Component,  Inject, Input, OnInit,} from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {CalendarEvent, CalendarView, CalendarWeekModule} from 'angular-calendar';
import {addDays, addHours} from 'date-fns';
import {ScheduleComponent} from '../../timetable/schedule/schedule.component';
import {formatDate, NgForOf, NgIf} from '@angular/common';
import {ToolbarComponent} from '../../general/toolbar/toolbar.component';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {RoleService} from '../../../services/role.service';
import {LecturerView, ModuleView, RoomView} from '../../../models/response_models';
import {RoomService} from '../../../services/room.service';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatLabel} from '@angular/material/input';
import {ScheduleService} from '../../../services/schedule.service';
import {Subject} from 'rxjs';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';




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
  templateUrl: './create-appointment-modal.component.html',
  styleUrl: './create-appointment-modal.component.css'
})
export class CreateAppointmentModalComponent implements OnInit{
  @Input() previousEvents: CalendarEvent[] = [];
  @Input() pickedDate: Date = new Date();
  @Input() selectedClass: string = '';

  appointmentForm: FormGroup;
  appointmentType: 'single' | 'block' = 'single';
  events: CalendarEvent[] = [];
  selectedDay: Date = new Date();
  calendarView = CalendarView.Week;
  selectedWeekDays: Date[] = [];


  lecturers: LecturerView[] = [];
  rooms: RoomView[] = [];
  classes: string[] = [];
  modules: ModuleView[] = [];

  selectedModule: ModuleView  = this.modules[0];
  selectedRooms: RoomView[] = [];
  selectedLecturers: LecturerView[] = [];
  selectedClasses: string[] = [];

  newEvent: CalendarEvent;
  newEvents: CalendarEvent[] = [];

  refresh: Subject<void> = new Subject<void>();

  constructor(private fb: FormBuilder,
              public dialogRef: MatDialogRef<CreateAppointmentModalComponent>,
              @Inject(MAT_DIALOG_DATA) public  data: any,
              private roleService: RoleService,
              private roomService: RoomService,
              private scheduleService: ScheduleService,
              ) {
    this.previousEvents = data.previousEvents;
    this.pickedDate = data.pickedDate;
    this.selectedClass = data.selectedClass;
    this.appointmentForm = this.initializeForm();

    this.newEvent = this.createInitialEvent();
    this.events = [this.newEvent].concat(this.previousEvents);

    this.getAllLecturers();
    this.getAllRooms();
    this.getAllClasses();
    this.getAllModules();
  }


  private initializeForm():FormGroup {
    return this.fb.group({
      appointment_type: ['single', [Validators.required]],
      type: ['Lecture', [Validators.required]],
      title: ['New Appointment', [Validators.required]],
      modules: [null],
      date: [formatDate(this.pickedDate, "YYYY-MM-dd", "EN-US"), [Validators.required]],
      startTime: ['12:00', [Validators.required]],
      endTime: ['13:15', [Validators.required]],
      lecturers: new FormControl([], [Validators.required]),
      rooms: new FormControl([], [Validators.required]),
      classes: new FormControl([this.selectedClass], [Validators.required]),
      maxHours: [4, [Validators.required]],
      frequency: [4, [Validators.required]],
    });
  }


  previewEvent() {
  }

  submitEvent() {
    if (this.isFormValid()) {
      console.log('Form Submitted:', this.appointmentForm.value);
      // TODO event submission
    } else {
      console.error('Form is invalid. Please fill in all required fields.');
    }  }

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

    if (selectedModule) {
      this.appointmentForm.patchValue({
        title: selectedModule.title
      });
      if (this.appointmentType==="single"){
        this.refreshView();
      }else{
        this.createEventsFromWorkload();
      }

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

   createInitialEvent():CalendarEvent {
     const formData = this.appointmentForm?.value;
     return {
       id: "T1",
       start: new Date(`${formData.date}T${formData.startTime}:00`),
       end:   new Date(`${formData.date}T${formData.endTime}:00`),
       title: formData.title,
       draggable: true,
       color: { primary: '#62D2DC', secondary: '#62D2DC' },
       meta: {
         location: formData.rooms.map((room:any) => room.room_name).join('\n'),
         lecturer: formData.lecturers.map((lec:any) => lec.fullname).join('\n')
       },
       cssClass: 'custom-event-style'
     };
  }

  ngOnInit() {
    this.appointmentForm = this.initializeForm();
    this.appointmentForm.get('appointment_type')?.valueChanges.subscribe((type) => {
      this.appointmentType = type;
      if (type === 'block') {
        this.appointmentForm.get('modules')?.setValidators(Validators.required);
        this.events = this.newEvents.concat(this.previousEvents);

      } else {
        this.events = [this.newEvent].concat(this.previousEvents);
        this.appointmentForm.patchValue({modules: null});
        this.appointmentForm.get('modules')?.clearValidators();
      }
      this.appointmentForm.get('modules')?.updateValueAndValidity();
    });

    this.appointmentForm.get('frequency')?.valueChanges.subscribe(() => {
      if (this.appointmentType=== 'block') {
        this.createEventsFromWorkload();
      }
    });

    this.appointmentForm.get('maxHours')?.valueChanges.subscribe(() => {
      if (this.appointmentForm.get('appointment_type')?.value === 'block') {
        this.createEventsFromWorkload();
      }
    });
  }

  refreshView() {
    const formData = this.appointmentForm?.value;
    if(this.appointmentType === "single"){
      this.events.forEach(event => {
        if(this.newEvent.id === event.id){
          event.title= formData.title;
          event.start = new Date(`${formData.date}T${formData.startTime}:00`);
          event.end = new Date(`${formData.date}T${formData.endTime}:00`);
          event.color = this.scheduleService.getAppointmentColor(formData.type.toUpperCase())
          event.meta = {
            location: this.selectedRooms.map((room:any) => room.room_name).join('\n'),
            lecturer: this.selectedLecturers.map((lec:any) => lec.fullname).join('\n')
          }
        }
      });
      this.events = [this.newEvent].concat(this.previousEvents);
      this.refresh.next();
    }else{
      this.createEventsFromWorkload();
    }

  }


  updateClassSelection(value: string[]) {
    this.selectedClasses = value;
    this.appointmentForm.patchValue({
      classes: value
    });
  }

  isFormValid(): boolean {
    this.appointmentForm.markAllAsTouched();

    return this.appointmentForm.valid;
  }

  createEventsFromWorkload() {
    if(!this.isFormValid()) return;

    const formData = this.appointmentForm.value;
    const workload = formData.modules?.workload || 0;
    const frequency = formData.frequency;
    const maxHours = formData.maxHours;
    const startTime = formData.startTime;
    const date = new Date(formData.date);

    let remainingHours = workload;
    let sessionCount = 0;
    this.newEvents = [];
    this.events = this.newEvents.concat(this.previousEvents);
    let dayOffset = 0;
    let currentFrequency = 0;

    while (remainingHours > 0) {
      sessionCount++;
      currentFrequency++;
      let sessionHours = Math.min(remainingHours, maxHours);

      const start = new Date(date);
      start.setDate(start.getDate() + dayOffset);
      start.setHours(Number(startTime.split(':')[0]));
      start.setMinutes(Number(startTime.split(':')[1]));

      const end = new Date(start);
      end.setHours(end.getHours() + sessionHours);

      const event = {
        id: `T${sessionCount}`,
        start: start,
        end: end,
        title: formData.title,
        draggable: true,
        color: { primary: '#62D2DC', secondary: '#62D2DC' },
        meta: {
          location: formData.rooms.map((room:any) => room.room_name).join('\n'),
          lecturer: formData.lecturers.map((lec:any) => lec.fullname).join('\n')
        },
        cssClass: 'custom-event-style'
      };
      this.newEvents.push(event);
      remainingHours -= sessionHours;

      if (currentFrequency === frequency) {
        dayOffset += (7 - (dayOffset % 7));
        currentFrequency = 0;
      } else {
        dayOffset++;
      }
    }

    this.events = this.previousEvents.concat(this.newEvents);
    this.refresh.next();
  }

}
