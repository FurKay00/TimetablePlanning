import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {CalendarEvent, CalendarView} from 'angular-calendar';
import {DateService} from '../../../../services/date.service';
import {ScheduleService} from '../../../../services/schedule.service';
import {ScheduleComponent} from '../../../timetable/schedule/schedule.component';
import {ToolbarComponent} from '../../../general/toolbar/toolbar.component';
import {MatDialog} from '@angular/material/dialog';
import {
  CreatePersonalAppointmentModalComponent
} from '../../../forms/create-personal-appointment-modal/create-personal-appointment-modal.component';
import {
  UpdatePersonalAppointmentModalComponent
} from '../../../forms/update-personal-appointment-modal/update-personal-appointment-modal.component';

@Component({
  selector: 'app-lecturer-schedule',
  standalone: true,
  imports: [
    ScheduleComponent,
    ToolbarComponent
  ],
  templateUrl: './lecturer-schedule.component.html',
  styleUrl: './lecturer-schedule.component.css'
})
export class LecturerScheduleComponent implements OnInit{
  lecturerId: string = "";
  screen: string = "";
  selectedWeekDays: Date[] = [];
  selectedDay: Date = new Date();
  calendarView = CalendarView.Week;
  lecturerAppointments: CalendarEvent[] = [];
  personalAppointments: CalendarEvent[] = [];
  fullAppointments: CalendarEvent[] = []
  isLoaded: boolean = false;

  constructor(private route:ActivatedRoute, private dateService:DateService, private scheduleService:ScheduleService,  public dialog:MatDialog) {
    this.selectedWeekDays = dateService.initializeWeekDays();
  }


  ngOnInit():void{
    this.route.paramMap.subscribe((params) => {
      this.lecturerId = params.get("lecturerId") || "";
      this.loadLecturerSchedule();
    })
  }


  loadLecturerSchedule() {
    if(this.lecturerId === "")
      return;
    this.isLoaded=false;
    this.scheduleService.getFullAppointmentsByLecturer(this.lecturerId).subscribe(
      (data) => {
        this.isLoaded=true;
        this.lecturerAppointments = data.appointments;
        this.personalAppointments = data.personalAppointments;
        this.fullAppointments = [...this.lecturerAppointments, ...this.personalAppointments];
      },
    )
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

  OpenCreateAppointmentModal(): void {

    const dialogRef = this.dialog.open(CreatePersonalAppointmentModalComponent, {
      height: '90%',
      width: '90%',
      data: { previousEvents: this.scheduleService.createPreviousAppointments(this.fullAppointments),
        pickedDate: this.selectedDay, selectedLecturer: this.lecturerId},
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadLecturerSchedule();
    });
  }

  OpenUpdateAppointmentModal(): void {
    const dialogRef = this.dialog.open(UpdatePersonalAppointmentModalComponent, {
      height: '90%',
      width: '90%',
      data: { previousEvents: this.scheduleService.createPreviousAppointments(this.fullAppointments),
        pickedDate: this.selectedDay, selectedLecturer: this.lecturerId},
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadLecturerSchedule();
    });
  }
}
