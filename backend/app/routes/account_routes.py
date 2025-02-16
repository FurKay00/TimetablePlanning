from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
from app.main import db_dependency
from app.models import models
from typing import Optional

router = APIRouter()


class AccountView(BaseModel):
    id: int
    fullname: str
    role: str
    imgUrl: str
    faculty: Optional[str]
    class_id: Optional[str]
    classes: List[str]


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
