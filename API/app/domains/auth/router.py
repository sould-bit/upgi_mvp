from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.database import get_db
from app.domains.auth.schemas import (
    RegisterRequest, LoginRequest, AuthResponse, CurrentUserResponse
)
from app.domains.auth.service import AuthService
from app.domains.auth.utils import get_current_user
from app.domains.users.models import User

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=AuthResponse)
def register(request: RegisterRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.register(
        email=request.email,
        password=request.password,
        nombre=request.nombre,
        telefono=request.telefono
    )


@router.post("/login", response_model=AuthResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    service = AuthService(db)
    return service.login(email=request.email, password=request.password)


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"status": 200, "message": "Sesión cerrada exitosamente"}


@router.get("/me", response_model=CurrentUserResponse)
def get_me(
    authorization: str | None = Header(None),
    db: Session = Depends(get_db)
):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]

    service = AuthService(db)
    payload = service.get_current_user.__wrapped__(service, current_user.id)
    return payload
