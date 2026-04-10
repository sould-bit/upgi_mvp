from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    auth_id = Column(Integer, ForeignKey("auth.id"), nullable=False)
    nombre = Column(String(100), nullable=False)
    telefono = Column(String(20), nullable=True)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    auth = relationship("Auth", backref="user")
