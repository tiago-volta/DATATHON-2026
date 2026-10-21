"""GET/PUT del estado completo del recorrido del usuario."""

from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Annotated, Any, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field, field_validator, model_validator
from sqlalchemy.orm import Session

from ..auth import get_current_user
from ..db import get_db
from ..models import User, UserState

router = APIRouter(prefix="/api/me", tags=["estado"])

CAMPOS = (
    "perfil",
    "practica",
    "sala_progreso",
    "lo_que_te_ayuda",
    "pasaporte",
    "confianza",
    "insignias",
    "preferencias",
)

MAX_JSON_BYTES = 50_000
CLAVES_PROHIBIDAS = frozenset(
    {
        "diagnostico",
        "diagnóstico",
        "condicion",
        "condición",
        "disorder",
        "disability",
        "tea",
        "tdah",
        "autismo",
    }
)


class EstadoUsuario(BaseModel):
    perfil: Optional[Any] = None
    practica: Optional[Any] = None
    sala_progreso: Optional[Any] = None
    lo_que_te_ayuda: Optional[Any] = None
    pasaporte: Optional[Any] = None
    confianza: Optional[Any] = None
    insignias: Optional[Any] = None
    preferencias: Optional[Any] = None


def _sin_claves_prohibidas(valor: Any) -> Any:
    if isinstance(valor, dict):
        return {
            k: _sin_claves_prohibidas(v)
            for k, v in valor.items()
            if str(k).strip().lower() not in CLAVES_PROHIBIDAS
        }
    if isinstance(valor, list):
        return [_sin_claves_prohibidas(v) for v in valor]
    return valor


def _validar_bloque(valor: Any) -> Any:
    if valor is None:
        return None
    limpio = _sin_claves_prohibidas(valor)
    encoded = json.dumps(limpio, ensure_ascii=False)
    if len(encoded.encode("utf-8")) > MAX_JSON_BYTES:
        raise ValueError(f"Un bloque supera el máximo de {MAX_JSON_BYTES} bytes.")
    return limpio


class EstadoPut(BaseModel):
    perfil: Optional[Any] = Field(default=None)
    practica: Optional[Any] = Field(default=None)
    sala_progreso: Optional[Any] = Field(default=None)
    lo_que_te_ayuda: Optional[Any] = Field(default=None)
    pasaporte: Optional[Any] = Field(default=None)
    confianza: Optional[Any] = Field(default=None)
    insignias: Optional[Any] = Field(default=None)
    preferencias: Optional[Any] = Field(default=None)

    @field_validator(*CAMPOS, mode="before")
    @classmethod
    def sanitizar_bloque(cls, v: Any) -> Any:
        return _validar_bloque(v)

    @model_validator(mode="after")
    def al_menos_un_campo(self) -> "EstadoPut":
        if not self.model_dump(exclude_unset=True):
            raise ValueError("Envía al menos un bloque de estado.")
        return self


def _decode(raw: str | None) -> Any:
    if raw is None or raw == "":
        return None
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return None


def _encode(valor: Any) -> str | None:
    if valor is None:
        return None
    return json.dumps(valor, ensure_ascii=False)


def _asegurar_state(db: Session, user: User) -> UserState:
    if user.state is None:
        state = UserState(user_id=user.id)
        db.add(state)
        db.flush()
        user.state = state
    return user.state


def _estado_desde_state(state: UserState) -> EstadoUsuario:
    return EstadoUsuario(
        perfil=_decode(state.perfil),
        practica=_decode(state.practica),
        sala_progreso=_decode(state.sala_progreso),
        lo_que_te_ayuda=_decode(state.lo_que_te_ayuda),
        pasaporte=_decode(state.pasaporte),
        confianza=_decode(state.confianza),
        insignias=_decode(state.insignias),
        preferencias=_decode(state.preferencias),
    )


@router.get("/estado", response_model=EstadoUsuario)
def obtener_estado(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    state = _asegurar_state(db, user)
    db.commit()
    return _estado_desde_state(state)


@router.put("/estado", response_model=EstadoUsuario)
def guardar_estado(
    body: EstadoPut,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[Session, Depends(get_db)],
):
    state = _asegurar_state(db, user)
    datos = body.model_dump(exclude_unset=True)
    for campo, valor in datos.items():
        if campo not in CAMPOS:
            continue
        # null no borra: evita PUT parcial que anule bloques válidos
        if valor is None:
            continue
        setattr(state, campo, _encode(valor))
    state.actualizado = datetime.now(timezone.utc)
    db.add(state)
    db.commit()
    db.refresh(state)
    return _estado_desde_state(state)
