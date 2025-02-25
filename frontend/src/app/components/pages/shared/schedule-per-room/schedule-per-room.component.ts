import { Component } from '@angular/core';
import {ScheduleComponent} from "../../../timetable/schedule/schedule.component";
import {ToolbarComponent} from "../../../general/toolbar/toolbar.component";
import {LecturerView, RoomView} from '../../../../models/response_models';
import {CalendarEvent, CalendarView} from 'angular-calendar';
import {RoleService} from '../../../../services/role.service';
import {ScheduleService} from '../../../../services/schedule.service';
import {RoomService} from '../../../../services/room.service';

@Component({
  selector: 'app-schedule-per-room',
  standalone: true,
    imports: [
        ScheduleComponent,
        ToolbarComponent
    ],
  templateUrl: './schedule-per-room.component.html',
  styleUrl: './schedule-per-room.component.css'
})
export class SchedulePerRoomComponent {
  currentRooms: RoomView[] = []
  selectedWeekDays: Date[] = [];
  selectedDay: Date = new Date();
  calendarView = CalendarView.Week;
  roomAppointments: CalendarEvent[] = []
  isLoaded:boolean = true;

  constructor(private roomService:RoomService, private scheduleService:ScheduleService) {
    roomService.retrieveAllRooms().subscribe(data=> this.currentRooms = data);
  }

  loadRoomSchedule(room_id: string) {
    if(room_id === null)
      return;
    this.isLoaded = false;
    this.scheduleService.getAppointmentsByRoom(room_id).subscribe(

      data => {
        this.roomAppointments = data;
        this.isLoaded=true;
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

  onRoomSelected($event: RoomView){
    this.loadRoomSchedule($event.room_id +"");
  }
}
