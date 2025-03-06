import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import { map, Observable} from 'rxjs';
import {CalendarEvent} from 'angular-calendar';
import {
  AppointmentView, BasicAppointmentPutRequest,
  BasicAppointmentRequest,
  PersonalAppointmentRequest,
  PersonalAppointmentView
} from '../models/response_models';
import {formatDate} from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  URL: string = "http://127.0.0.1:8000/appointments/"
  lectureColor = {primary: '#62D2DC', secondary: '#62D2DC'}
  examColor = {primary: '#D83B3B', secondary: '#D83B3B'}
  informationalColor = {primary: '#DFED70', secondary: '#DFED70'}
  personalColor = {primary: '#2C81E7FF', secondary: '#2C81E7FF'}
  previousColor = {primary: '#7E7F86FF', secondary: '#7E7F86FF'}
  conflictColor = {primary: '#f3a61a', secondary: '#f3a61a'}

  constructor(private http: HttpClient) {
  }

  getAppointmentsByClass(class_id: string, start_date?:string, end_date?:string): Observable<CalendarEvent[]> {
    let date_string = "";
    if (typeof start_date !== "undefined" && typeof end_date !== "undefined"){
      date_string = "/"+start_date+"/"+end_date;
    }
    console.log(date_string)
    return this.http.get<{
      message: string;
      appointments: AppointmentView[]
    }>(this.URL + "appointmentsByClassImproved/" + class_id + date_string)
      .pipe(
        map(response => response.appointments.map(
          appointment => this.mapAppointmentToEvent(appointment))
        )
      );
  }

  getAppointmentsByRoom(room_id: string,start_date?:string, end_date?:string): Observable<CalendarEvent[]> {
    let date_string = "";
    if (typeof start_date !== "undefined" && typeof end_date !== "undefined"){
      date_string = "/"+start_date+"/"+end_date;
    }

    return this.http.get<{
      message: string;
      appointments: AppointmentView[]
    }>(this.URL + "appointmentsByRoomImproved/" + room_id + date_string)
      .pipe(
        map(response => response.appointments.map(
          appointment => this.mapAppointmentToEvent(appointment))
        )
      );
  }

  // This method is used, when the lecturer wants to retrieve their own full schedule
  getFullAppointmentsByLecturer(lec_id: string,start_date?:string, end_date?:string):Observable<{appointments:CalendarEvent[], personalAppointments:CalendarEvent[]}> {
    let date_string = "";
    if (typeof start_date !== "undefined" && typeof end_date !== "undefined"){
      date_string = "/"+start_date+"/"+end_date;
    }

    return this.http.get<{
      message: string;
      appointments: AppointmentView[],
      personalAppointments: PersonalAppointmentView[]
    }>(this.URL + "appointmentsByLecturerImproved/" + lec_id + date_string)
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
    }>(this.URL + "appointmentsByLecturerImproved/" + lec_id)
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

  createNewAppointment(appointment:BasicAppointmentRequest):Observable<BasicAppointmentPutRequest>{
    return this.http.post<{ message:string,appointment: BasicAppointmentPutRequest }>(this.URL + "basic/", appointment)
      .pipe(map(response => response.appointment))
  }

  createNewAppointments(appointments:BasicAppointmentRequest[]):Observable<BasicAppointmentPutRequest[]>{
    return this.http.post<{ message:string, appointments: BasicAppointmentPutRequest[] }>(this.URL + "basic/bulk", appointments)
      .pipe(map(response => response.appointments))
  }

  createNewPersonalAppointment(appointment: PersonalAppointmentRequest):Observable<PersonalAppointmentRequest>{
    return this.http.post<{ message: string, appointment:PersonalAppointmentRequest }>(this.URL + "personal/", appointment).pipe(
      map(response => response.appointment)
    )
  }

  updateAppointments(appointments:BasicAppointmentPutRequest[]):Observable<BasicAppointmentPutRequest[]>{
    return this.http.put<{ message: string, appointments: BasicAppointmentPutRequest[] }>(this.URL + "basic/", appointments)
      .pipe( map(response => response.appointments))
  }

  updatePersonalAppointments(appointments:PersonalAppointmentView[]):Observable<PersonalAppointmentView[]>{
    return this.http.put<{ message: string, appointments:PersonalAppointmentView[] }>(this.URL + "personal/", appointments)
      .pipe( map(response => response.appointments))
  }

  deleteAppointment(appointment_id:number):Observable<any>{
    return this.http.delete(this.URL +"basic/"+appointment_id).pipe();
  }

  deletePersonalAppointment(appointment_id:number):Observable<any>{
    return this.http.delete(this.URL +"personal/"+appointment_id).pipe();
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
        isLecturerAppointment:false,
        typeRaw: appointment.type,
        type: this.toTitleCase(appointment.type),
        module_id: appointment.module,
        locationRaw: appointment.rooms,
        lecturerRaw: appointment.lecturers,
        classesRaw: appointment.classes,
        location: appointment.rooms.map(room => `${room.room_name}`).join('\n'),
        lecturer: appointment.lecturers.map(lec => lec.fullname).join('\n'),
        classes: appointment.classes.map(class_ => class_.class_id).join('\n')
      },
      cssClass: 'custom-event-style'
    };
  }

  mapEventToAppointment(event:CalendarEvent):BasicAppointmentPutRequest{
    return {
      id: event.id as number,
      type: event.meta.typeRaw,
      title: event.title,
      module: event.meta.module_id || null,
      date: formatDate(event.start, "YYYY-MM-dd", "EN-US"),
      start_time: formatDate(event.start, "HH:mm", "EN-US") + ":00.000Z",
      end_time: formatDate(event.end as Date, "HH:mm", "EN-US") + ":00.000Z",
      lec_ids: event.meta.lecturerRaw.map((lecturer:any)=> lecturer.lec_id ),
      class_ids: event.meta.classesRaw,
      room_ids: event.meta.locationRaw.map((location:any)=> location.room_id)
    }
  }

  mapEventToPersonalAppointment(event:CalendarEvent):PersonalAppointmentView{
    return {
      id: event.id as number,
      title: event.title,
      date: formatDate(event.start, "YYYY-MM-dd", "EN-US"),
      start_time: formatDate(event.start, "HH:mm", "EN-US") + ":00.000Z",
      end_time: formatDate(event.end as Date, "HH:mm", "EN-US") + ":00.000Z",
    }
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
        isLecturerAppointment:true,
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

  createPreviousAppointments(previousAppointments:CalendarEvent[]):CalendarEvent[]{
    return previousAppointments.map(appointment => ({...appointment, color: this.previousColor}));
  }

  toTitleCase(str: any) {
    return str.toLowerCase().split(' ').map((word: any) => {
      return (word.charAt(0).toUpperCase() + word.slice(1));
    }).join(' ');
  }

}
