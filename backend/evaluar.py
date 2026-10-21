"""
Script de evaluación y benchmark objetivo para el DATAthon Justicia 2026.
Mide de forma reproducible la precisión de extracción, cobertura de anonimización
e incremento de legibilidad (Fernández-Huerta) sobre el conjunto de prueba.
"""

import asyncio
import json
import os
import re
from typing import Dict, List, Any

from backend.datos_evaluacion import CASOS_EVALUACION
from backend.app.anonimizador import anonimizar_documento_judicial
from backend.app.llm import procesar_citacion
from backend.app.metricas import comparar_legibilidad


async def ejecutar_evaluacion() -> Dict[str, Any]:
    total_casos = len(CASOS_EVALUACION)
    aciertos_rol = 0
    aciertos_organo = 0
    aciertos_fecha = 0
    aciertos_hora = 0
    total_pii_esperada = 0
    pii_correctamente_protegida = 0
    mejoras_legibilidad: List[float] = []

    resultados_detallados = []

    for caso in CASOS_EVALUACION:
        texto = caso["texto"]
        caso_id = caso["id"]

        # 1. Evaluación de anonimización local
        texto_anon, elementos = anonimizar_documento_judicial(texto)
        for pii in caso["pii_presente"]:
            total_pii_esperada += 1
            if pii.lower() not in texto_anon.lower():
                pii_correctamente_protegida += 1

        # 2. Extracción y procesamiento
        resultado = await procesar_citacion(texto)
        datos = resultado.get("datos_clave", {})

        # Validación rol
        rol_obtenido = datos.get("rol", "").lower()
        rol_esperado = caso["rol_esperado"]
        acierto_rol = bool(re.search(rol_esperado, rol_obtenido, re.I))
        if acierto_rol:
            aciertos_rol += 1

        # Validación órgano
        organo_obtenido = (datos.get("organo") or datos.get("lugar", "")).lower()
        organo_esperado = caso["organo_esperado_contiene"].lower()
        acierto_organo = bool(organo_esperado in organo_obtenido)
        if acierto_organo:
            aciertos_organo += 1

        # Validación fecha
        fecha_obtenida = datos.get("fecha", "").lower()
        fecha_esperada = caso["fecha_esperada_contiene"].lower()
        acierto_fecha = bool(fecha_esperada in fecha_obtenida)
        if acierto_fecha:
            aciertos_fecha += 1

        # Validación hora
        hora_obtenida = datos.get("hora")
        hora_esperada = caso["hora_esperada"]
        if hora_esperada is None:
            acierto_hora = True
            aciertos_hora += 1
        else:
            acierto_hora = bool(hora_obtenida == hora_esperada)
            if acierto_hora:
                aciertos_hora += 1

        # 3. Legibilidad
        adaptado = resultado.get("lectura_facil") or resultado.get("lectura_clara", "")
        comp = comparar_legibilidad(texto, adaptado)
        mejoras_legibilidad.append(comp["incremento_puntos"])

        resultados_detallados.append({
            "id": caso_id,
            "acierto_rol": acierto_rol,
            "acierto_organo": acierto_organo,
            "acierto_fecha": acierto_fecha,
            "acierto_hora": acierto_hora,
            "legibilidad_orig": comp["original"]["score"],
            "legibilidad_adap": comp["adaptado"]["score"],
            "ganancia_legibilidad": comp["incremento_puntos"],
        })

    tasa_rol = round((aciertos_rol / total_casos) * 100, 1)
    tasa_organo = round((aciertos_organo / total_casos) * 100, 1)
    tasa_fecha = round((aciertos_fecha / total_casos) * 100, 1)
    tasa_hora = round((aciertos_hora / total_casos) * 100, 1)
    tasa_pii = round((pii_correctamente_protegida / max(1, total_pii_esperada)) * 100, 1)
    media_ganancia_legibilidad = round(sum(mejoras_legibilidad) / len(mejoras_legibilidad), 1)

    precision_global = round(
        (tasa_rol + tasa_organo + tasa_fecha + tasa_hora + tasa_pii) / 5.0, 1
    )

    informe = {
        "total_casos_evaluados": total_casos,
        "precision_global": precision_global,
        "metricas": {
            "extraccion_rol": f"{tasa_rol}% ({aciertos_rol}/{total_casos})",
            "extraccion_organo": f"{tasa_organo}% ({aciertos_organo}/{total_casos})",
            "extraccion_fecha": f"{tasa_fecha}% ({aciertos_fecha}/{total_casos})",
            "extraccion_hora": f"{tasa_hora}% ({aciertos_hora}/{total_casos})",
            "cobertura_anonimizacion_rgpd": f"{tasa_pii}% ({pii_correctamente_protegida}/{total_pii_esperada} elementos)",
            "ganancia_media_legibilidad_fernandez_huerta": f"+{media_ganancia_legibilidad} puntos",
        },
        "detalles": resultados_detallados,
    }

    return informe


def imprimir_tabla(informe: Dict[str, Any]):
    print("\n" + "=" * 70)
    print("  PUENTE — INFORME DE EVALUACIÓN Y CALIDAD OBJETIVA (Reto 3)")
    print("=" * 70)
    print(f"Casos evaluados: {informe['total_casos_evaluados']}")
    print(f"Precisión global ponderada: {informe['precision_global']}%\n")
    print("MÉTRICAS POR DIMENSIÓN:")
    for k, v in informe["metricas"].items():
        nombre = k.replace("_", " ").capitalize()
        print(f"  • {nombre:45}: {v}")
    print("=" * 70 + "\n")


if __name__ == "__main__":
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    res = loop.run_until_complete(ejecutar_evaluacion())
    imprimir_tabla(res)

    ruta_salida = os.path.join(os.path.dirname(__file__), "evaluacion_resultados.json")
    with open(ruta_salida, "w", encoding="utf-8") as f:
        json.dump(res, f, ensure_ascii=False, indent=2)
    print(f"Resultados guardados en: {ruta_salida}")
