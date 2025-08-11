
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
    """
    Dependency para inyectar sesión de base de datos en endpoints FastAPI
    
    Uso en endpoints:
    @app.get("/usuarios/")
    async def get_usuarios(db: AsyncSession = Depends(get_db)):
        # usar db aquí
    
    Patrón ARQ: "Sesión única por petición con Depends(get_db)"
    """
# crea una nueva peticion asincrona para esta peticion http 
    async with AsyncSession(async_engine) as session:
        try:
            #entrega la sesion al endpoint
            yield session
        except Exception as e:
        # si ahi error hacemos un rollback automatico
            logger.error(f"Database Session Error: {e}")
            await session.rollback()
            """
            considerar lanzar una excepcion raise personalidada especifica para el cliente 
            """
            raise # <- relanza la misma ecxepcion que captura  except  " por defecto fastapi captura la excepcion "
        finally :
            pass


#======
# INICIALIZACION Y GESTION DE TABLAS 
#======

async def init_db():
    """
    Crear todas las tablas en la base de datos
    
    IMPORTANTE: Solo usar en desarrollo o testing
    En producción usar migraciones de Alembic
    """
    async with async_engine.begin() as conn:
#immportar todos los modelos sql para reistrarlos
#esto asegura que sqlmodel tenga todas laas tablas registradas
        from app.models import (
            Cliente, Usuario, Reserva, Servicio, Pago,
            Factura, Producto, Inventario, MovimientoInventario,
            Comentario, Reporte
        )


#creammos todas las tabals registradas 
# conn.run_sync() permite ejecutar código síncrono en contexto async
        await conn.run_sync(SQLModel.metadata.create_all)
        logger.info("✅ Database tables created successfully")