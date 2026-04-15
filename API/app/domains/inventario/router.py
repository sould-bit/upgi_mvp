from fastapi import APIRouter, Depends

from app.database import SessionLocal
from app.domains.auth.utils import get_current_admin
from app.domains.inventario.schemas import (
    EquipoCreate,
    EquipoCreateResponse,
    EquipoDeleteResponse,
    EquipoDetailResponse,
    EquipoListResponse,
    EquipoUpdate,
    EquipoUpdateResponse,
    InventarioSummaryResponse,
)
from app.domains.inventario.service import InventarioService
from app.domains.users.models import User

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.post("/equipos", response_model=EquipoCreateResponse, status_code=201)
def create_equipo(data: EquipoCreate, current_user: User = Depends(get_current_admin)):
    db = SessionLocal()
    try:
        service = InventarioService(db)
        return service.create(data)
    finally:
        db.close()


@router.get("/equipos", response_model=EquipoListResponse)
def list_equipos(current_user: User = Depends(get_current_admin)):
    db = SessionLocal()
    try:
        service = InventarioService(db)
        return service.list_all()
    finally:
        db.close()


@router.get("/equipos/{equipo_id}", response_model=EquipoDetailResponse)
def get_equipo(equipo_id: int, current_user: User = Depends(get_current_admin)):
    db = SessionLocal()
    try:
        service = InventarioService(db)
        return service.get_detail(equipo_id)
    finally:
        db.close()


@router.patch("/equipos/{equipo_id}", response_model=EquipoUpdateResponse)
def update_equipo(
    equipo_id: int,
    data: EquipoUpdate,
    current_user: User = Depends(get_current_admin),
):
    db = SessionLocal()
    try:
        service = InventarioService(db)
        return service.update(equipo_id, data)
    finally:
        db.close()


@router.delete("/equipos/{equipo_id}", response_model=EquipoDeleteResponse)
def delete_equipo(equipo_id: int, current_user: User = Depends(get_current_admin)):
    db = SessionLocal()
    try:
        service = InventarioService(db)
        return service.soft_delete(equipo_id)
    finally:
        db.close()


@router.get("/inventario", response_model=InventarioSummaryResponse)
def get_inventory_summary(current_user: User = Depends(get_current_admin)):
    db = SessionLocal()
    try:
        service = InventarioService(db)
        return service.get_summary()
    finally:
        db.close()
