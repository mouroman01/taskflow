from sqlalchemy.orm import Session
from app.core.security import verify_password, create_access_token
from app.models.models import User


def login(db: Session, email: str, password: str):
    user = db.query(User).filter(User.email == email, User.active == True).first()
    if not user or not verify_password(password, user.password_hash):
        return None

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "role": user.role,
        "name": user.name,
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }
