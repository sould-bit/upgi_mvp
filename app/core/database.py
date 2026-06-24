
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


async def drop_db():
     """
    Eliminar todas las tablas de la base de datos
    
    PELIGRO: Solo usar en testing o reset completo de desarrollo
    """
     async with async_engine.begin() as conn:
         await conn.run_sync(SQLModel.metadata.drop_all)
         logger.warning("🗑️ All database tables dropped")

# ============================================================================
# GESTIÓN DE CONEXIONES
# ============================================================================

async def close_db():
    """
    Cerrar todas las conexiones de la base de datos
    Llamar al hacer shutdown de la aplicación
    """
    await async_engine.dispose()
    sync_engine.dispose()
    logger.info("🔌 Database connections closed")



class DatabaseTransaccion:
    """
    Context manager para manejar transacciones manuales complejas
    
    Ejemplo del PDF: "Envolver creación de pedido y descuento de stock en transacción"
    
    Uso:
    async with DatabaseTransaction() as db:
        # Crear reserva
        reserva = await reserva_repo.create(db, reserva_data)
        # Descontar inventario
        await inventario_service.descontar_stock(db, producto_id, cantidad)
        # Si todo sale bien → commit automático
        # Si hay error → rollback automático
    """
    def __init__(self):
        self.session : AsyncSession = None

    async def __aenter__(self) -> AsyncSession:
        """Iniciar transaccion"""
        self.session = AsyncSession(async_engine)
        return self.session
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        try:
            if exc_type is not None:
                await self.session.rollback()
                logger.error(f"🔄 Transaction rolled back: {exc_val}")
            else:
                await self.session.commit()
                logger.debug("✅ Transaction committed")
        except Exception as e :
            #error al hacer commit /rollback
            logger.error(f"❌ Transaction error: {e}")
            await self.session.rollback()
        finally:
            # Siempre cerrar la sesión
            await self.session.close()
        
        # Retornar False para re-lanzar excepciones si las hay
        return False
    
# ============================================================================
# HEALTH CHECK - Monitoreo de base de datos
# ============================================================================

async def check_db_health() -> bool:
    """
    Verificar si PostgreSQL está disponible y respondiendo
    
    Útil para:
    - Health checks de Kubernetes/Docker
    - Monitoreo con Prometheus (del PDF)
    - Diagnóstico de problemas de conexión
    """
    try:
        async with AsyncSession(async_engine) as session:
            # Query simple para verificar conectividad
            from sqlmodel import text
            result = await session.exec(text("SELECT 1"))
            return result.first() == 1
    except Exception as e:
        logger.error(f"💔 Database health check failed: {e}")
        return False
    

# ============================================================================
# CONFIGURACIÓN PARA TESTING
# ============================================================================

class TestDatabase:
    """
    Configuración especial para testing con SQLite en memoria
    
    Siguiendo el patrón del PDF: "pytest con fixtures de base de datos en memoria"
    """
    
    def __init__(self):
        # SQLite en memoria para tests rápidos
        # No necesita PostgreSQL instalado para correr tests
        self.test_engine = create_async_engine(
            "sqlite+aiosqlite:///:memory:",
            echo=False,  # Sin logs en testing
            future=True
        )
    
    async def setup(self):
        """Preparar base de datos de prueba"""
        async with self.test_engine.begin() as conn:
            # Crear todas las tablas en memoria
            await conn.run_sync(SQLModel.metadata.create_all)
        logger.info("🧪 Test database setup completed")
    
    async def teardown(self):
        """Limpiar después de las pruebas"""
        await self.test_engine.dispose()
        logger.info("🧹 Test database cleaned up")
    
    async def get_session(self) -> AsyncGenerator[AsyncSession, None]:
        """
        Dependency override para testing
        
        En tests:
        app.dependency_overrides[get_db] = test_db.get_session
        """
        async with AsyncSession(self.test_engine) as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise

# ============================================================================
# UTILIDADES ADICIONALES
# ============================================================================

def get_sync_session() -> Session:
    """
    Sesión síncrona para casos especiales
    (Principalmente para Alembic y scripts de migración)
    """
    return Session(sync_engine)

async def execute_raw_query(query: str, params: dict = None):
    """
    Ejecutar query SQL crudo cuando SQLModel no es suficiente
    
    Ejemplo: reportes complejos, funciones de PostgreSQL específicas
    """
    async with AsyncSession(async_engine) as session:
        from sqlmodel import text
        result = await session.exec(text(query), params or {})
        return result.all()