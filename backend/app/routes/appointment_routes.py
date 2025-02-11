from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import date, time
from typing import Annotated, List
from app.main import db_dependency
from app.models import models

router = APIRouter()


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
