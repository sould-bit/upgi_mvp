from datetime import date, time
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.domains.auth.utils import get_current_user, get_current_admin
from app.domains.users.models import User
from app.domains.canchas.service import CanchaService
from app.domains.canchas.schemas import (
    CanchaCreate, CanchaUpdate, CanchaResponse, CanchaDetailResponse,
    CanchaCreateResponse,
    CanchaListResponse, DisponibilidadResponse
)

router = APIRouter(prefix="/canchas", tags=["Canchas"])


@router.get("", response_model=CanchaListResponse)
def listar_canchas(db: Session = Depends(get_db)):
    service = CanchaService(db)
    canchas = service.listar()
    return {
        "status": 200,
        "canchas": [
            {
                "id": c.id,
                "nombre": c.nombre,
                "tipo": c.tipo,
                "precio_hora": float(c.precio_hora),
                "capacidad": c.capacidad,
                "is_active": c.is_active
            }
            for c in canchas
        ]
    }


@router.get("/{cancha_id}", response_model=CanchaDetailResponse)
def get_canha(
    cancha_id: int,
    db: Session = Depends(get_db)
):
    service = CanchaService(db)
    return service.get_detail(cancha_id)


@router.get("/{cancha_id}/disponibilidad", response_model=DisponibilidadResponse)
def verificar_disponibilidad(
    cancha_id: int,
    fecha: date = Query(...),
    hora_inicio: time = Query(...),
    hora_fin: time = Query(...),
    db: Session = Depends(get_db)
):
    service = CanchaService(db)
    return service.verificar_disponibilidad(cancha_id, fecha, hora_inicio, hora_fin)


@router.post("", response_model=CanchaCreateResponse)
def crear_canha(
    data: CanchaCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    service = CanchaService(db)
    return service.crear(
        nombre=data.nombre,
        tipo=data.tipo,
        precio_hora=data.precio_hora,
        capacidad=data.capacidad
    )


@router.put("/{cancha_id}")
def actualizar_canha(
    cancha_id: int,
    data: CanchaUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    service = CanchaService(db)
    return service.actualizar(
        cancha_id=cancha_id,
        nombre=data.nombre,
        tipo=data.tipo,
        precio_hora=data.precio_hora,
        capacidad=data.capacidad,
        is_active=data.is_active
    )
