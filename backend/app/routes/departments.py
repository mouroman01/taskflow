from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Department, User
from app.schemas.schemas import DepartmentCreate, DepartmentOut

router = APIRouter(prefix="/api/departments", tags=["departments"])


@router.get("", response_model=list[DepartmentOut])
def list_departments(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Department).order_by(Department.name.asc()).all()


@router.post("", response_model=DepartmentOut)
def create_department(payload: DepartmentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    department = Department(name=payload.name, description=payload.description)
    db.add(department)
    db.commit()
    db.refresh(department)
    return department
