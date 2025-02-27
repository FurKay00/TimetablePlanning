from sqlalchemy import Column, ForeignKey, Integer, String, Date, Time, ARRAY
from app.database import Base


class Account(Base):
    __tablename__ = 'account'
    id = Column(Integer, primary_key=True, index=True)
    fullname = Column(String, index=True)
    role = Column(String, index=True)
    imgUrl = Column(String, index=True)
    faculty = Column(String, index=True, nullable=True)
    class_id = Column(String, ForeignKey("class.id"), nullable=True)


class Room(Base):
    __tablename__ = 'room'
    id = Column(Integer, primary_key=True, index=True)
    room = Column(String, index=True)
    building = Column(String, index=True)
    capacity = Column(Integer, index=True)


class Module(Base):
    __tablename__ = 'module'
    id = Column(String, primary_key=True, index=True)
    workload = Column(Integer, index=True)
    title = Column(String, index=True)


class Class(Base):
    __tablename__ = 'class'
    id = Column(String, primary_key=True, index=True)
    size = Column(Integer, index=True)
    secretary_id = Column(Integer, ForeignKey("account.id"), index=True)


class Appointment(Base):
    __tablename__ = 'appointment'
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, index=True)
    title = Column(String, index=True)
    module = Column(String, index=True, nullable=True)
    date = Column(Date, index=True)
    start_time = Column(Time, index=True)
    end_time = Column(Time, index=True)


class PersonalAppointment(Base):
    __tablename__ = 'personalAppointment'
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, index=True)
    start_time = Column(Time, index=True)
    end_time = Column(Time, index=True)
    title = Column(String, index=True)
    lec_id = Column(Integer, ForeignKey('account.id'))


class App2Lec(Base):
    __tablename__ = 'app2lec'
    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, ForeignKey('appointment.id'))
    lec_id = Column(Integer, ForeignKey('account.id'))


class App2Class(Base):
    __tablename__ = 'app2class'
    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, ForeignKey('appointment.id'))
    class_id = Column(String, ForeignKey('class.id'))


class App2Room(Base):
    __tablename__ = 'app2room'
    id = Column(Integer, primary_key=True, index=True)
    app_id = Column(Integer, ForeignKey('appointment.id'))
    room_id = Column(Integer, ForeignKey('room.id'))


class AppointmentsFlat(Base):
    __tablename__ = 'appointments_flat'  # name of the view
    __table_args__ = {'extend_existing': True}

    appointment_id = Column(Integer, primary_key=True)
    type = Column(String)
    title = Column(String)
    module = Column(String)
    date = Column(Date)
    start_time = Column(Time)
    end_time = Column(Time)

    lecturer_ids = Column(ARRAY(Integer))
    lecturer_names = Column(ARRAY(String))
    class_ids = Column(ARRAY(String))
    room_ids = Column(ARRAY(Integer))
    room_names = Column(ARRAY(String))
