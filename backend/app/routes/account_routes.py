from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.main import db_dependency
from app.models import models
from typing import Optional
from app.routes.appointment_routes import LecturerView

router = APIRouter()


class AccountView(BaseModel):
    id: int
    fullname: str
    role: str
    imgUrl: str
    faculty: Optional[str]
    class_id: Optional[str]
    classes: List[str]


class ModuleView(BaseModel):
    module_id: str
    workload: int
    title: str

@router.get("/all/")
async def get_all_accounts(db: db_dependency):
    accounts = []
    db_accounts = db.query(models.Account)

    for account in db_accounts:
        classes = []
        if account.role == "SECRETARY":
            db_classes = await get_classes_by_secretary(sec_id=account.id, db=db)
            classes = db_classes["classes"]
        account_view = AccountView(
            id=account.id,
            fullname=account.fullname,
            role=account.role,
            imgUrl=account.imgUrl,
            faculty=account.faculty,
            class_id=account.class_id,
            classes=classes
        )
        accounts.append(account_view)

    return {"message": "Accounts retrieved successfully.", "accounts": accounts}


@router.get("/secretary_classes/{sec_id}")
async def get_classes_by_secretary(sec_id: int, db: db_dependency):
    if sec_id is None:
        print("Bin hier drinnen")
        raise HTTPException(status_code=400, detail="No secretary_id provided")
    classes = []
    db_classes = db.query(models.Class).filter(models.Class.secretary_id == sec_id)
    for class_ in db_classes:
        classes.append(class_.id)

    return {"message": "Classes retrieved successfully", "classes": classes}


@router.get("/lecturers/")
async def get_all_lecturers(db: db_dependency):
    lecturers = []
    db_lecturers = db.query(models.Account).filter(models.Account.role == "LECTURER")
    for lecturer_entry in db_lecturers:
        lecturer = LecturerView(
            lec_id=lecturer_entry.id,
            fullname=lecturer_entry.fullname
        )
        lecturers.append(lecturer)
    return {"message": "Lecturers retrieved successfully", "lecturers": lecturers}


@router.get("/classes/")
async def get_all_classes(db: db_dependency):
    classes = []
    db_classes = db.query(models.Class)
    for class_entry in db_classes:
        classes.append(class_entry.id)
    return {"message": "Classes retrieved successfully", "classes": classes}


@router.get("/modules/")
async def get_all_modules(db: db_dependency):
    modules = []
    db_modules = db.query(models.Module)
    for module_entry in db_modules:
        module = ModuleView(
            module_id=module_entry.id,
            workload=module_entry.workload,
            title=module_entry.title)
        modules.append(module)
    return {"message": "Modules retrieved successfully", "modules": modules}
