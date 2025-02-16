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
