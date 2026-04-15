from datetime import time
from pydantic import BaseModel


class HorarioBase(BaseModel):
    dia_semana: int
    hora_inicio: time
    hora_fin: time


class HorarioResponse(HorarioBase):
    id: int
    dia_nombre: str | None = None

    class Config:
        from_attributes = True


class CanchaBase(BaseModel):
    nombre: str
    tipo: str
    precio_hora: float
    capacidad: int


class CanchaCreate(CanchaBase):
    pass


class CanchaUpdate(BaseModel):
    nombre: str | None = None
    tipo: str | None = None
    precio_hora: float | None = None
    capacidad: int | None = None
    is_active: bool | None = None


class CanchaResponse(BaseModel):
    id: int
    nombre: str
    tipo: str
    precio_hora: float
    capacidad: int
    is_active: bool

    class Config:
        from_attributes = True


class CanchaDetailResponse(CanchaResponse):
    horarios: list[HorarioResponse] = []


class CanchaCreateResponse(BaseModel):
    status: int = 201
    message: str
    cancha: CanchaResponse


class CanchaDeleteResponse(BaseModel):
    status: int = 200
    message: str
    cancha: CanchaResponse


class CanchaListResponse(BaseModel):
    status: int = 200
    canchas: list[CanchaResponse]


class DisponibilidadRequest(BaseModel):
    fecha: str
    hora_inicio: time
    hora_fin: time


class DisponibilidadResponse(BaseModel):
    status: int = 200
    disponible: bool
    cancha: dict
    horas_duracion: int | None = None
    duracion_label: str | None = None
    precio_total: float | None = None
    mensaje: str | None = None
