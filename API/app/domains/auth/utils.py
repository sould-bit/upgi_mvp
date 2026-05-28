from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session
from app.database import get_db
from app.core.security import decode_token
from app.domains.users.models import User
from app.domains.auth.models import Auth
from app.core.exceptions import UnauthorizedException, ForbiddenException

security = HTTPBearer(auto_error=False)


def get_current_user(
    token: str | None = None,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    # Primero verificar si hay token explícito
    if not token:
        # Solo si NO hay token, intentar obtener de credentials (si está resuelto)
        if credentials and hasattr(credentials, 'credentials'):
            token = credentials.credentials
    
    # Ahora sí verificar si tenemos token
    if not token:
        raise UnauthorizedException("Token requerido")

    payload = decode_token(token)
    if not payload:
        raise UnauthorizedException("Token inválido o expirado")

    sub = payload.get("sub")
    if not isinstance(sub, (str, int)):
        raise UnauthorizedException("Token inválido o expirado")

    try:
        user_id = int(sub)
    except (TypeError, ValueError):
        raise UnauthorizedException("Token inválido o expirado")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise UnauthorizedException("Usuario no encontrado")

    return user


def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    if not current_user.is_admin:
        raise ForbiddenException("Acceso denegado. Se requiere rol de administrador")
    return current_user
