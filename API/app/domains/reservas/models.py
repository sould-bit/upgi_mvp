from datetime import datetime, date, time
from sqlalchemy import Column, Integer, String, DateTime, Date, Time, ForeignKey, DECIMAL, Text, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum


class EstadoPago(str, enum.Enum):
    LIBRE = "Libre"
    ABONADO = "Abonado"
    SIN_PAGAR = "Sin pagar"
    PAGADO = "Pagado"


class Reserva(Base):
    __tablename__ = "reservas"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cancha_id = Column(Integer, ForeignKey("canchas.id"), nullable=False)
    fecha = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    jugadores = Column(Integer, nullable=False)
    estado_pago = Column(SQLEnum(EstadoPago), default=EstadoPago.SIN_PAGAR)
    precio_total = Column(DECIMAL(10, 2), nullable=False)
    observaciones = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    usuario = relationship("User", backref="reservas")
    cancha = relationship("Cancha", backref="reservas")
