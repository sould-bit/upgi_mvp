from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


try:
    from app.domains.inventario.models import Equipo, AlquilerEquipo
except ImportError:
    Equipo = None
    AlquilerEquipo = None
