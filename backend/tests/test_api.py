import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)


def test_health():
    res = client.get("/health")
    assert res.status_code == 200
    assert res.json() == {"status": "ok"}


def test_root():
    res = client.get("/")
    assert res.status_code == 200
    assert "PUENTE API" in res.json()["mensaje"]


def test_anonimizar_endpoint():
    res = client.post(
        "/api/anonimizar",
        json={
            "texto": (
                "Se cita a D. Roberto Fernández Gómez con DNI 12345678Z "
                "domiciliado en Calle Mayor 12 para que comparezca ante el juzgado."
            )
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total_protegidos"] >= 3
    assert "[DNI_1]" in data["texto_anonimizado"]
    assert "12345678Z" not in data["texto_anonimizado"]


def test_procesar_citacion_mock_luis():
    texto = (
        "JUZGADO DE INSTRUCCIÓN Nº 3 DE A CORUÑA. "
        "Procedimiento: Diligencias Previas 245/2026. Se cita a Luis García como testigo."
    )
    res = client.post("/api/procesar-citacion", json={"texto": texto})
    assert res.status_code == 200
    data = res.json()
    assert data["datos_clave"]["rol"] == "testigo"
    assert "privacidad_rgpd" in data["datos_clave"]
    assert data["datos_clave"]["privacidad_rgpd"]["anonimizado_antes_de_ia"] is True
    assert len(data["pictogramas"]) > 0


def test_procesar_citacion_personalizada():
    texto = (
        "JUZGADO DE PRIMERA INSTANCIA Nº 4 DE VIGO. "
        "Juicio Ordinario 512/2026. Se cita a D. Alberto Souto con DNI 35.889.123-W "
        "el día 18 de noviembre de 2026 a las 11:15 horas en calidad de TESTIGO para prestar declaración."
    )
    res = client.post("/api/procesar-citacion", json={"texto": texto})
    assert res.status_code == 200
    data = res.json()
    assert data["datos_clave"]["rol"] == "testigo"
    assert data["datos_clave"]["hora"] == "11:15"
    assert "18 de noviembre" in data["datos_clave"]["fecha"]
    assert "privacidad_rgpd" in data["datos_clave"]


def test_analizar_pregunta_doble_negacion():
    res = client.post(
        "/api/analizar-pregunta",
        json={"pregunta": "¿No es cierto que no vio salir al acusado de la vivienda?"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["semaforo"] in ("amarillo", "rojo")
    assert "Doble negación" in data["problemas"]
    assert data["reformulada"] is not None


def test_analizar_pregunta_clara():
    res = client.post(
        "/api/analizar-pregunta",
        json={"pregunta": "¿A qué hora viste llegar el coche a la calle?"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["semaforo"] == "verde"


def test_generar_ics():
    res = client.post(
        "/api/generar-ics?titulo=CitacionPrueba",
        json=[
            {
                "descripcion": "Declaración judicial",
                "fecha": "2026-11-10",
                "dias_restantes": 20,
            }
        ],
    )
    assert res.status_code == 200
    assert "BEGIN:VCALENDAR" in res.text
    assert "CitacionPrueba" in res.text


def test_voz_interpretar():
    res = client.post(
        "/api/voz/interpretar",
        json={"texto": "quiero activar el modo con voz"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["accion"] == "activar_modo_voz"


def test_ayuda_preguntar():
    res = client.post(
        "/api/ayuda/preguntar",
        json={"pregunta": "¿Cómo funciona el Pasaporte de ajustes?"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "respuesta" in data
    assert "Pasaporte" in data["respuesta"]
