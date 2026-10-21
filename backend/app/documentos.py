"""
Utilidades para extracción de texto de documentos judiciales (PDF, DOCX, TXT).
No guarda archivos en disco para garantizar privacidad y minimización de datos (RGPD).
"""

import io
import re
import zipfile
import xml.etree.ElementTree as ET
from typing import Tuple
from pypdf import PdfReader


def extraer_texto_documento(contenido: bytes, nombre_archivo: str) -> Tuple[str, int]:
    """
    Extrae texto de documentos PDF, DOCX o texto plano.
    Devuelve una tupla (texto_extraido, num_paginas).
    Lanza ValueError si el documento está vacío o no contiene texto seleccionable.
    """
    nombre_lower = (nombre_archivo or "").lower()
    num_paginas = 1
    texto = ""

    if nombre_lower.endswith(".pdf") or contenido.startswith(b"%PDF"):
        stream = io.BytesIO(contenido)
        try:
            reader = PdfReader(stream)
            num_paginas = len(reader.pages)
            partes = []
            for i, pagina in enumerate(reader.pages):
                texto_pagina = pagina.extract_text() or ""
                partes.append(texto_pagina.strip())
            texto = "\n\n".join(p for p in partes if p)
        except Exception as e:
            raise ValueError(f"No se pudo leer el archivo PDF: {str(e)}")

        if not texto.strip():
            raise ValueError(
                "El PDF no contiene texto legible (puede tratarse de una imagen escaneada sin capa de texto OCR). "
                "Copia y pega el texto de la citación o usa un documento con texto seleccionable."
            )

    elif nombre_lower.endswith(".docx"):
        try:
            stream = io.BytesIO(contenido)
            with zipfile.ZipFile(stream) as z:
                xml_content = z.read("word/document.xml")
            tree = ET.fromstring(xml_content)
            # Los párrafos de Word usan el namespace w:t
            ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
            textos = [node.text for node in tree.findall(".//w:t", ns) if node.text]
            texto = " ".join(textos)
        except Exception as e:
            raise ValueError(f"No se pudo leer el archivo DOCX: {str(e)}")

    else:
        # Intentar decodificar como texto plano (UTF-8, Latin-1, CP1252)
        for encoding in ("utf-8", "latin-1", "cp1252"):
            try:
                texto = contenido.decode(encoding)
                break
            except UnicodeDecodeError:
                continue
        if not texto:
            texto = contenido.decode("utf-8", errors="ignore")

    # Limpieza básica de caracteres nulos y espacios repetidos
    texto_limpio = texto.replace("\x00", " ")
    texto_limpio = re.sub(r"[ \t]+", " ", texto_limpio)
    texto_limpio = re.sub(r"\n{3,}", "\n\n", texto_limpio).strip()

    if len(texto_limpio) < 20:
        raise ValueError(
            "El archivo contiene muy poco texto. Comprueba que sea una citación o sentencia judicial completa."
        )

    return texto_limpio, num_paginas

