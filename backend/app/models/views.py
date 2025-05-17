from pydantic import BaseModel
from typing import List
from typing import Optional
from datetime import date, time


# Administrative


class AccountView(BaseModel):
    id: int
    fullname: str
    role: str
    imgUrl: str
    faculty: Optional[str]
    class_id: Optional[str]
    classes: List[str]


class ModuleView(BaseModel):
    module_id: str
    workload: int
    title: str


class ClassModel(BaseModel):
    id: str
    size: int
    secretary_id: int


# Appointment


class LecturerView(BaseModel):
    lec_id: int
    fullname: str


class RoomView(BaseModel):
    room_id: int
    room_name: str


class ClassView(BaseModel):
    class_id: str


class AppointmentBase(BaseModel):
    type: str
    title: str
    module: Optional[str]
    date: date
    start_time: time
    end_time: time
    lec_ids: List[int]
    class_ids: List[str]
    room_ids: List[int]


class AppointmentPut(BaseModel):
    id: int
    type: str
    title: str
    module: Optional[str]
    date: date
    start_time: time
    end_time: time
    lec_ids: List[int]
    class_ids: List[str]
    room_ids: List[int]


class AppointmentFinal(BaseModel):
    id: int
    appointment: AppointmentBase
    model_config = {
        "from_attributes": True
    }


class PersonalAppointmentBase(BaseModel):
    lec_id: int
    title: str
    date: date
    start_time: time
    end_time: time


class PersonalAppointmentView(BaseModel):
    id: int
    title: str
    date: date
    start_time: time
    end_time: time


class AppointmentView(BaseModel):
    id: int
    type: str
    title: str
    module: Optional[str]
    date: date
    start_time: time
    end_time: time
    lecturers: List[LecturerView]
    rooms: List[RoomView]
    classes: List[ClassView]


class LecturerAppointmentsFullView(BaseModel):
    appointments: List[AppointmentView]
    personal_appointments: List[PersonalAppointmentView]


class AppointmentsResponse(BaseModel):
    appointments: List[AppointmentView]
    personalAppointments: Optional[List[PersonalAppointmentView]] = None


# Room


class RoomDistanceRequest(BaseModel):
    room1: str
    room2: str
