"""
Generación de archivos .ics para recordatorios de plazos judiciales.
Implementación con zona horaria Europe/Madrid y cálculo dinámico de días.
"""

from datetime import datetime, timedelta
from typing import Any, List, Optional
import re
import uuid


def _limpiar_texto_ics(valor: str) -> str:
    return re.sub(r"[\r\n]+", " ", str(valor or "")).strip()[:200]


def generar_ics(
    plazos: List[Any],
    titulo: str = "Citación Judicial",
    hora_defecto: Optional[str] = None,
) -> str:
    titulo_limpio = _limpiar_texto_ics(titulo) or "Citación Judicial"
    tzid = "Europe/Madrid"
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//InclusiveCourt//Accesibilidad Justicia//ES",
        "CALSCALE:GREGORIAN",
        "METHOD:PUBLISH",
        "BEGIN:VTIMEZONE",
        f"TZID:{tzid}",
        "BEGIN:STANDARD",
        "DTSTART:19701025T030000",
        "RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU",
        "TZOFFSETFROM:+0200",
        "TZOFFSETTO:+0100",
        "TZNAME:CET",
        "END:STANDARD",
        "BEGIN:DAYLIGHT",
        "DTSTART:19700329T020000",
        "RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU",
        "TZOFFSETFROM:+0100",
        "TZOFFSETTO:+0200",
        "TZNAME:CEST",
        "END:DAYLIGHT",
        "END:VTIMEZONE",
    ]

    hoy = datetime.now().date()

    for item in plazos:
        plazo = item.model_dump() if hasattr(item, "model_dump") else dict(item)
        fecha_str = plazo.get("fecha", "")
        if not fecha_str:
            continue
        try:
            fecha = datetime.strptime(fecha_str, "%Y-%m-%d")
        except ValueError:
            continue

        descripcion = _limpiar_texto_ics(plazo.get("descripcion", "Plazo judicial"))

        # Cálculo dinámico de días restantes
        dias_restantes = max(0, (fecha.date() - hoy).days)

        # Parsear hora específica si viene en el plazo o por parámetro
        hora_candidata = str(plazo.get("hora") or hora_defecto or "")
        hora_match = re.search(r"\b([012]?\d):([0-5]\d)\b", hora_candidata)
        if hora_match:
            hora_num = int(hora_match.group(1))
            min_num = int(hora_match.group(2))
        else:
            hora_num = 10
            min_num = 0

        fecha_inicio = fecha.replace(hour=hora_num, minute=min_num)
        fecha_fin = fecha_inicio + timedelta(hours=1)

        uid = str(uuid.uuid4())
        dtstamp = datetime.now().strftime("%Y%m%dT%H%M%SZ")

        lines.extend([
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{dtstamp}",
            f"DTSTART;TZID={tzid}:{fecha_inicio.strftime('%Y%m%dT%H%M%S')}",
            f"DTEND;TZID={tzid}:{fecha_fin.strftime('%Y%m%dT%H%M%S')}",
            f"SUMMARY:InclusiveCourt: {descripcion}",
            f"DESCRIPTION:{titulo_limpio} - Recuerda llevar tu DNI y tu Pasaporte de Ajustes.",
            "END:VEVENT",
        ])

        # Recordatorio preventivo de solicitud de ajustes (5 días antes)
        if dias_restantes > 5:
            fecha_ajustes = fecha - timedelta(days=5)
            uid_ajustes = str(uuid.uuid4())
            lines.extend([
                "BEGIN:VEVENT",
                f"UID:{uid_ajustes}",
                f"DTSTAMP:{dtstamp}",
                f"DTSTART;TZID={tzid}:{fecha_ajustes.replace(hour=9, minute=0).strftime('%Y%m%dT%H%M%S')}",
                f"DTEND;TZID={tzid}:{fecha_ajustes.replace(hour=9, minute=30).strftime('%Y%m%dT%H%M%S')}",
                "SUMMARY:Recordatorio: Solicitar ajustes en el juzgado con antelación",
                f"DESCRIPTION:Pide con antelación los ajustes que necesites (sala tranquila, pausas, acompañante) según el art. 7 bis LEC para {descripcion}.",
                "END:VEVENT",
            ])

        for dias_antes in [7, 2, 1]:
            if dias_restantes > dias_antes:
                fecha_recordatorio = fecha - timedelta(days=dias_antes)
                uid_rec = str(uuid.uuid4())
                lines.extend([
                    "BEGIN:VEVENT",
                    f"UID:{uid_rec}",
                    f"DTSTAMP:{dtstamp}",
                    f"DTSTART;TZID={tzid}:{fecha_recordatorio.replace(hour=10, minute=0).strftime('%Y%m%dT%H%M%S')}",
                    f"DTEND;TZID={tzid}:{fecha_recordatorio.replace(hour=10, minute=30).strftime('%Y%m%dT%H%M%S')}",
                    f"SUMMARY:Recordatorio: {descripcion} en {dias_antes} días",
                    f"DESCRIPTION:Recordatorio de {titulo_limpio}",
                    "END:VEVENT",
                ])

    lines.append("END:VCALENDAR")
    return "\r\n".join(lines)
