from pydantic_settings import BaseSettings , SettingsConfigDict
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
    # BACKEND_CORS_ORIGINS: list[str] = [
    #     "http://localhost:3000",  # React frontend
    #     "http://localhost:8080",  # Vue frontend
    #     "http://localhost:4200",  # Angular frontend
    # ]
    
    # Configuración de archivos y reportes
    UPLOAD_FOLDER: str = "uploads"
    REPORTS_FOLDER: str = "reports"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    
    # Configuración de logs
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"  # json o simple
    
    # Configuración de pruebas
    TESTING: bool = False
    TEST_DATABASE_URL: str | None = None 


    model_config = SettingsConfigDict(env_file=".env_config", case_sensitive=True)


#instancia global de configuraion 
settings = Setting()


class Dev_settings(Setting):
    LOG_LEVEL: str = "DEBUG"
    POSTGRES_DB: str = "TEST_DB"


class Produccion_Settings(Setting):
    LOG_LEVEL: str = "WARNING"
    DEBUG: bool = False


class SettingsForTest(Setting):
    DEBUG : bool = True
    POSTGRES_DB: str = "TEST_DB"

    # redefinimos , para darle robustes claridad y aislamiento  definiendo  una preocupacion para la url de la base de datos en la sub de testing
    @property
    def DATABASE_URL(self) -> str :
        #postgresql://postgres:password@localhost:5432/mvp_db
        return (f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
        f"@{self.POSTGRES_SERVER}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}")


def get_settings() -> Setting:
    """factory funcion para obtener una configuracion segun el entorno"""

    env = os.getenv("ENVIRONMENT", "dev_settings")

    match env:
        case "dev_settings":
            return Dev_settings()
        case "Produccion" :
            return Produccion_Settings()
        case "test_settings" :
            return SettingsForTest()
        