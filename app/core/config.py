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

     # Configuración de autenticación JWT
    SECRET_KEY: str = "your-super-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Configuración de CORS
    BACKEND_CORS_ORIGINS: list[str] = [
        "http://localhost:3000",  # React frontend
        "http://localhost:8080",  # Vue frontend
        "http://localhost:4200",  # Angular frontend
    ]
    
    # Configuración de archivos y reportes
    UPLOAD_FOLDER: str = "uploads"
    REPORTS_FOLDER: str = "reports"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Configuración de logs
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"  # json o simple
    
    # Configuración de pruebas
    TESTING: bool = False
    TEST_DATABASE_URL: str | None 


    class Config:
        env_file = ".env_config"