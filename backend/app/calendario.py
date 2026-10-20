"""
Generación de archivos .ics para recordatorios de plazos judiciales.
Implementación simple sin dependencias externas.
"""

from datetime import datetime, timedelta
from typing import List
import uuid


def generar_ics(plazos: List[dict], titulo: str = "Citación Judicial") -> str:
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//PUENTE//Accesibilidad Justicia//ES",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
    ]
    
    for plazo in plazos:
        fecha = datetime.strptime(plazo["fecha"], "%Y-%m-%d")
        fecha_inicio = fecha.replace(hour=8, minute=0)
        fecha_fin = fecha.replace(hour=9, minute=0)
        
        uid = str(uuid.uuid4())
        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{datetime.now().strftime('%Y%m%dT%H%M%SZ')}",
            f"DTSTART:{fecha_inicio.strftime('%Y%m%dT%H%M%S')}",
            f"DTEND:{fecha_fin.strftime('%Y%m%dT%H%M%S')}",
            f"SUMMARY:PUENTE: {plazo['descripcion']}",
            f"DESCRIPTION:{titulo}",
            "END:VEVENT",
        ])
        
        for dias_antes in [7, 2, 1]:
            if plazo.get("dias_restantes", 0) > dias_antes:
                fecha_recordatorio = fecha - timedelta(days=dias_antes)
                uid_rec = str(uuid.uuid4())
                lines.extend([
                    "BEGIN:VEVENT",
                    f"UID:{uid_rec}",
                    f"DTSTAMP:{datetime.now().strftime('%Y%m%dT%H%M%SZ')}",
                    f"DTSTART:{fecha_recordatorio.replace(hour=10).strftime('%Y%m%dT%H%M%S')}",
                    f"DTEND:{fecha_recordatorio.replace(hour=10, minute=30).strftime('%Y%m%dT%H%M%S')}",
                    f"SUMMARY:Recordatorio: {plazo['descripcion']} en {dias_antes} días",
                    f"DESCRIPTION:Recordatorio de {titulo}",
                    "END:VEVENT",
                ])
    
    lines.append("END:VCALENDAR")
    return "\r\n".join(lines)
