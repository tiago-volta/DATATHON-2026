"""
Abstracción simple para llamadas a LLM.
En producción, conecta con OpenAI o Anthropic.
Para la demo, se usa el mock por defecto.
"""

import os
import httpx
from typing import Optional

SYSTEM_PROMPT = """Eres un asistente especializado en hacer accesible la documentación judicial.
Tu tarea es transformar citaciones judiciales en versiones comprensibles.

Devuelve SIEMPRE un JSON con esta estructura:
{
  "datos_clave": {
    "rol": "testigo|investigado|demandante|demandado",
    "tipo_procedimiento": "string",
    "organo": "string",
    "fecha": "string",
    "hora": "string",
    "lugar": "string"
  },
  "lectura_clara": "Versión en lenguaje claro, frases cortas, estructura con emojis",
  "lectura_facil": "Versión en lectura fácil UNE 153101: una idea por línea, palabras sencillas",
  "plazos": [{"descripcion": "string", "fecha": "YYYY-MM-DD", "dias_restantes": number}],
  "pictogram_keywords": ["palabras clave para buscar pictogramas en ARASAAC"]
}"""


async def procesar_citacion(texto: str, perfil: Optional[str] = None) -> dict:
    provider = os.getenv("LLM_PROVIDER", "mock")
    
    if provider == "openai":
        return await _llamar_openai(texto, perfil)
    elif provider == "anthropic":
        return await _llamar_anthropic(texto, perfil)
    else:
        from .mock_data import MOCK_RESPONSE_LUIS
        return MOCK_RESPONSE_LUIS


async def _llamar_openai(texto: str, perfil: Optional[str]) -> dict:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        from .mock_data import MOCK_RESPONSE_LUIS
        return MOCK_RESPONSE_LUIS
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}"},
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Perfil: {perfil or 'general'}\n\nCitación:\n{texto}"}
                ],
                "response_format": {"type": "json_object"}
            },
            timeout=30.0
        )
        data = response.json()
        import json
        return json.loads(data["choices"][0]["message"]["content"])


async def _llamar_anthropic(texto: str, perfil: Optional[str]) -> dict:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        from .mock_data import MOCK_RESPONSE_LUIS
        return MOCK_RESPONSE_LUIS
    
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.anthropic.com/v1/messages",
            headers={
                "x-api-key": api_key,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json"
            },
            json={
                "model": "claude-3-haiku-20240307",
                "max_tokens": 2000,
                "system": SYSTEM_PROMPT,
                "messages": [
                    {"role": "user", "content": f"Perfil: {perfil or 'general'}\n\nCitación:\n{texto}"}
                ]
            },
            timeout=30.0
        )
        data = response.json()
        import json
        content = data["content"][0]["text"]
        start = content.find("{")
        end = content.rfind("}") + 1
        return json.loads(content[start:end])
