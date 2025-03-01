import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable, of} from 'rxjs';
import {CalendarEvent} from 'angular-calendar';
import {
  AppointmentView,
  ClassModel,
  Conflict,
  ConflictCheckObjects,
  RoomModel,
  RoomView
} from '../models/response_models';
import {ScheduleService} from './schedule.service';

@Injectable({
  providedIn: 'root'
})
export class IntegrityService {
  URL: string = "http://127.0.0.1:8000/"

  constructor(private http:HttpClient, private scheduleService:ScheduleService) {
  }

  checkCapacityOfSelectedClasses(selectedRooms:RoomView[], selectedClasses:ClassModel[]):{message:string, isAllowed:boolean}{
    let totalSize:number = 0;
    let totalCapacity:number = 0;
    let message:string = "";
    let isAllowed:boolean = true;

    selectedRooms.forEach(room => totalCapacity += room.capacity);
    selectedClasses.forEach(class_ => totalSize += class_.size);
    if (totalSize > totalCapacity){
      message = "Total capacity exceeded by " + (totalSize-totalCapacity);
      isAllowed=false;
    }
    return {
      message: message,
      isAllowed: isAllowed,
    }
  }

  checkClassScheduleConflicts(mode:"single"|"block", conflictObjects:ConflictCheckObjects): Observable<Conflict[]>{
    let conflicts: Conflict[] = [];
    let appointmentsToCheck: CalendarEvent[] = [];

    if(mode==="single"){
      if (conflictObjects.newEvent){
        appointmentsToCheck.push(conflictObjects.newEvent);
      }
    }else{
      appointmentsToCheck = conflictObjects.newEvents || [];
    }


    conflictObjects.selectedClasses.forEach(class_ => {
      this.scheduleService.getAppointmentsByClass(class_.id).subscribe((existingAppointments:CalendarEvent[]) => {

        appointmentsToCheck.forEach(newEvent => {
          existingAppointments.forEach(existing => {
            if (!newEvent.start || !newEvent.end || !existing.start || !existing.end) {
              console.warn("Skipping event due to missing start or end time", newEvent, existing);
              return;
            }
            if (newEvent.start.toDateString() === new Date(existing.start).toDateString() &&
              newEvent.start < existing.end  && newEvent.end > existing.start) {
              console.log("Ayooo")
              conflicts.push({
                type: "CLASS",
                conflict_id: class_.id,
                message: `Schedule conflict with Class ${class_.id}`,
                conflictingAppointments: [existing],
                conflictCausingAppointment: newEvent,
              });
            }
          });
        })
      })
    })
    return of(conflicts);
  }

  checkLecturerScheduleConflicts(mode:"single"|"block", conflictObjects:ConflictCheckObjects): Observable<Conflict[]>{
    let conflicts: Conflict[] = [];
    let appointmentsToCheck: CalendarEvent[] = [];

    if(mode==="single"){
      if (conflictObjects.newEvent){
        appointmentsToCheck.push(conflictObjects.newEvent);
      }
    }else{
      appointmentsToCheck = conflictObjects.newEvents || [];
    }

    conflictObjects.selectedLecturers.forEach(lecturer => {
      this.scheduleService.getFullAppointmentsByLecturer(lecturer.lec_id+"").subscribe((data) => {
        const existingAppointments = [...data.appointments, ...data.personalAppointments];
        appointmentsToCheck.forEach(newEvent => {
          existingAppointments.forEach(existing => {
            if (!newEvent.start || !newEvent.end || !existing.start || !existing.end) {
              console.warn("Skipping event due to missing start or end time", newEvent, existing);
              return;
            }
            if (newEvent.start.toDateString() === new Date(existing.start).toDateString() &&
              newEvent.start < existing.end  && newEvent.end > existing.start) {
              console.log("Ayooo")
              conflicts.push({
                type: "LECTURER",
                conflict_id: lecturer.lec_id,
                message: `Schedule conflict with Teacher ${lecturer.fullname}`,
                conflictingAppointments: [existing],
                conflictCausingAppointment: newEvent,
              });
            }
          });

        })
      })

    })

    return of(conflicts);
  }

  checkRoomScheduleConflicts(mode:"single"|"block", conflictObjects:ConflictCheckObjects): Observable<Conflict[]>{
    let conflicts: Conflict[] = [];
    let appointmentsToCheck: CalendarEvent[] = [];

    if(mode==="single"){
      if (conflictObjects.newEvent){
        appointmentsToCheck.push(conflictObjects.newEvent);
      }
    }else{
      appointmentsToCheck = conflictObjects.newEvents || [];
    }

    conflictObjects.selectedRooms.forEach(room => {
      this.scheduleService.getAppointmentsByRoom(room.room_id+"").subscribe((existingAppointments) => {
        appointmentsToCheck.forEach(newEvent => {
          existingAppointments.forEach(existing => {
            if (!newEvent.start || !newEvent.end || !existing.start || !existing.end) {
              console.warn("Skipping event due to missing start or end time", newEvent, existing);
              return;
            }
            if (newEvent.start.toDateString() === new Date(existing.start).toDateString() &&
              newEvent.start < existing.end  && newEvent.end > existing.start) {
              console.log("Ayooo")
              conflicts.push({
                type: "ROOM",
                conflict_id: room.room_id,
                message: `Schedule conflict with room ${room.room_name}`,
                conflictingAppointments: [existing],
                conflictCausingAppointment: newEvent,
              });
            }
          });

        })
      })

    })

    return of(conflicts);
  }
}
