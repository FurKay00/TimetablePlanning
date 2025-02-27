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
import {BasicAppointmentRequest, Conflict, LecturerView, ModuleView, RoomView} from '../../../models/response_models';
import {RoomService} from '../../../services/room.service';
import {MatError, MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatInput, MatLabel} from '@angular/material/input';
import {ScheduleService} from '../../../services/schedule.service';
import {Subject} from 'rxjs';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';

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
    MatButtonToggle,
    MatDatepickerInput,
    MatInput,
    MatDatepickerToggle,
    MatDatepicker,
    MatSuffix
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

  conflicts: Conflict[] = [];

  isLoaded:boolean = true;
  refresh: Subject<void> = new Subject<void>();

  constructor(private fb: FormBuilder,
              public dialogRef: MatDialogRef<CreateAppointmentModalComponent>,
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
      endTime: ['14:30', [Validators.required]],
      lecturers: new FormControl([], [Validators.required]),
      rooms: new FormControl([], [Validators.required]),
      classes: new FormControl([this.selectedClass], [Validators.required]),
      maxHours: [4, ],
      weekdays: [[],],
    });
  }

  previewEvent() {
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

  onModuleChange($event:Event) {
    const selectedModule: ModuleView = this.appointmentForm.get('modules')?.value;
    this.selectedModule = selectedModule;

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

  updateWeekdaysSelection(selectedWeekdays: any) {
    this.appointmentForm.get('weekdays')?.setValue([...selectedWeekdays]);
    if(this.appointmentType === "block"){
      this.createEventsFromWorkload();
    }
  }

  updateClassSelection(selectedClasses: string[]) {
    this.selectedClasses = selectedClasses;
    this.appointmentForm.patchValue({
      classes: selectedClasses
    });
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
         lecturer: formData.lecturers.map((lec:any) => lec.fullname).join('\n'),
       },
       cssClass: 'custom-event-style'
     };
  }

  ngOnInit() {
    this.appointmentForm = this.initializeForm();

    this.appointmentForm.get('appointment_type')?.valueChanges.subscribe((type) => {
      this.appointmentType = type;
      this.appointmentForm.patchValue({modules: null,
        lecturers: [],
        rooms: [],
        classes: [this.selectedClass]});
      this.selectedClasses = [this.selectedClass];

      if (type === 'block') {
        this.newEvents = [];
        this.appointmentForm.get('modules')?.setValidators(Validators.required);
        this.appointmentForm.get('maxHours')?.setValidators(Validators.required);
        this.appointmentForm.get('weekdays')?.setValidators(Validators.required);

        this.events = this.newEvents.concat(this.previousEvents);

      } else {
        this.events = [this.newEvent].concat(this.previousEvents);
        //this.appointmentForm.patchValue({modules: null});
        this.appointmentForm.get('modules')?.clearValidators();
        this.appointmentForm.get('maxHours')?.clearValidators();
        this.appointmentForm.get('weekdays')?.clearValidators();
      }
      /*
      this.appointmentForm.get('modules')?.updateValueAndValidity();
      this.appointmentForm.get('maxHours')?.updateValueAndValidity();
      this.appointmentForm.get('weekdays')?.updateValueAndValidity();*/
    });

    this.appointmentForm.get('weekdays')?.valueChanges.subscribe(() => {
      if (this.appointmentType === 'block') {
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
            lecturer: this.selectedLecturers.map((lec:any) => lec.fullname).join('\n'),
          }
        }
      });
      this.events = [this.newEvent].concat(this.previousEvents);
      this.refresh.next();
    }else{
      this.createEventsFromWorkload();
    }

  }

  isFormValid(): boolean {
    this.appointmentForm.markAllAsTouched();

    return this.appointmentForm.valid;
  }

  createEventsFromWorkload() {
    const formData = this.appointmentForm.value;
    if(formData.maxHours <= 0) {
      this.appointmentForm.patchValue({
        maxHours: 1
      })
      return;
    }
    if(!this.isFormValid()) return;

    const workload = formData.modules?.workload || 0;
    const maxHours = formData.maxHours;
    const startTime = formData.startTime;
    const date = new Date(formData.date);
    const weekdays = formData.weekdays.sort();

    let weekOffset=0;
    let remainingHours = workload;
    let sessionCount = 0;
    this.newEvents = [];
    this.events = this.newEvents.concat(this.previousEvents);
    let dayOffset = 0;


    while (remainingHours > 0) {
      for(let i = 0; i < weekdays.length; i++){
        sessionCount++;
        let sessionHours = Math.min(remainingHours, maxHours);

        const start = new Date(date);
        const dayOfWeek = weekdays[i];
        start.setDate(start.getDate() + (weekOffset * 7) + (dayOfWeek - start.getDay()));
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
          color: this.scheduleService.getAppointmentColor(formData.type.toUpperCase()),
          meta: {
            location: formData.rooms.map((room: any) => room.room_name).join('\n'),
            lecturer: formData.lecturers.map((lec: any) => lec.fullname).join('\n'),
          },
          cssClass: 'custom-event-style'
        };
        this.newEvents.push(event);
        remainingHours -= sessionHours;

        if (remainingHours <= 0) break;
      }
      weekOffset++;
    }

    this.events = this.previousEvents.concat(this.newEvents);
    console.log(this.newEvents.length);
    this.refresh.next();
  }

  submitNewEvent(){
    if(this.appointmentType === 'single'){
      let newAppointment: BasicAppointmentRequest = {
        class_ids: [...this.selectedClasses],
        date: this.appointmentForm.get("date")?.value,
        end_time:  this.appointmentForm.get("endTime")?.value + ":00.000Z",
        lec_ids: this.selectedLecturers.map(lecturer => lecturer.lec_id),
        module: this.selectedModule?.module_id || "",
        room_ids: this.selectedRooms.map(room => room.room_id),
        start_time: this.appointmentForm.get("startTime")?.value + ":00.000Z",
        title: this.appointmentForm.get("title")?.value,
        type: this.appointmentForm.get("type")?.value.toUpperCase()
      }
      console.log(newAppointment)
      this.isLoaded = false;
      this.scheduleService.createNewAppointment(newAppointment).subscribe(()=> {
        this.scheduleService.getAppointmentsByClass(this.selectedClass).subscribe(data => {
          this.previousEvents = this.scheduleService.createPreviousAppointments(data);
          this.newEvent = this.createInitialEvent();
          this.events = [this.newEvent].concat(this.previousEvents);
          this.initializeForm();
          this.isLoaded = true;
        })
      })
    }else{
      let newAppointments:BasicAppointmentRequest[] = [];
      this.newEvents.forEach((event)=>{
        const date = event.start.toISOString().split('T')[0];
        const startTime = event.start.toTimeString().slice(0,5);
        const endTime = event.end?.toTimeString().slice(0,5);

        const newAppointment:BasicAppointmentRequest = {
          class_ids: [...this.selectedClasses],
          date: date,
          end_time:  endTime + ":00.000Z",
          lec_ids: this.selectedLecturers.map(lecturer => lecturer.lec_id),
          module: this.selectedModule?.module_id,
          room_ids: this.selectedRooms.map(room => room.room_id),
          start_time: startTime + ":00.000Z",
          title: this.appointmentForm.get("title")?.value,
          type: this.appointmentForm.get("type")?.value.toUpperCase()
        }
        newAppointments.push(newAppointment);
      });
      console.log(newAppointments)
      this.scheduleService.createNewAppointments(newAppointments).subscribe(()=> {
        this.isLoaded=false;
        this.scheduleService.getAppointmentsByClass(this.selectedClass).subscribe(data => {
          this.previousEvents = this.scheduleService.createPreviousAppointments(data);
          this.newEvents = [];
          this.events = this.newEvents.concat(this.previousEvents);
          this.initializeForm();
          this.isLoaded = true;
        })
      })
    }
  }

  checkCollisions() {
    this.conflicts = [];
    if(!this.isFormValid()) return;

    const formData = this.appointmentForm.value;
    const selectedClasses = formData.classes.map((class_: any) => class_.class_id);
    const selectedLecturers = formData.lecturers.map((lec: any) => lec.lec_id);
    const selectedRooms = formData.rooms.map((room: any) => room.room_id);
    const startTime = formData.startTime;
    const endTime = formData.endTime;
    const date = formData.date;
  /*
    this.checkClassRoomCapacity(selectedClasses, selectedRooms);


    this.checkClassScheduleConflicts(selectedClasses, date, startTime, endTime);


    this.checkTeacherScheduleConflicts(selectedLecturers, date, startTime, endTime);


    this.checkRoomTransitionTiming(selectedRooms, date, startTime, endTime);
    */



  }

  // TODO RoomView mit capacity
  /*checkClassRoomCapacity(selectedClasses: string[], selectedRooms: number[]) {
    let totalCapacity = 0;
    selectedRooms.forEach(roomId => {
      const room = this.rooms.find(r => r.room_id === roomId);
      totalCapacity += room?.room_name;
    });

    selectedClasses.forEach(classId => {
      const class_ = this.classes.find(c => c === classId);
      if (class_.size > totalCapacity) {
        this.conflicts.push({
          conflict_id: 'class_capacity',
          message: `Class size of ${class_.size} exceeds room capacity of ${totalCapacity}.`
        });
      }
    });
  }


  checkClassScheduleConflicts(selectedClasses: string[], date: string, startTime: string, endTime: string) {
    selectedClasses.forEach(classId => {
      this.scheduleService.getAppointmentsByClass(classId).subscribe(classAppointments => {
        classAppointments.forEach(appointment => {
          if (appointment.date === date &&
            (startTime < appointment.end_time && endTime > appointment.start_time)) {
            this.conflicts.push({
              conflict_id: 'class_schedule',
              message: `Class schedule conflict with existing appointment.`,
              conflictingAppointments: [appointment]
            });
          }
        });
      });
    });
  }


  checkTeacherScheduleConflicts(selectedLecturers: number[], date: string, startTime: string, endTime: string) {
    selectedLecturers.forEach(lecId => {
      this.scheduleService.getFullAppointmentsByLecturer(lecId).subscribe(lecturerAppointments => {
        lecturerAppointments.forEach(appointment => {
          if (appointment.date === date &&
            (startTime < appointment.end_time && endTime > appointment.start_time)) {
            this.conflicts.push({
              conflict_id: 'lecturer_schedule',
              message: `Lecturer schedule conflict with existing appointment.`,
              conflictingAppointments: [appointment]
            });
          }
        });
      });
    });
  }


  checkRoomTransitionTiming(selectedRooms: number[], date: string, startTime: string, endTime: string) {
    this.roomService.getRoomTransitionTime(selectedRooms).subscribe(transitionTime => {
      if (transitionTime > (endTime - startTime)) {
        this.conflicts.push({
          conflict_id: 'room_transition',
          message: `Insufficient time for room transition. Required: ${transitionTime} minutes.`,
        });
      }
    });
  }
  */

  incrementHours() {
    const formData = this.appointmentForm.value;
    const maxHours = formData.maxHours +1;
    this.appointmentForm.patchValue({
      maxHours: maxHours
    })
  }

  decrementHours() {
    const formData = this.appointmentForm.value;
    const maxHours = Math.max(formData.maxHours - 1, 0);
    this.appointmentForm.patchValue({
      maxHours: maxHours
    })
  }
}
