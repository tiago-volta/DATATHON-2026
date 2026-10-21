"""Router de registro, login, logout y me."""

from __future__ import annotations

import json
import time
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy import select
from sqlalchemy.orm import Session

from ..auth import (
    COOKIE_NAME,
    comprobar_rate_limit,
    cookie_segura,
    crear_token,
    get_current_user,
    hash_password,
    verify_password,
)
from ..db import get_db
from ..models import User, UserState

router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegistroInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    nombre: Optional[str] = Field(default=None, max_length=60)

    @field_validator("email")
    @classmethod
    def email_minusculas(cls, v: EmailStr) -> str:
        return str(v).strip().lower()

    @field_validator("password")
    @classmethod
    def password_fuerte(cls, v: str) -> str:
        if len(v.strip()) < 8:
            raise ValueError("La contraseña debe tener al menos 8 caracteres.")
        return v

    @field_validator("nombre")
    @classmethod
    def nombre_limpio(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return None
        limpio = v.strip()
        return limpio[:60] if limpio else None


class LoginInput(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def email_minusculas(cls, v: EmailStr) -> str:
        return str(v).strip().lower()


def _set_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,
        secure=cookie_segura(),
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
        path="/",
    )


def _perfil_inicial(nombre: Optional[str]) -> Optional[str]:
    if not nombre:
        return None
    ahora = int(time.time() * 1000)
    return json.dumps(
        {
            "nombre": nombre,
            "rol": "testigo",
            "tolerancia": 1,
            "estimulosSensibles": [],
            "creado": ahora,
            "actualizado": ahora,
        },
        ensure_ascii=False,
    )


def _user_payload(user: User) -> dict:
    perfil = None
    if user.state and user.state.perfil:
        try:
            perfil = json.loads(user.state.perfil)
        except json.JSONDecodeError:
            perfil = None
    return {"email": user.email, "perfil": perfil}


@router.post("/registro")
def registro(
    body: RegistroInput,
    request: Request,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
):
    comprobar_rate_limit(request, "registro")
    existe = db.scalar(select(User).where(User.email == body.email))
    if existe:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya hay una cuenta con ese email.",
        )
    user = User(email=body.email, password_hash=hash_password(body.password))
    db.add(user)
    db.flush()
    state = UserState(user_id=user.id, perfil=_perfil_inicial(body.nombre))
    db.add(state)
    db.commit()
    db.refresh(user)
    token = crear_token(user.id, user.email)
    _set_cookie(response, token)
    return _user_payload(user)


@router.post("/login")
def login(
    body: LoginInput,
    request: Request,
    response: Response,
    db: Annotated[Session, Depends(get_db)],
):
    comprobar_rate_limit(request, "login")
    user = db.scalar(select(User).where(User.email == body.email))
    if user is None or not verify_password(body.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos.",
        )
    token = crear_token(user.id, user.email)
    _set_cookie(response, token)
    return _user_payload(user)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        secure=cookie_segura(),
        httponly=True,
        samesite="lax",
    )
    return {"ok": True}


@router.get("/me")
def me(user: Annotated[User, Depends(get_current_user)]):
    return _user_payload(user)


@router.delete("/me")
def delete_me(
    user: Annotated[User, Depends(get_current_user)],
    response: Response,
    db: Annotated[Session, Depends(get_db)],
):
    """Borrado completo de la cuenta y de todos los datos asociados (Art. 17 RGPD Derecho al Olvido)."""
    db.delete(user)
    db.commit()
    response.delete_cookie(
        key=COOKIE_NAME,
        path="/",
        secure=cookie_segura(),
        httponly=True,
        samesite="lax",
    )
    return {"ok": True, "mensaje": "Cuenta y datos eliminados correctamente conforme al Art. 17 RGPD."}
