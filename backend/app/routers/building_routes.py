from fastapi import APIRouter
from app.services.graph_service import get_building_connections

router = APIRouter()


@router.get("/connections/")
def get_connections():
    return get_building_connections()
