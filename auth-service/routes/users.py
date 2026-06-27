from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from services.user_service import get_user_by_id, deactivate_user
from services.token_service import verify_access_token
from database import get_db

router = APIRouter(prefix="/users", tags=["users"])


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str | None
    tenant_id: str
    is_active: bool
    is_admin: bool

    class Config:
        from_attributes = True


def get_current_user(token: str, db: Session):
    payload = verify_access_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = get_user_by_id(db, int(payload["sub"]))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.get("/me", response_model=UserResponse)
def get_me(token: str, db: Session = Depends(get_db)):
    return get_current_user(token, db)


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: int, token: str, db: Session = Depends(get_db)):
    actor = get_current_user(token, db)
    if actor.id != user_id and not actor.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied")
    user = get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def deactivate(user_id: int, token: str, db: Session = Depends(get_db)):
    actor = get_current_user(token, db)
    if not actor.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin only")
    deactivate_user(db, user_id)
