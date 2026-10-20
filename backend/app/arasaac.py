"""
Cliente para la API de ARASAAC (pictogramas).
https://api.arasaac.org - Licencia CC BY-NC-SA, Sergio Palao / ARASAAC / Gobierno de Aragón
"""

import httpx
from typing import List

ARASAAC_API = "https://api.arasaac.org/api"
ARASAAC_STATIC = "https://static.arasaac.org/pictograms"


async def obtener_pictogramas(keywords: List[str]) -> List[dict]:
    pictogramas = []
    
    async with httpx.AsyncClient() as client:
        for keyword in keywords[:10]:
            try:
                response = await client.get(
                    f"{ARASAAC_API}/pictograms/es/search/{keyword}",
                    timeout=5.0
                )
                if response.status_code == 200:
                    data = response.json()
                    if data and len(data) > 0:
                        picto = data[0]
                        pictogramas.append({
                            "keyword": keyword,
                            "id": picto["_id"],
                            "url": f"{ARASAAC_STATIC}/{picto['_id']}/{picto['_id']}_500.png"
                        })
            except Exception:
                continue
    
    return pictogramas
