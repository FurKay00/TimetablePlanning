from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import date, time
from typing import List
from app.main import db_dependency
from app.models import models

router = APIRouter()


class LecturerView(BaseModel):
    lec_id: int
    fullname: str


class RoomView(BaseModel):
    room_id: int
    room_name: str


class ModuleView(BaseModel):
    module_id: str
    workload: int
    title: str


class ClassView(BaseModel):
    class_id: str


class AppointmentBase(BaseModel):
    type: str
    title: str
    module: str
    date: date
    start_time: time
    end_time: time
    lec_ids: List[int]
    class_ids: List[str]
    room_ids: List[int]


class AppointmentFinal(BaseModel):
    id: int
    appointment: AppointmentBase


class PersonalAppointmentBase(BaseModel):
    lec_id: int
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
    module: str
    date: date
    start_time: time
    end_time: time
    lecturers: List[LecturerView]
    rooms: List[RoomView]
    classes: List[ClassView]


class LecturerAppointmentsFullView(BaseModel):
    appointments: List[AppointmentView]
    personal_appointments: List[PersonalAppointmentView]


@router.get("/appointment_basic/{appointment_id}")
async def get_basic_appointment(appointment_id: int, db: db_dependency):
    if not appointment_id:
        raise HTTPException(status_code=400, detail="No appointment_id provided")

    db_appointment_request = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()
    print(db_appointment_request)

    db_lecturers_request = await get_basic_appointment_lecturers(appointment_id, db)
    db_lecturers = db_lecturers_request["lecturers"]

    db_rooms_request = await get_basic_appointment_rooms(appointment_id, db)
    db_rooms = db_rooms_request["rooms"]

    db_classes_request = await get_basic_appointment_classes(appointment_id, db)
    db_classes = db_classes_request["classes"]

    db_appointment = AppointmentView(
        id=appointment_id,
        type=db_appointment_request.type,
        title=db_appointment_request.title,
        module=db_appointment_request.module,
        date=db_appointment_request.date,
        start_time=db_appointment_request.start_time,
        end_time=db_appointment_request.end_time,
        lecturers=db_lecturers,
        rooms=db_rooms,
        classes=db_classes,
    )
    return {"message": "Appointment retrieved successfully", "appointment": db_appointment}


@router.get("/appointments_personal/{lec_id}")
async def get_personal_appointments(lec_id: int, db: db_dependency):
    if not lec_id:
        raise HTTPException(status_code=400, detail="No lec_id provided")
    db_appointments = db.query(models.PersonalAppointment).filter(models.PersonalAppointment.lec_id == lec_id)
    personal_appointments = []
    for appointment in db_appointments:
        personal_appointment = PersonalAppointmentView(
            id=appointment.id,
            title=appointment.title,
            date=appointment.date,
            start_time=appointment.start_time,
            end_time=appointment.end_time
        )
        personal_appointments.append(personal_appointment)

    return {"message": "Personal Appointments retrieved successfully", "appointments": personal_appointments}


@router.post("/basic/")
async def create_basic_appointment(appointment: AppointmentBase, db: db_dependency):
    if not appointment:
        raise HTTPException(status_code=400, detail="No appointment provided")

    db_appointment = models.Appointment(
        type=appointment.type,
        title=appointment.title,
        module=appointment.module,
        date=appointment.date,
        start_time=appointment.start_time,
        end_time=appointment.end_time
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)

    appointment_final = AppointmentFinal(
        id=db_appointment.id,
        appointment={
            "type": db_appointment.type,
            "title": db_appointment.title,
            "module": db_appointment.module,
            "date": db_appointment.date,
            "start_time": db_appointment.start_time,
            "end_time": db_appointment.end_time,
            "lec_ids": [lec for lec in appointment.lec_ids],
            "class_ids": [cls for cls in appointment.class_ids],
            "room_ids": [room for room in appointment.room_ids],
        }
    )

    for lec_id in appointment.lec_ids:
        db_app2lec = models.App2Lec(
            app_id=db_appointment.id,
            lec_id=lec_id
        )
        db.add(db_app2lec)
        db.commit()

    for class_id in appointment.class_ids:
        db_app2class = models.App2Class(
            app_id=db_appointment.id,
            class_id=class_id
        )
        db.add(db_app2class)
        db.commit()

    for room_id in appointment.room_ids:
        db_app2room = models.App2Room(
            app_id=db_appointment.id,
            room_id=room_id
        )
        db.add(db_app2room)
        db.commit()

    return {"message": "Appointment created successfully", "appointment": appointment_final}


@router.post("/basic/bulk")
async def create_multiple_basis_appointments(appointments: List[AppointmentBase], db: db_dependency):
    if not appointments:
        raise HTTPException(status_code=400, detail="No appointments provided")

    appointments_result = []

    for appointment in appointments:
        db_appointment = await create_basic_appointment(appointment, db)
        appointments_result.append(db_appointment["appointment"])

    return {"message": "Appointments created successfully", "appointments": appointments_result}


@router.post("/personal/")
async def create_personal_appointment(appointment: PersonalAppointmentBase, db: db_dependency):
    if not appointment:
        raise HTTPException(status_code=400, detail="No appointment provided")

    db_appointment = models.PersonalAppointment(
            date=appointment.date,
            start_time=appointment.start_time,
            end_time=appointment.end_time,
            lec_id=appointment.lec_id
        )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)

    return {"message": "Personal Appointment created successfully", "appointment": db_appointment}


@router.post("/personal/bulk")
async def create_multiple_personal_appointments(appointments: List[PersonalAppointmentBase], db: db_dependency):
    if not appointments:
        raise HTTPException(status_code=400, detail="No appointments provided")

    appointments_result = []

    for appointment in appointments:
        db_appointment = await create_personal_appointment(appointment, db)
        appointments_result.append(db_appointment["appointment"])

    return {"message": "Appointments created successfully", "appointments": appointments_result}


@router.get("/appointment_lecturers/{appointment_id}")
async def get_basic_appointment_lecturers(appointment_id: int, db: db_dependency):
    if not appointment_id:
        raise HTTPException(status_code=400, detail="No appointment_id provided")

    db_appointment = db.query(models.App2Lec).filter(models.App2Lec.app_id == appointment_id)
    lecturers = []
    for app2lec_entry in db_appointment:
        lec_acc = db.query(models.Account).filter(models.Account.id == app2lec_entry.lec_id).first()
        lecture_view = LecturerView(lec_id=lec_acc.id, fullname=lec_acc.fullname)
        lecturers.append(lecture_view)

    return {"message": "Lecturers successfully retrieved", "lecturers": lecturers}


@router.get("/appointment_rooms/{appointment_id}")
async def get_basic_appointment_rooms(appointment_id: int, db: db_dependency):
    if not appointment_id:
        raise HTTPException(status_code=400, detail="No appointment_id provided")

    db_appointment = db.query(models.App2Room).filter(models.App2Room.app_id == appointment_id)
    rooms = []
    for app2room_entry in db_appointment:
        room = db.query(models.Room).filter(models.Room.id == app2room_entry.room_id).first()
        room_view = RoomView(room_id=room.id, room_name=room.building + " " + room.room)
        rooms.append(room_view)

    return {"message": "Rooms successfully retrieved", "rooms": rooms}


@router.get("/appointment_classes/{appointment_id}")
async def get_basic_appointment_classes(appointment_id: int, db: db_dependency):
    if not appointment_id:
        raise HTTPException(status_code=400, detail="No appointment_id provided")

    db_appointment = db.query(models.App2Class).filter(models.App2Class.app_id == appointment_id)
    classes = []
    for app2class_entry in db_appointment:
        class_ = db.query(models.Class).filter(models.Class.id == app2class_entry.class_id).first()
        class_view = ClassView(class_id=class_.id)
        classes.append(class_view)

    return {"message": "Classes successfully retrieved", "classes": classes}


@router.get("/appointmentsByLecturer/{lecturer_id}")
async def get_basic_appointments_by_lecturer(lecturer_id: int, db: db_dependency):
    if not lecturer_id:
        raise HTTPException(status_code=400, detail="No lecturer_id provided")
    db_appointments = db.query(models.App2Lec).filter(models.App2Lec.lec_id == lecturer_id)
    appointments = []

    for app2lec_entry in db_appointments:
        appointment_query = await get_basic_appointment(app2lec_entry.app_id, db)
        appointments.append(appointment_query["appointment"])

    db_personal_appointments = await get_personal_appointments(lecturer_id, db)
    personal_appointments = db_personal_appointments["appointments"]

    return {"message": "Appointments retrieved successfully", "PersonalAppointments": personal_appointments,
            "Appointments": appointments}


@router.get("/appointmentsByClass/{class_id}")
async def get_basic_appointments_by_class(class_id: str, db: db_dependency):
    if not class_id:
        raise HTTPException(status_code=400, detail="No class_id provided")
    db_appointments = db.query(models.App2Class).filter(models.App2Class.class_id == class_id)
    appointments = []

    for app2class_entry in db_appointments:
        appointment_query = await get_basic_appointment(app2class_entry.app_id, db)
        appointments.append(appointment_query["appointment"])

    return {"message": "Appointments retrieved successfully", "appointments": appointments}


@router.get("/appointmentsByRoom/{room_id}")
async def get_basic_appointments_by_room(room_id: int, db: db_dependency):
    if not room_id:
        raise HTTPException(status_code=400, detail="No room_id provided")
    db_appointments = db.query(models.App2Room).filter(models.App2Room.room_id == room_id)
    appointments = []

    for app2room_entry in db_appointments:
        appointment_query = await get_basic_appointment(app2room_entry.app_id, db)
        appointments.append(appointment_query["appointment"])

    return {"message": "Appointments retrieved successfully", "appointments": appointments}
