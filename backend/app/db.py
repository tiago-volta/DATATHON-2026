"""Conexión a base de datos (SQLite local o Postgres vía DATABASE_URL)."""

from __future__ import annotations

import os
from pathlib import Path

from sqlalchemy import create_engine, event
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DEFAULT_SQLITE = f"sqlite:///{(DATA_DIR / 'tribunalinclusivo.db').as_posix()}"


def _resolver_url() -> str:
    url = (os.getenv("DATABASE_URL") or "").strip()
    if not url:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        return DEFAULT_SQLITE
    # Render a veces entrega postgres://; SQLAlchemy 2 pide postgresql://
    if url.startswith("postgres://"):
        return "postgresql://" + url[len("postgres://") :]
    return url


DATABASE_URL = _resolver_url()

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
engine = create_engine(DATABASE_URL, connect_args=connect_args, future=True)

if DATABASE_URL.startswith("sqlite"):

    @event.listens_for(engine, "connect")
    def _sqlite_fk(dbapi_connection, _connection_record) -> None:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()


SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, future=True)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _anadir_columna_citaciones() -> None:
    """create_all no altera tablas ya creadas. Añade la columna si falta."""
    from sqlalchemy import inspect, text

    insp = inspect(engine)
    if not insp.has_table("user_state"):
        return
    nombres = {col["name"] for col in insp.get_columns("user_state")}
    if "citaciones" in nombres:
        return
    with engine.begin() as conn:
        conn.execute(text("ALTER TABLE user_state ADD COLUMN citaciones TEXT"))


def init_db() -> None:
    # Importa modelos para registrar metadata
    from . import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
    _anadir_columna_citaciones()
