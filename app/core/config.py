from pydantic_settings import BaseSettings 
import os 

class Setting(BaseSettings):

    """
    configuracion general del proyecto
    """
    # Configuración de la aplicación
    PROJECT_NAME: str = "MVP  FastAPI PostgreSQL"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    DEBUG: bool = False

    # Configuración de PostgreSQL
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "your user"
    POSTGRES_PASSWORD: str = "password"
    POSTGRES_DB: str = "db"
    POSTGRES_PORT: int = 5432

    class Config:
        env_file = ".env_config"


    #url de coneccion
    @property
    def DATABASE_URL(self) -> str :
        #postgresql://postgres:password@localhost:5432/mvp_db
        return (f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
        f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}")
    
    #url sincrona para alembic 
    @property
    def DATABASE_URL_SYNC(self) -> str:
        return (f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
        f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}")

