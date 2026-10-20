"""
Generación de archivos .ics para recordatorios de plazos judiciales.
"""

from ics import Calendar, Event
from datetime import datetime, timedelta
from typing import List


def generar_ics(plazos: List[dict], titulo: str = "Citación Judicial") -> str:
    cal = Calendar()
    
    for plazo in plazos:
        evento = Event()
        evento.name = f"PUENTE: {plazo['descripcion']}"
        
        fecha = datetime.strptime(plazo["fecha"], "%Y-%m-%d")
        evento.begin = fecha.replace(hour=8, minute=0)
        evento.duration = timedelta(hours=1)
        evento.description = f"{titulo}\n\n{plazo['descripcion']}"
        
        cal.events.add(evento)
        
        for dias_antes in [7, 2, 1]:
            if plazo["dias_restantes"] > dias_antes:
                recordatorio = Event()
                recordatorio.name = f"Recordatorio: {plazo['descripcion']} en {dias_antes} días"
                recordatorio.begin = (fecha - timedelta(days=dias_antes)).replace(hour=10, minute=0)
                recordatorio.duration = timedelta(minutes=30)
                cal.events.add(recordatorio)
    
    return str(cal)
