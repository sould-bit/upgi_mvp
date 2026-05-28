from datetime import datetime, date, time
from sqlalchemy import Column, Integer, String, DateTime, Date, Time, ForeignKey, DECIMAL, Text, Enum as SQLEnum, Boolean
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
    serie_id = Column(Integer, ForeignKey("series_reserva.id"), nullable=True)
    fecha = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    jugadores = Column(Integer, nullable=False)
    estado_pago = Column(SQLEnum(EstadoPago), default=EstadoPago.SIN_PAGAR)
    precio_total = Column(DECIMAL(10, 2), nullable=False)
    precio_base = Column(DECIMAL(10, 2), nullable=True)
    descuento_monto = Column(DECIMAL(10, 2), nullable=True, default=0)
    observaciones = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    usuario = relationship("User", backref="reservas")
    cancha = relationship("Cancha", backref="reservas")
    comunicaciones = relationship("ComunicacionReserva", back_populates="reserva", order_by="ComunicacionReserva.created_at.desc()")


class ComunicacionReserva(Base):
    __tablename__ = "comunicaciones_reserva"

    id = Column(Integer, primary_key=True, index=True)
    reserva_id = Column(Integer, ForeignKey("reservas.id"), nullable=False)
    autor_usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    autor_nombre = Column(String(200), nullable=False)
    contenido = Column(Text, nullable=False)
    tipo = Column(String(20), nullable=False, default="NOTE")
    created_at = Column(DateTime, default=datetime.utcnow)

    reserva = relationship("Reserva", back_populates="comunicaciones")
    autor = relationship("User")


class ReglaPrecio(Base):
    __tablename__ = "reglas_precio"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    tipo = Column(String(30), nullable=False)
    valor = Column(DECIMAL(10, 2), nullable=False)
    hora_inicio = Column(Time, nullable=True)
    hora_fin = Column(Time, nullable=True)
    es_socio = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ListaEspera(Base):
    __tablename__ = "lista_espera"

    id = Column(Integer, primary_key=True, index=True)
    cancha_id = Column(Integer, ForeignKey("canchas.id"), nullable=False)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    cliente_nombre = Column(String(200), nullable=False)
    cliente_email = Column(String(200), nullable=True)
    cliente_telefono = Column(String(50), nullable=True)
    fecha = Column(Date, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    posicion = Column(Integer, nullable=False, default=1)
    estado = Column(String(20), nullable=False, default="ESPERANDO")
    created_at = Column(DateTime, default=datetime.utcnow)
    promoted_at = Column(DateTime, nullable=True)

    cancha = relationship("Cancha")
    usuario = relationship("User")


class SerieReserva(Base):
    __tablename__ = "series_reserva"

    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cancha_id = Column(Integer, ForeignKey("canchas.id"), nullable=False)
    fecha_inicio = Column(Date, nullable=False)
    fecha_fin = Column(Date, nullable=True)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)
    jugadores = Column(Integer, nullable=False)
    frecuencia = Column(String(20), nullable=False)
    intervalo = Column(Integer, nullable=False, default=1)
    dias_semana = Column(String(50), nullable=True)
    observaciones = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("User")
    cancha = relationship("Cancha")
    reservas = relationship("Reserva", backref="serie")
