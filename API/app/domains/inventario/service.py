from datetime import datetime

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.core.exceptions import NotFoundException, ValidationException
from app.domains.canchas.models import Cancha
from app.domains.inventario.models import AlquilerEquipo, Equipo
from app.domains.reservas.models import EstadoPago, Reserva
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

    def marcar_mantenimiento(self, equipo_id: int, notas: str | None = None) -> dict:
        equipo = self.get_by_id(equipo_id)
        equipo.maintenance_status = "Mantenimiento"
        equipo.maintenance_notes = notas
        self.db.commit()
        self.db.refresh(equipo)
        return {
            "status": 200,
            "message": "Equipo marcado para mantenimiento",
            "equipo": self._to_response(equipo),
        }

    def completar_mantenimiento(self, equipo_id: int) -> dict:
        equipo = self.get_by_id(equipo_id)
        equipo.maintenance_status = "Disponible"
        equipo.maintenance_notes = None
        self.db.commit()
        self.db.refresh(equipo)
        return {
            "status": 200,
            "message": "Mantenimiento completado - equipo disponible",
            "equipo": self._to_response(equipo),
        }

    def get_summary(self) -> dict:
        total_equipos, stock_total, valor_inventario = self.db.query(
            func.count(Equipo.id),
            func.coalesce(func.sum(Equipo.stock_total), 0),
            func.coalesce(func.sum(Equipo.precio_alquiler * Equipo.stock_total), 0),
        ).filter(Equipo.is_active == True).first()
        equipos_bajo_stock = self.db.query(Equipo).filter(
            Equipo.is_active == True,
            Equipo.stock_total <= 2,
        ).count()
        alquileres_activos = self.db.query(func.coalesce(func.sum(AlquilerEquipo.cantidad), 0)).join(
            Reserva,
            Reserva.id == AlquilerEquipo.reserva_id,
        ).filter(Reserva.estado_pago != EstadoPago.LIBRE).scalar()

        return {
            "status": 200,
            "total_equipos": int(total_equipos or 0),
            "stock_total": int(stock_total or 0),
            "valor_inventario": float(valor_inventario or 0),
            "equipos_bajo_stock": int(equipos_bajo_stock or 0),
            "alquileres_activos": int(alquileres_activos or 0),
        }

    def list_reserva_alquileres(self, reserva_id: int) -> dict:
        reserva = self._get_reserva(reserva_id)
        return self._build_reserva_alquileres_response(reserva, "Alquileres de la reserva")

    def replace_reserva_alquileres(self, reserva_id: int, items: list[dict]) -> dict:
        reserva = self._get_reserva(reserva_id)
        if reserva.estado_pago == EstadoPago.LIBRE:
            raise ValidationException("No se pueden asociar equipos a una reserva cancelada")

        normalized_items = self._normalize_alquiler_items(items)

        for item in normalized_items:
            equipo = self.get_by_id(item["equipo_id"])
            if not equipo.is_active:
                raise ValidationException(f"El equipo {equipo.nombre} no estÃ¡ activo")

            disponible = self._stock_disponible(equipo.id, exclude_reserva_id=reserva.id)
            if item["cantidad"] > disponible:
                raise ValidationException(
                    f"Stock insuficiente para {equipo.nombre}. Disponible: {disponible}"
                )

        self.db.query(AlquilerEquipo).filter(AlquilerEquipo.reserva_id == reserva.id).delete()

        for item in normalized_items:
            equipo = self.get_by_id(item["equipo_id"])
            alquiler = AlquilerEquipo(
                reserva_id=reserva.id,
                equipo_id=equipo.id,
                cantidad=item["cantidad"],
                precio_alquiler=float(equipo.precio_alquiler),
            )
            self.db.add(alquiler)

        self.db.flush()
        reserva.precio_total = self._calcular_total_reserva(reserva)
        reserva.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(reserva)

        return self._build_reserva_alquileres_response(reserva, "Alquileres actualizados")

    def _validate_categoria(self, categoria: CategoriaEquipo | str) -> None:
        if categoria not in ALLOWED_CATEGORIAS:
            raise ValidationException("Categoría inválida")

    def _validate_precio(self, precio_alquiler: float) -> None:
        if precio_alquiler <= 0:
            raise ValidationException("El precio de alquiler debe ser mayor a 0")

    def _validate_stock(self, stock_total: int) -> None:
        if stock_total < 0:
            raise ValidationException("El stock total no puede ser negativo")

    def _get_reserva(self, reserva_id: int) -> Reserva:
        reserva = self.db.query(Reserva).filter(Reserva.id == reserva_id).first()
        if not reserva:
            raise NotFoundException("Reserva no encontrada")
        return reserva

    def _normalize_alquiler_items(self, items: list[dict]) -> list[dict]:
        aggregated: dict[int, int] = {}
        for item in items:
            equipo_id = int(item["equipo_id"])
            cantidad = int(item["cantidad"])
            if cantidad <= 0:
                raise ValidationException("La cantidad de equipos debe ser mayor a 0")
            aggregated[equipo_id] = aggregated.get(equipo_id, 0) + cantidad

        return [{"equipo_id": equipo_id, "cantidad": cantidad} for equipo_id, cantidad in aggregated.items()]

    def _stock_disponible(self, equipo_id: int, exclude_reserva_id: int | None = None) -> int:
        equipo = self.get_by_id(equipo_id)

        # Bloquear stock si equipo esta en mantenimiento.
        if getattr(equipo, "maintenance_status", "Disponible") == "Mantenimiento":
            return 0

        query = self.db.query(func.coalesce(func.sum(AlquilerEquipo.cantidad), 0)).join(
            Reserva,
            Reserva.id == AlquilerEquipo.reserva_id,
        ).filter(
            AlquilerEquipo.equipo_id == equipo_id,
            Reserva.estado_pago != EstadoPago.LIBRE,
        )

        if exclude_reserva_id is not None:
            query = query.filter(AlquilerEquipo.reserva_id != exclude_reserva_id)

        comprometido = int(query.scalar() or 0)
        return max(0, int(equipo.stock_total or 0) - comprometido)

    def _calcular_total_reserva(self, reserva: Reserva) -> float:
        cancha = self.db.query(Cancha).filter(Cancha.id == reserva.cancha_id).first()
        if not cancha:
            raise NotFoundException("Cancha no encontrada")

        inicio_dt = datetime.combine(reserva.fecha, reserva.hora_inicio)
        fin_dt = datetime.combine(reserva.fecha, reserva.hora_fin)
        duracion_horas = (fin_dt - inicio_dt).seconds / 3600
        total_cancha = float(cancha.precio_hora) * duracion_horas

        total_alquileres = self.db.query(
            func.coalesce(func.sum(AlquilerEquipo.precio_alquiler * AlquilerEquipo.cantidad), 0)
        ).filter(AlquilerEquipo.reserva_id == reserva.id).scalar()

        return float(total_cancha) + float(total_alquileres or 0)

    def _format_alquiler(self, alquiler: AlquilerEquipo) -> dict:
        equipo = self.get_by_id(alquiler.equipo_id)
        subtotal = float(alquiler.precio_alquiler) * int(alquiler.cantidad)
        return {
            "id": alquiler.id,
            "equipo_id": equipo.id,
            "equipo_nombre": equipo.nombre,
            "categoria": equipo.categoria,
            "cantidad": alquiler.cantidad,
            "precio_alquiler": float(alquiler.precio_alquiler),
            "subtotal": subtotal,
        }

    def _build_reserva_alquileres_response(self, reserva: Reserva, message: str) -> dict:
        alquileres = self.db.query(AlquilerEquipo).filter(
            AlquilerEquipo.reserva_id == reserva.id
        ).all()
        formatted = [self._format_alquiler(alquiler) for alquiler in alquileres]
        return {
            "status": 200,
            "message": message,
            "reserva_id": reserva.id,
            "alquileres": formatted,
            "total_alquileres": sum(item["subtotal"] for item in formatted),
            "precio_total_reserva": float(reserva.precio_total),
        }

    def _to_response(self, equipo: Equipo) -> dict:
        return {
            "id": equipo.id,
            "nombre": equipo.nombre,
            "categoria": equipo.categoria,
            "precio_alquiler": float(equipo.precio_alquiler),
            "stock_total": equipo.stock_total,
            "is_active": equipo.is_active,
            "maintenance_status": getattr(equipo, "maintenance_status", "Disponible"),
            "maintenance_notes": getattr(equipo, "maintenance_notes", None),
        }
