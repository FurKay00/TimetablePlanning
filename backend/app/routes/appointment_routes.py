from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import List, Optional
from sqlalchemy import delete, any_, and_
from app.main import db_dependency
from app.models import models
from app.models import views
from app.services.appointments_service import to_view, create_appointment, update_basic_one

router = APIRouter()


@router.get("/appointment_basic/{appointment_id}")
async def get_basic_appointment(appointment_id: int, db: db_dependency) -> views.AppointmentView:
    if appointment_id is None:
        raise HTTPException(status_code=400, detail="No appointment_id provided")

    db_appointment_request = db.query(models.AppointmentsFlat).filter(models.AppointmentsFlat.appointment_id == appointment_id).first()

    return to_view(db_appointment_request)


@router.get("/appointments_personal/{lec_id}")
async def get_personal_appointments_timeframe(lec_id: int, start_date: Optional[str], end_date: Optional[str],
                                              db: db_dependency) -> list[views.PersonalAppointmentView]:
    if lec_id is None:
        raise HTTPException(status_code=400, detail="No lec_id provided")

    filters = [models.PersonalAppointment.lec_id == lec_id]

    if start_date is not None:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        filters.append(models.PersonalAppointment.date >= start_dt.date())

    if end_date is not None:
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        filters.append(models.PersonalAppointment.date <= end_dt.date())

    db_appointments = db.query(models.PersonalAppointment).filter(*filters).all()

    return [
        views.PersonalAppointmentView(
            id=personal_appointment.id,
            title=personal_appointment.title,
            date=personal_appointment.date,
            start_time=personal_appointment.start_time,
            end_time=personal_appointment.end_time
        )
        for personal_appointment in db_appointments
    ]


@router.get("", response_model=views.AppointmentsResponse, summary="Appointments with certain filters")
async def get_appointments_with_filters(
        *,
        db: db_dependency,
        start_date: Optional[str] = Query(None, description="Earliest date"),
        end_date: Optional[str] = Query(None, description="Latest date"),
        room_id: Optional[int] = Query(None, description="Room filter"),
        class_id: Optional[str] = Query(None, description="Class filter"),
        lecturer_id: Optional[int] = Query(None, description="Lecturer filter"),
        personal: bool = Query(None, description="Personal appointments of lecturer flag")
):
    filters = []

    if start_date is not None:
        start_dt = datetime.strptime(start_date, "%Y-%m-%d")
        filters.append(models.AppointmentsFlat.date >= start_dt.date())

    if end_date is not None:
        end_dt = datetime.strptime(end_date, "%Y-%m-%d")
        filters.append(models.AppointmentsFlat.date <= end_dt.date())

    if room_id is not None:
        filters.append(room_id == any_(models.AppointmentsFlat.room_ids))

    if class_id is not None:
        filters.append(class_id == any_(models.AppointmentsFlat.class_ids))

    if lecturer_id is not None:
        filters.append(lecturer_id == any_(models.AppointmentsFlat.lecturer_ids))

    query = db.query(models.AppointmentsFlat)
    if filters:
        query = query.filter(and_(*filters))
    rows = query.all()

    appointments = [to_view(r) for r in rows]
    response = {"appointments": appointments}

    if lecturer_id is not None and personal:
        personal = await get_personal_appointments_timeframe(lecturer_id, start_date, end_date, db)
        response["personalAppointments"] = personal

    return response


@router.post("/basic/", response_model=views.AppointmentFinal)
async def create_basic_appointment(appointment: views.AppointmentBase, db: db_dependency):
    try:
        with db.begin():
            db_apt = create_appointment(db, appointment)
            db.refresh(db_apt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return views.AppointmentFinal.model_validate(db_apt)


@router.post("/basic/bulk", response_model=List[views.AppointmentFinal])
async def create_multiple_basic_appointments(appointments: List[views.AppointmentBase], db: db_dependency):
    if not appointments:
        raise HTTPException(status_code=400, detail="No appointments provided")
    created = []
    try:
        with db.begin():
            for appt in appointments:
                db_apt = create_appointment(db, appt)
                created.append(db_apt)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    for db_apt in created:
        db.refresh(db_apt)

    return [
        views.AppointmentFinal.model_validate(db_apt)
        for db_apt in created
    ]


@router.post("/personal/")
async def create_personal_appointment(appointment: views.PersonalAppointmentBase, db: db_dependency):
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
async def create_multiple_personal_appointments(appointments: List[views.PersonalAppointmentBase], db: db_dependency):
    if not appointments:
        raise HTTPException(status_code=400, detail="No appointments provided")

    appointments_result = []

    for appointment in appointments:
        db_appointment = await create_personal_appointment(appointment, db)
        appointments_result.append(db_appointment["appointment"])

    return {"message": "Appointments created successfully", "appointments": appointments_result}


@router.put("/basic/", response_model=list[views.AppointmentFinal])
async def update_basic_appointments(appointments: List[views.AppointmentPut], db: db_dependency):
    if not appointments:
        raise HTTPException(status_code=400, detail="No appointments provided")

    updated: list[models.Appointment] = []
    try:
        with db.begin():
            for appt in appointments:
                obj = update_basic_one(db, appt)
                updated.append(obj)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    for obj in updated:
        db.refresh(obj)

    return [
            views.AppointmentFinal.model_validate(obj)
            for obj in updated
        ]


@router.put("/personal/", response_model=list[views.PersonalAppointmentView])
async def update_personal_appointments(appointments: List[views.PersonalAppointmentView], db: db_dependency):
    if not appointments:
        raise HTTPException(status_code=400, detail="No appointments provided")

    updated: list[models.PersonalAppointment] = []
    try:
        with db.begin():
            for data in appointments:
                db_obj = db.get(models.PersonalAppointment, data.id)
                if not db_obj:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Personal Appointment with ID {data.id} not found."
                    )
                db_obj.title = data.title
                db_obj.date = data.date
                db_obj.start_time = data.start_time
                db_obj.end_time = data.end_time
                updated.append(db_obj)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    for obj in updated:
        db.refresh(obj)

    return [
            views.PersonalAppointmentView.model_validate(obj)
            for obj in updated
        ]


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


