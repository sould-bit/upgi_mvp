from datetime import datetime, time
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Time, ForeignKey, DECIMAL
from sqlalchemy.orm import relationship
from app.db.base import Base


class Cancha(Base):
    __tablename__ = "canchas"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    tipo = Column(String(50), nullable=False)
    precio_hora = Column(DECIMAL(10, 2), nullable=False)
    capacidad = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    horarios = relationship("Horario", back_populates="cancha")


class Horario(Base):
    __tablename__ = "horarios"

    id = Column(Integer, primary_key=True, index=True)
    cancha_id = Column(Integer, ForeignKey("canchas.id"), nullable=False)
    dia_semana = Column(Integer, nullable=False)
    hora_inicio = Column(Time, nullable=False)
    hora_fin = Column(Time, nullable=False)

    cancha = relationship("Cancha", back_populates="horarios")
