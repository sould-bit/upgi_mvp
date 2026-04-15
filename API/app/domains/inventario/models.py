from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, DECIMAL, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.db.base import Base


class Equipo(Base):
    __tablename__ = "equipos"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    categoria = Column(String(50), nullable=False)
    precio_alquiler = Column(DECIMAL(10, 2), nullable=False)
    stock_total = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    alquileres = relationship("AlquilerEquipo", back_populates="equipo")


class AlquilerEquipo(Base):
    __tablename__ = "alquileres_equipo"

    id = Column(Integer, primary_key=True, index=True)
    reserva_id = Column(Integer, ForeignKey("reservas.id"), nullable=True)
    equipo_id = Column(Integer, ForeignKey("equipos.id"), nullable=False)
    cantidad = Column(Integer, nullable=False)
    precio_alquiler = Column(DECIMAL(10, 2), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    equipo = relationship("Equipo", back_populates="alquileres")
