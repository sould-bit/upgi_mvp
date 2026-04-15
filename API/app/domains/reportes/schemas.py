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


class OcupacionItem(BaseModel):
    cancha_id: int
    cancha_nombre: str
    horas_reservadas: float
    horas_disponibles: float
    ocupacion_pct: float


class OcupacionResponse(BaseModel):
    status: int = 200
    periodo: dict
    ocupacion: list[OcupacionItem]


class HorarioPicoItem(BaseModel):
    hora: str
    cantidad: int


class HorariosPicoResponse(BaseModel):
    status: int = 200
    periodo: dict
    horarios: list[HorarioPicoItem]


class ClienteFrecuenteItem(BaseModel):
    cliente_nombre: str
    total_reservas: int
    total_gastado: float


class ClientesFrecuentesResponse(BaseModel):
    status: int = 200
    periodo: dict
    clientes: list[ClienteFrecuenteItem]


class DailyItem(BaseModel):
    fecha: str
    reservas_count: int
    ingreso_total: float


class DailyResponse(BaseModel):
    status: int = 200
    periodo: dict
    daily: list[DailyItem]


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
