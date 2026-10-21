"""
Módulo de métricas de calidad y legibilidad objetiva para PUENTE.
Implementa la fórmula científica de Fernández-Huerta (1959) adaptada para español,
así como indicadores de accesibilidad cognitiva (UNE 153101 / W3C COGA).
"""

import re
from typing import Dict, Any


def contar_silabas_palabra(palabra: str) -> int:
    """
    Cuenta el número aproximado de sílabas de una palabra en español
    considerando vocales, diptongos y acentos en vocales débiles (hiatos).
    """
    p = palabra.lower().strip(",.;:()¿?¡!\"'«»-_")
    p = re.sub(r"[^a-záéíóúüñ]", "", p)
    if not p:
        return 0

    # Vocal cerrada con tilde (í, ú) rompe diptongo (hiato)
    # Vocales fuertes: a, e, o, á, é, ó
    # Vocales débiles: i, u, ü
    grupos = re.findall(r"[aáeéoóíúüiu]+", p)
    total_silabas = len(grupos)

    # Añadir sílaba por hiatos acentuados (ej: dí-a, le-í-do, con-ti-nú-a)
    hiatos_acentuados = len(re.findall(r"[aáeéoó][íú]|[íú][aáeéoó]", p))
    total_silabas += hiatos_acentuados

    # Hiatos formados por dos vocales fuertes contiguas (ej: ca-os, le-er, te-a-tro)
    hiatos_fuertes = len(re.findall(r"[aáeéoó]{2}", p))
    total_silabas += hiatos_fuertes

    return max(1, total_silabas)


def calcular_legibilidad(texto: str) -> Dict[str, Any]:
    """
    Calcula la legibilidad según la fórmula de Fernández-Huerta (1959):
    L = 206.84 - 0.60 * P - 1.02 * F
    Donde:
      P = número de sílabas por cada 100 palabras (densidad léxica)
      F = promedio de palabras por frase (complejidad sintáctica)

    Escala de interpretación:
      90-100: Muy fácil (Lectura fácil UNE 153101 / Primaria)
      80-89:  Fácil (Lenguaje claro)
      70-79:  Bastante fácil
      60-69:  Estándar
      50-59:  Algo difícil
      30-49:  Difícil (Lenguaje administrativo)
      0-29:   Muy difícil (Jerga jurídica procesal compleja)
    """
    limpio = (texto or "").strip()
    if not limpio:
        return {
            "score": 0.0,
            "nivel": "Sin texto",
            "palabras": 0,
            "frases": 0,
            "palabras_por_frase": 0.0,
            "silabas_por_palabra": 0.0,
        }

    # Separación de frases por puntuación o saltos de línea (lectura fácil usa un salto por idea)
    frases_brutas = [f.strip() for f in re.split(r"[.!?¡¿\n]+", limpio) if len(f.strip()) >= 3]
    num_frases = max(1, len(frases_brutas))

    palabras_brutas = [
        p for p in re.split(r"[\s,.;:()\"'«»]+", limpio)
        if len(p) > 0 and re.search(r"[a-zA-ZáéíóúÁÉÍÓÚñÑ]", p)
    ]
    num_palabras = max(1, len(palabras_brutas))

    num_silabas = sum(contar_silabas_palabra(p) for p in palabras_brutas)

    P = (num_silabas / num_palabras) * 100.0
    F = num_palabras / num_frases

    score_raw = 206.84 - (0.60 * P) - (1.02 * F)
    score = round(max(0.0, min(100.0, score_raw)), 1)

    if score >= 80:
        nivel = "Lectura muy fácil (accesible para personas neurodivergentes)"
    elif score >= 65:
        nivel = "Lectura fácil / Lenguaje claro (comprensión inmediata)"
    elif score >= 50:
        nivel = "Dificultad media (estándar)"
    elif score >= 30:
        nivel = "Difícil (lenguaje jurídico tradicional)"
    else:
        nivel = "Muy difícil (jerga procesal compleja)"

    return {
        "score": score,
        "nivel": nivel,
        "palabras": num_palabras,
        "frases": num_frases,
        "palabras_por_frase": round(F, 1),
        "silabas_por_palabra": round(num_silabas / num_palabras, 2),
    }


def comparar_legibilidad(texto_original: str, texto_adaptado: str) -> Dict[str, Any]:
    """
    Compara de forma cuantitativa y reproducible la legibilidad
    del documento original frente a la versión procesada por PUENTE.
    """
    met_orig = calcular_legibilidad(texto_original)
    met_adap = calcular_legibilidad(texto_adaptado)

    diferencia_puntos = round(met_adap["score"] - met_orig["score"], 1)
    
    base_calc = max(1.0, met_orig["score"])
    porcentaje_mejora = round(((met_adap["score"] - met_orig["score"]) / base_calc) * 100.0, 1)

    # Pautas UNE 153101 y W3C COGA: máximo 20 palabras por oración
    cumple_coga = met_adap["palabras_por_frase"] <= 20.0

    return {
        "original": met_orig,
        "adaptado": met_adap,
        "incremento_puntos": max(0.0, diferencia_puntos),
        "porcentaje_mejora": max(0.0, porcentaje_mejora),
        "cumple_coga_longitud_frase": cumple_coga,
        "resumen_impacto": (
            f"La adaptación aumenta la legibilidad en +{diferencia_puntos} puntos "
            f"y reduce la longitud media de {met_orig['palabras_por_frase']} a "
            f"{met_adap['palabras_por_frase']} palabras por oración."
        ),
    }

