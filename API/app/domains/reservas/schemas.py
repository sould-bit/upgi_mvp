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


class ComunicacionCreate(BaseModel):
    contenido: str

    @field_validator("contenido")
    @classmethod
    def validate_contenido(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("El contenido no puede estar vacío")
        return v.strip()


class ComunicacionResponse(BaseModel):
    id: int
    reserva_id: int
    autor_usuario_id: int
    autor_nombre: str
    contenido: str
    tipo: str
    created_at: str | None = None

    class Config:
        from_attributes = True


class ComunicacionListResponse(BaseModel):
    status: int = 200
    comunicaciones: list[ComunicacionResponse]


class ComunicacionCreateResponse(BaseModel):
    status: int = 201
    message: str
    comunicacion: ComunicacionResponse


class ReglaPrecioCreate(BaseModel):
    nombre: str
    tipo: str
    valor: float
    hora_inicio: str | None = None
    hora_fin: str | None = None
    es_socio: bool = False


class ReglaPrecioResponse(BaseModel):
    id: int
    nombre: str
    tipo: str
    valor: float
    hora_inicio: str | None = None
    hora_fin: str | None = None
    es_socio: bool
    is_active: bool

    class Config:
        from_attributes = True


class ReglaPrecioListResponse(BaseModel):
    status: int = 200
    reglas: list[ReglaPrecioResponse]


class ReglaPrecioCreateResponse(BaseModel):
    status: int = 201
    message: str
    regla: ReglaPrecioResponse


class PrecioPreviewRequest(BaseModel):
    cancha_id: int
    hora_inicio: str
    hora_fin: str
    es_socio: bool = False


class PrecioPreviewResponse(BaseModel):
    status: int = 200
    precio_base: float
    descuento: float
    precio_final: float
    desglose: list[dict]


class ListaEsperaCreate(BaseModel):
    cancha_id: int
    fecha: date
    hora_inicio: time
    hora_fin: time
    cliente_nombre: str
    cliente_email: str | None = None
    cliente_telefono: str | None = None


class ListaEsperaResponse(BaseModel):
    id: int
    cancha_id: int
    cliente_nombre: str
    cliente_email: str | None = None
    cliente_telefono: str | None = None
    fecha: date
    hora_inicio: time
    hora_fin: time
    posicion: int
    estado: str
    created_at: str | None = None

    class Config:
        from_attributes = True


class ListaEsperaListResponse(BaseModel):
    status: int = 200
    entradas: list[ListaEsperaResponse]


class ListaEsperaCreateResponse(BaseModel):
    status: int = 201
    message: str
    entrada: ListaEsperaResponse


class ListaEsperaPromoteResponse(BaseModel):
    status: int = 200
    message: str
    reserva_id: int | None = None


class SerieReservaCreate(BaseModel):
    cancha_id: int
    fecha_inicio: date
    fecha_fin: date | None = None
    hora_inicio: time
    hora_fin: time
    jugadores: int
    frecuencia: str
    intervalo: int = 1
    dias_semana: str | None = None
    observaciones: str | None = None


class SerieReservaResponse(BaseModel):
    id: int
    cancha_id: int
    fecha_inicio: date
    fecha_fin: date | None = None
    hora_inicio: time
    hora_fin: time
    jugadores: int
    frecuencia: str
    intervalo: int
    dias_semana: str | None = None
    observaciones: str | None = None
    is_active: bool
    total_instancias: int = 0
    created_at: str | None = None

    class Config:
        from_attributes = True


class SerieReservaListResponse(BaseModel):
    status: int = 200
    series: list[SerieReservaResponse]


class SerieReservaCreateResponse(BaseModel):
    status: int = 201
    message: str
    serie: SerieReservaResponse
    instancias_creadas: int = 0


class SerieReservaCancelResponse(BaseModel):
    status: int = 200
    message: str
    reservas_canceladas: int = 0
