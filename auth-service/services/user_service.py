from typing import Optional
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from models.user import User

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, email: str, password: str, full_name: str, tenant_id: str) -> User:
    hashed = pwd_context.hash(password)
    user = User(email=email, hashed_password=hashed, full_name=full_name, tenant_id=tenant_id)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def deactivate_user(db: Session, user_id: int) -> bool:
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    user.is_active = False
    db.commit()
    return True
