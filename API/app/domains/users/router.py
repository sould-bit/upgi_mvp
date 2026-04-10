from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.domains.auth.utils import get_current_user
from app.domains.users.models import User
from app.domains.users.service import UserService
from app.domains.users.schemas import UserResponse, UserUpdate, UserDetailResponse

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/me", response_model=UserDetailResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = UserService(db)
    return service.get_detail(current_user.id)


@router.patch("/me", response_model=UserDetailResponse)
def update_current_user(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = UserService(db)
    return service.update(
        user_id=current_user.id,
        nombre=data.nombre,
        telefono=data.telefono
    )
