from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import date, time, datetime
from typing import List, Optional

from sqlalchemy import delete, any_, and_

from app.main import db_dependency
from app.models import models
from app.models.models import AppointmentsFlat

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


class AccountView(BaseModel):
    id: int
    fullname: str
    role: str
    imgUrl: str
    faculty: str
    class_id: str
    classes: List[str]


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


@router.get("/all_appointments/")
async def get_all_appointment(db: db_dependency):
    datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    db_appointment = db.query(models.Appointment).all()
    appointments = []
    for app_entry in db_appointment:
        appointment_query = await get_basic_appointment(app_entry.id, db)
        appointments.append(appointment_query["appointment"])

    datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    return {"message": "All appointments successfully retrieved", "appointments": appointments}


@router.get("/appointment_basic/{appointment_id}")
async def get_basic_appointment(appointment_id: int, db: db_dependency):
    if appointment_id is None:
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
    if lec_id is None:
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


@router.get("/appointments_personal/{lec_id}/{start_date}/{end_date}")
async def get_personal_appointments_timeframe(lec_id: int, start_date: str, end_date: str, db: db_dependency):
    if lec_id is None:
        raise HTTPException(status_code=400, detail="No lec_id provided")

    start_dt = datetime.strptime(start_date, "%Y-%m-%d")
    end_dt = datetime.strptime(end_date, "%Y-%m-%d")

    db_appointments = db.query(models.PersonalAppointment).filter(
            models.PersonalAppointment.lec_id == lec_id,
            models.PersonalAppointment.date >= start_dt.date(),
            models.PersonalAppointment.date <= end_dt.date()
        )

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
        title=appointment.title,
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


@router.put("/basic/")
async def update_basic_appointments(appointments: List[AppointmentPut], db: db_dependency):
    if not appointments:
        raise HTTPException(status_code=400, detail="No appointments provided")
    updated_appointments = []
    for updated_appointment in appointments:
        appointment = db.query(models.Appointment).filter(models.Appointment.id == updated_appointment.id).first()
        if not appointment:
            raise HTTPException(status_code=404, detail=f"Appointment with ID {updated_appointment.id} not found.")
        appointment.title = updated_appointment.title
        appointment.type = updated_appointment.type
        appointment.module = updated_appointment.module
        appointment.date = updated_appointment.date
        appointment.start_time = updated_appointment.start_time
        appointment.end_time = updated_appointment.end_time

        db.execute(delete(models.App2Lec).where(models.App2Lec.app_id == appointment.id))
        db.execute(delete(models.App2Room).where(models.App2Room.app_id == appointment.id))
        db.execute(delete(models.App2Class).where(models.App2Class.app_id == appointment.id))
        for lec_id in updated_appointment.lec_ids:
            new_relation = models.App2Lec(app_id=appointment.id, lec_id=lec_id)
            db.add(new_relation)

        for class_id in updated_appointment.class_ids:
            new_relation = models.App2Class(app_id=appointment.id, class_id=class_id)
            db.add(new_relation)

        for room_id in updated_appointment.room_ids:
            new_relation = models.App2Room(app_id=appointment.id, room_id=room_id)
            db.add(new_relation)
        updated_appointments.append(appointment)

    db.commit()

    return {"message": "Appointments updated successfully", "appointments": updated_appointments}


@router.put("/personal/")
async def update_personal_appointments(appointments: List[PersonalAppointmentView], db: db_dependency):
    if not appointments:
        raise HTTPException(status_code=400, detail="No appointments provided")
    updated_appointments = []
    for updated_appointment in appointments:
        appointment = (db.query(models.PersonalAppointment).
                       filter(models.PersonalAppointment.id == updated_appointment.id).first())
        if not appointment:
            raise HTTPException(status_code=404, detail=f"Appointment with ID {updated_appointment.id} not found.")
        appointment.title = updated_appointment.title
        appointment.date = updated_appointment.date
        appointment.start_time = updated_appointment.start_time
        appointment.end_time = updated_appointment.end_time
        updated_appointments.append(appointment)

    db.commit()

    return {"message": "Personal Appointments updated successfully", "appointments": updated_appointments}


@router.delete("/basic/{appointment_id}", status_code=204)
async def delete_basic_appointment(appointment_id: int, db: db_dependency):
    appointment = db.query(models.Appointment).filter(models.Appointment.id == appointment_id).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    db.execute(delete(models.App2Lec).where(models.App2Lec.app_id == appointment.id))
    db.execute(delete(models.App2Room).where(models.App2Room.app_id == appointment.id))
    db.execute(delete(models.App2Class).where(models.App2Class.app_id == appointment.id))
    db.delete(appointment)
    db.commit()

    return {"message": "Appointment deleted successfully"}


@router.delete("/personal/{appointment_id}", status_code=204)
async def delete_personal_appointment(appointment_id: int, db: db_dependency):
    appointment = db.query(models.PersonalAppointment).filter(models.PersonalAppointment.id == appointment_id).first()

    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")

    db.delete(appointment)
    db.commit()

    return {"message": "Appointment deleted successfully"}


@router.get("/appointment_lecturers/{appointment_id}")
async def get_basic_appointment_lecturers(appointment_id: int, db: db_dependency):
    if appointment_id is None:
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
    if appointment_id is None:
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
    if appointment_id is None:
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
    if lecturer_id is None:
        raise HTTPException(status_code=400, detail="No lecturer_id provided")
    db_appointments = db.query(models.App2Lec).filter(models.App2Lec.lec_id == lecturer_id)
    appointments = []

    for app2lec_entry in db_appointments:
        appointment_query = await get_basic_appointment(app2lec_entry.app_id, db)
        appointments.append(appointment_query["appointment"])

    db_personal_appointments = await get_personal_appointments(lecturer_id, db)
    personal_appointments = db_personal_appointments["appointments"]

    return {"message": "Appointments retrieved successfully", "personalAppointments": personal_appointments,
            "appointments": appointments}


@router.get("/appointmentsByClass/{class_id}")
async def get_basic_appointments_by_class(class_id: str, db: db_dependency):
    datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    if not class_id:
        raise HTTPException(status_code=400, detail="No class_id provided")
    db_appointments = db.query(models.App2Class).filter(models.App2Class.class_id == class_id)
    appointments = []

    for app2class_entry in db_appointments:
        appointment_query = await get_basic_appointment(app2class_entry.app_id, db)
        appointments.append(appointment_query["appointment"])

    datetime.now().strftime('%Y-%m-%d %H:%M:%S')
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


@router.get("/appointmentsByClassImproved/{class_id}")
async def get_appointments_by_class_improved(class_id: str, db: db_dependency):
    datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    results = db.query(AppointmentsFlat).filter(class_id == any_(AppointmentsFlat.class_ids)).all()

    appointment_views = []
    for row in results:
        appointment_views.append(
            AppointmentView(
                id=row.appointment_id,
                type=row.type,
                title=row.title,
                module=row.module,
                date=row.date,
                start_time=row.start_time,
                end_time=row.end_time,
                lecturers=[
                    LecturerView(lec_id=lid, fullname=name)
                    for (lid, name) in zip(row.lecturer_ids, row.lecturer_names)
                    if lid is not None
                ],
                rooms=[
                    RoomView(room_id=rid, room_name=rname)
                    for (rid, rname) in zip(row.room_ids, row.room_names)
                    if rid is not None
                ],
                classes=[
                    ClassView(class_id=cid)
                    for cid in row.class_ids
                    if cid is not None
                ]
            )
        )
    datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    return {
        "message": "Appointments retrieved successfully",
        "appointments": appointment_views
    }


@router.get("/appointmentsByRoomImproved/{room_id}")
async def get_appointments_by_room_improved(room_id: int, db: db_dependency):
    datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    results = db.query(AppointmentsFlat).filter(room_id == any_(AppointmentsFlat.room_ids)).all()

    appointment_views = []
    for row in results:
        appointment_views.append(
            AppointmentView(
                id=row.appointment_id,
                type=row.type,
                title=row.title,
                module=row.module,
                date=row.date,
                start_time=row.start_time,
                end_time=row.end_time,
                lecturers=[
                    LecturerView(lec_id=lid, fullname=name)
                    for (lid, name) in zip(row.lecturer_ids, row.lecturer_names)
                    if lid is not None
                ],
                rooms=[
                    RoomView(room_id=rid, room_name=rname)
                    for (rid, rname) in zip(row.room_ids, row.room_names)
                    if rid is not None
                ],
                classes=[
                    ClassView(class_id=cid)
                    for cid in row.class_ids
                    if cid is not None
                ]
            )
        )
    datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    return {
        "message": "Appointments retrieved successfully",
        "appointments": appointment_views
    }


@router.get("/appointmentsByLecturerImproved/{lec_id}")
async def get_appointments_by_lecturer_improved(lec_id: int, db: db_dependency):
    datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    results = db.query(AppointmentsFlat).filter(lec_id == any_(AppointmentsFlat.lecturer_ids)).all()

    appointment_views = []
    for row in results:
        appointment_views.append(
            AppointmentView(
                id=row.appointment_id,
                type=row.type,
                title=row.title,
                module=row.module,
                date=row.date,
                start_time=row.start_time,
                end_time=row.end_time,
                lecturers=[
                    LecturerView(lec_id=lid, fullname=name)
                    for (lid, name) in zip(row.lecturer_ids, row.lecturer_names)
                    if lid is not None
                ],
                rooms=[
                    RoomView(room_id=rid, room_name=rname)
                    for (rid, rname) in zip(row.room_ids, row.room_names)
                    if rid is not None
                ],
                classes=[
                    ClassView(class_id=cid)
                    for cid in row.class_ids
                    if cid is not None
                ]
            )
        )
    db_personal_appointments = await get_personal_appointments(lec_id, db)
    personal_appointments = db_personal_appointments["appointments"]

    datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    return {
        "message": "Appointments retrieved successfully",
        "personalAppointments": personal_appointments,
        "appointments": appointment_views,
    }


@router.get("/all_appointments_Improved/")
async def get_all_appointments_improved(db: db_dependency):
    datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    results = db.query(AppointmentsFlat).all()

    appointment_views = []
    for row in results:
        appointment_views.append(
            AppointmentView(
                id=row.appointment_id,
                type=row.type,
                title=row.title,
                module=row.module,
                date=row.date,
                start_time=row.start_time,
                end_time=row.end_time,
                lecturers=[
                    LecturerView(lec_id=lid, fullname=name)
                    for (lid, name) in zip(row.lecturer_ids, row.lecturer_names)
                    if lid is not None
                ],
                rooms=[
                    RoomView(room_id=rid, room_name=rname)
                    for (rid, rname) in zip(row.room_ids, row.room_names)
                    if rid is not None
                ],
                classes=[
                    ClassView(class_id=cid)
                    for cid in row.class_ids
                    if cid is not None
                ]
            )
        )

    datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    return {
        "message": "Appointments retrieved successfully",
        "appointments": appointment_views
    }


@router.get("/appointmentsByRoomImproved/{room_id}/{start_date}/{end_date}")
async def get_appointments_by_room_improved_timeframe(room_id: int, start_date: str, end_date: str, db: db_dependency):
    try:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")

        results = db.query(models.AppointmentsFlat).filter(
            and_(
                room_id == any_(models.AppointmentsFlat.room_ids),
                models.AppointmentsFlat.date >= start_dt.date(),
                models.AppointmentsFlat.date <= end_dt.date()
            )
        ).all()

        appointment_views = []
        for row in results:
            appointment_views.append(
                AppointmentView(
                    id=row.appointment_id,
                    type=row.type,
                    title=row.title,
                    module=row.module,
                    date=row.date,
                    start_time=row.start_time,
                    end_time=row.end_time,
                    lecturers=[
                        LecturerView(lec_id=lid, fullname=name)
                        for (lid, name) in zip(row.lecturer_ids, row.lecturer_names)
                        if lid is not None
                    ],
                    rooms=[
                        RoomView(room_id=rid, room_name=rname)
                        for (rid, rname) in zip(row.room_ids, row.room_names)
                        if rid is not None
                    ],
                    classes=[
                        ClassView(class_id=cid)
                        for cid in row.class_ids
                        if cid is not None
                    ]
                )
            )

        return {
            "message": "Appointments retrieved successfully",
            "appointments": appointment_views
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/appointmentsByClassImproved/{class_id}/{start_date}/{end_date}")
async def get_appointments_by_class_improved_timeframe(class_id: str, start_date: str, end_date: str, db: db_dependency):
    try:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")

        results = db.query(models.AppointmentsFlat).filter(
            and_(
                class_id == any_(models.AppointmentsFlat.class_ids),
                models.AppointmentsFlat.date >= start_dt.date(),
                models.AppointmentsFlat.date <= end_dt.date()
            )
        ).all()

        appointment_views = []
        for row in results:
            appointment_views.append(
                AppointmentView(
                    id=row.appointment_id,
                    type=row.type,
                    title=row.title,
                    module=row.module,
                    date=row.date,
                    start_time=row.start_time,
                    end_time=row.end_time,
                    lecturers=[
                        LecturerView(lec_id=lid, fullname=name)
                        for (lid, name) in zip(row.lecturer_ids, row.lecturer_names)
                        if lid is not None
                    ],
                    rooms=[
                        RoomView(room_id=rid, room_name=rname)
                        for (rid, rname) in zip(row.room_ids, row.room_names)
                        if rid is not None
                    ],
                    classes=[
                        ClassView(class_id=cid)
                        for cid in row.class_ids
                        if cid is not None
                    ]
                )
            )

        return {
            "message": "Appointments retrieved successfully",
            "appointments": appointment_views
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/appointmentsByLecturerImproved/{lec_id}/{start_date}/{end_date}")
async def get_appointments_by_lecturer_improved_timeframe(lec_id: int, start_date: str, end_date: str, db: db_dependency):
    try:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")

        results = db.query(models.AppointmentsFlat).filter(
            and_(
                lec_id == any_(models.AppointmentsFlat.lecturer_ids),
                models.AppointmentsFlat.date >= start_dt.date(),
                models.AppointmentsFlat.date <= end_dt.date()
            )
        ).all()

        appointment_views = []
        for row in results:
            appointment_views.append(
                AppointmentView(
                    id=row.appointment_id,
                    type=row.type,
                    title=row.title,
                    module=row.module,
                    date=row.date,
                    start_time=row.start_time,
                    end_time=row.end_time,
                    lecturers=[
                        LecturerView(lec_id=lid, fullname=name)
                        for (lid, name) in zip(row.lecturer_ids, row.lecturer_names)
                        if lid is not None
                    ],
                    rooms=[
                        RoomView(room_id=rid, room_name=rname)
                        for (rid, rname) in zip(row.room_ids, row.room_names)
                        if rid is not None
                    ],
                    classes=[
                        ClassView(class_id=cid)
                        for cid in row.class_ids
                        if cid is not None
                    ]
                )
            )
        db_personal_appointments = await get_personal_appointments_timeframe(lec_id, start_date, end_date, db)
        personal_appointments = db_personal_appointments["appointments"]

        return {
            "message": "Appointments retrieved successfully",
            "personalAppointments": personal_appointments,
            "appointments": appointment_views,
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
