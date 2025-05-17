from typing import List

from fastapi import APIRouter, HTTPException
from app.main import db_dependency
from app.models import models
from app.models import views

router = APIRouter()


@router.get("/accounts/")
async def get_all_accounts(db: db_dependency) -> list[views.AccountView]:
    accounts = []
    db_accounts = db.query(models.Account)

    for account in db_accounts:
        classes = []
        if account.role == "SECRETARY":
            classes = await get_classes_by_secretary(sec_id=account.id, db=db)
        account_view = views.AccountView(
            id=account.id,
            fullname=account.fullname,
            role=account.role,
            imgUrl=account.imgUrl,
            faculty=account.faculty,
            class_id=account.class_id,
            classes=classes
        )
        accounts.append(account_view)

    return accounts


@router.get("/secretary_classes/{sec_id}", response_model=List[str])
async def get_classes_by_secretary(sec_id: int, db: db_dependency) -> List[str]:
    if sec_id is None:
        raise HTTPException(status_code=400, detail="No secretary_id provided")
    classes = []
    db_classes = db.query(models.Class).filter(models.Class.secretary_id == sec_id)
    for class_ in db_classes:
        classes.append(class_.id)

    return classes


@router.get("/lecturers/")
async def get_all_lecturers(db: db_dependency) -> list[views.LecturerView]:
    lecturers = []
    db_lecturers = db.query(models.Account).filter(models.Account.role == "LECTURER")
    for lecturer_entry in db_lecturers:
        lecturer = views.LecturerView(
            lec_id=lecturer_entry.id,
            fullname=lecturer_entry.fullname
        )
        lecturers.append(lecturer)
    return lecturers


@router.get("/class_ids/", response_model=List[str])
async def get_all_class_ids(db: db_dependency) -> List[str]:
    classes = []
    db_classes = db.query(models.Class)
    for class_entry in db_classes:
        classes.append(class_entry.id)
    return classes


@router.get("/class_models/")
async def get_all_class_models(db: db_dependency) -> list[views.ClassModel]:
    classes = []
    db_classes = db.query(models.Class)
    for class_entry in db_classes:
        classes.append(class_entry)
    return classes


@router.get("/class_models/{class_id}")
async def get_class_by_id(class_id: str, db: db_dependency) -> views.ClassModel:
    db_class = db.query(models.Class).filter(models.Class.id == class_id).first()
    return db_class


@router.get("/modules/")
async def get_all_modules(db: db_dependency) -> list[views.ModuleView]:
    modules = []
    db_modules = db.query(models.Module)
    for module_entry in db_modules:
        module = views.ModuleView(
            module_id=module_entry.id,
            workload=module_entry.workload,
            title=module_entry.title)
        modules.append(module)
    return modules
