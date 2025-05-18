from app.models import views, models
from app.main import db_dependency
from fastapi import HTTPException
from sqlalchemy import delete


def to_view(r: models.AppointmentsFlat) -> views.AppointmentView:
    return views.AppointmentView(
        id=r.appointment_id,
        type=r.type,
        title=r.title,
        module=r.module,
        date=r.date,
        start_time=r.start_time,
        end_time=r.end_time,
        lecturers=[
            views.LecturerView(lec_id=lid, fullname=name)
            for lid, name in zip(r.lecturer_ids, r.lecturer_names)
            if lid is not None
        ],
        rooms=[
            views.RoomView(room_id=rid, room_name=rname)
            for rid, rname in zip(r.room_ids, r.room_names)
            if rid is not None
        ],
        classes=[
            views.ClassView(class_id=cid)
            for cid in r.class_ids
            if cid is not None
        ],
    )


def create_appointment(db: db_dependency, appointment: views.AppointmentBase) -> models.Appointment:
    db_appointment = models.Appointment(
        type=appointment.type,
        title=appointment.title,
        module=appointment.module,
        date=appointment.date,
        start_time=appointment.start_time,
        end_time=appointment.end_time
    )
    db.add(db_appointment)
    db.flush()

    assocs = []
    assocs += [
        models.App2Lec(app_id=db_appointment.id, lec_id=lid)
        for lid in appointment.lec_ids or []
    ]
    assocs += [
        models.App2Class(app_id=db_appointment.id, class_id=cid)
        for cid in appointment.class_ids or []
    ]
    assocs += [
        models.App2Room(app_id=db_appointment.id, room_id=rid)
        for rid in appointment.room_ids or []
    ]

    if assocs:
        db.bulk_save_objects(assocs)
    return db_appointment


def update_basic_one(
        db: db_dependency, data: views.AppointmentPut
) -> models.Appointment:

    db_obj = db.get(models.Appointment, data.id)
    if not db_obj:
        raise HTTPException(
            status_code=404,
            detail=f"Appointment with ID {data.id} not found."
        )

    for field in ("title", "type", "module", "date", "start_time", "end_time"):
        setattr(db_obj, field, getattr(data, field))

    db.execute(
        delete(models.App2Lec).where(models.App2Lec.app_id == data.id)
    )
    db.execute(
        delete(models.App2Class).where(models.App2Class.app_id == data.id)
    )
    db.execute(
        delete(models.App2Room).where(models.App2Room.app_id == data.id)
    )

    # 4) Neue Relationen in Bulk erzeugen
    assocs: list[models.Base] = []
    assocs += [
        models.App2Lec(app_id=data.id, lec_id=lid)
        for lid in data.lec_ids or []
    ]
    assocs += [
        models.App2Class(app_id=data.id, class_id=cid)
        for cid in data.class_ids or []
    ]
    assocs += [
        models.App2Room(app_id=data.id, room_id=rid)
        for rid in data.room_ids or []
    ]
    if assocs:
        db.bulk_save_objects(assocs)

    return db_obj
