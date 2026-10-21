"""
Generación de archivos .ics y cómputo de plazos procesales hábiles (LEC / LOPJ / LECrim).
Implementación con zona horaria Europe/Madrid y exclusión de días inhábiles judiciales.
"""

from datetime import date, datetime, timedelta
from typing import Any, Dict, List, Optional, Set, Tuple
import re
import uuid

# Festivos nacionales fijos oficiales en España (mes, día)
# (Art. 182 LOPJ / Estatuto de los Trabajadores / Calendario laboral BOE)
FESTIVOS_NACIONALES_ESPANA: Set[Tuple[int, int]] = {
    (1, 1),    # Año Nuevo
    (1, 6),    # Epifanía del Señor / Reyes
    (5, 1),    # Fiesta del Trabajo
    (8, 15),   # Asunción de la Virgen
    (10, 12),  # Fiesta Nacional de España
    (11, 1),   # Todos los Santos
    (12, 6),   # Día de la Constitución Española
    (12, 8),   # Inmaculada Concepción
    (12, 25),  # Natividad del Señor
}


def es_dia_habil_procesal(fecha: date, orden: str = "general") -> bool:
    """
    Determina si una fecha es día hábil judicial conforme a la LEC y la LOPJ.
    - Sábados y domingos son inhábiles (Art. 130.1 LEC / Art. 182.1 LOPJ).
    - Festivos nacionales oficiales son inhábiles (Art. 182.1 LOPJ).
    - En el orden civil: el mes de agosto y del 24 de diciembre al 6 de enero
      son inhábiles procesales (Art. 130.2 LEC, tras reforma de conciliación).
    - En penal ordinario (recursos y plazos no urgentes): se excluyen sábados,
      domingos y festivos nacionales (Art. 182 LOPJ / Art. 790.1 LECrim).
    """
    # 1. Sábados (5) y Domingos (6)
    if fecha.weekday() in (5, 6):
        return False

    # 2. Festivos nacionales fijos
    if (fecha.month, fecha.day) in FESTIVOS_NACIONALES_ESPANA:
        return False

    orden_normalizado = (orden or "general").strip().lower()

    # 3. Reglas especiales para el orden civil
    if orden_normalizado == "civil":
        # Mes de agosto completo inhábil (Art. 130.2 LEC)
        if fecha.month == 8:
            return False
        # Periodo navideño inhábil: 24 de diciembre a 6 de enero (Art. 130.2 LEC)
        if (fecha.month == 12 and fecha.day >= 24) or (fecha.month == 1 and fecha.day <= 6):
            return False

    return True


def calcular_dias_habiles_restantes(
    fecha_limite: date,
    fecha_inicio: Optional[date] = None,
    orden: str = "general",
) -> int:
    """
    Calcula los días hábiles judiciales que median entre fecha_inicio y fecha_limite.
    Sigue la regla 'dies a quo non computatur' (el cómputo arranca el día siguiente
    a la notificación o fecha inicial, Arts. 133.1 LEC y 185.1 LOPJ).
    """
    inicio = fecha_inicio or datetime.now().date()
    if fecha_limite <= inicio:
        return 0

    dias_habiles = 0
    actual = inicio + timedelta(days=1)
    while actual <= fecha_limite:
        if es_dia_habil_procesal(actual, orden):
            dias_habiles += 1
        actual += timedelta(days=1)

    return dias_habiles


def calcular_fecha_vencimiento_habil(
    fecha_inicio: date,
    dias_habiles: int,
    orden: str = "penal",
) -> date:
    """
    Calcula la fecha exacta de vencimiento tras transcurrir N días hábiles procesales,
    comenzando a computar el día hábil siguiente a fecha_inicio (Art. 133.1 LEC).
    """
    if dias_habiles <= 0:
        return fecha_inicio

    dias_contados = 0
    actual = fecha_inicio + timedelta(days=1)
    while True:
        if es_dia_habil_procesal(actual, orden):
            dias_contados += 1
            if dias_contados == dias_habiles:
                return actual
        actual += timedelta(days=1)


def calcular_resumen_plazo(
    fecha_inicio: date,
    dias_habiles: int,
    orden: str = "penal",
) -> Dict[str, Any]:
    """
    Devuelve un diccionario estructurado con el desglose del plazo judicial hábil.
    """
    fecha_limite = calcular_fecha_vencimiento_habil(fecha_inicio, dias_habiles, orden)
    hoy = datetime.now().date()
    dias_habiles_restantes = calcular_dias_habiles_restantes(fecha_limite, hoy, orden)
    dias_naturales = max(0, (fecha_limite - hoy).days)

    return {
        "fecha_inicio": fecha_inicio.isoformat(),
        "dias_habiles_totales": dias_habiles,
        "fecha_limite": fecha_limite.isoformat(),
        "dias_habiles_restantes": dias_habiles_restantes,
        "dias_naturales_restantes": dias_naturales,
        "orden_jurisdiccional": orden,
        "fundamento_legal": (
            "Arts. 130 y 133 LEC, Arts. 182 y 185 LOPJ. Excluye sábados, domingos y "
            "festivos procesales de ámbito nacional."
        ),
    }


def _limpiar_texto_ics(valor: str) -> str:
    return re.sub(r"[\r\n]+", " ", str(valor or "")).strip()[:200]


def generar_ics(
    plazos: List[Any],
    titulo: str = "Citación Judicial",
    hora_defecto: Optional[str] = None,
) -> str:
    """
    Genera un calendario estándar iCalendar (RFC 5545) con zona horaria Europe/Madrid
    y eventos de señalamiento junto a recordatorios preventivos de accesibilidad.
    """
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

        # Cálculo dinámico de días naturales y hábiles restantes
        dias_restantes = max(0, (fecha.date() - hoy).days)
        dias_habiles = calcular_dias_habiles_restantes(fecha.date(), hoy)

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
            (
                f"DESCRIPTION:{titulo_limpio} ({dias_habiles} días hábiles judiciales restantes). "
                "Recuerda llevar tu DNI y tu Pasaporte de Ajustes."
            ),
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
                (
                    f"DESCRIPTION:Pide con antelación los ajustes que necesites (sala tranquila, pausas, acompañante) "
                    f"según el art. 7 bis LEC para {descripcion}."
                ),
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
