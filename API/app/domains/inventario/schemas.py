from typing import Literal

from pydantic import BaseModel


CategoriaEquipo = Literal["Raquetas", "Pelotas", "Accesorios", "Iluminacion", "Redes"]
MaintenanceStatus = Literal["Disponible", "Mantenimiento"]


class EquipoCreate(BaseModel):
    nombre: str
    categoria: CategoriaEquipo
    precio_alquiler: float
    stock_total: int


class EquipoUpdate(BaseModel):
    nombre: str | None = None
    categoria: CategoriaEquipo | None = None
    precio_alquiler: float | None = None
    stock_total: int | None = None


class MantenimientoUpdate(BaseModel):
    notas: str | None = None


class EquipoResponse(BaseModel):
    id: int
    nombre: str
    categoria: CategoriaEquipo
    precio_alquiler: float
    stock_total: int
    is_active: bool
    maintenance_status: str = "Disponible"
    maintenance_notes: str | None = None

    class Config:
        from_attributes = True


class EquipoListResponse(BaseModel):
    status: int = 200
    equipos: list[EquipoResponse]


class EquipoDetailResponse(BaseModel):
    status: int = 200
    equipo: EquipoResponse


class EquipoCreateResponse(BaseModel):
    status: int = 201
    message: str
    equipo: EquipoResponse


class EquipoUpdateResponse(BaseModel):
    status: int = 200
    message: str
    equipo: EquipoResponse


class EquipoDeleteResponse(BaseModel):
    status: int = 200
    message: str
    equipo: EquipoResponse


class InventarioSummaryResponse(BaseModel):
    status: int = 200
    total_equipos: int
    stock_total: int
    valor_inventario: float
    equipos_bajo_stock: int = 0
    alquileres_activos: int = 0


class AlquilerEquipoItem(BaseModel):
    equipo_id: int
    cantidad: int


class ReservaAlquileresUpdate(BaseModel):
    items: list[AlquilerEquipoItem]


class AlquilerEquipoResponse(BaseModel):
    id: int
    equipo_id: int
    equipo_nombre: str
    categoria: str
    cantidad: int
    precio_alquiler: float
    subtotal: float


class ReservaAlquileresResponse(BaseModel):
    status: int = 200
    message: str
    reserva_id: int
    alquileres: list[AlquilerEquipoResponse]
    total_alquileres: float
    precio_total_reserva: float


class MantenimientoResponse(BaseModel):
    status: int = 200
    message: str
    equipo: EquipoResponse


class InventarioDisponibleResponse(BaseModel):
    status: int = 200
    equipos: list[EquipoResponse]
