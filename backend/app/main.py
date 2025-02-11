from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Annotated
import app.models as models
from app.database import engine, SessionLocal
from sqlalchemy.orm import Session
from app.routers import room_routes, building_routes
app = FastAPI()


# models.Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


db_dependency = Annotated[Session, Depends(get_db)]


app.include_router(room_routes.router, prefix="/rooms", tags=["Rooms"])
app.include_router(building_routes.router, prefix="/buildings", tags=["Buildings"])


@app.get("/")
def read_root():
    return {"message": "Welcome to University Scheduler!"}


@app.get("/accounts")
async def get_accounts(db: db_dependency):
    result = db.query(models.Account).all()
    if not result:
        raise HTTPException(status_code=404, detail="Account not found")
    return result


@app.get("/rooms")
async def get_rooms(db: db_dependency):
    result = db.query(models.Room).all()
    if not result:
        raise HTTPException(status_code=404, detail="Room not found")
    return result


@app.get("/modules")
async def get_modules(db: db_dependency):
    result = db.query(models.Module).all()
    if not result:
        raise HTTPException(status_code=404, detail="Module not found")
    return result


@app.get("/classes")
async def get_classes(db: db_dependency):
    result = db.query(models.Class).all()
    if not result:
        raise HTTPException(status_code=404, detail="Class not found")
    return result
