from datetime import date, time
from pydantic import BaseModel, field_validator
from app.domains.reservas.models import EstadoPago


class ReservaCreate(BaseModel):
    cancha_id: int
    fecha: date
    hora_inicio: time
    hora_fin: time
    jugadores: int
    observaciones: str | None = None

    @field_validator("fecha")
    @classmethod
    def validate_fecha(cls, v: date) -> date:
        if v < date.today():
            raise ValueError("La fecha no puede ser anterior a hoy")
        return v


class ReservaCreatePublic(BaseModel):
    cancha_id: int
    fecha: date
    hora_inicio: time
    hora_fin: time
    jugadores: int
    nombre: str
    email: str
    telefono: str | None = None
    observaciones: str | None = None

    @field_validator("fecha")
    @classmethod
    def validate_fecha(cls, v: date) -> date:
        if v < date.today():
            raise ValueError("La fecha no puede ser anterior a hoy")
        return v


class ReservaResponse(BaseModel):
    id: int
    cancha: dict
    fecha: date
    hora_inicio: time
    hora_fin: time
    jugadores: int
    estado_pago: EstadoPago
    precio_total: float
    observaciones: str | None = None

    class Config:
        from_attributes = True


class ReservaCreateResponse(BaseModel):
    status: int
    message: str
    reserva: ReservaResponse


class ReservaDetailResponse(ReservaResponse):
    usuario: dict | None = None
    created_at: str | None = None


class ReservaDetailGetResponse(BaseModel):
    status: int
    reserva: ReservaDetailResponse


class ReservaListResponse(BaseModel):
    status: int = 200
    reservas: list[ReservaResponse]
    total: int
    page: int = 1
    limit: int = 20


class PagoUpdate(BaseModel):
    estado_pago: EstadoPago


class PagoResponse(BaseModel):
    status: int
    message: str
    reserva: dict


class ReservaCancelResponse(BaseModel):
    status: int
    message: str


class ReservaPublicCreateResponse(BaseModel):
    status: int
    message: str
    reserva: dict
    email_enviado: bool = False
