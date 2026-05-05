from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user, get_password_hash, verify_password
from app.models.models import User
from app.schemas.schemas import ChangePasswordRequest, LoginRequest, TokenResponse, UserSummary
from app.services.auth_service import login

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login_route(payload: LoginRequest, db: Session = Depends(get_db)):
    result = login(db, payload.email, payload.password)
    if not result:
        raise HTTPException(status_code=401, detail="Credenciais inválidas")
    return result


@router.get("/me", response_model=UserSummary)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/change-password", response_model=UserSummary)
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Senha atual incorreta")
    if len(payload.new_password) < 6:
        raise HTTPException(status_code=400, detail="A nova senha deve ter pelo menos 6 caracteres")
    current_user.password_hash = get_password_hash(payload.new_password)
    current_user.must_change_password = False
    db.commit()
    db.refresh(current_user)
    return current_user
