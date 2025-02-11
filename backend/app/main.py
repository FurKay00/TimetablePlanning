from fastapi import FastAPI, HTTPException, Depends
import app.models.models as models
from app.database import db_dependency
from app.routes import room_routes, building_routes, appointment_routes


app = FastAPI()


# models.Base.metadata.create_all(bind=engine)

app.include_router(room_routes.router, prefix="/rooms", tags=["Rooms"])
app.include_router(building_routes.router, prefix="/buildings", tags=["Buildings"])

app.include_router(appointment_routes.router, prefix="/appointments", tags=["Appointments"])


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
