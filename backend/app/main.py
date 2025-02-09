from fastapi import FastAPI
from app.routes import rooms, modules, classes, students, appointments
app = FastAPI()

app.include_router(rooms.router, prefix="/rooms", tags=["Rooms"])
app.include_router(modules.router, prefix="/modules", tags=["Modules"])
app.include_router(classes.router, prefix="/classes", tags=["Classes"])
app.include_router(students.router, prefix="/students", tags=["Students"])
app.include_router(appointments.router, prefix="/appointments", tags=["Appointments"])


@app.get("/")
def read_root():
    return {"message": "Welcome to the University Scheduling System!"}
