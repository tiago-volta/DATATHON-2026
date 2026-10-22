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
    assert "TribunalInclusivo API" in res.json()["mensaje"]


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


def test_ayuda_preguntar():
    res = client.post(
        "/api/ayuda/preguntar",
        json={"pregunta": "¿Cómo funciona el Pasaporte de ajustes?"},
    )
    assert res.status_code == 200
    texto = res.json()["respuesta"]
    assert "Pasaporte" in texto
    assert "diagnóstico" in texto
    assert "Solo contesto dudas legales" not in texto


def test_ayuda_ir_al_juzgado_aunque_no_quiera(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "mock")
    monkeypatch.setenv("GEMINI_API_KEY", "")
    res = client.post(
        "/api/ayuda/preguntar",
        json={"pregunta": "¿Tengo que ir al juzgado aunque no quiera?"},
    )
    assert res.status_code == 200
    texto = res.json()["respuesta"]
    assert "410" in texto
    assert "Solo contesto dudas legales" not in texto


def test_ayuda_obligar_a_ir_testigo(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "mock")
    monkeypatch.setenv("GEMINI_API_KEY", "")
    res = client.post(
        "/api/ayuda/preguntar",
        json={"pregunta": "¿Me pueden obligar a ir si soy testigo?"},
    )
    assert res.status_code == 200
    texto = res.json()["respuesta"]
    assert "410" in texto
    assert "420" in texto
    assert "458" not in texto


def test_ayuda_preguntar_fuente_boe(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "mock")
    monkeypatch.setenv("GEMINI_API_KEY", "")
    res = client.post(
        "/api/ayuda/preguntar",
        json={"pregunta": "¿De dónde sacas las leyes? ¿Vas al BOE?"},
    )
    assert res.status_code == 200
    data = res.json()
    texto = data["respuesta"]
    assert "art. 420 LECrim" in texto
    assert "boe.es" in texto
    assert "No es asesoramiento" not in texto
    assert "Solo contesto dudas legales" not in texto


def test_ayuda_abogado_no_es_gratis(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "mock")
    monkeypatch.setenv("GEMINI_API_KEY", "")
    res = client.post(
        "/api/ayuda/preguntar",
        json={"pregunta": "¿Tengo abogado gratis en un delito leve?"},
    )
    assert res.status_code == 200
    texto = res.json()["respuesta"]
    assert "abogado gratis" not in texto.lower()
    assert "967.1" in texto
    assert "6.3.b" in texto
    assert "decide" in texto.lower()
    assert "No es asesoramiento" not in texto


def test_ayuda_falso_testimonio_458(monkeypatch):
    monkeypatch.setenv("LLM_PROVIDER", "mock")
    monkeypatch.setenv("GEMINI_API_KEY", "")
    res = client.post(
        "/api/ayuda/preguntar",
        json={"pregunta": "¿Qué pasa si miento como testigo?"},
    )
    assert res.status_code == 200
    texto = res.json()["respuesta"]
    assert "458" in texto
    assert "433" in texto
    assert "boe.es" in texto

def test_obtener_roles_todos():
    res = client.get("/api/roles")
    assert res.status_code == 200
    roles = res.json()
    assert isinstance(roles, list)
    assert len(roles) == 4
    ids = [r["id"] for r in roles]
    assert "testigo" in ids
    assert "investigado" in ids
    assert "victima" in ids
    assert "parte_civil" in ids


def test_obtener_rol_especifico():
    res = client.get("/api/roles?rol=testigo")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == "testigo"
    assert "derechos" in data
    assert "obligaciones" in data
    assert "faq" in data
    assert len(data["faq"]) >= 6


def test_obtener_rol_inexistente():
    res = client.get("/api/roles?rol=desconocido")
    assert res.status_code == 404



def test_evaluar_respuesta_declaracion_mock():
    res = client.post(
        "/api/declaracion/evaluar-respuesta",
        json={
            "pregunta": "¿Qué vio usted en la parada?",
            "respuesta_usuario": "Vi a alguien correr con un móvil hacia la plaza",
            "nombre": "Luis",
            "rol": "testigo",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert "replica_juez" in data
    assert data["avanzar"] is True
    assert "parada" in data["replica_juez"].lower() or "anotado" in data["replica_juez"].lower()


def test_evaluar_respuesta_declaracion_agua():
    res = client.post(
        "/api/declaracion/evaluar-respuesta",
        json={
            "pregunta": "¿Puede decirme su nombre?",
            "respuesta_usuario": "¿Puedo beber un poco de agua antes?",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["esperar_listo"] is True
    assert "agua" in data["replica_juez"].lower()
