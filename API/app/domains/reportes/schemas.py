from datetime import date
from pydantic import BaseModel


class StatsResponse(BaseModel):
    reservas_hoy: int
    reservas_semana: int
    reservas_mes: int
    reservas_totales: int
    ingresos_hoy: float
    ingresos_semana: float
    ingresos_mes: float
    ingresos_totales: float
    canchas_activas: int
    usuarios_totales: int


class DashboardResponse(BaseModel):
    status: int = 200
    stats: StatsResponse


class ReporteSemanaItem(BaseModel):
    label: str
    total: int


class ReporteSemanaResponse(BaseModel):
    status: int = 200
    periodo: dict
    reporte: list[ReporteSemanaItem]
    total_reservas: int


class ReporteIngresosResponse(BaseModel):
    status: int = 200
    periodo: dict
    ingresos: dict
    reservas_procesadas: int
    reservas_pendientes: int


class AdminReservaItem(BaseModel):
    id: int
    usuario: dict
    cancha: dict
    fecha: date
    hora_inicio: str
    hora_fin: str
    estado_pago: str
    precio_total: float
    created_at: str | None = None


class AdminReservaListResponse(BaseModel):
    status: int = 200
    reservas: list[AdminReservaItem]
    total: int
    page: int = 1
    limit: int = 50
