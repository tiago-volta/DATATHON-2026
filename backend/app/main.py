"""
PUENTE Backend API
FastAPI backend para el DATAthon Justicia 2026 (Reto 3: Neurodiversidad).
Enfoque determinista con soporte opcional de LLM (OpenAI / Anthropic).
"""

from datetime import datetime
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel, field_validator
from typing import Optional, List
import json
import os
import re
from dotenv import load_dotenv

from .llm import procesar_citacion, analizar_pregunta, responder_ayuda
from .anonimizador import anonimizar_documento_judicial
from .arasaac import obtener_pictogramas
from .calendario import generar_ics
from .documentos import extraer_texto_documento
from .tts import MAX_CARACTERES, sintetizar_mp3, sanitizar_texto
from .voz import interpretar_peticion
from .mock_data import (
    MOCK_CITACION_LUIS,
    MOCK_CITACION_JUAN,
    MOCK_SENTENCIA,
    MOCK_RESPONSE_LUIS,
    MOCK_RESPONSE_JUAN,
    MOCK_RESPONSE_SENTENCIA,
)

load_dotenv()

app = FastAPI(
    title="PUENTE API",
    description="API para accesibilidad cognitiva en la justicia",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

TERMINOS_JUDICIALES_RE = re.compile(
    r"\b(juzgado|citaci[oó]n|cita|comparezca|comparecer|procedimiento|diligencias|juicio|testigo|"
    r"investigad[oa]|demandad[oa]|demandante|vista|declaraci[oó]n|tribunal|audiencia|letrad[oa]|"
    r"fiscal|sentencia|fallo|absuelvo|absolver|condeno|hurto|notificaci[oó]n|c[eé]dula|autos|"
    r"expediente|delito|instrucci[oó]n|penal|civil|denuncia|querella|recurso)\b",
    re.IGNORECASE,
)

INICIO_PREGUNTA_RE = re.compile(
    r"^[¿\s]*(qu[eé]|qui[eé]n|qui[eé]nes|c[oó]mo|cu[aá]ndo|d[oó]nde|cu[aá]nto|cu[aá]nta|cu[aá]ntos|cu[aá]ntas|"
    r"por\s+qu[eé]|para\s+qu[eé]|cu[aá]l|cu[aá]les|acaso|no\s+es|es\s+cierto|puede|puedes|podr[ií]a|"
    r"vio|viste|estaba|estabas|hab[ií]a|conoce|conoces|recuerda|recuerdas|fue|era|tiene|tienes|"
    r"hizo|hiciste|dijo|dijiste|sabe|sabes|escuch[oó]|escuchaste|firm[oó]|firmaste)\b",
    re.IGNORECASE,
)


class CitacionInput(BaseModel):
    texto: str
    perfil: Optional[str] = None

    @field_validator("texto")
    @classmethod
    def validar_texto(cls, v: str) -> str:
        limpio = v.strip()
        solo_letras = re.sub(r"[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜçÇ]", "", limpio)
        if len(limpio) < 30 or len(solo_letras) < 20:
            raise ValueError("El texto del documento judicial es demasiado corto.")
        if not TERMINOS_JUDICIALES_RE.search(limpio):
            raise ValueError("El texto no parece una citación ni una sentencia judicial.")
        return limpio[:8000]


class PlazoItem(BaseModel):
    descripcion: str
    fecha: str
    dias_restantes: int

    @field_validator("descripcion")
    @classmethod
    def validar_descripcion(cls, v: str) -> str:
        limpio = v.strip()
        if not limpio:
            raise ValueError("La descripción del plazo no puede estar vacía.")
        return limpio[:200]

    @field_validator("fecha")
    @classmethod
    def validar_fecha(cls, v: str) -> str:
        limpio = v.strip()
        try:
            datetime.strptime(limpio, "%Y-%m-%d")
        except ValueError:
            raise ValueError("La fecha debe tener formato YYYY-MM-DD.")
        return limpio

    @field_validator("dias_restantes")
    @classmethod
    def validar_dias(cls, v: int) -> int:
        return max(0, v)


class ElementoProtegidoItem(BaseModel):
    tipo: str
    marcador: str
    valor_protegido: str


class AnonimizacionInput(BaseModel):
    texto: str


class AnonimizacionResponse(BaseModel):
    texto_anonimizado: str
    art_rgpd: str
    garantia: str
    total_protegidos: int
    elementos_protegidos: List[ElementoProtegidoItem]


class CitacionResponse(BaseModel):
    datos_clave: dict
    lectura_clara: str
    lectura_facil: str
    plazos: List[PlazoItem]
    pictogram_keywords: List[str]
    pictogramas: List[dict]


class PreguntaInput(BaseModel):
    pregunta: str
    perfil: Optional[str] = None

    @field_validator("pregunta")
    @classmethod
    def validar_pregunta(cls, v: str) -> str:
        limpia = v.strip()
        solo_letras = re.sub(r"[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜçÇ]", "", limpia)
        palabras = [p for p in re.split(r"\s+", limpia) if p]
        if len(limpia) < 6 or len(solo_letras) < 4 or len(palabras) < 2:
            raise ValueError("Escribe una pregunta completa con al menos dos palabras.")
        tiene_interrogacion = "?" in limpia or "¿" in limpia
        if not tiene_interrogacion and not INICIO_PREGUNTA_RE.search(limpia):
            raise ValueError(
                "El texto no parece una pregunta. Añade signos de interrogación «¿?» o empieza por qué, cómo, cuándo, dónde..."
            )
        return limpia[:500]


class PreguntaResponse(BaseModel):
    original: str
    semaforo: str
    problemas: List[str]
    impacto_cognitivo: str
    reformulada: Optional[str] = None
    preguntas_divididas: List[str] = []
    consejos: List[str] = []


class PasaporteInput(BaseModel):
    nombre: str
    necesidades: List[str] = []
    ajustes_solicitados: List[str]
    contacto_emergencia: Optional[str] = None

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, v: str) -> str:
        limpio = v.strip()
        if not re.match(r"^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜçÇ\s'\-]{2,60}$", limpio):
            raise ValueError("El nombre solo puede contener letras y espacios (entre 2 y 60 caracteres).")
        solo_letras = re.sub(r"[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜçÇ]", "", limpio)
        if len(solo_letras) < 2 or re.match(r"^(.)\1+$", solo_letras, re.IGNORECASE):
            raise ValueError("Introduce un nombre válido.")
        return limpio

    @field_validator("ajustes_solicitados")
    @classmethod
    def validar_ajustes(cls, v: List[str]) -> List[str]:
        limpios = [item.strip() for item in v if item and item.strip()]
        if not limpios:
            raise ValueError("Debes seleccionar al menos un ajuste.")
        return limpios[:15]

    @field_validator("contacto_emergencia")
    @classmethod
    def validar_contacto(cls, v: Optional[str]) -> Optional[str]:
        if v is None or not v.strip():
            return None
        limpio = v.strip()
        if not re.match(r"^\+?[\d\s]{9,18}$", limpio):
            raise ValueError("El contacto de emergencia debe ser un teléfono válido (solo números y espacios).")
        digitos = re.sub(r"\D", "", limpio)
        if not (9 <= len(digitos) <= 15) or re.match(r"^(\d)\1+$", digitos):
            raise ValueError("Introduce un número de teléfono válido (entre 9 y 15 dígitos).")
        if not limpio.startswith("+") and not re.match(r"^[6789]\d{8}$", digitos):
            raise ValueError("Los teléfonos en España deben empezar por 6, 7, 8 o 9 y tener 9 cifras.")
        return limpio


class PasaporteResponse(BaseModel):
    id: str
    qr_url: str
    marca: str


class TtsInput(BaseModel):
    texto: str

    @field_validator("texto")
    @classmethod
    def validar_texto_tts(cls, v: str) -> str:
        limpio = sanitizar_texto(v)
        if not limpio:
            raise ValueError("El texto para voz no puede estar vacío.")
        if len(limpio) > MAX_CARACTERES:
            raise ValueError(f"El texto supera el límite de {MAX_CARACTERES} caracteres.")
        return limpio


@app.get("/")
async def root():
    return {"mensaje": "PUENTE API - Accesibilidad cognitiva para la justicia"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/extraer-texto")
async def extraer_texto_endpoint(archivo: UploadFile = File(...)):
    """
    Extrae el texto de un documento judicial (PDF, DOCX o TXT).
    No almacena el documento en disco (minimización de datos y privacidad RGPD).
    """
    if not archivo.filename:
        raise HTTPException(status_code=400, detail="Debes seleccionar un archivo.")

    contenido = await archivo.read()
    if not contenido:
        raise HTTPException(status_code=400, detail="El archivo está vacío.")

    if len(contenido) > 15 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="El archivo supera el tamaño máximo permitido (15 MB).",
        )

    try:
        texto, paginas = extraer_texto_documento(contenido, archivo.filename)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"No se pudo procesar el documento: {str(exc)}",
        ) from exc

    return {
        "texto": texto,
        "nombre": archivo.filename,
        "paginas": paginas,
        "caracteres": len(texto),
    }


class VozInput(BaseModel):
    texto: str

    @field_validator("texto")
    @classmethod
    def validar_texto_voz(cls, v: str) -> str:
        limpio = (v or "").strip()
        if len(limpio) > 500:
            raise ValueError("El texto de voz es demasiado largo.")
        return limpio


@app.post("/api/voz/interpretar")
async def voz_interpretar(input_data: VozInput):
    """
    Interpreta una petición hablada (MOCK por keywords).
    TODO(Gemini): sustituir el cuerpo por LLM manteniendo el mismo JSON.
    """
    return interpretar_peticion(input_data.texto)


class AyudaInput(BaseModel):
    pregunta: str

    @field_validator("pregunta")
    @classmethod
    def validar_pregunta_ayuda(cls, v: str) -> str:
        limpio = (v or "").strip()
        if len(limpio) < 2:
            raise ValueError("Escribe o dicta tu duda (al menos 2 caracteres).")
        if len(limpio) > 800:
            raise ValueError("La pregunta es demasiado larga. Acórtala un poco.")
        return limpio


class AyudaResponse(BaseModel):
    respuesta: str
    fuente: str  # "gemini" | "mock"


@app.post("/api/ayuda/preguntar", response_model=AyudaResponse)
async def ayuda_preguntar(input_data: AyudaInput):
    """
    Chat de dudas sobre citación, Pasaporte, Ensaya, Sala Previa, modo con voz.
    Gemini si hay GEMINI_API_KEY; si no, respuestas mock calmadas.
    Nunca diagnóstico médico ni datos sensibles de salud.
    """
    resultado = await responder_ayuda(input_data.pregunta)
    return AyudaResponse(**resultado)


@app.post("/api/tts")
async def tts_post(input_data: TtsInput):
    """
    Sintetiza voz natural (edge-tts, es-ES-ElviraNeural) y devuelve audio/mpeg.
    Gratuito; no consume cuota de Gemini/OpenAI.
    """
    try:
        audio = await sintetizar_mp3(input_data.texto)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="No se pudo generar la voz. Prueba de nuevo en unos segundos.",
        ) from exc
    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "private, max-age=3600",
            "Content-Disposition": "inline; filename=voz.mp3",
        },
    )


@app.get("/api/tts")
async def tts_get(texto: str = ""):
    """GET con texto corto: útil para pruebas rápidas (curl / smoke)."""
    limpio = sanitizar_texto(texto)
    if not limpio:
        raise HTTPException(status_code=400, detail="El texto para voz no puede estar vacío.")
    if len(limpio) > MAX_CARACTERES:
        raise HTTPException(
            status_code=400,
            detail=f"El texto supera el límite de {MAX_CARACTERES} caracteres.",
        )
    try:
        audio = await sintetizar_mp3(limpio)
    except Exception as exc:
        raise HTTPException(
            status_code=502,
            detail="No se pudo generar la voz. Prueba de nuevo en unos segundos.",
        ) from exc
    return Response(
        content=audio,
        media_type="audio/mpeg",
        headers={
            "Cache-Control": "private, max-age=3600",
            "Content-Disposition": "inline; filename=voz.mp3",
        },
    )


@app.post("/api/anonimizar", response_model=AnonimizacionResponse)
async def anonimizar_endpoint(input_data: AnonimizacionInput):
    """
    Anonimiza un texto judicial eliminando DNI, nombres, domicilios, teléfonos y emails.
    Garantía de privacidad RGPD art. 25 antes de cualquier procesamiento externo o con IA.
    """
    texto_anonimizado, elementos_protegidos = anonimizar_documento_judicial(input_data.texto)
    return AnonimizacionResponse(
        texto_anonimizado=texto_anonimizado,
        art_rgpd="Artículo 25 RGPD (Privacidad desde el diseño) y Minimización de Datos",
        garantia="Tus datos personales identificativos fueron detectados y anonimizados en local antes de cualquier llamada a la IA.",
        total_protegidos=len(elementos_protegidos),
        elementos_protegidos=elementos_protegidos,
    )


@app.post("/api/procesar-citacion", response_model=CitacionResponse)
async def procesar_citacion_endpoint(input_data: CitacionInput):
    """
    Procesa una citación o sentencia judicial y devuelve versiones accesibles
    (lenguaje claro, lectura fácil UNE 153101, apoyo numérico para discalculia y pictogramas).
    Anonimiza datos personales en local antes de cualquier llamada a LLM.
    """
    texto = input_data.texto.strip()
    texto_min = texto.lower()

    # Comprobar si coincide con los ejemplos exactos o emblemáticos precargados
    es_ejemplo_sentencia = (
        ("318/2026" in texto_min and "sentencia" in texto_min)
        or texto_min == MOCK_SENTENCIA.strip().lower()
    )
    es_ejemplo_juan = (
        ("892/2026" in texto_min and "juan martínez" in texto_min)
        or texto_min == MOCK_CITACION_JUAN.strip().lower()
    )
    es_ejemplo_luis = (
        ("245/2026" in texto_min and "luis garcía" in texto_min)
        or texto_min == MOCK_CITACION_LUIS.strip().lower()
    )

    if es_ejemplo_sentencia:
        resultado = json.loads(json.dumps(MOCK_RESPONSE_SENTENCIA))
    elif es_ejemplo_juan:
        resultado = json.loads(json.dumps(MOCK_RESPONSE_JUAN))
    elif es_ejemplo_luis:
        resultado = json.loads(json.dumps(MOCK_RESPONSE_LUIS))
    else:
        resultado = await procesar_citacion(texto, input_data.perfil)

    # Garantizar que los datos de privacidad RGPD estén siempre presentes
    if "privacidad_rgpd" not in resultado.setdefault("datos_clave", {}):
        _, elementos_protegidos = anonimizar_documento_judicial(texto)
        resultado["datos_clave"]["privacidad_rgpd"] = {
            "anonimizado_antes_de_ia": True,
            "art_rgpd": "Artículo 25 RGPD (Privacidad desde el diseño) y Minimización de Datos",
            "garantia": "Tus datos personales identificativos (DNI, nombres, domicilios) se detectaron y anonimizaron en local antes de ser procesados por la IA.",
            "total_protegidos": len(elementos_protegidos),
            "elementos_protegidos": elementos_protegidos,
        }

    pictogramas = await obtener_pictogramas(resultado["pictogram_keywords"])
    resultado["pictogramas"] = pictogramas

    return CitacionResponse(**resultado)


@app.post("/api/procesar-documento", response_model=CitacionResponse)
async def procesar_documento_endpoint(
    archivo: UploadFile = File(...),
    perfil: Optional[str] = Form(None),
):
    """
    Endpoint 'todo-en-uno': recibe directamente un archivo PDF, DOCX o TXT,
    extrae el texto y devuelve la citación/sentencia explicada.
    """
    contenido = await archivo.read()
    if not contenido:
        raise HTTPException(status_code=400, detail="El archivo está vacío.")

    try:
        texto, _ = extraer_texto_documento(contenido, archivo.filename)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    input_data = CitacionInput(texto=texto, perfil=perfil)
    return await procesar_citacion_endpoint(input_data)


@app.post("/api/analizar-pregunta", response_model=PreguntaResponse)
async def analizar_pregunta_endpoint(input_data: PreguntaInput):
    """
    Analiza una pregunta de interrogatorio judicial y devuelve su evaluación de claridad,
    el impacto cognitivo y una reformulación lista para leer en lectura fácil.
    """
    analisis = await analizar_pregunta(input_data.pregunta, input_data.perfil)
    return PreguntaResponse(**analisis)


@app.post("/api/generar-ics")
async def generar_calendario(plazos: List[PlazoItem], titulo: str = "Citación Judicial"):
    """Genera un archivo .ics con los plazos y recordatorios."""
    if not plazos:
        raise HTTPException(
            status_code=400,
            detail="Debes incluir al menos un plazo para generar el calendario.",
        )
    ics_content = generar_ics(plazos, titulo)
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": "attachment; filename=citacion_puente.ics"},
    )


@app.post("/api/pasaporte", response_model=PasaporteResponse)
async def crear_pasaporte(input_data: PasaporteInput):
    """Crea un Pasaporte de Ajustes con QR."""
    import uuid
    import qrcode
    import base64
    from io import BytesIO
    from urllib.parse import urlencode

    pasaporte_id = str(uuid.uuid4())[:8].upper()
    marca = f"Persona con necesidades de ajuste: {', '.join(input_data.ajustes_solicitados[:3])}"

    frontend_base = os.getenv("FRONTEND_URL", "http://localhost:3000").rstrip("/")
    query = {
        "id": pasaporte_id,
        "n": input_data.nombre,
        "a": ",".join(input_data.ajustes_solicitados),
    }
    if input_data.contacto_emergencia:
        query["c"] = input_data.contacto_emergencia
    qr_data = f"{frontend_base}/pasaporte/ver?{urlencode(query)}"
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(qr_data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#1e3a5f", back_color="white")

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()

    return PasaporteResponse(
        id=pasaporte_id,
        qr_url=f"data:image/png;base64,{qr_base64}",
        marca=marca,
    )


@app.get("/api/fases-judiciales/{orden}")
async def obtener_fases(orden: str):
    """Devuelve las fases del proceso judicial según el orden jurisdiccional."""
    from .mock_data import FASES_JUDICIALES

    if orden not in FASES_JUDICIALES:
        raise HTTPException(status_code=404, detail=f"Orden '{orden}' no encontrado")

    return FASES_JUDICIALES[orden]


@app.get("/api/roles-judiciales")
async def obtener_roles():
    """Devuelve información sobre los roles en un proceso judicial."""
    from .mock_data import ROLES_JUDICIALES

    return ROLES_JUDICIALES


@app.get("/api/demo/luis")
async def demo_luis():
    """Devuelve los datos del caso de Luis (TEA, testigo)."""
    return {
        "citacion": MOCK_CITACION_LUIS,
        "respuesta": MOCK_RESPONSE_LUIS,
        "perfil": {
            "nombre": "Luis",
            "edad": 28,
            "condicion": "TEA nivel 1",
            "rol": "testigo",
            "necesidades": [
                "Lenguaje literal, sin metáforas",
                "Anticipar cada paso",
                "Ambiente tranquilo",
                "Preguntas concretas",
            ],
        },
    }


@app.get("/api/demo/juan")
async def demo_juan():
    """Devuelve los datos del caso de Juan (TDAH + ceguera, investigado)."""
    return {
        "citacion": MOCK_CITACION_JUAN,
        "respuesta": MOCK_RESPONSE_JUAN,
        "perfil": {
            "nombre": "Juan",
            "edad": 32,
            "condicion": "TDAH combinado y ceguera",
            "rol": "investigado",
            "necesidades": [
                "Información por voz",
                "Textos en bloques cortos",
                "Pausas frecuentes",
                "Descripción de documentos visuales",
            ],
        },
    }


@app.get("/api/demo/sentencia")
async def demo_sentencia():
    """Devuelve un ejemplo de sentencia penal adaptada a lectura fácil."""
    return {
        "sentencia": MOCK_SENTENCIA,
        "respuesta": MOCK_RESPONSE_SENTENCIA,
    }
