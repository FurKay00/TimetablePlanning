from sqlalchemy import Column, Integer, String, Date, Time, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.database import Base


appointment_rooms = Table(
    'appointment_rooms',
    Base.metadata,
    Column('appointment_id', Integer, ForeignKey('appointments.id')),
    Column('room_id', String, ForeignKey('rooms.id'))
)


appointment_classes = Table(
    'appointment_classes',
    Base.metadata,
    Column('appointment_id', Integer, ForeignKey('appointments.id')),
    Column('class_id', String, ForeignKey('classes.id'))
)


appointment_lecturers = Table(
    'appointment_lecturers',
    Base.metadata,
    Column('appointment_id', Integer, ForeignKey('appointments.id')),
    Column('lecturer_id', Integer, ForeignKey('lecturers.id'))
)


class Room(Base):
    __tablename__ = "rooms"
    id = Column(String, primary_key=True, index=True)
    capacity = Column(Integer)


class Class(Base):
    __tablename__ = "classes"
    id = Column(String, primary_key=True, index=True)
    size = Column(Integer)
    students = relationship("Student", back_populates="class_")


class Student(Base):
    __tablename__ = "students"
    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String)
    class_id = Column(String, ForeignKey("classes.id"))
    class_ = relationship("Class", back_populates="students")


class Lecturer(Base):
    __tablename__ = "lecturers"
    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String)


class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    appointment_type = Column(String)
    title = Column(String)
    date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time)
    rooms = relationship("Room", secondary=appointment_rooms)
    lecturers = relationship("Lecturer", secondary=appointment_lecturers)
    classes = relationship("Class", secondary=appointment_classes)


class Module(Base):
    __tablename__ = "modules"
    id = Column(String, primary_key=True, index=True)  # Module ID (e.g., TI3000)
    title = Column(String, nullable=False)  # Module title (e.g., Databases)
    workload = Column(Integer, nullable=False)