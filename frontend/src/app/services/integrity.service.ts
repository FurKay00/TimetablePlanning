import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {forkJoin, map, Observable, of} from 'rxjs';
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

  checkClassScheduleConflicts(mode: "single" | "block", conflictObjects: ConflictCheckObjects): Observable<Conflict[]> {
    let appointmentsToCheck: CalendarEvent[] = [];

    if (mode === "single" && conflictObjects.newEvent) {
      appointmentsToCheck.push(conflictObjects.newEvent);
    } else if (mode === "block") {
      appointmentsToCheck = conflictObjects.newEvents || [];
    }

    if (conflictObjects.selectedClasses.length === 0) {
      return of([]);
    }

    let requests = conflictObjects.selectedClasses.map(class_ =>
      this.scheduleService.getAppointmentsByClass(class_.id).pipe(
        map(existingAppointments => ({ classId: class_.id, existingAppointments }))
      )
    );

    return forkJoin(requests).pipe(
      map(results => {
        let conflicts: Conflict[] = [];

        results.forEach(({ classId, existingAppointments }) => {
          appointmentsToCheck.forEach(newEvent => {
            existingAppointments.forEach(existing => {
              if (!newEvent.start || !newEvent.end || !existing.start || !existing.end) {
                console.warn("Skipping event due to missing start or end time", newEvent, existing);
                return;
              }

              if (
                newEvent.start.toDateString() === new Date(existing.start).toDateString() &&
                newEvent.start < existing.end &&
                newEvent.end > existing.start
              ) {
                console.log("Conflict detected");
                conflicts.push({
                  type: "CLASS",
                  conflict_id: classId,
                  message: `Schedule conflict with Class ${classId}`,
                  conflictingAppointments: [existing],
                  conflictCausingAppointment: newEvent,
                });
              }
            });
          });
        });

        return conflicts;
      })
    );
  }


  checkLecturerScheduleConflicts(mode: "single" | "block", conflictObjects: ConflictCheckObjects): Observable<Conflict[]> {
    let appointmentsToCheck: CalendarEvent[] = [];

    if (mode === "single" && conflictObjects.newEvent) {
      appointmentsToCheck.push(conflictObjects.newEvent);
    } else if (mode === "block") {
      appointmentsToCheck = conflictObjects.newEvents || [];
    }

    if (conflictObjects.selectedLecturers.length === 0) {
      return of([]);
    }

    let requests = conflictObjects.selectedLecturers.map(lecturer =>
      this.scheduleService.getFullAppointmentsByLecturer(lecturer.lec_id + "").pipe(
        map(data => ({
          lecturerId: lecturer.lec_id,
          lecturerName: lecturer.fullname,
          existingAppointments: [...data.appointments, ...data.personalAppointments]
        }))
      )
    );

    return forkJoin(requests).pipe(
      map(results => {
        let conflicts: Conflict[] = [];

        results.forEach(({ lecturerId, lecturerName, existingAppointments }) => {
          appointmentsToCheck.forEach(newEvent => {
            existingAppointments.forEach(existing => {
              if (!newEvent.start || !newEvent.end || !existing.start || !existing.end) {
                console.warn("Skipping event due to missing start or end time", newEvent, existing);
                return;
              }

              if (
                newEvent.start.toDateString() === new Date(existing.start).toDateString() &&
                newEvent.start < existing.end &&
                newEvent.end > existing.start
              ) {
                console.log("Conflict detected!");
                conflicts.push({
                  type: "LECTURER",
                  conflict_id: lecturerId,
                  message: `Schedule conflict with lecturer ${lecturerName}`,
                  conflictingAppointments: [existing],
                  conflictCausingAppointment: newEvent,
                });
              }
            });
          });
        });

        return conflicts;
      })
    );
  }


  checkRoomScheduleConflicts(mode:"single"|"block", conflictObjects:ConflictCheckObjects): Observable<Conflict[]>{
    let appointmentsToCheck: CalendarEvent[] = [];

    if (mode === "single" && conflictObjects.newEvent) {
      appointmentsToCheck.push(conflictObjects.newEvent);
    } else if (mode === "block") {
      appointmentsToCheck = conflictObjects.newEvents || [];
    }

    if (conflictObjects.selectedRooms.length === 0) {
      return of([]);
    }

    let requests = conflictObjects.selectedRooms.map(room =>
      this.scheduleService.getAppointmentsByRoom(room.room_id+"").pipe(
        map(existingAppointments => ({ room: room, existingAppointments }))
      )
    );

    return forkJoin(requests).pipe(
      map(results => {
        let conflicts: Conflict[] = [];

        results.forEach(({ room, existingAppointments }) => {
          appointmentsToCheck.forEach(newEvent => {
            existingAppointments.forEach(existing => {
              if (!newEvent.start || !newEvent.end || !existing.start || !existing.end) {
                console.warn("Skipping event due to missing start or end time", newEvent, existing);
                return;
              }

              if (
                newEvent.start.toDateString() === new Date(existing.start).toDateString() &&
                newEvent.start < existing.end &&
                newEvent.end > existing.start
              ) {
                console.log("Conflict detected");
                conflicts.push({
                  type: "ROOM",
                  conflict_id: room.room_id,
                  message: `Schedule conflict with room ${room.room_name}`,
                  conflictingAppointments: [existing],
                  conflictCausingAppointment: newEvent,
                });
              }
            });
          });
        });

        return conflicts;
      })
    );
  }
}
