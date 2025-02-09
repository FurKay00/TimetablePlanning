from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Student
from app.crud import create_student, get_students

router = APIRouter()


@router.post("/")
def create_new_student(student: Student, db: Session = Depends(get_db)):
    return create_student(db, student.id, student.fullname, student.class_id)


@router.get("/")
def fetch_students(db: Session = Depends(get_db)):
    return get_students(db)
