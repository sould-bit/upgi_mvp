from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.domains.auth.utils import get_current_user, get_current_admin
from app.domains.users.models import User
from app.domains.reservas.service import ReservaService
from app.domains.reservas.models import EstadoPago
from app.domains.reservas.schemas import (
    ReservaCreate, ReservaCreateResponse, ReservaResponse, ReservaListResponse,
    ReservaDetailGetResponse, PagoUpdate, PagoResponse
)

router = APIRouter(prefix="/reservas", tags=["Reservas"])


@router.post("", response_model=ReservaCreateResponse, status_code=201)
def crear_reserva(
    data: ReservaCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ReservaService(db)
    return service.crear(
        usuario_id=current_user.id,
        cancha_id=data.cancha_id,
        fecha=data.fecha,
        hora_inicio=data.hora_inicio,
        hora_fin=data.hora_fin,
        jugadores=data.jugadores,
        observaciones=data.observaciones
    )


@router.get("", response_model=ReservaListResponse)
def listar_reservas(
    fecha_desde: date | None = Query(None),
    fecha_hasta: date | None = Query(None),
    estado_pago: str | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ReservaService(db)
    return service.listar_usuario(
        usuario_id=current_user.id,
        fecha_desde=fecha_desde,
        fecha_hasta=fecha_hasta,
        estado_pago=estado_pago,
        page=page,
        limit=limit
    )


@router.get("/{reserva_id}", response_model=ReservaDetailGetResponse)
def get_reserva(
    reserva_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ReservaService(db)
    return service.get_detalle(
        reserva_id=reserva_id,
        usuario_id=current_user.id,
        is_admin=current_user.is_admin
    )


@router.delete("/{reserva_id}")
def cancelar_reserva(
    reserva_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    service = ReservaService(db)
    return service.cancelar(
        reserva_id=reserva_id,
        usuario_id=current_user.id,
        is_admin=current_user.is_admin
    )


@router.patch("/{reserva_id}/pago", response_model=PagoResponse)
def actualizar_pago(
    reserva_id: int,
    data: PagoUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    service = ReservaService(db)
    return service.actualizar_pago(reserva_id, data.estado_pago)
