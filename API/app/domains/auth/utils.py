from fastapi import Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_token
from app.domains.users.models import User
from app.domains.auth.models import Auth
from app.core.exceptions import UnauthorizedException


def get_current_user(
    token: str | None = None,
    db: Session = Depends(get_db)
) -> User:
    if not token:
        raise UnauthorizedException("Token requerido")

    payload = decode_token(token)
    if not payload:
        raise UnauthorizedException("Token inválido o expirado")

    user_id = int(payload.get("sub"))
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise UnauthorizedException("Usuario no encontrado")

    return user


def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_admin:
        raise UnauthorizedException("Acceso denegado. Se requiere rol de administrador")
    return current_user
