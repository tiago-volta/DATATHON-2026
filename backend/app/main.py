"""
PUENTE Backend API
Minimal FastAPI backend for the DATAthon Justicia 2026 hackathon.
Mock-first approach with optional LLM integration.
"""

from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv

from .llm import procesar_citacion
from .arasaac import obtener_pictogramas
from .calendario import generar_ics
from .mock_data import MOCK_CITACION_LUIS, MOCK_CITACION_JUAN, MOCK_RESPONSE_LUIS, MOCK_RESPONSE_JUAN

load_dotenv()

app = FastAPI(
    title="PUENTE API",
    description="API para accesibilidad cognitiva en la justicia",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class CitacionInput(BaseModel):
    texto: str
    perfil: Optional[str] = None  # "tea", "tdah", "dislexia", "ceguera", etc.


class PlazoItem(BaseModel):
    descripcion: str
    fecha: str
    dias_restantes: int


class CitacionResponse(BaseModel):
    datos_clave: dict
    lectura_clara: str
    lectura_facil: str
    plazos: List[PlazoItem]
    pictogram_keywords: List[str]
    pictogramas: List[dict]


class PasaporteInput(BaseModel):
    nombre: str
    necesidades: List[str]
    ajustes_solicitados: List[str]
    contacto_emergencia: Optional[str] = None


class PasaporteResponse(BaseModel):
    id: str
    qr_url: str
    marca: str


@app.get("/")
async def root():
    return {"mensaje": "PUENTE API - Accesibilidad cognitiva para la justicia"}


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/procesar-citacion", response_model=CitacionResponse)
async def procesar_citacion_endpoint(input_data: CitacionInput):
    """
    Procesa una citación judicial y devuelve versiones accesibles.
    Con mock activado, detecta si es el caso de Luis o Juan.
    """
    texto = input_data.texto.lower()
    
    # Detectar si es un caso de demo (Luis o Juan)
    if "luis" in texto or "testigo" in texto.lower() or "tea" in input_data.perfil.lower() if input_data.perfil else False:
        resultado = MOCK_RESPONSE_LUIS
    elif "juan" in texto or "investigado" in texto or "estafa" in texto:
        resultado = MOCK_RESPONSE_JUAN
    else:
        # Intentar procesar con LLM si hay API key
        provider = os.getenv("LLM_PROVIDER", "mock")
        if provider != "mock" and (os.getenv("OPENAI_API_KEY") or os.getenv("ANTHROPIC_API_KEY")):
            resultado = await procesar_citacion(input_data.texto, input_data.perfil)
        else:
            resultado = MOCK_RESPONSE_LUIS
    
    # Obtener pictogramas de ARASAAC
    pictogramas = await obtener_pictogramas(resultado["pictogram_keywords"])
    resultado["pictogramas"] = pictogramas
    
    return CitacionResponse(**resultado)


@app.post("/api/generar-ics")
async def generar_calendario(plazos: List[PlazoItem], titulo: str = "Citación Judicial"):
    """Genera un archivo .ics con los plazos y recordatorios."""
    ics_content = generar_ics(plazos, titulo)
    return Response(
        content=ics_content,
        media_type="text/calendar",
        headers={"Content-Disposition": f"attachment; filename=citacion_puente.ics"}
    )


@app.post("/api/pasaporte", response_model=PasaporteResponse)
async def crear_pasaporte(input_data: PasaporteInput):
    """Crea un Pasaporte de Ajustes con QR."""
    import uuid
    import qrcode
    import base64
    from io import BytesIO
    
    pasaporte_id = str(uuid.uuid4())[:8]
    
    # Generar marca (sin diagnóstico)
    marca = f"Persona con necesidades de ajuste: {', '.join(input_data.ajustes_solicitados[:3])}"
    
    # Generar QR
    qr_data = f"PUENTE:{pasaporte_id}"
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
        marca=marca
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
    """Devuelve los datos de demo de Luis (TEA, testigo)."""
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
                "Preguntas concretas"
            ]
        }
    }


@app.get("/api/demo/juan")
async def demo_juan():
    """Devuelve los datos de demo de Juan (TDAH + ceguera, investigado)."""
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
                "Descripción de documentos visuales"
            ]
        }
    }
