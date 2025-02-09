from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date, time


class Room(BaseModel):
    id: str = Field(..., pattern=r"^[A-D][1-5][0-9]{2}$", description="Room ID, e.g., A222")
    capacity: int = Field(..., gt=0, description="Maximum participant capacity")


class Module(BaseModel):
    id: str = Field(..., pattern=r"^[A-Z]{2}\d{4}$", description="Module ID, e.g., TI3000")
    title: str
    workload: int = Field(..., gt=0, description="Workload in hours")


class Class(BaseModel):
    id: str = Field(..., pattern=r"^[A-Z]{4}\d{2}B\d+$", description="Class ID, e.g., TINF22B6")
    size: int = Field(..., gt=0, description="Number of students in the class")


class Student(BaseModel):
    id: int = Field(..., description="Student's serial ID")
    fullname: str
    class_id: str = Field(..., pattern=r"^[A-Z]{4}\d{2}B\d+$", description="Class ID the student belongs to")


class Secretary(BaseModel):
    id: int = Field(..., description="Secretary's serial ID")
    fullname: str
    faculty: str
    class_ids: List[str] = Field(..., description="List of Class IDs overseen by the secretary")


class Lecturer(BaseModel):
    id: int = Field(..., description="Lecturer's serial ID")
    fullname: str


class Appointment(BaseModel):
    id: str = Field(..., description="Appointment unique ID")
    appointment_type: str = Field(..., description="Type of appointment (e.g., lecture, exam)")
    title: str
    date: date
    start_time: time
    end_time: time
    room_ids: List[str] = Field(..., description="List of Room IDs used")
    lecturer_ids: List[int] = Field(..., description="List of Lecturer IDs participating")
    class_ids: List[str] = Field(..., description="List of Class IDs attending")


class PersonalAppointment(BaseModel):
    lecturer_id: int = Field(..., description="ID of the lecturer setting the appointment")
    date: date
    start_time: time
    end_time: time
