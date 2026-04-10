from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.domains.auth.utils import get_current_admin
from app.domains.users.models import User
from app.domains.reportes.service import ReporteService
from app.domains.reportes.schemas import (
    DashboardResponse, ReporteSemanaResponse, ReporteIngresosResponse,
    AdminReservaListResponse
)
from app.domains.reservas.service import ReservaService

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard(current_user: User = Depends(get_current_admin)):
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        service = ReporteService(db)
        return service.get_stats()
    finally:
        db.close()


@router.get("/reportes/reservas-semana", response_model=ReporteSemanaResponse)
def get_reporte_semana(
    fecha_inicio: date = Query(...),
    fecha_fin: date = Query(...),
    current_user: User = Depends(get_current_admin)
):
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        service = ReporteService(db)
        return service.get_reservas_semana(fecha_inicio, fecha_fin)
    finally:
        db.close()


@router.get("/reportes/ingresos", response_model=ReporteIngresosResponse)
def get_reporte_ingresos(
    fecha_desde: date = Query(...),
    fecha_hasta: date = Query(...),
    current_user: User = Depends(get_current_admin)
):
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        service = ReporteService(db)
        return service.get_ingresos(fecha_desde, fecha_hasta)
    finally:
        db.close()


@router.get("/reservas", response_model=AdminReservaListResponse)
def listar_todas_reservas(
    fecha: date | None = Query(None),
    cancha_id: int | None = Query(None),
    estado_pago: str | None = Query(None),
    usuario_id: int | None = Query(None),
    page: int = Query(1, ge=1),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_admin)
):
    from app.database import SessionLocal
    db = SessionLocal()
    try:
        service = ReservaService(db)
        return service.listar_todas(
            fecha=fecha,
            cancha_id=cancha_id,
            estado_pago=estado_pago,
            usuario_id=usuario_id,
            page=page,
            limit=limit
        )
    finally:
        db.close()
