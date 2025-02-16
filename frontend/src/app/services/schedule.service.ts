import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, Observable} from 'rxjs';
import {CalendarEvent} from 'angular-calendar';
import {AppointmentView, PersonalAppointmentView} from '../models/response_models';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  URL: string = "http://127.0.0.1:8000/appointments/"
  lectureColor = {primary: '#62D2DC', secondary: '#62D2DC'}
  examColor = {primary: '#D83B3B', secondary: '#D83B3B'}
  informationalColor = {primary: '#DFED70', secondary: '#DFED70'}
  personalColor = {primary: '#2C81E7CC', secondary: '#2C81E7CC'}

  constructor(private http: HttpClient) {
  }

  getAppointmentsByClass(class_id: string): Observable<CalendarEvent[]> {
    return this.http.get<{
      message: string;
      appointments: AppointmentView[]
    }>(this.URL + "appointmentsByClass/" + class_id)
      .pipe(
        map(response => response.appointments.map(
          appointment => this.mapAppointmentToEvent(appointment))
        )
      );
  }

  getAppointmentsByRoom(room_id: string): Observable<CalendarEvent[]> {
    return this.http.get<{
      message: string;
      appointments: AppointmentView[]
    }>(this.URL + "appointmentsByRoom/" + room_id)
      .pipe(
        map(response => response.appointments.map(
          appointment => this.mapAppointmentToEvent(appointment))
        )
      );
  }

  // This method is used, when the lecturer wants to retrieve their own full schedule
  getFullAppointmentsByLecturer(lec_id: string):Observable<{appointments:CalendarEvent[], personalAppointments:CalendarEvent[]}> {
    return this.http.get<{
      message: string;
      appointments: AppointmentView[],
      personalAppointments: PersonalAppointmentView[]
    }>(this.URL + "appointmentsByLecturer/" + lec_id)
      .pipe(
        map(response => ({
            appointments: response.appointments.map(appointment => this.mapAppointmentToEvent(appointment)),
            personalAppointments: response.personalAppointments.map(personalAppointment => this.mapPersonalAppointmentToEvent(personalAppointment, false))
          })
        )
      );
  }

  getPartialAppointmentsByLecturer(lec_id: string):Observable<{appointments:CalendarEvent[], personalAppointments:CalendarEvent[]}> {
    return this.http.get<{
      message: string;
      appointments: AppointmentView[],
      personalAppointments: PersonalAppointmentView[]
    }>(this.URL + "appointmentsByLecturer/" + lec_id)
      .pipe(
        map(response => ({
            appointments: response.appointments.map(appointment => this.mapAppointmentToEvent(appointment)),
            personalAppointments: response.personalAppointments.map(personalAppointment =>
              this.mapPersonalAppointmentToEvent(personalAppointment,true)
            )
          })
        )
      );
  }

  private mapAppointmentToEvent(appointment: AppointmentView): any {
    return {
      id: appointment.id,
      start: new Date(appointment.date + 'T' + appointment.start_time),
      end: new Date(appointment.date + 'T' + appointment.end_time),
      title: appointment.title,
      draggable: false,
      color: this.getAppointmentColor(appointment.type),
      meta: {
        location: appointment.rooms.map(room => `${room.room_name}`).join('\n'),
        lecturer: appointment.lecturers.map(lec => lec.fullname).join('\n')
      },
      cssClass: 'custom-event-style'
    };
  }

  private mapPersonalAppointmentToEvent(personalAppointment:PersonalAppointmentView, pseudonomized:boolean):any{
    return {
      id: personalAppointment.id,
      start: new Date(personalAppointment.date + 'T' + personalAppointment.start_time),
      end: new Date(personalAppointment.date + 'T' + personalAppointment.end_time),
      title: pseudonomized? "Personal appointment" : personalAppointment.title,
      draggable: false,
      color: this.getAppointmentColor("PERSONAL"),
      meta: {
        location:"",
        lecturer:""
      },
      cssClass: 'custom-event-style'
    };
  }

  getAppointmentColor(type:string):{primary:string, secondary:string}{
    switch (type){
      case "LECTURE":
        return this.lectureColor;
      case "EXAM":
        return this.examColor;
      case "INFORMATIONAL":
        return this.informationalColor;
      case "PERSONAL":
        return this.personalColor;
      default:
        return this.lectureColor;
    }
  }
}
