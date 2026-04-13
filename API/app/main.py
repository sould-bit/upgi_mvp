from pathlib import Path
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
import logging

from app.config import settings
from app.db.base import Base
from app.database import engine
from app.core.exceptions import AppException

from app.domains.auth.router import router as auth_router
from app.domains.users.router import router as users_router
from app.domains.canchas.router import router as canchas_router
from app.domains.reservas.router import router as reservas_router
from app.domains.reportes.router import router as reportes_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API REST para el sistema de gestión de reservas de canchas deportivas UPGI"
)

BASE_DIR = Path(__file__).resolve().parent.parent
app.mount("/statics", StaticFiles(directory=BASE_DIR / "statics"), name="statics")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    logger.error(f"AppException: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": exc.status_code, "error": exc.detail}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.exception("Error interno del servidor")
    return JSONResponse(
        status_code=500,
        content={"status": 500, "error": "Error interno del servidor"}
    )


app.include_router(auth_router, prefix="/api/v1")
app.include_router(users_router, prefix="/api/v1")
app.include_router(canchas_router, prefix="/api/v1")
app.include_router(reservas_router, prefix="/api/v1")
app.include_router(reportes_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "UPGI API", "version": settings.APP_VERSION}


@app.get("/health")
def health():
    return {"status": "healthy"}
