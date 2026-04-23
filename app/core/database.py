
"""
Configuración de PostgreSQL con SQLModel (async)
Siguiendo el patrón de la guía: sesión única por petición con SQLModel

"""
from sqlmodel import create_engine, SQLModel, Session
from sqlalchemy.ext.asyncio.session  import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine

from typing import AsyncGenerator
import logging

#import la instancia de la clase settings
from app.core.config import settings

logger = logging.getLogger(__name__)


# ============================================================================
# MOTORES DE BASE DE DATOS (ENGINES)
# ============================================================================

async_engine = create_async_engine(
    settings.DATABASE_URL,      #url de la base de datos
    echo=settings.DEBUG,        #i DEBUG=True, logea todas las queries SQL
    pool_pre_ping=True,         #pool_pre_ping=True para que se reconecte a la base de datos si se desconecta
    pool_recycle=3600,          #se recicla la conexion cada hora
    pool_size=20,               #tamaño del pool de conexiones
    max_overflow=30,            #maximo de conexiones que se pueden hacer
    future=True,                #Usa SQLAlchemy 2.0 style (requerido por SQLModel) para que se use el nuevo estilo de asyncio
    )


#motor sincrono para conecciones con alembic
sync_engine = create_engine(
    settings.DATABASE_URL_SYNC,
    echo=settings.DEBUG,        #i DEBUG=True, logea todas las queries SQL
    pool_pre_ping=True,
    pool_recycle=3600,
    pool_size=10,           #pool mas pequeño para  migraciones
    )


# ============================================================================
# DEPENDENCY INJECTION
# ============================================================================

async def get_db()->AsyncGenerator[AsyncSession,None]:
    pass