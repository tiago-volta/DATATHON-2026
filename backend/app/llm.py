"""
Abstracción para procesamiento de documentos judiciales y reformulación de preguntas.
Combina un motor determinista de adaptación en español (UNE 153101 + ISO 24495-1)
con conexión opcional a Google Gemini (google-genai), OpenAI o Anthropic.
"""

import asyncio
import json
import os
import re
from typing import Dict, List, Optional
import httpx

from .mock_data import (
    MOCK_RESPONSE_LUIS,
    MOCK_RESPONSE_JUAN,
    MOCK_RESPONSE_SENTENCIA,
    PIPELINE_SUMA_IAS,
)

SYSTEM_PROMPT = """Eres un asistente especializado en accesibilidad cognitiva para la justicia española.
Tu tarea es transformar citaciones o sentencias judiciales en versiones comprensibles según UNE-ISO 24495-1 (lenguaje claro) y UNE 153101 (lectura fácil).

Devuelve SIEMPRE un JSON válido con esta estructura exacta:
{
  "datos_clave": {
    "tipo_documento": "citacion|sentencia",
    "rol": "testigo|investigado|demandante|demandado|persona absuelta",
    "tipo_procedimiento": "string",
    "organo": "string",
    "fecha": "string",
    "hora": "string",
    "lugar": "string",
    "que_llevar": ["string"],
    "derechos": ["string"],
    "puedo_pedir_ajustes": true,
    "base_legal_ajustes": "Artículo 7 bis LEC / Artículo 109 y 118 LECrim",
    "apoyo_numerico": [{"etiqueta": "string", "cifra": "string", "en_palabras": "string"}],
    "que_pasa_si_no_voy": {
      "resumen": "string",
      "pasos_si_no_puedes": ["string"],
      "mensaje_calma": "string"
    },
    "pasos_super_simples": ["string"]
  },
  "lectura_clara": "Versión en lenguaje claro, frases cortas en voz activa",
  "lectura_facil": "Versión en lectura fácil UNE 153101: una idea por línea, palabras cotidianas",
  "plazos": [{"descripcion": "string", "fecha": "YYYY-MM-DD", "dias_restantes": 15}],
  "pictogram_keywords": ["juzgado", "hablar", "escuchar", "documento", "calendario", "ayuda"]
}"""

SYSTEM_PROMPT_PREGUNTA = """Eres un facilitador judicial experto en accesibilidad cognitiva (pautas The Advocate's Gateway, Guía CGPJ 2025, Guía Autismo España 2025 y norma UNE 153101).
Analiza la pregunta que un operador jurídico quiere formular en sala y devuelve SIEMPRE un JSON válido con esta estructura:
{
  "original": "string",
  "semaforo": "verde|amarillo|rojo",
  "problemas": ["Doble negación", "Pregunta compuesta", "Sugestiva", "Intimidante", "Jerga jurídica", "Metáfora o lenguaje figurado", "Frase demasiado larga"],
  "impacto_cognitivo": "Explicación breve de por qué puede confundir en TEA, TDAH, dislexia o discapacidad intelectual",
  "reformulada": "La pregunta ya reescrita en lenguaje claro y positivo (o null si ya es clara)",
  "preguntas_divididas": ["1. Pregunta corta y directa", "2. Pregunta corta y directa"],
  "consejos": ["Consejo práctico para el profesional"]
}"""

DICCIONARIO_JERGA: Dict[str, str] = {
    "apercibe": "avisa de forma oficial",
    "apercibimiento": "aviso oficial",
    "comparecencia": "ir al juzgado",
    "comparecer": "ir al juzgado",
    "comparezca": "vaya al juzgado",
    "diligencias": "investigación del juzgado",
    "incoado": "abierto",
    "autos": "expediente del caso",
    "testifical": "declaración como testigo",
    "pericial": "informe de un especialista",
    "jurisdicción": "juzgado competente",
    "coartada": "pruebas de dónde estabas",
    "imputado": "persona investigada",
    "imputada": "persona investigada",
    "instrucción": "investigación inicial",
    "procesal": "del juicio",
    "fehaciente": "que se puede comprobar con seguridad",
    "interfecto": "la persona fallecida",
    "deponer": "contar lo que sabes",
    "manifestar": "decir",
    "manifieste": "diga",
    "ratificar": "confirmar",
    "ratifique": "confirme",
    "suscribir": "firmar",
    "suscribió": "firmó",
}

PATRONES_METAFORAS: List[tuple[re.Pattern, str, str]] = [
    (
        re.compile(r"\bechar\s+un\s+vistazo\b", re.IGNORECASE),
        "mirar o revisar",
        "«Echar un vistazo» es una expresión figurada; en TEA puede interpretarse de forma literal.",
    ),
    (
        re.compile(r"\btomar\s+cartas\s+en\s+el\s+asunto\b", re.IGNORECASE),
        "intervenir o hacer algo para resolverlo",
        "«Tomar cartas en el asunto» es un modismo confuso para personas con comprensión literal.",
    ),
    (
        re.compile(r"\bponer\s+la\s+mano\s+en\s+el\s+fuego\b", re.IGNORECASE),
        "estar totalmente seguro",
        "«Poner la mano en el fuego» es una metáfora que no debe usarse en un interrogatorio.",
    ),
    (
        re.compile(r"\ba\s+ojo\s+de\s+buen\s+cubero\b", re.IGNORECASE),
        "aproximadamente",
        "Usa palabras directas como «aproximadamente» en lugar de dichos populares.",
    ),
    (
        re.compile(r"\bhacer\s+la\s+vista\s+gorda\b", re.IGNORECASE),
        "dejar pasar algo sin decir nada",
        "«Hacer la vista gorda» es lenguaje figurado; cámbialo por una acción concreta.",
    ),
]

CASOS_CONOCIDOS_PREGUNTAS = [
    {
        "match": "no vio bien lo que pasó porque estaba lejos y había poca luz",
        "semaforo": "rojo",
        "problemas": ["Doble negación", "Pregunta compuesta", "Sugestiva"],
        "impacto_cognitivo": "Combina dos negaciones («no es cierto que no vio») con tres ideas distintas en una sola frase. En TEA y discapacidad intelectual bloquea la respuesta; en TDAH sobrecarga la memoria de trabajo.",
        "reformulada": "¿Viste lo que pasó? ¿A qué distancia estabas? ¿Cómo era la luz en ese lugar?",
        "preguntas_divididas": [
            "1. ¿Viste lo que pasó ese día?",
            "2. ¿Desde qué lugar exactamente lo viste?",
            "3. ¿Había suficiente luz para ver con claridad?",
        ],
        "consejos": [
            "Elimina el arranque «¿No es cierto que no...?» y pregunta en positivo.",
            "Haz las 3 preguntas de una en una, esperando la respuesta entre cada una.",
        ],
    },
    {
        "match": "por qué deberíamos creerle",
        "semaforo": "rojo",
        "problemas": ["Intimidante", "No busca hechos concretos"],
        "impacto_cognitivo": "Cuestiona la honestidad de la persona en abstracto. Puede provocar bloqueo emocional o mutismo en personas con autismo o ansiedad.",
        "reformulada": "¿Puedes contarnos paso a paso cómo ocurrieron los hechos que viste?",
        "preguntas_divididas": [
            "1. ¿Qué fue lo primero que viste o escuchaste?",
            "2. ¿Había alguna otra persona o prueba que confirme lo que ocurrió?",
        ],
        "consejos": [
            "Pide detalles observables (qué vio, qué oyó, a qué hora) en lugar de pedir que justifique su credibilidad.",
        ],
    },
    {
        "match": "a qué hora ocurrieron los hechos aproximadamente",
        "semaforo": "verde",
        "problemas": [],
        "impacto_cognitivo": "Es una pregunta única, en voz activa y con una referencia temporal clara.",
        "reformulada": None,
        "preguntas_divididas": [
            "1. ¿A qué hora ocurrieron los hechos aproximadamente?",
        ],
        "consejos": [
            "Si la persona tiene discalculia o dificultad con las horas, puedes añadir anclas cotidianas: «¿Era por la mañana, después de comer o por la noche?».",
        ],
    },
]


def _llamar_gemini_sync(system_prompt: str, user_content: str) -> dict:
    from google import genai
    from google.genai import types

    api_key = (os.getenv("GEMINI_API_KEY") or "").strip()
    if not api_key or len(api_key) < 20:
        raise ValueError("GEMINI_API_KEY no válida")

    modelos = list(
        dict.fromkeys(
            [
                os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
                "gemini-3.7-flash",
                "gemini-3.6-flash",
                "gemini-3.5-flash",
            ]
        )
    )
    client = genai.Client(api_key=api_key)
    ultimo_error: Optional[Exception] = None
    for modelo in modelos:
        try:
            response = client.models.generate_content(
                model=modelo,
                contents=user_content,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    response_mime_type="application/json",
                ),
            )
            texto = (response.text or "").strip()
            start = texto.find("{")
            end = texto.rfind("}") + 1
            return json.loads(texto[start:end])
        except Exception as e:
            ultimo_error = e
            continue
    raise ultimo_error or RuntimeError("No se pudo conectar con Gemini")


def analizar_pregunta_determinista(pregunta: str, perfil: Optional[str] = None) -> dict:
    limpia = re.sub(r"\s+", " ", pregunta.strip())
    minus = limpia.lower()

    for caso in CASOS_CONOCIDOS_PREGUNTAS:
        if caso["match"] in minus:
            return {
                "original": limpia,
                **{k: v for k, v in caso.items() if k != "match"},
            }

    palabras = limpia.split(" ")
    negaciones = re.findall(
        r"\b(no|nunca|jam[aá]s|tampoco|nadie|ning[uú]n|ninguna|sin)\b", minus
    )
    tiene_doble_negacion = len(negaciones) >= 2
    signos_cierre = limpia.count("?")
    es_compuesta = signos_cierre >= 2 or (
        bool(re.search(r"\b(y|o|adem[aá]s|tambi[eé]n|mientras|porque|cuando)\b", minus))
        and len(palabras) > 10
    )
    es_sugestiva = bool(
        re.search(
            r"^[¿\s]*(no\s+es\s+cierto|no\s+es\s+verdad|no\s+cree|no\s+ser[aá]\s+que|acaso\s+no|verdad\s+que)",
            limpia,
            re.IGNORECASE,
        )
        or re.search(r"\b(verdad|no\s+es\s+as[ií]|cierto)\s*\??$", limpia, re.IGNORECASE)
    )
    es_intimidante = bool(
        re.search(
            r"\b(por\s+qu[eé]\s+deber[ií]a(mos)?\s+creer|por\s+qu[eé]\s+miente|c[oó]mo\s+puede\s+estar\s+segur[oa]|c[oó]mo\s+pretende\s+que|est[aá]\s+segur[oa]\s+de\s+que\s+no\s+se\s+inventa)\b",
            limpia,
            re.IGNORECASE,
        )
    )
    es_larga = len(palabras) > 20

    jerga_encontrada: List[str] = []
    for termino in DICCIONARIO_JERGA:
        if re.search(rf"\b{ re.escape(termino) }\b", minus):
            jerga_encontrada.append(termino)

    metaforas_encontradas: List[tuple[re.Pattern, str, str]] = []
    for patron, reemplazo, nota in PATRONES_METAFORAS:
        if patron.search(limpia):
            metaforas_encontradas.append((patron, reemplazo, nota))

    problemas: List[str] = []
    consejos: List[str] = []
    impactos: List[str] = []

    borrador = limpia

    if es_sugestiva:
        problemas.append("Sugestiva")
        borrador = re.sub(
            r"^[¿\s]*(no\s+es\s+cierto\s+que|no\s+es\s+verdad\s+que|no\s+cree\s+que|acaso\s+no|verdad\s+que)\s*",
            "¿",
            borrador,
            flags=re.IGNORECASE,
        )
        borrador = re.sub(
            r",?\s*(¿?\s*verdad|¿?\s*no\s+es\s+as[ií]|¿?\s*cierto)\s*\??$",
            "?",
            borrador,
            flags=re.IGNORECASE,
        )
        consejos.append("Evita preguntas que induzcan la respuesta («¿No es cierto que...?»).")
        impactos.append(
            "Las preguntas sugestivas aumentan el riesgo de aquiescencia (responder que sí por presión social)."
        )

    if tiene_doble_negacion:
        problemas.append("Doble negación")
        borrador = re.sub(r"\bno\s+es\s+cierto\s+que\s+no\b", "", borrador, flags=re.IGNORECASE)
        borrador = re.sub(r"\bno\s+dej[oó]\s+de\b", "", borrador, flags=re.IGNORECASE)
        consejos.append("Formula la pregunta en positivo para que quede claro qué significa responder «sí» o «no».")
        impactos.append(
            "La doble negación obliga a invertir mentalmente la frase y confunde a personas con TEA, dislexia o discapacidad intelectual."
        )

    if jerga_encontrada:
        problemas.append("Jerga jurídica")
        for termino in jerga_encontrada:
            reemplazo = DICCIONARIO_JERGA[termino]
            borrador = re.sub(rf"\b{re.escape(termino)}\b", reemplazo, borrador, flags=re.IGNORECASE)
        consejos.append(
            f"Sustituye los tecnicismos ({', '.join(jerga_encontrada)}) por palabras de uso diario."
        )
        impactos.append("Los términos jurídicos generan ansiedad y bloquean la comprensión literal.")

    if metaforas_encontradas:
        problemas.append("Metáfora o lenguaje figurado")
        for patron, reemplazo, nota in metaforas_encontradas:
            borrador = patron.sub(reemplazo, borrador)
            consejos.append(nota)
        impactos.append("Las personas con TEA procesan el lenguaje de forma literal y las frases hechas pueden desorientarlas.")

    if es_intimidante:
        problemas.append("Intimidante")
        borrador = "¿Puedes contar paso a paso qué viste o qué hiciste en ese momento?"
        consejos.append("Cambia los juicios de valor por preguntas sobre hechos concretos y observables.")
        impactos.append("El tono acusatorio dispara la sobrecarga emocional y dificulta recuperar recuerdos con precisión.")

    borrador = re.sub(r"\busted\s+no\s+vio\b", "viste", borrador, flags=re.IGNORECASE)
    borrador = re.sub(r"\busted\s+vio\b", "viste", borrador, flags=re.IGNORECASE)

    preguntas_divididas: List[str] = []
    if es_compuesta:
        if "Pregunta compuesta" not in problemas:
            problemas.append("Pregunta compuesta")
        consejos.append("Haz una sola pregunta cada vez y espera la respuesta antes de formular la siguiente.")
        impactos.append("En TDAH y discapacidad intelectual, varias preguntas juntas hacen que solo se recuerde la primera o la última parte.")

        fragmentos_brutos = re.split(
            r"\?\s*¿?|\s+(?:y\s+adem[aá]s|y\s+tambi[eé]n|porque|mientras\s+que|o\s+si|y\s+c[oó]mo|y\s+d[oó]nde|y\s+cu[aá]ndo|y\s+qu[eé]|y\s+por\s+qu[eé]|y)\s+",
            borrador.strip("¿? "),
            flags=re.IGNORECASE,
        )
        fragmentos_limpios = [f.strip(" ,.;:¿?") for f in fragmentos_brutos if len(f.strip(" ,.;:¿?")) >= 4]
        if len(fragmentos_limpios) >= 2:
            for idx, frag in enumerate(fragmentos_limpios[:4], start=1):
                frag_cap = frag[0].upper() + frag[1:]
                preguntas_divididas.append(f"{idx}. ¿{frag_cap}?")
            borrador = " ".join(f"¿{f[0].upper() + f[1:]}?" for f in fragmentos_limpios[:4])

    if es_larga and "Frase demasiado larga" not in problemas:
        problemas.append("Frase demasiado larga")
        consejos.append("Acorta cada frase a menos de 15-20 palabras (norma UNE-ISO 24495-1).")
        impactos.append("Las oraciones de más de 20 palabras dificultan seguir el hilo en dislexia y TDAH.")

    if not borrador.startswith("¿"):
        borrador = "¿" + borrador.lstrip("¿ ")
    if not borrador.endswith("?"):
        borrador = borrador.rstrip("? .") + "?"

    if not preguntas_divididas:
        preguntas_divididas = [f"1. {borrador}"]

    if not problemas:
        return {
            "original": limpia,
            "semaforo": "verde",
            "problemas": [],
            "impacto_cognitivo": "Pregunta directa, formulada con una sola idea y sin negaciones confusas.",
            "reformulada": None,
            "preguntas_divididas": [f"1. {limpia}"],
            "consejos": [
                "Deja entre 5 y 10 segundos de silencio después de hacer la pregunta para que la persona pueda procesar y responder sin prisa."
            ],
        }

    semaforo = "amarillo" if len(problemas) == 1 else "rojo"
    if borrador.strip("¿? ").lower() == limpia.strip("¿? ").lower():
        borrador = f"Por favor, cuéntanos paso a paso: {borrador}"

    return {
        "original": limpia,
        "semaforo": semaforo,
        "problemas": problemas,
        "impacto_cognitivo": " ".join(impactos)
        if impactos
        else "Simplificar la estructura reduce la carga cognitiva y mejora la exactitud del testimonio.",
        "reformulada": borrador,
        "preguntas_divididas": preguntas_divididas,
        "consejos": consejos,
    }


async def analizar_pregunta(pregunta: str, perfil: Optional[str] = None) -> dict:
    provider = os.getenv("LLM_PROVIDER", "mock").lower()
    gemini_key = (os.getenv("GEMINI_API_KEY") or "").strip()

    if provider == "gemini" or (provider == "mock" and len(gemini_key) >= 20):
        try:
            return await asyncio.to_thread(
                _llamar_gemini_sync,
                SYSTEM_PROMPT_PREGUNTA,
                f"Perfil: {perfil or 'neurodivergente general'}\nPregunta: {pregunta}",
            )
        except Exception:
            pass
    elif provider == "openai" and os.getenv("OPENAI_API_KEY"):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers={"Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}"},
                    json={
                        "model": "gpt-4o-mini",
                        "messages": [
                            {"role": "system", "content": SYSTEM_PROMPT_PREGUNTA},
                            {
                                "role": "user",
                                "content": f"Perfil: {perfil or 'neurodivergente general'}\nPregunta: {pregunta}",
                            },
                        ],
                        "response_format": {"type": "json_object"},
                    },
                    timeout=15.0,
                )
                data = response.json()
                return json.loads(data["choices"][0]["message"]["content"])
        except Exception:
            pass
    elif provider == "anthropic" and os.getenv("ANTHROPIC_API_KEY"):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.anthropic.com/v1/messages",
                    headers={
                        "x-api-key": os.getenv("ANTHROPIC_API_KEY", ""),
                        "anthropic-version": "2023-06-01",
                        "content-type": "application/json",
                    },
                    json={
                        "model": "claude-3-haiku-20240307",
                        "max_tokens": 1200,
                        "system": SYSTEM_PROMPT_PREGUNTA,
                        "messages": [
                            {
                                "role": "user",
                                "content": f"Perfil: {perfil or 'neurodivergente general'}\nPregunta: {pregunta}",
                            }
                        ],
                    },
                    timeout=15.0,
                )
                data = response.json()
                content = data["content"][0]["text"]
                start = content.find("{")
                end = content.rfind("}") + 1
                return json.loads(content[start:end])
        except Exception:
            pass

    return analizar_pregunta_determinista(pregunta, perfil)


def adaptar_documento_personalizado(texto: str) -> dict:
    """Extrae fecha, hora, juzgado y rol de cualquier texto judicial pegado por el usuario."""
    limpio = texto.strip()
    minus = limpio.lower()

    if "fallo" in minus or "absuelvo" in minus or "condeno" in minus or "sentencia" in minus:
        return dict(MOCK_RESPONSE_SENTENCIA)

    es_investigado = any(k in minus for k in ["investigad", "imputad", "delito leve", "estafa", "art. 118"])
    base = dict(MOCK_RESPONSE_JUAN if es_investigado else MOCK_RESPONSE_LUIS)
    datos_clave = dict(base["datos_clave"])

    organo_match = re.search(
        r"(juzgado\s+de\s+[^\n,.]+(?:\s+de\s+[^\n,.]+)?)", limpio, re.IGNORECASE
    )
    if organo_match:
        datos_clave["organo"] = organo_match.group(1).strip()
        datos_clave["lugar"] = organo_match.group(1).strip()

    hora_match = re.search(r"\b([012]?\d:[0-5]\d)\s*(?:horas|h)?\b", limpio, re.IGNORECASE)
    if hora_match:
        datos_clave["hora"] = hora_match.group(1)

    fecha_match = re.search(
        r"\b(\d{1,2}\s+de\s+[a-záéíóú]+\s+de\s+20\d{2})\b", limpio, re.IGNORECASE
    )
    if fecha_match:
        datos_clave["fecha"] = fecha_match.group(1)

    datos_clave["pipeline_ia"] = PIPELINE_SUMA_IAS
    base["datos_clave"] = datos_clave
    return base


async def procesar_citacion(texto: str, perfil: Optional[str] = None) -> dict:
    provider = os.getenv("LLM_PROVIDER", "mock").lower()
    gemini_key = (os.getenv("GEMINI_API_KEY") or "").strip()

    if provider == "gemini" or (provider == "mock" and len(gemini_key) >= 20):
        try:
            resultado = await asyncio.to_thread(
                _llamar_gemini_sync,
                SYSTEM_PROMPT,
                f"Perfil: {perfil or 'general'}\n\nDocumento:\n{texto}",
            )
            resultado.setdefault("datos_clave", {})["pipeline_ia"] = PIPELINE_SUMA_IAS
            return resultado
        except Exception:
            return adaptar_documento_personalizado(texto)
    elif provider == "openai":
        return await _llamar_openai(texto, perfil)
    elif provider == "anthropic":
        return await _llamar_anthropic(texto, perfil)
    else:
        return adaptar_documento_personalizado(texto)


async def _llamar_openai(texto: str, perfil: Optional[str]) -> dict:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return adaptar_documento_personalizado(texto)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"Perfil: {perfil or 'general'}\n\nDocumento:\n{texto}"},
                    ],
                    "response_format": {"type": "json_object"},
                },
                timeout=30.0,
            )
            data = response.json()
            resultado = json.loads(data["choices"][0]["message"]["content"])
            resultado.setdefault("datos_clave", {})["pipeline_ia"] = PIPELINE_SUMA_IAS
            return resultado
    except Exception:
        return adaptar_documento_personalizado(texto)


async def _llamar_anthropic(texto: str, perfil: Optional[str]) -> dict:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return adaptar_documento_personalizado(texto)

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-3-haiku-20240307",
                    "max_tokens": 2000,
                    "system": SYSTEM_PROMPT,
                    "messages": [
                        {"role": "user", "content": f"Perfil: {perfil or 'general'}\n\nDocumento:\n{texto}"}
                    ],
                },
                timeout=30.0,
            )
            data = response.json()
            content = data["content"][0]["text"]
            start = content.find("{")
            end = content.rfind("}") + 1
            resultado = json.loads(content[start:end])
            resultado.setdefault("datos_clave", {})["pipeline_ia"] = PIPELINE_SUMA_IAS
            return resultado
    except Exception:
        return adaptar_documento_personalizado(texto)


# ── Chat de ayuda (dudas sobre PUENTE / proceso) ─────────────────────────────
# Nunca diagnóstico médico. Sin datos sensibles de salud. Lectura fácil, tuteo.

SYSTEM_PROMPT_AYUDA = """Eres PUENTE, una guía calmada de accesibilidad cognitiva en la justicia española.
Ayudas a personas neurodivergentes (y a quien lo necesite) a entender citaciones, el juzgado,
el Pasaporte de ajustes, Ensaya y la Sala Previa.

Reglas OBLIGATORIAS:
- Español de España, tuteo, lectura fácil: frases cortas, una idea por frase.
- NUNCA des diagnóstico médico ni preguntes por enfermedades, tratamientos o datos de salud.
- NUNCA pidas DNI, número de expediente real, ni datos personales sensibles.
- Si preguntan por salud o discapacidad clínica, di con calma que no eres médica y que pueden
  pedir apoyos en el Pasaporte sin escribir ningún diagnóstico.
- Habla solo de PUENTE y del proceso judicial accesible (citación, plazos, pasaporte, ensaya, sala previa, modo con voz).
- Si no sabes algo concreto del caso, dilo y sugiere ir a «Mi citación» o hablar con su abogado/a.
- Responde en texto plano (sin JSON, sin markdown denso). Máximo 8 frases cortas.
"""


RESPUESTAS_MOCK_AYUDA: List[tuple[re.Pattern, str]] = [
    (
        re.compile(r"citaci[oó]n|carta|documento|fecha|hora|plazos?", re.I),
        "En «Mi citación» puedes pegar el texto de la carta del juzgado. "
        "Te la explicamos con frases cortas: qué día, a qué hora y dónde. "
        "También puedes pedir que te la lean en voz alta. "
        "Si quieres, ve a Citación en el menú de arriba.",
    ),
    (
        re.compile(r"pasaporte|ajustes?|adaptaciones?", re.I),
        "El Pasaporte es una lista de lo que te ayuda en el juzgado. "
        "Tú eliges los apoyos. No hace falta escribir ningún diagnóstico. "
        "Puedes generar un código QR para enseñarlo. "
        "Entra en Pasaporte desde el menú.",
    ),
    (
        re.compile(r"ensaya|declaraci[oó]n|preguntas?|testigo", re.I),
        "En Ensaya practicas preguntas antes del día. "
        "Puedes parar cuando quieras. "
        "Hay pictogramas y ayuda si una pregunta te confunde. "
        "Entra en Ensaya desde el menú.",
    ),
    (
        re.compile(r"sala\s*previa|ruido|luz|juzgado|sala\s*3d|estimul", re.I),
        "La Sala Previa te deja probar el ambiente del juzgado a tu ritmo: "
        "ruido, luz y gente. "
        "Puedes bajar estímulos y usar el botón de calma. "
        "Entra en Sala desde el menú.",
    ),
    (
        re.compile(r"voz|micr[oó]fono|hablar|escuchar|audio|leer", re.I),
        "Puedes activar el «modo con voz» para que PUENTE te lea y te escuche. "
        "Di «quiero activar el modo con voz» o usa el botón de la cabecera. "
        "En esta página de Ayuda también puedes dictar tu pregunta con el micrófono.",
    ),
    (
        re.compile(r"medic[oa]|diagn[oó]stico|enfermedad|trastorno|salud|tdah|autismo|ciego", re.I),
        "No soy médica y no hago diagnósticos. "
        "En PUENTE no hace falta decir tu diagnóstico. "
        "Puedes marcar «Necesito más apoyos de voz y lectura» en el Pasaporte "
        "y elegir los ajustes que te ayudan. "
        "Si tienes dudas de salud, habla con tu profesional de confianza.",
    ),
]


def _respuesta_mock_ayuda(pregunta: str) -> str:
    limpia = re.sub(r"\s+", " ", (pregunta or "").strip())
    if len(limpia) < 2:
        return (
            "Escribe o dicta tu duda. "
            "Puedo ayudarte con la citación, el Pasaporte, Ensaya o la Sala Previa."
        )
    for patron, texto in RESPUESTAS_MOCK_AYUDA:
        if patron.search(limpia):
            return texto
    return (
        "PUENTE te ayuda a entender el juzgado con frases cortas. "
        "Puedes ir a Citación (explicar la carta), Pasaporte (pedir apoyos), "
        "Ensaya (practicar) o Sala Previa (probar el ambiente). "
        "Si quieres, reformula tu duda con otras palabras. "
        "No pido datos de salud ni hago diagnósticos."
    )


def _llamar_gemini_texto_sync(system_prompt: str, user_content: str) -> str:
    """Gemini en texto plano (chat de ayuda). Misma clave que el resto del LLM."""
    from google import genai
    from google.genai import types

    api_key = (os.getenv("GEMINI_API_KEY") or "").strip()
    if not api_key or len(api_key) < 20:
        raise ValueError("GEMINI_API_KEY no válida")

    modelos = list(
        dict.fromkeys(
            [
                os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
                "gemini-3.7-flash",
                "gemini-3.6-flash",
                "gemini-3.5-flash",
            ]
        )
    )
    client = genai.Client(api_key=api_key)
    ultimo_error: Optional[Exception] = None
    for modelo in modelos:
        try:
            response = client.models.generate_content(
                model=modelo,
                contents=user_content,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt,
                    temperature=0.4,
                    max_output_tokens=512,
                ),
            )
            texto = (response.text or "").strip()
            if texto:
                return texto
        except Exception as e:
            ultimo_error = e
            continue
    raise ultimo_error or RuntimeError("No se pudo conectar con Gemini")


async def responder_ayuda(pregunta: str) -> dict:
    """
    Responde dudas sobre PUENTE / proceso judicial.
    Usa Gemini si hay GEMINI_API_KEY (o LLM_PROVIDER=gemini); si no, mock calmado.
    """
    limpia = re.sub(r"\s+", " ", (pregunta or "").strip())[:800]
    provider = os.getenv("LLM_PROVIDER", "mock").lower()
    gemini_key = (os.getenv("GEMINI_API_KEY") or "").strip()
    fuente = "mock"

    if provider == "gemini" or (provider in ("mock", "") and len(gemini_key) >= 20):
        try:
            texto = await asyncio.to_thread(
                _llamar_gemini_texto_sync,
                SYSTEM_PROMPT_AYUDA,
                f"Pregunta de la persona (responde en lectura fácil, tuteo):\n{limpia}",
            )
            fuente = "gemini"
            return {"respuesta": texto, "fuente": fuente}
        except Exception:
            pass

    return {"respuesta": _respuesta_mock_ayuda(limpia), "fuente": "mock"}
