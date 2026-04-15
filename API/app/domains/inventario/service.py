from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException, ValidationException
from app.domains.inventario.models import Equipo
from app.domains.inventario.schemas import CategoriaEquipo, EquipoCreate, EquipoUpdate


ALLOWED_CATEGORIAS: set[str] = {
    "Raquetas",
    "Pelotas",
    "Accesorios",
    "Iluminacion",
    "Redes",
}


class InventarioService:
    def __init__(self, db: Session):
        self.db = db

    def create(self, data: EquipoCreate) -> dict:
        self._validate_categoria(data.categoria)
        self._validate_precio(data.precio_alquiler)
        self._validate_stock(data.stock_total)

        equipo = Equipo(
            nombre=data.nombre,
            categoria=data.categoria,
            precio_alquiler=data.precio_alquiler,
            stock_total=data.stock_total,
        )

        self.db.add(equipo)
        self.db.commit()
        self.db.refresh(equipo)

        return {
            "status": 201,
            "message": "Equipo creado",
            "equipo": self._to_response(equipo),
        }

    def list_all(self) -> dict:
        equipos = (
            self.db.query(Equipo)
            .filter(Equipo.is_active == True)
            .order_by(Equipo.id.desc())
            .all()
        )
        return {
            "status": 200,
            "equipos": [self._to_response(equipo) for equipo in equipos],
        }

    def get_by_id(self, equipo_id: int) -> Equipo:
        equipo = self.db.query(Equipo).filter(Equipo.id == equipo_id).first()
        if not equipo:
            raise NotFoundException("Equipo no encontrado")
        return equipo

    def get_detail(self, equipo_id: int) -> dict:
        equipo = self.get_by_id(equipo_id)
        return {
            "status": 200,
            "equipo": self._to_response(equipo),
        }

    def update(self, equipo_id: int, data: EquipoUpdate) -> dict:
        equipo = self.get_by_id(equipo_id)

        if data.nombre is not None:
            equipo.nombre = data.nombre
        if data.categoria is not None:
            self._validate_categoria(data.categoria)
            equipo.categoria = data.categoria
        if data.precio_alquiler is not None:
            self._validate_precio(data.precio_alquiler)
            equipo.precio_alquiler = data.precio_alquiler
        if data.stock_total is not None:
            self._validate_stock(data.stock_total)
            equipo.stock_total = data.stock_total

        self.db.commit()
        self.db.refresh(equipo)

        return {
            "status": 200,
            "message": "Equipo actualizado",
            "equipo": self._to_response(equipo),
        }

    def soft_delete(self, equipo_id: int) -> dict:
        equipo = self.get_by_id(equipo_id)

        if not equipo.is_active:
            return {
                "status": 200,
                "message": "Equipo eliminado",
                "equipo": self._to_response(equipo),
            }

        equipo.is_active = False
        self.db.commit()
        self.db.refresh(equipo)

        return {
            "status": 200,
            "message": "Equipo eliminado",
            "equipo": self._to_response(equipo),
        }

    def get_summary(self) -> dict:
        total_equipos, stock_total, valor_inventario = self.db.query(
            func.count(Equipo.id),
            func.coalesce(func.sum(Equipo.stock_total), 0),
            func.coalesce(func.sum(Equipo.precio_alquiler * Equipo.stock_total), 0),
        ).filter(Equipo.is_active == True).first()

        return {
            "status": 200,
            "total_equipos": int(total_equipos or 0),
            "stock_total": int(stock_total or 0),
            "valor_inventario": float(valor_inventario or 0),
        }

    def _validate_categoria(self, categoria: CategoriaEquipo | str) -> None:
        if categoria not in ALLOWED_CATEGORIAS:
            raise ValidationException("Categoría inválida")

    def _validate_precio(self, precio_alquiler: float) -> None:
        if precio_alquiler <= 0:
            raise ValidationException("El precio de alquiler debe ser mayor a 0")

    def _validate_stock(self, stock_total: int) -> None:
        if stock_total < 0:
            raise ValidationException("El stock total no puede ser negativo")

    def _to_response(self, equipo: Equipo) -> dict:
        return {
            "id": equipo.id,
            "nombre": equipo.nombre,
            "categoria": equipo.categoria,
            "precio_alquiler": float(equipo.precio_alquiler),
            "stock_total": equipo.stock_total,
            "is_active": equipo.is_active,
        }
