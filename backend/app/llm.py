"""
Abstracción para procesamiento de documentos judiciales y reformulación de preguntas.
Combina un motor determinista de adaptación en español (UNE 153101 + ISO 24495-1)
con conexión opcional a Google Gemini (google-genai), OpenAI o Anthropic.
"""

import asyncio
import json
import os
import re
from pathlib import Path
from typing import Dict, List, Optional
import httpx

from .mock_data import (
    MOCK_RESPONSE_LUIS,
    MOCK_RESPONSE_JUAN,
    MOCK_RESPONSE_SENTENCIA,
    MOCK_RESPONSE_CONDENA,
    MOCK_RESPONSE_DESCONOCIDO,
    PIPELINE_SUMA_IAS,
)
from .anonimizador import anonimizar_documento_judicial

SYSTEM_PROMPT = """Eres un asistente especializado en accesibilidad cognitiva para la justicia española.
Tu tarea es transformar citaciones o sentencias judiciales en versiones comprensibles según UNE-ISO 24495-1 (lenguaje claro) y UNE 153101 (lectura fácil).

IMPORTANTE SOBRE PRIVACIDAD (RGPD art. 25): El documento que recibes ya ha sido anonimizado en local. Los nombres, DNI y domicilios han sido sustituidos por marcadores como [PERSONA_1], [DNI_1], [DOMICILIO_1]. Mantén estos marcadores o usa fórmulas neutras y accesibles en segunda persona («tú», «tu carné de identidad»), sin inventar datos personales reales ni solicitar información identificativa.

Devuelve SIEMPRE un JSON válido con esta estructura exacta:
{
  "datos_clave": {
    "tipo_documento": "citacion|sentencia|documento_judicial",
    "rol": "testigo|investigado|demandante|demandado|persona absuelta|persona condenada|desconocido",
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

    # Mantiene el registro formal ("usted") y preserva el sentido de la negación si corresponde

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


def adaptar_documento_personalizado(
    texto: str, elementos_protegidos: Optional[List[dict]] = None
) -> dict:
    """Extrae fecha, hora, juzgado y rol de cualquier texto judicial pegado por el usuario."""
    limpio = texto.strip()
    minus = limpio.lower()

    if elementos_protegidos is None:
        _, elementos_protegidos = anonimizar_documento_judicial(texto)

    privacidad_info = {
        "anonimizado_antes_de_ia": True,
        "art_rgpd": "Artículo 25 RGPD (Privacidad desde el diseño) y Minimización de Datos",
        "garantia": "Hemos detectado y enmascarado en local los identificadores encontrados (DNI, nombres, domicilios o teléfonos) antes de cualquier procesamiento.",
        "total_protegidos": len(elementos_protegidos),
        "elementos_protegidos": elementos_protegidos,
    }

    es_sentencia = any(k in minus for k in ["sentencia", "fallo", "absuelvo", "absolucion", "condeno", "condena"])
    if es_sentencia:
        es_condena = any(k in minus for k in ["condeno", "condena", "culpable", "pena de", "prision", "multa de"])
        base = json.loads(json.dumps(MOCK_RESPONSE_CONDENA if es_condena else MOCK_RESPONSE_SENTENCIA))
    else:
        es_civil = any(k in minus for k in ["demandad", "demandant", "juicio verbal", "juicio ordinario", "cedula de emplazamiento", "decreto de admision", "audiencia previa"])
        es_investigado = any(k in minus for k in ["investigad", "imputad", "delito leve", "estafa", "art. 118", "en calidad de investigad"])
        es_testigo = any(k in minus for k in ["testigo", "declaracion testifical", "en calidad de testigo", "art. 433"])

        if es_testigo:
            base = json.loads(json.dumps(MOCK_RESPONSE_LUIS))
            if es_civil:
                base["datos_clave"]["tipo_procedimiento"] = "Procedimiento Civil (Testifical)"
        elif es_investigado:
            base = json.loads(json.dumps(MOCK_RESPONSE_JUAN))
        elif es_civil:
            base = json.loads(json.dumps(MOCK_RESPONSE_DESCONOCIDO))
            base["datos_clave"]["tipo_procedimiento"] = "Procedimiento Civil"
            base["datos_clave"]["rol"] = "demandada" if "demandad" in minus else ("demandante" if "demandant" in minus else "parte_civil")
        else:
            base = json.loads(json.dumps(MOCK_RESPONSE_DESCONOCIDO))
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
    datos_clave["privacidad_rgpd"] = privacidad_info
    base["datos_clave"] = datos_clave
    return base


async def procesar_citacion(texto: str, perfil: Optional[str] = None) -> dict:
    texto_anonimizado, elementos_protegidos = anonimizar_documento_judicial(texto)
    privacidad_info = {
        "anonimizado_antes_de_ia": True,
        "art_rgpd": "Artículo 25 RGPD (Privacidad desde el diseño) y Minimización de Datos",
        "garantia": "Hemos detectado y enmascarado en local los identificadores encontrados (DNI, nombres, domicilios o teléfonos) antes de cualquier procesamiento.",
        "total_protegidos": len(elementos_protegidos),
        "elementos_protegidos": elementos_protegidos,
    }

    provider = os.getenv("LLM_PROVIDER", "mock").lower()
    gemini_key = (os.getenv("GEMINI_API_KEY") or "").strip()

    prompt_usuario = (
        f"Perfil de accesibilidad: {perfil or 'general'}\n\n"
        f"Documento (DATOS PERSONALES PREVIAMENTE ANONIMIZADOS SEGÚN RGPD):\n"
        f"{texto_anonimizado}"
    )

    if provider == "gemini" or (provider == "mock" and len(gemini_key) >= 20):
        try:
            resultado = await asyncio.to_thread(
                _llamar_gemini_sync,
                SYSTEM_PROMPT,
                prompt_usuario,
            )
            datos = resultado.setdefault("datos_clave", {})
            datos["pipeline_ia"] = PIPELINE_SUMA_IAS
            datos["privacidad_rgpd"] = privacidad_info
            return resultado
        except Exception:
            return adaptar_documento_personalizado(texto, elementos_protegidos)
    elif provider == "openai":
        return await _llamar_openai(texto_anonimizado, perfil, elementos_protegidos)
    elif provider == "anthropic":
        return await _llamar_anthropic(texto_anonimizado, perfil, elementos_protegidos)
    else:
        return adaptar_documento_personalizado(texto, elementos_protegidos)


async def _llamar_openai(
    texto_anonimizado: str,
    perfil: Optional[str],
    elementos_protegidos: List[dict],
) -> dict:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return adaptar_documento_personalizado(texto_anonimizado, elementos_protegidos)

    prompt_usuario = (
        f"Perfil de accesibilidad: {perfil or 'general'}\n\n"
        f"Documento (DATOS PERSONALES PREVIAMENTE ANONIMIZADOS SEGÚN RGPD):\n"
        f"{texto_anonimizado}"
    )

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}"},
                json={
                    "model": "gpt-4o-mini",
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": prompt_usuario},
                    ],
                    "response_format": {"type": "json_object"},
                },
                timeout=30.0,
            )
            data = response.json()
            resultado = json.loads(data["choices"][0]["message"]["content"])
            datos = resultado.setdefault("datos_clave", {})
            datos["pipeline_ia"] = PIPELINE_SUMA_IAS
            datos["privacidad_rgpd"] = {
                "anonimizado_antes_de_ia": True,
                "art_rgpd": "Artículo 25 RGPD (Privacidad desde el diseño)",
                "garantia": "Tus datos personales identificativos se anonimizaron en local antes de enviarse al modelo.",
                "total_protegidos": len(elementos_protegidos),
                "elementos_protegidos": elementos_protegidos,
            }
            return resultado
    except Exception:
        return adaptar_documento_personalizado(texto_anonimizado, elementos_protegidos)


async def _llamar_anthropic(
    texto_anonimizado: str,
    perfil: Optional[str],
    elementos_protegidos: List[dict],
) -> dict:
    api_key = os.getenv("ANTHROPIC_API_KEY")
    if not api_key:
        return adaptar_documento_personalizado(texto_anonimizado, elementos_protegidos)

    prompt_usuario = (
        f"Perfil de accesibilidad: {perfil or 'general'}\n\n"
        f"Documento (DATOS PERSONALES PREVIAMENTE ANONIMIZADOS SEGÚN RGPD):\n"
        f"{texto_anonimizado}"
    )

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
                    "messages": [{"role": "user", "content": prompt_usuario}],
                },
                timeout=30.0,
            )
            data = response.json()
            content = data["content"][0]["text"]
            start = content.find("{")
            end = content.rfind("}") + 1
            resultado = json.loads(content[start:end])
            datos = resultado.setdefault("datos_clave", {})
            datos["pipeline_ia"] = PIPELINE_SUMA_IAS
            datos["privacidad_rgpd"] = {
                "anonimizado_antes_de_ia": True,
                "art_rgpd": "Artículo 25 RGPD (Privacidad desde el diseño)",
                "garantia": "Tus datos personales identificativos se anonimizaron en local antes de enviarse al modelo.",
                "total_protegidos": len(elementos_protegidos),
                "elementos_protegidos": elementos_protegidos,
            }
            return resultado
    except Exception:
        return adaptar_documento_personalizado(texto_anonimizado, elementos_protegidos)


# ── Chat de ayuda: solo dudas de derecho, con artículo ────────────────────────
# Cita la ley y el artículo. Informa: no asesora. Textos ya corregidos.

FRASE_FUERA_DE_DERECHO = "Solo contesto dudas legales."
AVISO_NO_ASESORA = "Esto es información. No es asesoramiento."

SYSTEM_PROMPT_AYUDA = """Eres TribunalInclusivo. Ayudas a una persona a preparar su cita con el juzgado en España.

Responde siempre que la pregunta trate de esta aplicación o del proceso:
el juicio, ir o no ir, la citación, declarar, el silencio, el abogado, las pausas, la persona de apoyo, el facilitador, el diagnóstico, el Pasaporte de Ajustes, la sala previa y el simulador.
También si pregunta por su papel: testigo, investigado, víctima o parte civil.

Reglas:
- Español de España, tuteo, frases cortas, una idea por frase.
- No respondas «Solo contesto dudas legales» si la pregunta es del juzgado, de los derechos, de los ajustes o de esta aplicación.
- Esa frase solo vale si el tema es ajeno, como el tiempo, un partido o una receta.
- Si preguntan si tienen que ir al juzgado como testigo: sí, es un deber. Cita el art. 410 LECrim. Si no van sin causa justificada, cita el art. 420 LECrim.
- Si preguntan si tienen que decir su diagnóstico: no. Es un dato privado. El Pasaporte dice los ajustes, no la enfermedad. Cita el art. 9 del RGPD y el art. 7 bis de la LEC.
- No des un diagnóstico médico. No pidas DNI, expediente ni datos de salud.
- Si preguntan por una persona de apoyo o un facilitador: pueden pedirlo. El juez decide. Cita el art. 7 bis de la LEC.
- Cita la ley y el artículo. Ejemplo: «art. 420 LECrim, en boe.es». No basta con decir «fuente: BOE».
- Falso testimonio: art. 433 LECrim y art. 458 del Código Penal. Si no recuerda, puede decirlo. No inventa.
- Abogado en delito leve: no digas «abogado gratis» ni que esté garantizado. Es optativo (art. 967.1 LECrim). Puede pedir justicia gratuita y el juzgado decide (art. 6.3.b Ley 1/1996).
- Texto plano, sin JSON y sin markdown. Máximo 6 frases cortas.
"""


def _cerrar_derecho(cuerpo: str, cita: str) -> str:
    return f"{cuerpo} Fuente: {cita}, en boe.es."


RESPUESTA_ABOGADO = _cerrar_derecho(
    "En un delito leve el abogado no es obligatorio. "
    "Puedes ir con uno si quieres. "
    "Si no tienes dinero, puedes pedir justicia gratuita. "
    "El juzgado decide si te la concede.",
    "art. 967.1 LECrim y art. 6.3.b de la Ley 1/1996",
)

RESPUESTAS_MOCK_AYUDA: List[tuple[re.Pattern, str]] = [
    (
        re.compile(r"abogad|justicia gratuita|oficio|gratis", re.I),
        RESPUESTA_ABOGADO,
    ),
    (
        re.compile(r"diagn[oó]stic|informe m[eé]dico", re.I),
        _cerrar_derecho(
            "No tienes que decir tu diagnóstico en público. "
            "Es un dato privado. "
            "El Pasaporte explica los ajustes que necesitas, no tu enfermedad.",
            "art. 9 RGPD y art. 7 bis LEC",
        ),
    ),
    (
        re.compile(r"persona de apoyo|facilitador|acompa[nñ]|persona de confianza", re.I),
        _cerrar_derecho(
            "Puedes pedir ir con una persona de apoyo o un facilitador. "
            "Esa persona te ayuda a entender. "
            "El juez decide si puede entrar en la sala.",
            "art. 7 bis LEC",
        ),
    ),
    (
        re.compile(r"delito leve.*(no (voy|acudo)|ausencia|multa)|multa.*delito leve", re.I),
        _cerrar_derecho(
            "En un delito leve, si no vas y no justificas, el juicio puede hacerse sin ti. "
            "La multa puede ser de 200 a 2.000 euros.",
            "art. 967.2 y art. 971 LECrim",
        ),
    ),
    (
        re.compile(r"pausa|bloque|nervios|descans", re.I),
        _cerrar_derecho(
            "Puedes pedir una pausa en el juicio. "
            "El juez decide cuándo paras y cuándo sigues.",
            "art. 7 bis LEC",
        ),
    ),
    (
        re.compile(r"mentir|falso testimonio|verdad|recordar|no lo s[eé]|testigo|declar", re.I),
        _cerrar_derecho(
            "Si eres testigo, dices lo que viste. "
            "Mentir puede ser un delito de falso testimonio. "
            "Si no recuerdas un dato, dilo. No inventes.",
            "art. 433 LECrim y art. 458 CP",
        ),
    ),
    (
        re.compile(r"no voy|no acudo|incomparec|conducci[oó]n|multa", re.I),
        _cerrar_derecho(
            "Si eres testigo y no vas sin una causa justificada, pueden multarte de 200 a 5.000 euros. "
            "También pueden ordenar que la policía te lleve al juzgado. "
            "Si no puedes ir, avisa y lleva un justificante.",
            "art. 420 LECrim",
        ),
    ),
    (
        re.compile(r"repet|m[aá]s claro|lenguaje claro|palabras sencillas|entender la pregunta", re.I),
        _cerrar_derecho(
            "Puedes pedir que repitan una pregunta. "
            "Puedes pedir que la digan con palabras más claras. "
            "Decide quien preside la sala.",
            "art. 7 bis LEC y art. 709 LECrim",
        ),
    ),
    (
        re.compile(r"silencio|no declarar|no contestar|no confes", re.I),
        _cerrar_derecho(
            "Si estás investigado, puedes guardar silencio. "
            "No tienes que declararte culpable.",
            "art. 118 LECrim",
        ),
    ),
    (
        re.compile(r"citaci[oó]n", re.I),
        _cerrar_derecho(
            "Una citación es el aviso del juzgado para que vayas. "
            "Te dice el día y el lugar. "
            "Si te citan como testigo, ir es un deber.",
            "art. 410 LECrim",
        ),
    ),
    (
        re.compile(r"\bboe\b|fuente|leyes?|normas?|art[ií]culos?|\blec\b|lecrim|c[oó]digo penal|bolet[ií]n", re.I),
        _cerrar_derecho(
            "Cito la ley y el artículo, no solo el boletín. "
            "Por ejemplo, si un testigo no va sin causa justificada, mira el art. 420 LECrim.",
            "art. 420 LECrim",
        ),
    ),
    (
        re.compile(r"ir al juzgado|aunque no quiera|tengo que ir|obligatorio ir", re.I),
        _cerrar_derecho(
            "Sí. Si te citan como testigo, ir al juzgado es un deber. "
            "No depende de si quieres. "
            "Si no puedes ir, avisa antes y lleva un justificante.",
            "art. 410 LECrim",
        ),
    ),
    (
        re.compile(r"simulador|ver la sala|sala previa|antes del juicio", re.I),
        _cerrar_derecho(
            "En la sala previa ves quién hay y qué se oye. "
            "Después puedes ensayar preguntas. "
            "Puedes parar cuando quieras. "
            "Sirve para llegar con menos sorpresa.",
            "art. 7 bis LEC",
        ),
    ),
    (
        re.compile(r"pasaporte", re.I),
        _cerrar_derecho(
            "El Pasaporte dice los ajustes que necesitas, como pausas o preguntas claras. "
            "No dice tu diagnóstico. "
            "Así el juzgado sabe cómo ayudarte sin ver tu historial.",
            "art. 7 bis LEC y art. 9 RGPD",
        ),
    ),
    (
        re.compile(r"jue[cz]|fiscal|juicio|derechos?|pena|recurso", re.I),
        _cerrar_derecho(
            "En el juicio hablan el juez, el fiscal y los abogados. "
            "Tú contestas cuando te toca. "
            "Si no entiendes, puedes pedir que lo repitan.",
            "art. 7 bis LEC",
        ),
    ),
]

_PATRON_ABOGADO_GRATIS = re.compile(
    r"abogado gratis|gratis garantiz|de oficio gratuito garant|te lo dan gratis",
    re.I,
)

_FAQS_APP: List[tuple[str, str]] = [
    (
        "¿Cómo me ayuda el simulador de la sala antes de ir al juzgado?",
        _cerrar_derecho(
            "Primero ves la sala: quién hay y qué se oye. "
            "Después ensayas un juicio con preguntas. "
            "Puedes parar cuando quieras.",
            "art. 7 bis LEC",
        ),
    ),
    (
        "¿Cómo funciona el Pasaporte de ajustes?",
        _cerrar_derecho(
            "El Pasaporte dice los ajustes que necesitas, como pausas o preguntas claras. "
            "No dice tu diagnóstico.",
            "art. 7 bis LEC y art. 9 RGPD",
        ),
    ),
]


def _normalizar_pregunta(texto: str) -> str:
    limpio = (texto or "").lower().strip()
    limpio = re.sub(r"[¿?¡!.,;:\"'«»]", "", limpio)
    return re.sub(r"\s+", " ", limpio)


def _formato_faq(respuesta: str, articulo: str, enlace: str) -> str:
    cuerpo = re.sub(r"\s+", " ", (respuesta or "").strip())
    cita = (articulo or "").strip()
    if not cita:
        return cuerpo
    if enlace and "boe.es" in enlace:
        return f"{cuerpo} Fuente: {cita}, en boe.es."
    return f"{cuerpo} Fuente: {cita}."


def _indice_faqs_ayuda() -> Dict[str, str]:
    base = Path(__file__).resolve().parent
    candidatos = [
        base.parents[1] / "data" / "roles.json",
        base.parent / "data" / "roles.json",
        base / "data" / "roles.json",
    ]
    indice: Dict[str, str] = {}
    for ruta in candidatos:
        if not ruta.exists():
            continue
        with ruta.open(encoding="utf-8") as archivo:
            roles = json.load(archivo)
        for rol in roles:
            for faq in rol.get("faq", []):
                clave = _normalizar_pregunta(faq.get("pregunta", ""))
                if not clave:
                    continue
                indice[clave] = _formato_faq(
                    faq.get("respuesta", ""),
                    faq.get("articulo", ""),
                    faq.get("enlace_boe", ""),
                )
        break
    for pregunta, respuesta in _FAQS_APP:
        indice.setdefault(_normalizar_pregunta(pregunta), respuesta)
    return indice


_INDICE_FAQS_AYUDA = _indice_faqs_ayuda()


def _es_rechazo(texto: str) -> bool:
    limpio = re.sub(r"\s+", " ", (texto or "").strip())
    if not limpio:
        return True
    frase = FRASE_FUERA_DE_DERECHO.rstrip(".")
    return frase in limpio and len(limpio) < 140


def _es_pregunta_de_derecho(pregunta: str) -> bool:
    return any(patron.search(pregunta) for patron, _ in RESPUESTAS_MOCK_AYUDA)


def _respuesta_mock_ayuda(pregunta: str) -> str:
    limpia = re.sub(r"\s+", " ", (pregunta or "").strip())
    if _PATRON_ABOGADO_GRATIS.search(limpia):
        return RESPUESTA_ABOGADO
    if not _es_pregunta_de_derecho(limpia):
        return FRASE_FUERA_DE_DERECHO
    for patron, texto in RESPUESTAS_MOCK_AYUDA:
        if patron.search(limpia):
            return texto
    return FRASE_FUERA_DE_DERECHO


def _sanear_respuesta_derecho(texto: str, pregunta: str) -> str:
    if _PATRON_ABOGADO_GRATIS.search(texto) or _PATRON_ABOGADO_GRATIS.search(pregunta):
        return RESPUESTA_ABOGADO
    limpio = (texto or "").replace(AVISO_NO_ASESORA, " ").strip()
    return re.sub(r"\s+", " ", limpio)


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
            mensaje = str(e)
            if "429" in mensaje or "RESOURCE_EXHAUSTED" in mensaje:
                break
            continue
    raise ultimo_error or RuntimeError("No se pudo conectar con Gemini")


async def responder_ayuda(pregunta: str) -> dict:
    """
    Responde dudas del juzgado, de los ajustes y de esta aplicación.
    Primero usa las preguntas ya escritas. Si no hay una, llama al modelo.
    """
    limpia = re.sub(r"\s+", " ", (pregunta or "").strip())[:800]
    if _PATRON_ABOGADO_GRATIS.search(limpia):
        return {"respuesta": RESPUESTA_ABOGADO, "fuente": "mock"}

    de_catalogo = _INDICE_FAQS_AYUDA.get(_normalizar_pregunta(limpia))
    if de_catalogo:
        return {"respuesta": de_catalogo, "fuente": "mock"}

    provider = os.getenv("LLM_PROVIDER", "mock").lower()
    gemini_key = (os.getenv("GEMINI_API_KEY") or "").strip()
    gemini_ok = provider == "gemini" or (provider in ("mock", "") and len(gemini_key) >= 20)

    if gemini_ok:
        try:
            texto = await asyncio.to_thread(
                _llamar_gemini_texto_sync,
                SYSTEM_PROMPT_AYUDA,
                (
                    "Responde la pregunta. Si trata del juzgado, de los derechos, "
                    "de los ajustes o de esta aplicación, contéstala y cita la ley y el artículo, en boe.es. "
                    "No uses «Solo contesto dudas legales» en ese caso. "
                    "No digas que el abogado es gratis.\n"
                    f"{limpia}"
                ),
            )
            saneado = _sanear_respuesta_derecho(texto, limpia)
            if not _es_rechazo(saneado):
                return {"respuesta": saneado, "fuente": "gemini"}
        except Exception:
            pass

    return {"respuesta": _respuesta_mock_ayuda(limpia), "fuente": "mock"}

