import pytest
from backend.app.calendario import generar_ics


def test_generar_ics_con_hora_y_tzid():
    plazos = [
        {
            "descripcion": "Celebración de vista judicial",
            "fecha": "2026-11-12",
            "dias_restantes": 22,
            "hora": "09:30",
        }
    ]
    ics = generar_ics(plazos, titulo="Juicio por Delito Leve")

    assert "TZID:Europe/Madrid" in ics
    assert "DTSTART;TZID=Europe/Madrid:20261112T093000" in ics
    assert "DTEND;TZID=Europe/Madrid:20261112T103000" in ics
    assert "Solicitar ajustes en el juzgado con antelación" in ics
    assert "art. 7 bis LEC" in ics


def test_generar_ics_sin_hora_especifica_usa_defecto():
    plazos = [
        {
            "descripcion": "Declaración como testigo",
            "fecha": "2026-11-10",
            "dias_restantes": 20,
        }
    ]
    ics = generar_ics(plazos, hora_defecto="10:00")
    assert "DTSTART;TZID=Europe/Madrid:20261110T100000" in ics
    assert "DTEND;TZID=Europe/Madrid:20261110T110000" in ics
