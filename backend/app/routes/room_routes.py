from fastapi import APIRouter
from pydantic import BaseModel
from app.services.graph_service import find_shortest_path
from app.routes.appointment_routes import RoomView
from app.main import db_dependency
from app.models import models

router = APIRouter()


# Request model
class RoomDistanceRequest(BaseModel):
    room1: str
    room2: str


@router.post("/shortest_path/")
def get_shortest_path(request: RoomDistanceRequest):
    return find_shortest_path(request.room1, request.room2)


@router.get("/all_rooms/")
async def get_all_rooms(db: db_dependency):
    rooms = []
    db_rooms = db.query(models.Room)
    for room_entry in db_rooms:
        room = RoomView(
                room_id=room_entry.id,
                room_name=room_entry.building + " " + room_entry.room)
        rooms.append(room)
    return {"message": "Rooms retrieved successfully", "rooms": rooms}


@router.get("/room_models/")
async def get_all_rooms(db: db_dependency):
    rooms = []
    db_rooms = db.query(models.Room)
    for room_entry in db_rooms:
        rooms.append(room_entry)
    return {"message": "Rooms retrieved successfully", "rooms": rooms}
