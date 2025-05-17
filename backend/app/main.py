from fastapi import FastAPI, HTTPException
import app.models.models as models
from app.database import db_dependency
from app.routes import room_routes, building_routes, appointment_routes, administrative_routes
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

API_URL = "/api/v1"

origins = [
    "http://localhost:4200",  # Angular Dev Server
    "http://127.0.0.1:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# models.Base.metadata.create_all(bind=engine)

app.include_router(room_routes.router, prefix=API_URL + "/rooms", tags=["Rooms"])

app.include_router(building_routes.router, prefix=API_URL + "/buildings", tags=["Buildings"])

app.include_router(appointment_routes.router, prefix=API_URL + "/appointments", tags=["Appointments"])

app.include_router(administrative_routes.router, prefix=API_URL + "/administrative", tags=["Administrative"])


@app.get("/")
def read_root():
    return {"message": "Welcome to University Scheduler!"}