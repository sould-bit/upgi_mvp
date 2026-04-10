from sqlalchemy.orm import Session
from app.domains.users.models import User
from app.domains.auth.models import Auth
from app.core.exceptions import NotFoundException


class UserService:
    def __init__(self, db: Session):
        self.db = db

    def get_by_id(self, user_id: int) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise NotFoundException("Usuario no encontrado")
        return user

    def get_detail(self, user_id: int) -> dict:
        user = self.get_by_id(user_id)
        auth = self.db.query(Auth).filter(Auth.id == user.auth_id).first()

        return {
            "id": user.id,
            "email": auth.email,
            "nombre": user.nombre,
            "telefono": user.telefono,
            "is_admin": user.is_admin,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "reservas_count": len(user.reservas)
        }

    def update(self, user_id: int, nombre: str | None = None, telefono: str | None = None) -> dict:
        user = self.get_by_id(user_id)

        if nombre is not None:
            user.nombre = nombre
        if telefono is not None:
            user.telefono = telefono

        self.db.commit()
        self.db.refresh(user)

        return self.get_detail(user_id)
