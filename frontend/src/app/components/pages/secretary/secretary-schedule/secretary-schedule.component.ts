import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DateService} from '../../../../services/date.service';
import {ToolbarComponent} from '../../../general/toolbar/toolbar.component';
import {CalendarEvent, CalendarView} from 'angular-calendar';
import {ScheduleComponent} from '../../../timetable/schedule/schedule.component';
import {ScheduleService} from '../../../../services/schedule.service';
import {MatDialog} from '@angular/material/dialog';
import {
  CreateAppointmentModalComponent
} from '../../../forms/create-appointment-modal/create-appointment-modal.component';
import {
  UpdateAppointmentModalComponent
} from '../../../forms/update-appointment-modal/update-appointment-modal.component';
import {MatProgressSpinner} from '@angular/material/progress-spinner';

@Component({
  selector: 'app-secretary-schedule',
  standalone: true,
  imports: [
    ToolbarComponent,
    ScheduleComponent,
    CreateAppointmentModalComponent,
    MatProgressSpinner
  ],
  templateUrl: './secretary-schedule.component.html',
  styleUrl: './secretary-schedule.component.css'
})
export class SecretaryScheduleComponent implements OnInit{
  classId: string = "";
  screen: string = "";
  selectedWeekDays: Date[] = [];
  selectedDay: Date = new Date();
  calendarView = CalendarView.Week;
  classAppointments: CalendarEvent[] = []
  isLoaded:boolean = false;

  constructor(private route:ActivatedRoute, private dateService:DateService, private scheduleService:ScheduleService, public dialog:MatDialog) {
    this.selectedWeekDays = dateService.initializeWeekDays();
  }

  ngOnInit():void{
    this.route.paramMap.subscribe((params) => {
      this.classId = params.get("classId") || "";
      this.loadClassSchedule();
    })
  }

  loadClassSchedule() {
    this.isLoaded = false;
    if(this.classId === "")
      return;
    this.scheduleService.getAppointmentsByClass(this.classId).subscribe(
      (data: any[]) => {
          this.classAppointments = data;
          this.isLoaded = true;
      }
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

    const dialogRef = this.dialog.open(CreateAppointmentModalComponent, {
      height: '90%',
      width: '90%',
      data: { previousEvents: this.scheduleService.createPreviousAppointments(this.classAppointments),
      pickedDate: this.selectedDay, selectedClass: this.classId},
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadClassSchedule();
    });
  }

  OpenUpdateAppointmentModal(): void {
    const dialogRef = this.dialog.open(UpdateAppointmentModalComponent, {
      height: '90%',
      width: '90%',
      data: { previousEvents: this.scheduleService.createPreviousAppointments(this.classAppointments),
        pickedDate: this.selectedDay, selectedClass: this.classId},
    });

    dialogRef.afterClosed().subscribe(result => {
      this.loadClassSchedule();
    });
  }
}
