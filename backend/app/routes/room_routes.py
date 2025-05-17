from fastapi import APIRouter
from app.services.graph_service import find_shortest_path
from app.models.views import RoomView, RoomDistanceRequest
from app.main import db_dependency
from app.models import models

router = APIRouter()


@router.get("/all_rooms/")
async def get_all_rooms(db: db_dependency):
    rooms = []
    db_rooms = db.query(models.Room).order_by(models.Room.id)
    for room_entry in db_rooms:
        room = RoomView(
            room_id=room_entry.id,
            room_name=room_entry.building + " " + room_entry.room)
        rooms.append(room)
    return {"message": "Rooms retrieved successfully", "rooms": rooms}


@router.get("/room_models/")
async def get_all_rooms(db: db_dependency):
    rooms = []
    db_rooms = db.query(models.Room).order_by(models.Room.id)
    for room_entry in db_rooms:
        rooms.append(room_entry)
    return {"message": "Rooms retrieved successfully", "rooms": rooms}


@router.post("/shortest_path/")
def get_shortest_path(request: RoomDistanceRequest):
    return find_shortest_path(request.room1, request.room2)

