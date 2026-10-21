"""Hash de contraseñas, JWT y dependencia de usuario actual."""

from __future__ import annotations

import os
import time
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from typing import Annotated

import jwt
from fastapi import Cookie, Depends, HTTPException, Request, status
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .db import get_db
from .models import User

COOKIE_NAME = "court_token"
ALGORITHM = "HS256"
TOKEN_HOURS = 24 * 7

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Rate limit en memoria (datathon): clave → timestamps
_intentos: dict[str, list[float]] = defaultdict(list)
_MAX_INTENTOS = 20
_VENTANA_S = 60.0


def _jwt_secret() -> str:
    secret = (os.getenv("JWT_SECRET") or "").strip()
    if secret:
        return secret
    if (os.getenv("ENV") or os.getenv("RENDER") or "").lower() in {"production", "prod", "true"}:
        raise RuntimeError("JWT_SECRET es obligatorio en producción.")
    return "inclusivecourt-dev-secret-cambiar"


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def crear_token(user_id: int, email: str) -> str:
    ahora = datetime.now(timezone.utc)
    payload = {
        "sub": str(user_id),
        "email": email,
        "iat": ahora,
        "exp": ahora + timedelta(hours=TOKEN_HOURS),
    }
    return jwt.encode(payload, _jwt_secret(), algorithm=ALGORITHM)


def leer_token(token: str) -> dict:
    try:
        return jwt.decode(token, _jwt_secret(), algorithms=[ALGORITHM])
    except jwt.PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión no válida o caducada. Entra otra vez.",
        ) from exc


def cookie_segura() -> bool:
    return (os.getenv("COOKIE_SECURE") or "").lower() in {"1", "true", "yes"}


def comprobar_rate_limit(request: Request, accion: str) -> None:
    ip = request.client.host if request.client else "unknown"
    clave = f"{accion}:{ip}"
    ahora = time.monotonic()
    ventana = [t for t in _intentos[clave] if ahora - t < _VENTANA_S]
    if len(ventana) >= _MAX_INTENTOS:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Demasiados intentos. Espera un minuto e inténtalo de nuevo.",
        )
    ventana.append(ahora)
    _intentos[clave] = ventana


def get_current_user(
    db: Annotated[Session, Depends(get_db)],
    court_token: Annotated[str | None, Cookie(alias=COOKIE_NAME)] = None,
) -> User:
    if not court_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Necesitas iniciar sesión.",
        )
    datos = leer_token(court_token)
    try:
        user_id = int(datos["sub"])
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión no válida. Entra otra vez.",
        ) from exc
    user = db.get(User, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="La cuenta ya no existe.",
        )
    return user


def get_optional_user(
    db: Annotated[Session, Depends(get_db)],
    court_token: Annotated[str | None, Cookie(alias=COOKIE_NAME)] = None,
) -> User | None:
    if not court_token:
        return None
    try:
        return get_current_user(db=db, court_token=court_token)
    except HTTPException:
        return None
