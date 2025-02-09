from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Appointment
from app.crud import create_appointment, get_appointments

router = APIRouter()


@router.post("/")
def create_new_appointment(appointment: Appointment, db: Session = Depends(get_db)):
    return create_appointment(
        db,
        appointment.id,
        appointment.appointment_type,
        appointment.title,
        appointment.date,
        appointment.start_time,
        appointment.end_time,
        appointment.room_ids,
        appointment.lecturer_ids,
        appointment.class_ids,
    )


@router.get("/")
def fetch_appointments(db: Session = Depends(get_db)):
    return get_appointments(db)
