from datetime import date, timedelta
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

        reservas_hoy = self.db.query(Reserva).filter(Reserva.fecha == today).count()
        reservas_semana = self.db.query(Reserva).filter(Reserva.fecha >= week_start).count()
        reservas_mes = self.db.query(Reserva).filter(Reserva.fecha >= month_start).count()
        reservas_totales = self.db.query(Reserva).count()

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
            Reserva.fecha <= fecha_fin
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
            Reserva.fecha <= fecha_hasta
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
