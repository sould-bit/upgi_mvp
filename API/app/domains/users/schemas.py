from pydantic import BaseModel


class UserUpdate(BaseModel):
    nombre: str | None = None
    telefono: str | None = None


class UserResponse(BaseModel):
    id: int
    email: str
    nombre: str
    telefono: str | None = None
    is_admin: bool
    created_at: str | None = None

    class Config:
        from_attributes = True


class UserDetailResponse(BaseModel):
    id: int
    email: str
    nombre: str
    telefono: str | None = None
    is_admin: bool
    created_at: str | None = None
    reservas_count: int = 0
