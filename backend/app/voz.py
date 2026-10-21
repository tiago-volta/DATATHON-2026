"""
Interpretación de peticiones de voz (MOCK).

TODO(Gemini): sustituir `interpretar_peticion` por llamada a Gemini / LLM
manteniendo el mismo esquema de respuesta { intent, respuestaHabla, accion }.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Literal

Intent = Literal[
    "activar_modo",
    "repetir",
    "explicar",
    "ayuda",
    "parar",
    "mas_despacio",
    "desconocido",
]

Accion = Literal[
    "activar_modo_voz",
    "repetir_ultimo",
    "explicar_contexto",
    "mostrar_ayuda",
    "parar_voz",
    "ralentizar",
    "ninguna",
]

FRASES_ACTIVACION = (
    "quiero activar el modo con voz",
    "activar modo con voz",
    "activar el modo con voz",
    "modo con voz",
    "activar acceso por voz",
    "acceso por voz",
    "modo audiodescrito",
    "activar modo audiodescrito",
    "necesito audio",
    "necesito la voz",
    "modo ciego",
    "activar modo ciego",
)

CONFIRMACION = (
    "Modo con voz activado. Puedes pedir que te lea, que te explique o que te "
    "repita. Si quieres, ve a la Sala Previa o a tu citación."
)

AYUDA = (
    "Puedes decir: activar modo con voz, repite, otra vez, más despacio, para, "
    "o ayuda. También puedes pulsar Escuchar pedido."
)


def _normalizar(texto: str) -> str:
    nfd = unicodedata.normalize("NFD", texto.lower())
    sin_tildes = "".join(c for c in nfd if unicodedata.category(c) != "Mn")
    limpio = re.sub(r"[¿?¡!.,;:«»\"'…]", " ", sin_tildes)
    return re.sub(r"\s+", " ", limpio).strip()


def interpretar_peticion(texto: str) -> dict:
    """Mock por keywords. Misma forma que el frontend `procesarPeticionVoz`."""
    crudo = (texto or "").strip()
    n = _normalizar(crudo)

    if not n:
        return {
            "intent": "desconocido",
            "respuestaHabla": (
                "No te he oído bien. Puedes decir «ayuda» o pulsar Escuchar pedido."
            ),
            "accion": "ninguna",
            "textoNormalizado": n,
            "fuente": "api",
        }

    for frase in FRASES_ACTIVACION:
        fn = _normalizar(frase)
        if fn in n or n in fn:
            return {
                "intent": "activar_modo",
                "respuestaHabla": CONFIRMACION,
                "accion": "activar_modo_voz",
                "textoNormalizado": n,
                "fuente": "api",
            }

    if re.search(
        r"\b(repite|repetir|otra\s+vez|de\s+nuevo|puedes\s+repetir|"
        r"perdon[a]?,?\s+puedes\s+repetir|vuelve\s+a\s+(decir|leer|explicar))\b",
        crudo,
        re.IGNORECASE,
    ) or re.search(r"\brepite\b|\botra vez\b", n):
        return {
            "intent": "repetir",
            "respuestaHabla": "Claro. Te lo repito.",
            "accion": "repetir_ultimo",
            "textoNormalizado": n,
            "fuente": "api",
        }

    if re.search(r"\b(para|parar|detente|calla|silencio|basta|stop)\b", n):
        return {
            "intent": "parar",
            "respuestaHabla": "De acuerdo. Paro la voz.",
            "accion": "parar_voz",
            "textoNormalizado": n,
            "fuente": "api",
        }

    if re.search(r"\b(mas\s+despacio|mas\s+lento|despacio|lento)\b", n):
        return {
            "intent": "mas_despacio",
            "respuestaHabla": "Vale. Lo digo un poco más despacio.",
            "accion": "ralentizar",
            "textoNormalizado": n,
            "fuente": "api",
        }

    if re.search(r"\b(ayuda|ayudame|que\s+puedo\s+decir|comandos|opciones)\b", n):
        return {
            "intent": "ayuda",
            "respuestaHabla": AYUDA,
            "accion": "mostrar_ayuda",
            "textoNormalizado": n,
            "fuente": "api",
        }

    if re.search(
        r"\b(explica|explicame|que\s+es\s+esto|donde\s+estoy|que\s+hago|como\s+funciona)\b",
        n,
    ):
        return {
            "intent": "explicar",
            "respuestaHabla": (
                "Estás en PUENTE. Aquí entiendes el juzgado con frases cortas y voz. "
                "En Sala Previa puedes probar ruido, luz y gente a tu ritmo. "
                "Di «repite» si quieres oír otra vez el último bloque."
            ),
            "accion": "explicar_contexto",
            "textoNormalizado": n,
            "fuente": "api",
        }

    return {
        "intent": "desconocido",
        "respuestaHabla": (
            "No estoy segura de lo que pides. Di «ayuda» para oír qué puedes decir, "
            "o «repite» para volver a escuchar."
        ),
        "accion": "ninguna",
        "textoNormalizado": n,
        "fuente": "api",
    }
