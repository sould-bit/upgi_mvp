from typing import Literal

from pydantic import BaseModel


CategoriaEquipo = Literal["Raquetas", "Pelotas", "Accesorios", "Iluminacion", "Redes"]


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


class EquipoResponse(BaseModel):
    id: int
    nombre: str
    categoria: CategoriaEquipo
    precio_alquiler: float
    stock_total: int
    is_active: bool

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
