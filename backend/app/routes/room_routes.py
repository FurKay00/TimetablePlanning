from fastapi import APIRouter
from pydantic import BaseModel
from app.services.graph_service import find_shortest_path

router = APIRouter()


# Request model
class RoomDistanceRequest(BaseModel):
    room1: str
    room2: str


@router.post("/shortest_path/")
def get_shortest_path(request: RoomDistanceRequest):
    return find_shortest_path(request.room1, request.room2)
