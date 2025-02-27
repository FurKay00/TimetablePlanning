import {CalendarEvent} from 'angular-calendar';

export interface LecturerView {
  lec_id: number;
  fullname: string;
}

export interface RoomView {
  room_id: number;
  room_name: string;
}

export interface ClassView {
  class_id: string;
  id?:string;
  secretary_id?:number;
  size: number;
}

export interface ClassModel{
  secretary_id: number;
  id: string;
  size: string;
}

export interface ModuleView {
  module_id: string,
  workload: number,
  title: string,
}

export interface AppointmentView {
  id: string;
  type: string;
  title: string;
  module: string;
  date: string;
  start_time: string;
  end_time: string;
  lecturers: LecturerView[];
  rooms: RoomView[];
  classes: ClassView[];
}

export interface PersonalAppointmentView{
  id: number;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
}

export interface BasicAppointmentRequest{
  type: string,
  title: string,
  module: string | null,
  date: string,
  start_time: string, //Format: 20:06:26.182
  end_time: string,
  lec_ids: number[],
  class_ids: string[],
  room_ids: number[]
}

export interface BasicAppointmentPutRequest {
  id: number,
  type: string,
  title: string,
  module: string | null,
  date: string,
  start_time: string, //Format: 20:06:26.182
  end_time: string,
  lec_ids: number[],
  class_ids: string[],
  room_ids: number[]
}

export interface PersonalAppointmentRequest{
  id?: number,
  lec_id: number,
  title: string,
  date: string,
  start_time: string,
  end_time: string
}

export interface Conflict {
  conflict_id: string;
  message: string;
  conflictingAppointments?: CalendarEvent[];
}

export interface ConflictCheckObjects{
  selectedClasses: string[];
  selectedLecturers: number[];
  selectedRooms: RoomView[];
  startTime: string;
  endTime:string;
  date: string;
}
