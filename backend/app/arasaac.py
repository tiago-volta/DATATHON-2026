"""
Cliente para la API de ARASAAC (pictogramas).
https://api.arasaac.org - Licencia CC BY-NC-SA, Sergio Palao / ARASAAC / Gobierno de Aragón
Incluye catálogo de respaldo instantáneo para garantizar que siempre haya pictogramas disponibles.
"""

import httpx
from typing import Dict, List

ARASAAC_API = "https://api.arasaac.org/api"
ARASAAC_STATIC = "https://static.arasaac.org/pictograms"

CATALOGO_RESPALDO: Dict[str, int] = {
    "juzgado": 8147,
    "juicio": 8147,
    "juez": 11523,
    "jurado": 26885,
    "abogado": 2636,
    "testigo": 12339,
    "hablar": 6517,
    "escuchar": 6572,
    "documento": 21802,
    "carta": 2324,
    "calendario": 32488,
    "ayuda": 12252,
    "persona": 6479,
    "tranquilo": 31310,
    "calma": 31310,
    "silencio": 11386,
    "derechos": 11247,
    "prueba": 21802,
    "sentencia": 21802,
    "inocente": 5397,
    "dinero": 2368,
    "preguntar": 9847,
}

_CACHE_PICTOGRAMAS: Dict[str, dict] = {}


def _pictograma_respaldo(keyword: str) -> dict | None:
    clave = keyword.strip().lower()
    picto_id = CATALOGO_RESPALDO.get(clave)
    if not picto_id:
        return None
    return {
        "keyword": keyword,
        "id": picto_id,
        "url": f"{ARASAAC_STATIC}/{picto_id}/{picto_id}_500.png",
    }


async def obtener_pictogramas(keywords: List[str]) -> List[dict]:
    pictogramas: List[dict] = []

    async with httpx.AsyncClient() as client:
        for keyword in keywords[:10]:
            clave = keyword.strip().lower()
            if clave in _CACHE_PICTOGRAMAS:
                pictogramas.append(_CACHE_PICTOGRAMAS[clave])
                continue

            encontrado = None
            try:
                response = await client.get(
                    f"{ARASAAC_API}/pictograms/es/search/{keyword}",
                    timeout=2.5,
                )
                if response.status_code == 200:
                    data = response.json()
                    if data and len(data) > 0:
                        picto = data[0]
                        encontrado = {
                            "keyword": keyword,
                            "id": picto["_id"],
                            "url": f"{ARASAAC_STATIC}/{picto['_id']}/{picto['_id']}_500.png",
                        }
            except Exception:
                encontrado = None

            if not encontrado:
                encontrado = _pictograma_respaldo(keyword)

            if encontrado:
                _CACHE_PICTOGRAMAS[clave] = encontrado
                pictogramas.append(encontrado)

    return pictogramas
