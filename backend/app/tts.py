"""
Síntesis de voz natural gratuita con Microsoft Edge TTS (edge-tts).
Voz calmada es-ES para audioguía accesible (ceguera / TDAH / TEA).
"""

from __future__ import annotations

import asyncio
import hashlib
import re
import tempfile
from pathlib import Path
from typing import Optional

import edge_tts

# Voz neural calmada en español de España (diseño universal: misma para todos).
VOZ_DEFAULT = "es-ES-ElviraNeural"
MAX_CARACTERES = 800
CACHE_MAX_ENTRIES = 64

_CONTROL_CHARS = re.compile(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]")
_ESPACIOS = re.compile(r"\s+")

_cache: dict[str, bytes] = {}
_cache_orden: list[str] = []
_cache_lock = asyncio.Lock()
_tmp_dir = Path(tempfile.gettempdir()) / "court-tts-cache"
_tmp_dir.mkdir(parents=True, exist_ok=True)


def sanitizar_texto(texto: str) -> str:
    """Limpia y limita el texto para síntesis segura."""
    limpio = _CONTROL_CHARS.sub("", texto or "")
    limpio = _ESPACIOS.sub(" ", limpio).strip()
    if len(limpio) > MAX_CARACTERES:
        limpio = limpio[:MAX_CARACTERES].rsplit(" ", 1)[0] or limpio[:MAX_CARACTERES]
    return limpio


def _clave_cache(texto: str, voz: str) -> str:
    return hashlib.sha256(f"{voz}\n{texto}".encode("utf-8")).hexdigest()


def _ruta_tmp(clave: str) -> Path:
    return _tmp_dir / f"{clave}.mp3"


async def _cargar_desde_disco(clave: str) -> Optional[bytes]:
    ruta = _ruta_tmp(clave)
    if not ruta.is_file():
        return None
    try:
        return await asyncio.to_thread(ruta.read_bytes)
    except OSError:
        return None


async def _guardar_disco(clave: str, audio: bytes) -> None:
    ruta = _ruta_tmp(clave)
    try:
        await asyncio.to_thread(ruta.write_bytes, audio)
    except OSError:
        pass


async def _recordar_cache(clave: str, audio: bytes) -> None:
    async with _cache_lock:
        if clave in _cache:
            return
        _cache[clave] = audio
        _cache_orden.append(clave)
        while len(_cache_orden) > CACHE_MAX_ENTRIES:
            vieja = _cache_orden.pop(0)
            _cache.pop(vieja, None)


async def sintetizar_mp3(texto: str, voz: str = VOZ_DEFAULT) -> bytes:
    """
    Devuelve audio MPEG (mp3) para el texto dado.
    Usa caché en memoria y disco temporal por hash.
    """
    limpio = sanitizar_texto(texto)
    if not limpio:
        raise ValueError("El texto está vacío.")

    clave = _clave_cache(limpio, voz)

    async with _cache_lock:
        en_memoria = _cache.get(clave)
    if en_memoria is not None:
        return en_memoria

    en_disco = await _cargar_desde_disco(clave)
    if en_disco is not None:
        await _recordar_cache(clave, en_disco)
        return en_disco

    communicate = edge_tts.Communicate(limpio, voz)
    chunks: list[bytes] = []
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            chunks.append(chunk["data"])
    if not chunks:
        raise RuntimeError("No se generó audio TTS.")

    audio = b"".join(chunks)
    await _guardar_disco(clave, audio)
    await _recordar_cache(clave, audio)
    return audio
