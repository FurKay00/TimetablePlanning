import {ChangeDetectorRef, Component, Inject, Input, OnInit,} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  FormGroupDirective,
  NgForm,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import {CalendarEvent, CalendarView, CalendarWeekModule} from 'angular-calendar';
import {ScheduleComponent} from '../../timetable/schedule/schedule.component';
import {formatDate, NgForOf, NgIf} from '@angular/common';
import {ToolbarComponent} from '../../general/toolbar/toolbar.component';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {MatIcon} from '@angular/material/icon';
import {MatIconButton} from '@angular/material/button';
import {RoleService} from '../../../services/role.service';
import {
  AppointmentView,
  BasicAppointmentRequest,
  ClassModel,
  Conflict, ConflictCheckObjects,
  LecturerView,
  ModuleView,
  RoomView
} from '../../../models/response_models';
import {RoomService} from '../../../services/room.service';
import {MatError, MatFormField, MatSuffix} from '@angular/material/form-field';
import {MatOption, MatSelect} from '@angular/material/select';
import {MatInput, MatLabel} from '@angular/material/input';
import {ScheduleService} from '../../../services/schedule.service';
import {forkJoin, map, Subject} from 'rxjs';
import {MatButtonToggle, MatButtonToggleGroup} from '@angular/material/button-toggle';
import {ConfirmationDialogComponent} from '../confirmation-dialog/confirmation-dialog.component';
import {MatDatepicker, MatDatepickerInput, MatDatepickerToggle} from '@angular/material/datepicker';
import {IntegrityService} from '../../../services/integrity.service';
import {MatTooltip} from '@angular/material/tooltip';
import {MatTab, MatTabGroup} from '@angular/material/tabs';
import {ConflictViewComponent} from '../../timetable/conflict-view/conflict-view.component';
import {GanttDate, GanttGroup, GanttItem} from '@worktile/gantt';
import {subWeeks} from 'date-fns';

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
    MatSuffix,
    MatTooltip,
    MatTabGroup,
    MatTab,
    ConflictViewComponent
  ],
  templateUrl: './create-appointment-modal.component.html',
  styleUrl: './create-appointment-modal.component.css'
})
export class CreateAppointmentModalComponent implements OnInit {
  @Input() previousEvents: CalendarEvent[] = [];
  @Input() pickedDate: Date = new Date();
  @Input() selectedClass: ClassModel;

  appointmentForm: FormGroup;
  appointmentType: 'single' | 'block' = 'single';
  events: CalendarEvent[] = [];
  selectedDay: Date = new Date();
  calendarView = CalendarView.Week;
  selectedWeekDays: Date[] = [];

  lecturers: LecturerView[] = [];
  rooms: RoomView[] = [];
  classes: ClassModel[] = [];
  modules: ModuleView[] = [];

  selectedModule: ModuleView = this.modules[0];
  selectedRooms: RoomView[] = [];
  selectedLecturers: LecturerView[] = [];
  selectedClasses: ClassModel[] = [];
  newEvent: CalendarEvent;
  newEvents: CalendarEvent[] = [];

  selecetedTabIndex: number = 0;
  capacityConflict: { message: string, isAllowed: boolean } = {message: "", isAllowed: true};
  ganttStartDate: number = Date.now() / 1000;

  conflicts: Conflict[] = [{
    message: "Class Conflict",
    conflict_id: "TINF22B6",
    conflictingAppointments: [],
    type: "CLASS"
  },
    {
      message: "Class Conflict",
      conflict_id: "TINF22B5",
      conflictingAppointments: [],
      type: "CLASS"
    },
    {
      message: "Class Conflict",
      conflict_id: "TINF22B5",
      conflictingAppointments: [],
      type: "CLASS"
    },
    {
      message: "Room Conflict",
      conflict_id: 0,
      conflictingAppointments: [],
      type: "ROOM"
    },
    {
      message: "Lecturer Conflict",
      conflict_id: 5,
      conflictingAppointments: [],
      type: "LECTURER"
    }
  ];

  classConflicts: Conflict[] = [
    {
      message: "Class Conflict",
      conflict_id: "TINF22B6",
      conflictingAppointments: [],
      type: "CLASS"
    }
  ];
  roomConflicts: Conflict[] = [
    {
      message: "Room Conflict",
      conflict_id: 0,
      conflictingAppointments: [],
      type: "ROOM"
    }
  ];
  lecturerConflicts: Conflict[] = [
    {
      message: "Lecturer Conflict",
      conflict_id: 5,
      conflictingAppointments: [],
      type: "LECTURER"
    }
  ];


  classConflictAppointments: CalendarEvent[] = [];
  roomConflictAppointments: CalendarEvent[] = [];
  lecturerConflictAppointments: CalendarEvent[] = [];

  ganttClassGroups: GanttGroup[] = [];
  ganttRoomGroups: GanttGroup[] = [];
  ganttLecturerGroups: GanttGroup[] = [];

  ganttClassTasks: GanttItem[] = [];
  ganttRoomTasks: GanttItem[] = [];
  ganttLecturerTasks: GanttItem[] = [];

  isLoaded: boolean = true;
  refresh: Subject<void> = new Subject<void>();

  constructor(private fb: FormBuilder,
              public dialogRef: MatDialogRef<CreateAppointmentModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private roleService: RoleService,
              private roomService: RoomService,
              private scheduleService: ScheduleService,
              private integrityService: IntegrityService,
              private dialog: MatDialog,
              private changeDetectorRef: ChangeDetectorRef,
  ) {
    this.previousEvents = data.previousEvents;
    this.pickedDate = data.pickedDate;
    this.selectedClass = data.selectedClass;
    this.selectedClasses = [this.selectedClass];

    this.getAllLecturers();
    this.getAllRooms();
    this.getAllClasses();
    this.getAllModules();
    this.appointmentForm = this.initializeForm();
    this.newEvent = this.createInitialEvent();
    this.events = [this.newEvent].concat(this.previousEvents);


  }


  private initializeForm(): FormGroup {
    return this.fb.group({
      appointment_type: ['single', [Validators.required]],
      type: ["LECTURE", [Validators.required]],
      title: ['New Appointment', [Validators.required]],
      modules: [null],
      date: [formatDate(this.pickedDate, "YYYY-MM-dd", "EN-US"), [Validators.required]],
      startTime: ['12:00', [Validators.required]],
      endTime: ['14:30', [Validators.required]],
      lecturers: new FormControl([], [Validators.required]),
      rooms: new FormControl([], [Validators.required]),
      classes: new FormControl([...this.selectedClasses], [Validators.required]),
      maxHours: [4,],
      weekdays: [[],],
    });
  }

  previewEvent() {
    this.checkCollisions();
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
          console.log(this.selectedClasses)
          console.log('User canceled');
        }
      });


    } else {
      console.error('Form is invalid. Please fill in all required fields.');
    }
  }

  onWeekDaysSelected(weekDays: Date[]): void {
    this.selectedWeekDays = weekDays;
  }

  onDaySelected(day: Date): void {
    this.pickedDate = day;
  }

  onViewSelected($event: CalendarView) {
    this.calendarView = $event;
  }

  onEventMoved($event: CalendarEvent) {
    const newStart = $event.start;
    const newEnd = $event.end;

    this.previousEvents.forEach(event => {
      if ($event.id === event.id) {
        event.start = newStart;
        event.end = newEnd;
      }
    });

    const newDate = newStart.toISOString().split('T')[0];
    const newStartTime = newStart.toTimeString().slice(0, 5);
    const newEndTime = newEnd?.toTimeString().slice(0, 5);

    this.appointmentForm.patchValue({
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
    });
  }

  closeDialog(): void {
    this.dialogRef.close();
  }

  private getAllClasses() {
    this.roleService.retrieveAllClasses().subscribe(data => {
      this.classes = data;
      const selectedClass = this.classes.find(class_ => class_.id === this.selectedClass.id) as ClassModel;
      this.selectedClasses.push(selectedClass);
      this.appointmentForm.patchValue({
        classes: [selectedClass],
      })
    });
  }

  private getAllLecturers() {
    this.roleService.retrieveAllLecturers().subscribe(data => this.lecturers = data);
  }

  private getAllRooms() {
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
      if (this.appointmentType === "single") {
        this.refreshView();
      } else {
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
    this.capacityConflict = this.integrityService.checkCapacityOfSelectedClasses(this.selectedRooms, this.selectedClasses);

    this.refreshView();
  }

  updateWeekdaysSelection(selectedWeekdays: any) {
    this.appointmentForm.get('weekdays')?.setValue([...selectedWeekdays]);
    if (this.appointmentType === "block") {
      this.createEventsFromWorkload();
    }
  }

  updateClassSelection(selectedClasses: any[]) {
    this.selectedClasses = selectedClasses;
    console.log(selectedClasses);
    this.capacityConflict = this.integrityService.checkCapacityOfSelectedClasses(this.selectedRooms, this.selectedClasses)

    this.refreshView();
  }

  createInitialEvent(): CalendarEvent {
    const formData = this.appointmentForm?.value;
    return {
      id: "T1",
      start: new Date(`${formData.date}T${formData.startTime}:00`),
      end: new Date(`${formData.date}T${formData.endTime}:00`),
      title: formData.title,
      draggable: true,
      color: {primary: '#62D2DC', secondary: '#62D2DC'},
      meta: {
        location: formData.rooms.map((room: any) => room.room_name).join('\n'),
        lecturer: formData.lecturers.map((lec: any) => lec.fullname).join('\n'),
      },
      cssClass: 'custom-event-style'
    };
  }

  ngOnInit() {
    this.appointmentForm = this.initializeForm();
    this.appointmentForm.get('appointment_type')?.valueChanges.subscribe((appointment_type) => {

      this.appointmentType = appointment_type;
      this.selectedClasses = [this.selectedClass]
      this.selectedRooms = []
      this.selectedLecturers = []

      this.appointmentForm.patchValue({
        type: "LECTURE",
        modules: null,
        title: 'New Appointment',
        date: formatDate(this.pickedDate, "YYYY-MM-dd", "EN-US"),
        startTime: '12:00',
        endTime: '14:30',
        classes: [this.selectedClass],
        lecturers: [],
        rooms: [],
        maxHours: 4,
        weekdays: []
      });

      if (appointment_type === 'block') {
        this.newEvents = [];
        this.appointmentForm.get('modules')?.setValidators(Validators.required);
        this.appointmentForm.get('maxHours')?.setValidators(Validators.required);
        this.appointmentForm.get('weekdays')?.setValidators(Validators.required);

        this.events = this.newEvents.concat(this.previousEvents);

      } else {
        this.events = [this.newEvent].concat(this.previousEvents);
        this.appointmentForm.get('modules')?.clearValidators();
        this.appointmentForm.get('maxHours')?.clearValidators();
        this.appointmentForm.get('weekdays')?.clearValidators();
      }
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
    if (this.appointmentType === "single") {
      this.events.forEach(event => {
        if (this.newEvent.id === event.id) {
          event.title = formData.title;
          event.start = new Date(`${formatDate(formData.date, "YYYY-MM-dd", "EN-US")}T${formData.startTime}:00`);
          event.end = new Date(`${formatDate(formData.date, "YYYY-MM-dd", "EN-US")}T${formData.endTime}:00`);
          event.color = this.scheduleService.getAppointmentColor(formData.type.toUpperCase())
          event.meta = {
            location: this.selectedRooms.map((room: any) => room.room_name).join('\n'),
            lecturer: this.selectedLecturers.map((lec: any) => lec.fullname).join('\n'),
          }
        }
      });
      this.events = [this.newEvent].concat(this.previousEvents);
      this.refresh.next();
    } else {
      this.createEventsFromWorkload();
    }

  }

  isFormValid(): boolean {
    this.appointmentForm.markAllAsTouched();

    return this.appointmentForm.valid;
  }

  createEventsFromWorkload() {
    const formData = this.appointmentForm.value;
    if (formData.maxHours <= 0) {
      this.appointmentForm.patchValue({
        maxHours: 1
      })
      return;
    }
    if (!this.isFormValid()) return;

    const workload = formData.modules?.workload || 0;
    const maxHours = formData.maxHours;
    const startTime = formData.startTime;
    const date = new Date(formData.date);
    const weekdays = formData.weekdays.sort();

    let weekOffset = 0;
    let remainingHours = workload;
    let sessionCount = 0;
    this.newEvents = [];
    this.events = this.newEvents.concat(this.previousEvents);
    let dayOffset = 0;


    while (remainingHours > 0) {
      for (let i = 0; i < weekdays.length; i++) {
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

  submitNewEvent() {
    if (this.appointmentType === 'single') {
      let newAppointment: BasicAppointmentRequest = {
        class_ids: this.selectedClasses.map(class_ => class_.id),
        date: this.appointmentForm.get("date")?.value,
        end_time: this.appointmentForm.get("endTime")?.value + ":00.000Z",
        lec_ids: this.selectedLecturers.map(lecturer => lecturer.lec_id),
        module: this.selectedModule?.module_id || "",
        room_ids: this.selectedRooms.map(room => room.room_id),
        start_time: this.appointmentForm.get("startTime")?.value + ":00.000Z",
        title: this.appointmentForm.get("title")?.value,
        type: this.appointmentForm.get("type")?.value.toUpperCase()
      }
      console.log(newAppointment)
      this.isLoaded = false;
      this.scheduleService.createNewAppointment(newAppointment).subscribe(() => {
        this.scheduleService.getAppointmentsByClass(this.selectedClass.id).subscribe(data => {
          this.previousEvents = this.scheduleService.createPreviousAppointments(data);
          this.newEvent = this.createInitialEvent();
          this.events = [this.newEvent].concat(this.previousEvents);
          this.initializeForm();
          this.isLoaded = true;
        })
      })
    } else {
      let newAppointments: BasicAppointmentRequest[] = [];
      this.newEvents.forEach((event) => {
        const date = event.start.toISOString().split('T')[0];
        const startTime = event.start.toTimeString().slice(0, 5);
        const endTime = event.end?.toTimeString().slice(0, 5);

        const newAppointment: BasicAppointmentRequest = {
          class_ids: this.selectedClasses.map(class_ => class_.id),
          date: date,
          end_time: endTime + ":00.000Z",
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
      this.scheduleService.createNewAppointments(newAppointments).subscribe(() => {
        this.isLoaded = false;
        this.scheduleService.getAppointmentsByClass(this.selectedClass.id).subscribe(data => {
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
    if (!this.isFormValid()) return;

    const conflictCheckData: ConflictCheckObjects = {
      newEvent: this.newEvent,
      newEvents: this.newEvents,
      selectedClasses: this.selectedClasses,
      selectedLecturers: this.selectedLecturers,
      selectedRooms: this.selectedRooms
    }

    forkJoin({
      classConflicts: this.integrityService.checkClassScheduleConflicts(this.appointmentType, conflictCheckData),
      lecturerConflicts: this.integrityService.checkLecturerScheduleConflicts(this.appointmentType, conflictCheckData),
      roomConflicts: this.integrityService.checkRoomScheduleConflicts(this.appointmentType, conflictCheckData),
    }).subscribe(({classConflicts, lecturerConflicts, roomConflicts}) => {
      this.conflicts = [...classConflicts, ...lecturerConflicts, ...roomConflicts];
      console.log("Conflicts found:", this.conflicts);
      this.classConflicts = this.conflicts.filter(conflict => conflict.type === "CLASS");
      this.roomConflicts = this.conflicts.filter(conflict => conflict.type === "ROOM");
      this.lecturerConflicts = this.conflicts.filter(conflict => conflict.type === "LECTURER");
      if (this.conflicts.length !== 0) {
        this.fillGanttChart();
      } else {
        if (this.appointmentType === "single") {
          this.newEvent.color = this.scheduleService.acceptableColor;
          this.refresh.next();
        } else {
          this.newEvents.forEach(event => event.color = this.scheduleService.acceptableColor);
          this.refresh.next();

        }
      }
      this.conflicts.forEach(conflict => {
        if (conflict.conflictingAppointments) {
          conflict.conflictingAppointments.forEach(appointment => {
            if (this.appointmentType === "single") {
              this.newEvent.color = this.scheduleService.conflictColor;
              this.refresh.next();
            } else {
              let matchingEvent = this.newEvents.find(event => event.id = appointment.id);
              if (matchingEvent) {
                matchingEvent.color = this.scheduleService.conflictColor;
                this.refresh.next();
              }
            }
          })
        }
      })
    });

  }

  incrementHours() {
    const formData = this.appointmentForm.value;
    const maxHours = formData.maxHours + 1;
    this.appointmentForm.patchValue({
      maxHours: maxHours
    })
    this.createEventsFromWorkload();
  }

  decrementHours() {
    const formData = this.appointmentForm.value;
    const maxHours = Math.max(formData.maxHours - 1, 0);
    this.appointmentForm.patchValue({
      maxHours: maxHours
    })
    this.createEventsFromWorkload();
  }


  selectConflict(value: Conflict) {
    const availableTabs = ["CALENDAR"];

    if (this.classConflicts.length > 0) {
      availableTabs.push("CLASS");
    }
    if (this.roomConflicts.length > 0) {
      availableTabs.push("ROOM");
    }
    if (this.lecturerConflicts.length > 0) {
      availableTabs.push("LECTURER");
    }

    // Find the index dynamically in the available tabs
    const tabIndex = availableTabs.indexOf(value.type);
    if (tabIndex !== -1) {
      this.selecetedTabIndex = tabIndex;
    } else {
      console.warn("Conflict tab not available:", value.type);
    }
  }

  private fillGanttChart() {
    let start_date: string;
    let end_date: string;
    if (this.appointmentType === "single") {
      start_date = formatDate(subWeeks(this.newEvent.start, 3), "YYYY-MM-dd", "EN-US");
      end_date = formatDate(this.newEvent.start, "YYYY-MM-dd", "EN-US");
    } else {
      start_date = formatDate(this.newEvents[0].start, "YYYY-MM-dd", "EN-US");
      end_date = formatDate(this.newEvents[this.newEvents.length - 1].end as Date, "YYYY-MM-dd", "EN-US");
    }
    this.ganttStartDate = new Date(start_date).getTime();
    /*
    const uniqueRoomConflictIds = [...new Set(this.roomConflicts.map(conflict => conflict.conflict_id))];
    const uniqueClassConflictIds = [...new Set(this.classConflicts.map(conflict => conflict.conflict_id))];
    const uniqueLecturerConflictIds = [...new Set(this.lecturerConflicts.map(conflict => conflict.conflict_id))];
    */
    const uniqueRoomConflictIds = [...this.selectedRooms.map(room => room.room_id)];
    const uniqueClassConflictIds = [...this.selectedClasses.map(class_ => class_.id)];
    const uniqueLecturerConflictIds = [...this.selectedLecturers.map(lecturer => lecturer.lec_id)];

    const roomServiceCalls = uniqueRoomConflictIds.map(conflict_id =>
      this.scheduleService.getAppointmentsByRoom(conflict_id + "", start_date, end_date)
        .pipe(map(response => ({conflict_id, appointments: response})))
    );

    const classServiceCalls = uniqueClassConflictIds.map(conflict_id =>
      this.scheduleService.getAppointmentsByClass(conflict_id, start_date, end_date)
        .pipe(map(response => ({conflict_id, appointments: response})))
    );

    const lecturerServiceCalls = uniqueLecturerConflictIds.map(conflict_id =>
      this.scheduleService.getFullAppointmentsByLecturer(conflict_id + "", start_date, end_date).pipe(map(response => ({
        conflict_id,
        appointments: [...response.appointments, ...response.personalAppointments]
      })))
    );
    this.ganttClassGroups = [...this.selectedClasses.map(cls => ({id: cls.id, title: cls.id, expanded: false}))]
    this.ganttRoomGroups = [...this.selectedRooms.map(room => ({
      id: room.room_id.toString(),
      title: room.room_name,
    }))]
    this.ganttLecturerGroups = [...this.selectedLecturers.map(lec => ({
      id: lec.lec_id.toString(),
      title: lec.fullname,
    }))]


    forkJoin(roomServiceCalls).subscribe({
      next: responses => {
        responses.forEach(({
                             conflict_id,
                             appointments
                           }) => this.mapRoomAppointmentsToGantt(appointments, conflict_id.toString()))

        this.ganttRoomTasks = [...this.ganttRoomTasks];
        this.changeDetectorRef.detectChanges()
      },
    })
    forkJoin(classServiceCalls).subscribe({
      next: responses => {
        responses.forEach(({conflict_id, appointments}) => this.mapClassAppointmentsToGantt(appointments, conflict_id));

        this.ganttClassTasks = [...this.ganttClassTasks];
        this.changeDetectorRef.detectChanges()

      }
    })
    forkJoin(lecturerServiceCalls).subscribe({
      next: responses => {
        responses.forEach(({
                             conflict_id,
                             appointments
                           }) => this.mapLecturerAppointmentsToGantt(appointments, conflict_id.toString()));

        this.ganttLecturerTasks = [...this.ganttLecturerTasks];
        this.changeDetectorRef.detectChanges()
      }
    })
  }

  mapClassAppointmentsToGantt(events: CalendarEvent[], groupId: string) {
    const childItems = events.map((event): GanttItem => {
      return {
        id: String(event.id),
        title: event.title,
        start: event.start.getTime() / 1000,
        end: (event.end as Date).getTime() / 1000,
        color: this.scheduleService.previousColor.primary,
        draggable: true,
        itemDraggable: true,
      };
    });

    const earliestStart = Math.min(...childItems.map(i => i.start as number));
    const latestEnd = Math.max(...childItems.map(i => i.end as number));

    const parentItem: GanttItem = {
      id: groupId,
      title: groupId,
      children: childItems,
      color: this.scheduleService.previousColor.primary
    };

    this.ganttClassTasks.push(parentItem);
  }

  mapRoomAppointmentsToGantt(events: CalendarEvent[], groupId: string) {
    events.forEach(event => {
      this.ganttRoomTasks.push({
        id: event.id + "",
        title: event.title,
        start: event.start.getTime() / 1000,
        end: (event.end as Date).getTime() / 1000,

        color: this.scheduleService.previousColor.primary,
        group_id: groupId
      });
    });
  }

  mapLecturerAppointmentsToGantt(events: CalendarEvent[], groupId: string) {
    events.forEach(event => {
      this.ganttLecturerTasks.push({
        id: event.id + "",
        title: event.title,
        start: event.start.getTime() / 1000,
        end: (event.end as Date).getTime() / 1000,
        color: this.scheduleService.previousColor.primary,
        group_id: groupId
      });
    });
  }

}
