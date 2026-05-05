from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, get_password_hash
from app.models.models import User
from app.schemas.schemas import UserCreate, UserOut, UserUpdate

DEFAULT_PASSWORD = "123@impettus"

router = APIRouter(prefix="/api/users", tags=["users"])


def _require_gestor(current_user: User):
    if current_user.role != "GESTOR":
        raise HTTPException(status_code=403, detail="Acesso restrito ao administrador")


@router.get("", response_model=list[UserOut])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _require_gestor(current_user)
    return db.query(User).order_by(User.name.asc()).all()


@router.post("", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _require_gestor(current_user)
    if db.query(User).filter(User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado")
    password = payload.password or DEFAULT_PASSWORD
    user = User(
        name=payload.name,
        email=payload.email,
        password_hash=get_password_hash(password),
        role=payload.role,
        active=True,
        must_change_password=not bool(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.put("/{user_id}", response_model=UserOut)
def update_user(user_id: int, payload: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _require_gestor(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    if payload.name is not None:
        user.name = payload.name
    if payload.email is not None:
        existing = db.query(User).filter(User.email == payload.email, User.id != user_id).first()
        if existing:
            raise HTTPException(status_code=400, detail="E-mail já está em uso por outro usuário")
        user.email = payload.email
    if payload.role is not None:
        user.role = payload.role
    if payload.active is not None:
        user.active = payload.active
    db.commit()
    db.refresh(user)
    return user


@router.post("/{user_id}/reset-password", response_model=UserOut)
def reset_password(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _require_gestor(current_user)
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    user.password_hash = get_password_hash(DEFAULT_PASSWORD)
    user.must_change_password = True
    db.commit()
    db.refresh(user)
    return user


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    _require_gestor(current_user)
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Você não pode excluir sua própria conta")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Usuário não encontrado")
    db.delete(user)
    db.commit()
    return {"ok": True}
