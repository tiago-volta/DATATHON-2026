"""Modelos de usuario y estado del recorrido."""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .db import Base


def _ahora() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    creado: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_ahora)

    state: Mapped["UserState | None"] = relationship(
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
    )


class UserState(Base):
    __tablename__ = "user_state"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    perfil: Mapped[str | None] = mapped_column(Text, nullable=True)
    practica: Mapped[str | None] = mapped_column(Text, nullable=True)
    sala_progreso: Mapped[str | None] = mapped_column(Text, nullable=True)
    lo_que_te_ayuda: Mapped[str | None] = mapped_column(Text, nullable=True)
    pasaporte: Mapped[str | None] = mapped_column(Text, nullable=True)
    confianza: Mapped[str | None] = mapped_column(Text, nullable=True)
    insignias: Mapped[str | None] = mapped_column(Text, nullable=True)
    preferencias: Mapped[str | None] = mapped_column(Text, nullable=True)
    citaciones: Mapped[str | None] = mapped_column(Text, nullable=True)
    actualizado: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_ahora, onupdate=_ahora
    )

    user: Mapped[User] = relationship(back_populates="state")
