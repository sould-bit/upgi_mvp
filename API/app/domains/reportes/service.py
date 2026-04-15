from datetime import date, datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from app.domains.reservas.models import Reserva, EstadoPago
from app.domains.canchas.models import Cancha
from app.domains.users.models import User


class ReporteService:
    def __init__(self, db: Session):
        self.db = db

    def get_stats(self) -> dict:
        today = date.today()
        week_start = today - timedelta(days=today.weekday())
        month_start = today.replace(day=1)

        reservas_hoy = self.db.query(Reserva).filter(Reserva.fecha == today, Reserva.estado_pago != EstadoPago.LIBRE).count()
        reservas_semana = self.db.query(Reserva).filter(
            Reserva.fecha >= week_start,
            Reserva.estado_pago != EstadoPago.LIBRE
        ).count()
        reservas_mes = self.db.query(Reserva).filter(
            Reserva.fecha >= month_start,
            Reserva.estado_pago != EstadoPago.LIBRE
        ).count()
        reservas_totales = self.db.query(Reserva).filter(Reserva.estado_pago != EstadoPago.LIBRE).count()

        ingresos_hoy = self.db.query(func.coalesce(func.sum(Reserva.precio_total), 0)).filter(
            Reserva.fecha == today,
            Reserva.estado_pago == EstadoPago.PAGADO
        ).scalar()

        ingresos_semana = self.db.query(func.coalesce(func.sum(Reserva.precio_total), 0)).filter(
            Reserva.fecha >= week_start,
            Reserva.estado_pago == EstadoPago.PAGADO
        ).scalar()

        ingresos_mes = self.db.query(func.coalesce(func.sum(Reserva.precio_total), 0)).filter(
            Reserva.fecha >= month_start,
            Reserva.estado_pago == EstadoPago.PAGADO
        ).scalar()

        ingresos_totales = self.db.query(func.coalesce(func.sum(Reserva.precio_total), 0)).filter(
            Reserva.estado_pago == EstadoPago.PAGADO
        ).scalar()

        canchas_activas = self.db.query(Cancha).filter(Cancha.is_active == True).count()
        usuarios_totales = self.db.query(User).count()

        return {
            "status": 200,
            "stats": {
                "reservas_hoy": reservas_hoy,
                "reservas_semana": reservas_semana,
                "reservas_mes": reservas_mes,
                "reservas_totales": reservas_totales,
                "ingresos_hoy": float(ingresos_hoy or 0),
                "ingresos_semana": float(ingresos_semana or 0),
                "ingresos_mes": float(ingresos_mes or 0),
                "ingresos_totales": float(ingresos_totales or 0),
                "canchas_activas": canchas_activas,
                "usuarios_totales": usuarios_totales
            }
        }

    def get_reservas_semana(self, fecha_inicio: date, fecha_fin: date) -> dict:
        dia_nombres = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

        reservas = self.db.query(
            extract('dow', Reserva.fecha).label('dia'),
            func.count(Reserva.id).label('total')
        ).filter(
            Reserva.fecha >= fecha_inicio,
            Reserva.fecha <= fecha_fin,
            Reserva.estado_pago != EstadoPago.LIBRE
        ).group_by(extract('dow', Reserva.fecha)).all()

        reporte_dict = {int(r.dia): r.total for r in reservas}

        reporte = []
        for i, nombre in enumerate(dia_nombres):
            dia_sql = i + 1
            if dia_sql == 7:
                dia_sql = 0
            reporte.append({
                "label": nombre,
                "total": reporte_dict.get(dia_sql, 0)
            })

        total_reservas = sum(r["total"] for r in reporte)

        return {
            "status": 200,
            "periodo": {
                "fecha_inicio": fecha_inicio.isoformat(),
                "fecha_fin": fecha_fin.isoformat()
            },
            "reporte": reporte,
            "total_reservas": total_reservas
        }

    def get_ingresos(self, fecha_desde: date, fecha_hasta: date) -> dict:
        base_query = self.db.query(Reserva).filter(
            Reserva.fecha >= fecha_desde,
            Reserva.fecha <= fecha_hasta,
            Reserva.estado_pago != EstadoPago.LIBRE
        )

        total = base_query.with_entities(
            func.coalesce(func.sum(Reserva.precio_total), 0)
        ).scalar()

        pagado = base_query.filter(
            Reserva.estado_pago == EstadoPago.PAGADO
        ).with_entities(
            func.coalesce(func.sum(Reserva.precio_total), 0)
        ).scalar()

        abonado = base_query.filter(
            Reserva.estado_pago == EstadoPago.ABONADO
        ).with_entities(
            func.coalesce(func.sum(Reserva.precio_total), 0)
        ).scalar()

        sin_pagar = base_query.filter(
            Reserva.estado_pago == EstadoPago.SIN_PAGAR
        ).with_entities(
            func.coalesce(func.sum(Reserva.precio_total), 0)
        ).scalar()

        reservas_procesadas = base_query.filter(
            Reserva.estado_pago.in_([EstadoPago.PAGADO, EstadoPago.ABONADO])
        ).count()

        reservas_pendientes = base_query.filter(
            Reserva.estado_pago == EstadoPago.SIN_PAGAR
        ).count()

        return {
            "status": 200,
            "periodo": {
                "fecha_desde": fecha_desde.isoformat(),
                "fecha_hasta": fecha_hasta.isoformat()
            },
            "ingresos": {
                "total": float(total or 0),
                "pagado": float(pagado or 0),
                "abonado": float(abonado or 0),
                "sin_pagar": float(sin_pagar or 0)
            },
            "reservas_procesadas": reservas_procesadas,
            "reservas_pendientes": reservas_pendientes
        }

    def _parse_periodo(self, fecha_desde: date, fecha_hasta: date) -> tuple[date, date]:
        """Validate date range. Raises ValueError if invalid."""
        if fecha_desde > fecha_hasta:
            raise ValueError("fecha_desde must be <= fecha_hasta")
        return (fecha_desde, fecha_hasta)

    def get_ocupacion(self, fecha_desde: date, fecha_hasta: date, cancha_id: int | None = None) -> dict:
        """Return occupancy % per court for the period."""
        self._parse_periodo(fecha_desde, fecha_hasta)

        dias = (fecha_hasta - fecha_desde).days + 1
        horas_disponibles_por_dia = 14

        courts_query = self.db.query(Cancha).filter(Cancha.is_active == True)
        if cancha_id is not None:
            courts_query = courts_query.filter(Cancha.id == cancha_id)
        courts = courts_query.all()

        reservas_query = self.db.query(Reserva).filter(
            Reserva.fecha >= fecha_desde,
            Reserva.fecha <= fecha_hasta,
            Reserva.estado_pago != EstadoPago.LIBRE,
        )
        if cancha_id is not None:
            reservas_query = reservas_query.filter(Reserva.cancha_id == cancha_id)

        hours_per_court: dict[int, float] = {}
        for reserva in reservas_query.all():
            inicio_dt = datetime.combine(reserva.fecha, reserva.hora_inicio)
            fin_dt = datetime.combine(reserva.fecha, reserva.hora_fin)
            horas = (fin_dt - inicio_dt).seconds / 3600
            hours_per_court[reserva.cancha_id] = hours_per_court.get(reserva.cancha_id, 0) + horas

        ocupacion = []
        for court in courts:
            horas_reservadas = hours_per_court.get(court.id, 0.0)
            horas_disponibles = dias * horas_disponibles_por_dia
            ocupacion_pct = round((horas_reservadas / horas_disponibles) * 100, 2) if horas_disponibles > 0 else 0.0
            ocupacion.append(
                {
                    "cancha_id": court.id,
                    "cancha_nombre": court.nombre,
                    "horas_reservadas": round(horas_reservadas, 2),
                    "horas_disponibles": horas_disponibles,
                    "ocupacion_pct": ocupacion_pct,
                }
            )

        return {
            "status": 200,
            "periodo": {"fecha_desde": fecha_desde.isoformat(), "fecha_hasta": fecha_hasta.isoformat()},
            "ocupacion": ocupacion,
        }

    def get_horarios_pico(self, fecha_desde: date, fecha_hasta: date, cancha_id: int | None = None) -> dict:
        """Return top 10 most reserved hour buckets."""
        self._parse_periodo(fecha_desde, fecha_hasta)

        hour_bucket = extract("hour", Reserva.hora_inicio)
        query = self.db.query(
            hour_bucket.label("hora"),
            func.count(Reserva.id).label("cantidad"),
        ).filter(
            Reserva.fecha >= fecha_desde,
            Reserva.fecha <= fecha_hasta,
            Reserva.estado_pago != EstadoPago.LIBRE,
        )
        if cancha_id is not None:
            query = query.filter(Reserva.cancha_id == cancha_id)

        rows = query.group_by(hour_bucket).order_by(func.count(Reserva.id).desc()).limit(10).all()

        horarios = [
            {
                "hora": f"{int(row.hora):02d}:00",
                "cantidad": int(row.cantidad),
            }
            for row in rows
            if row.hora is not None
        ]

        return {
            "status": 200,
            "periodo": {"fecha_desde": fecha_desde.isoformat(), "fecha_hasta": fecha_hasta.isoformat()},
            "horarios": horarios,
        }

    def get_clientes_frecuentes(
        self,
        fecha_desde: date,
        fecha_hasta: date,
        cancha_id: int | None = None,
    ) -> dict:
        """Return top 10 clients by reservation count and total spend."""
        self._parse_periodo(fecha_desde, fecha_hasta)

        query = self.db.query(
            User.nombre.label("cliente_nombre"),
            func.count(Reserva.id).label("total_reservas"),
            func.coalesce(func.sum(Reserva.precio_total), 0).label("total_gastado"),
        ).join(Reserva, Reserva.usuario_id == User.id).filter(
            Reserva.fecha >= fecha_desde,
            Reserva.fecha <= fecha_hasta,
            Reserva.estado_pago.in_([EstadoPago.PAGADO, EstadoPago.ABONADO]),
        )
        if cancha_id is not None:
            query = query.filter(Reserva.cancha_id == cancha_id)

        rows = query.group_by(User.id, User.nombre).order_by(func.count(Reserva.id).desc()).limit(10).all()
        clientes = [
            {
                "cliente_nombre": row.cliente_nombre or "Sin nombre",
                "total_reservas": int(row.total_reservas),
                "total_gastado": float(row.total_gastado or 0),
            }
            for row in rows
        ]

        return {
            "status": 200,
            "periodo": {"fecha_desde": fecha_desde.isoformat(), "fecha_hasta": fecha_hasta.isoformat()},
            "clientes": clientes,
        }

    def get_daily(self, fecha_desde: date, fecha_hasta: date, cancha_id: int | None = None) -> dict:
        """Return day-by-day breakdown with zeros for missing days."""
        self._parse_periodo(fecha_desde, fecha_hasta)

        query = self.db.query(
            Reserva.fecha,
            func.count(Reserva.id).label("reservas_count"),
            func.coalesce(func.sum(Reserva.precio_total), 0).label("ingreso_total"),
        ).filter(
            Reserva.fecha >= fecha_desde,
            Reserva.fecha <= fecha_hasta,
            Reserva.estado_pago != EstadoPago.LIBRE,
        )
        if cancha_id is not None:
            query = query.filter(Reserva.cancha_id == cancha_id)

        rows = query.group_by(Reserva.fecha).order_by(Reserva.fecha).all()
        data = {
            row.fecha.isoformat(): {
                "reservas_count": int(row.reservas_count),
                "ingreso_total": float(row.ingreso_total or 0),
            }
            for row in rows
        }

        daily = []
        current = fecha_desde
        while current <= fecha_hasta:
            key = current.isoformat()
            if key in data:
                daily.append({"fecha": key, **data[key]})
            else:
                daily.append({"fecha": key, "reservas_count": 0, "ingreso_total": 0.0})
            current += timedelta(days=1)

        return {
            "status": 200,
            "periodo": {"fecha_desde": fecha_desde.isoformat(), "fecha_hasta": fecha_hasta.isoformat()},
            "daily": daily,
        }
