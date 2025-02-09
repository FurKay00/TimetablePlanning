from sqlalchemy.orm import Session
from app.schemas import Room, Module, Appointment, Class, Lecturer, Student


def create_room(db: Session, room_id: str, capacity: int):
    db_room = Room(id=room_id, capacity=capacity)
    db.add(db_room)
    db.commit()
    db.refresh(db_room)
    return db_room


def get_rooms(db: Session):
    return db.query(Room).all()


def create_module(db: Session, module_id: str, title: str, workload: int):
    db_module = Module(id=module_id, title=title, workload=workload)
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module


def get_modules(db: Session):
    return db.query(Module).all()


def create_class(db: Session, class_id: str, size: int):
    db_class = Class(id=class_id, size=size)
    db.add(db_class)
    db.commit()
    db.refresh(db_class)
    return db_class

def get_classes(db: Session):
    return db.query(Class).all()


def create_student(db: Session, student_id: int, fullname: str, class_id: str):
    db_student = Student(id=student_id, fullname=fullname, class_id=class_id)
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student


def get_students(db: Session):
    return db.query(Student).all()


def create_appointment(db: Session, appointment_id: int, appointment_type: str, title: str,
                       date: str, start_time: str, end_time: str,
                       room_ids: list, lecturer_ids: list, class_ids: list):
    db_appointment = Appointment(
        id=appointment_id,
        appointment_type=appointment_type,
        title=title,
        date=date,
        start_time=start_time,
        end_time=end_time,
    )
    # Assuming relationships are pre-defined with proper association tables
    for room_id in room_ids:
        room = db.query(Room).filter(Room.id == room_id).first()
        db_appointment.rooms.append(room)

    for lecturer_id in lecturer_ids:
        lecturer = db.query(Lecturer).filter(Lecturer.id == lecturer_id).first()
        db_appointment.lecturers.append(lecturer)

    for class_id in class_ids:
        class_ = db.query(Class).filter(Class.id == class_id).first()
        db_appointment.classes.append(class_)

    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment


def get_appointments(db: Session):
    return db.query(Appointment).all()