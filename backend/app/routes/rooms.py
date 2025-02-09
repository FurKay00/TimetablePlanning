from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.crud import create_room, get_rooms
from app.models import Room

router = APIRouter()


@router.post("/")
def create_new_room(room: Room, db: Session = Depends(get_db)):
    return create_room(db, room.id, room.capacity)


@router.get("/")
def fetch_rooms(db: Session = Depends(get_db)):
    return get_rooms(db)
