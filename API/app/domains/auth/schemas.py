from __future__ import annotations
from pydantic import BaseModel, EmailStr, field_validator
import re


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    nombre: str
    telefono: str | None = None

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres")
        if not re.search(r"[A-Z]", v):
            raise ValueError("La contraseña debe tener al menos 1 mayúscula")
        if not re.search(r"[a-z]", v):
            raise ValueError("La contraseña debe tener al menos 1 minúscula")
        if not re.search(r"\d", v):
            raise ValueError("La contraseña debe tener al menos 1 número")
        if not re.search(r"[@$!%*?&]", v):
            raise ValueError("La contraseña debe tener al menos 1 carácter especial (@$!%*?&)")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class AuthResponse(BaseModel):
    status: int
    message: str
    user_id: int | None = None
    access_token: str | None = None
    token_type: str | None = None
    expires_in: int | None = None
    user: "UserResponse | None " = None


class UserResponse(BaseModel):
    id: int
    email: str
    nombre: str
    telefono: str | None = None
    is_admin: bool
    created_at: str | None = None

    class Config:
        from_attributes = True


class CurrentUserResponse(BaseModel):
    status: int = 200
    user: UserResponse


AuthResponse.model_rebuild()
