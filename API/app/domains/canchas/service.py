from datetime import date, time
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.domains.canchas.models import Cancha, Horario
from app.domains.reservas.models import Reserva, EstadoPago
from app.core.exceptions import NotFoundException, ConflictException, ValidationException


class CanchaService:
    def __init__(self, db: Session):
        self.db = db

    def listar(self) -> list[Cancha]:
        return self.db.query(Cancha).filter(Cancha.is_active == True).all()

    def get_by_id(self, cancha_id: int) -> Cancha:
        cancha = self.db.query(Cancha).filter(Cancha.id == cancha_id).first()
        if not cancha:
            raise NotFoundException("Cancha no encontrada")
        return cancha

    def get_detail(self, cancha_id: int) -> dict:
        cancha = self.get_by_id(cancha_id)
        horarios = self.db.query(Horario).filter(Horario.cancha_id == cancha_id).all()

        dia_nombres = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

        return {
            "id": cancha.id,
            "nombre": cancha.nombre,
            "tipo": cancha.tipo,
            "precio_hora": float(cancha.precio_hora),
            "capacidad": cancha.capacidad,
            "is_active": cancha.is_active,
            "horarios": [
                {
                    "id": h.id,
                    "dia_semana": h.dia_semana,
                    "dia_nombre": dia_nombres[h.dia_semana] if h.dia_semana < 8 else "",
                    "hora_inicio": h.hora_inicio.strftime("%H:%M"),
                    "hora_fin": h.hora_fin.strftime("%H:%M")
                }
                for h in horarios
            ]
        }

    def verificar_disponibilidad(
        self,
        cancha_id: int,
        fecha: date,
        hora_inicio: time,
        hora_fin: time
    ) -> dict:
        cancha = self.get_by_id(cancha_id)

        dia_semana = fecha.weekday()
        if dia_semana == 6:
            dia_semana = 0
        else:
            dia_semana += 1

        horario = self.db.query(Horario).filter(
            Horario.cancha_id == cancha_id,
            Horario.dia_semana == dia_semana
        ).first()

        if not horario:
            return {
                "status": 200,
                "disponible": False,
                "cancha": {"id": cancha.id, "nombre": cancha.nombre},
                "mensaje": "La cancha no tiene horarios disponibles para este día"
            }

        if hora_inicio < horario.hora_inicio or hora_fin > horario.hora_fin:
            return {
                "status": 200,
                "disponible": False,
                "cancha": {"id": cancha.id, "nombre": cancha.nombre},
                "mensaje": "El horario seleccionado está fuera del horario de atención"
            }

        reservas_conflictivas = self.db.query(Reserva).filter(
            Reserva.cancha_id == cancha_id,
            Reserva.fecha == fecha,
            Reserva.estado_pago != EstadoPago.LIBRE,
            or_(
                and_(Reserva.hora_inicio < hora_fin, Reserva.hora_fin > hora_inicio)
            )
        ).first()

        if reservas_conflictivas:
            return {
                "status": 200,
                "disponible": False,
                "cancha": {"id": cancha.id, "nombre": cancha.nombre},
                "mensaje": "El horario seleccionado ya está reservado"
            }

        inicio_dt = datetime.combine(fecha, hora_inicio)
        fin_dt = datetime.combine(fecha, hora_fin)
        duracion_horas = (fin_dt - inicio_dt).seconds / 3600
        precio_total = float(cancha.precio_hora) * duracion_horas

        return {
            "status": 200,
            "disponible": True,
            "cancha": {"id": cancha.id, "nombre": cancha.nombre},
            "horas_duracion": int(duracion_horas),
            "duracion_label": f"{int(duracion_horas)} horas",
            "precio_total": precio_total
        }

    def crear(self, nombre: str, tipo: str, precio_hora: float, capacidad: int) -> dict:
        if precio_hora <= 0:
            raise ValidationException("El precio por hora debe ser mayor a 0")
        if capacidad <= 0:
            raise ValidationException("La capacidad debe ser mayor a 0")

        cancha = Cancha(
            nombre=nombre,
            tipo=tipo,
            precio_hora=precio_hora,
            capacidad=capacidad
        )
        self.db.add(cancha)
        self.db.commit()
        self.db.refresh(cancha)

        return {
            "status": 201,
            "message": "Cancha creada exitosamente",
            "cancha": {
                "id": cancha.id,
                "nombre": cancha.nombre,
                "tipo": cancha.tipo,
                "precio_hora": float(cancha.precio_hora),
                "capacidad": cancha.capacidad
            }
        }

    def actualizar(
        self,
        cancha_id: int,
        nombre: str | None = None,
        tipo: str | None = None,
        precio_hora: float | None = None,
        capacidad: int | None = None,
        is_active: bool | None = None
    ) -> dict:
        cancha = self.get_by_id(cancha_id)

        if nombre is not None:
            cancha.nombre = nombre
        if tipo is not None:
            cancha.tipo = tipo
        if precio_hora is not None:
            if precio_hora <= 0:
                raise ValidationException("El precio por hora debe ser mayor a 0")
            cancha.precio_hora = precio_hora
        if capacidad is not None:
            if capacidad <= 0:
                raise ValidationException("La capacidad debe ser mayor a 0")
            cancha.capacidad = capacidad
        if is_active is not None:
            cancha.is_active = is_active

        self.db.commit()
        self.db.refresh(cancha)

        return {
            "status": 200,
            "message": "Cancha actualizada exitosamente",
            "cancha": {
                "id": cancha.id,
                "nombre": cancha.nombre,
                "tipo": cancha.tipo,
                "precio_hora": float(cancha.precio_hora),
                "capacidad": cancha.capacidad,
                "is_active": cancha.is_active
            }
        }


from datetime import datetime
