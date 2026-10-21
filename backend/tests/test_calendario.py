from datetime import date
import pytest
from fastapi.testclient import TestClient

from backend.app.calendario import (
    generar_ics,
    es_dia_habil_procesal,
    calcular_dias_habiles_restantes,
    calcular_fecha_vencimiento_habil,
    calcular_resumen_plazo,
)
from backend.app.main import app

client = TestClient(app)


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


def test_es_dia_habil_procesal():
    # Sábado y domingo inhábiles (Art. 130.1 LEC / 182 LOPJ)
    assert not es_dia_habil_procesal(date(2026, 10, 24))  # Sábado
    assert not es_dia_habil_procesal(date(2026, 10, 25))  # Domingo

    # Festivo nacional 12 de octubre (Fiesta Nacional) inhábil
    assert not es_dia_habil_procesal(date(2026, 10, 12))

    # Festivo nacional 25 de diciembre (Navidad) inhábil
    assert not es_dia_habil_procesal(date(2026, 12, 25))

    # Día laborable ordinario (miércoles 21 de octubre de 2026)
    assert es_dia_habil_procesal(date(2026, 10, 21))

    # Agosto en orden civil es inhábil (Art. 130.2 LEC)
    assert not es_dia_habil_procesal(date(2026, 8, 10), orden="civil")


def test_calcular_fecha_vencimiento_habil_recurso_apelacion():
    # Notificación el lunes 19 de octubre de 2026
    # Plazo 10 días hábiles (Art. 790.1 LECrim)
    # Cómputo empieza el martes 20/10/2026:
    # 1: mar 20, 2: mié 21, 3: jue 22, 4: vie 23
    # fin de semana 24-25 inhábil
    # 5: lun 26, 6: mar 27, 7: mié 28, 8: jue 29, 9: vie 30
    # fin de semana 31-01 inhábil
    # 1 nov es domingo (festivo), lun 2 nov: si no es puente, cuenta
    # Día 10: lunes 2 de noviembre de 2026
    vencimiento = calcular_fecha_vencimiento_habil(
        fecha_inicio=date(2026, 10, 19),
        dias_habiles=10,
        orden="penal",
    )
    assert vencimiento == date(2026, 11, 2)


def test_endpoint_calcular_plazo():
    response = client.post(
        "/api/calcular-plazo",
        json={
            "fecha_inicio": "2026-10-19",
            "dias_habiles": 10,
            "orden": "penal",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["fecha_limite"] == "2026-11-02"
    assert data["dias_habiles_totales"] == 10
    assert "Arts. 130 y 133 LEC" in data["fundamento_legal"]
