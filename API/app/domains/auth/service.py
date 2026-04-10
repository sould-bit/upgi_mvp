from sqlalchemy.orm import Session
from app.domains.auth.models import Auth
from app.domains.users.models import User
from app.core.security import generate_salt, hash_password, verify_password, create_access_token
from app.core.exceptions import NotFoundException, ConflictException, UnauthorizedException
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(self, email: str, password: str, nombre: str, telefono: str | None = None) -> dict:
        existing = self.db.query(Auth).filter(Auth.email == email.lower()).first()
        if existing:
            logger.warning(f"Intento de registro con email existente: {email}")
            raise ConflictException("El email ya está registrado")

        salt = generate_salt()
        password_hash = hash_password(password, salt)

        auth = Auth(
            email=email.lower(),
            password_hash=password_hash,
            salt=salt
        )
        self.db.add(auth)
        self.db.flush()

        user = User(
            auth_id=auth.id,
            nombre=nombre,
            telefono=telefono
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        logger.info(f"Usuario registrado exitosamente: {email}")
        return {"status": 201, "message": "Registro exitoso", "user_id": user.id}

    def login(self, email: str, password: str) -> dict:
        auth = self.db.query(Auth).filter(Auth.email == email.lower()).first()
        if not auth:
            logger.warning(f"Intento de login con email no registrado: {email}")
            raise NotFoundException("El usuario no existe")

        if not verify_password(password, auth.password_hash):
            logger.warning(f"Intento de login con contraseña incorrecta: {email}")
            raise UnauthorizedException("Credenciales incorrectas")

        if not auth.is_active:
            raise UnauthorizedException("La cuenta está desactivada")

        user = self.db.query(User).filter(User.auth_id == auth.id).first()
        token = create_access_token({
            "sub": str(user.id),
            "email": auth.email,
            "is_admin": user.is_admin
        })

        logger.info(f"Login exitoso: {email}")
        return {
            "status": 200,
            "message": "Autenticación exitosa",
            "user_id": user.id,
            "access_token": token,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {
                "id": user.id,
                "email": auth.email,
                "nombre": user.nombre,
                "is_admin": user.is_admin
            }
        }

    def get_current_user(self, user_id: int) -> dict:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException("Usuario no encontrado")

        auth = self.db.query(Auth).filter(Auth.id == user.auth_id).first()

        return {
            "status": 200,
            "user": {
                "id": user.id,
                "email": auth.email,
                "nombre": user.nombre,
                "telefono": user.telefono,
                "is_admin": user.is_admin,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        }
