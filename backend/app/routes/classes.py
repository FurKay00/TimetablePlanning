from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Class
from app.crud import create_class, get_classes

router = APIRouter()


@router.post("/")
def create_new_class(class_: Class, db: Session = Depends(get_db)):
    return create_class(db, class_.id, class_.size)


@router.get("/")
def fetch_classes(db: Session = Depends(get_db)):
    return get_classes(db)
