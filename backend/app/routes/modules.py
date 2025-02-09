from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Module
from app.crud import create_module, get_modules

router = APIRouter()


@router.post("/")
def create_new_module(module: Module, db: Session = Depends(get_db)):
    return create_module(db, module.id, module.title, module.workload)


@router.get("/")
def fetch_modules(db: Session = Depends(get_db)):
    return get_modules(db)
