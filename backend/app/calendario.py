"""
Generación de archivos .ics para recordatorios de plazos judiciales.
Implementación simple sin dependencias externas.
"""

from datetime import datetime, timedelta
from typing import Any, List
import re
import uuid


def _limpiar_texto_ics(valor: str) -> str:
    return re.sub(r"[\r\n]+", " ", str(valor or "")).strip()[:200]


def generar_ics(plazos: List[Any], titulo: str = "Citación Judicial") -> str:
    titulo_limpio = _limpiar_texto_ics(titulo) or "Citación Judicial"
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//PUENTE//Accesibilidad Justicia//ES",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
    ]

    for item in plazos:
        plazo = item.model_dump() if hasattr(item, "model_dump") else dict(item)
        fecha = datetime.strptime(plazo["fecha"], "%Y-%m-%d")
        descripcion = _limpiar_texto_ics(plazo.get("descripcion", "Plazo judicial"))
        dias_restantes = int(plazo.get("dias_restantes", 0) or 0)

        fecha_inicio = fecha.replace(hour=8, minute=0)
        fecha_fin = fecha.replace(hour=9, minute=0)

        uid = str(uuid.uuid4())
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{datetime.now().strftime('%Y%m%dT%H%M%SZ')}",
            f"DTSTART:{fecha_inicio.strftime('%Y%m%dT%H%M%S')}",
            f"DTEND:{fecha_fin.strftime('%Y%m%dT%H%M%S')}",
            f"SUMMARY:PUENTE: {descripcion}",
            f"DESCRIPTION:{titulo_limpio}",
            "END:VEVENT",
        ])

        for dias_antes in [7, 2, 1]:
            if dias_restantes > dias_antes:
                fecha_recordatorio = fecha - timedelta(days=dias_antes)
                uid_rec = str(uuid.uuid4())
                lines.extend([
                    "BEGIN:VEVENT",
                    f"UID:{uid_rec}",
                    f"DTSTAMP:{datetime.now().strftime('%Y%m%dT%H%M%SZ')}",
                    f"DTSTART:{fecha_recordatorio.replace(hour=10).strftime('%Y%m%dT%H%M%S')}",
                    f"DTEND:{fecha_recordatorio.replace(hour=10, minute=30).strftime('%Y%m%dT%H%M%S')}",
                    f"SUMMARY:Recordatorio: {descripcion} en {dias_antes} días",
                    f"DESCRIPTION:Recordatorio de {titulo_limpio}",
                    "END:VEVENT",
                ])

    lines.append("END:VCALENDAR")
    return "\r\n".join(lines)
