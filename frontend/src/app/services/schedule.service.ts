import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {CalendarEvent} from 'angular-calendar';
import {AppointmentView} from '../models/response_models';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  URL:string = "http://127.0.0.1:8000/appointments/"

  constructor(private http: HttpClient) { }

  getAppointmentsByClass(class_id: string):Observable<CalendarEvent[]>{
    return this.http.get<{message: string; appointments:AppointmentView[]}>(this.URL + "appointmentsByClass/" + class_id)
      .pipe(
        map(response => response.appointments.map(
          appointment => ({
              id: appointment.id,
              start: new Date(appointment.date + 'T' + appointment.start_time),
              end: new Date(appointment.date + 'T' + appointment.end_time),
              title: appointment.title,
              draggable:false,
              color: { primary: '#62D2DC', secondary: '#62D2DC' },
              meta:{
                location: appointment.rooms.map(room => `${room.room_name}`).join('\n'),
                lecturer: appointment.lecturers.map(lec => lec.fullname).join('\n')
              },
            cssClass: 'custom-event-style'
          })
          )
        )
      );
  }
}
