import uuid

from fastapi.testclient import TestClient

from backend.app.db import init_db
from backend.app.main import app

init_db()
client = TestClient(app)


def _email() -> str:
    return f"test-{uuid.uuid4().hex[:12]}@example.com"


def test_registro_y_me():
    email = _email()
    res = client.post(
        "/api/auth/registro",
        json={"email": email, "password": "secreto12", "nombre": "Luis"},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["email"] == email
    assert data["perfil"]["nombre"] == "Luis"
    assert "court_token" in res.cookies

    me = client.get("/api/auth/me")
    assert me.status_code == 200
    assert me.json()["email"] == email


def test_registro_email_duplicado():
    email = _email()
    primero = client.post(
        "/api/auth/registro",
        json={"email": email, "password": "secreto12"},
    )
    assert primero.status_code == 200
    client.cookies.clear()
    segundo = client.post(
        "/api/auth/registro",
        json={"email": email, "password": "otraclave99"},
    )
    assert segundo.status_code == 409


def test_login_fallido():
    email = _email()
    client.post("/api/auth/registro", json={"email": email, "password": "secreto12"})
    client.cookies.clear()
    res = client.post(
        "/api/auth/login",
        json={"email": email, "password": "incorrecta"},
    )
    assert res.status_code == 401


def test_me_sin_sesion():
    client.cookies.clear()
    res = client.get("/api/auth/me")
    assert res.status_code == 401


def test_estado_put_get():
    email = _email()
    client.post(
        "/api/auth/registro",
        json={"email": email, "password": "secreto12", "nombre": "Ana"},
    )
    payload = {
        "perfil": {
            "nombre": "Ana",
            "rol": "testigo",
            "tolerancia": 2,
            "estimulosSensibles": ["ruido"],
            "creado": 1,
            "actualizado": 1,
        },
        "practica": {"dias": ["2026-10-21"], "bienvenidaVistaTras": None},
        "sala_progreso": {"nivelMaximo": 1, "sesionesCompletadas": 1},
    }
    put = client.put("/api/me/estado", json=payload)
    assert put.status_code == 200
    body = put.json()
    assert body["perfil"]["tolerancia"] == 2
    assert body["practica"]["dias"] == ["2026-10-21"]
    assert body["sala_progreso"]["nivelMaximo"] == 1

    get = client.get("/api/me/estado")
    assert get.status_code == 200
    assert get.json()["perfil"]["nombre"] == "Ana"


def test_estado_varias_citaciones():
    email = _email()
    client.post(
        "/api/auth/registro",
        json={"email": email, "password": "secreto12", "nombre": "Luis"},
    )
    citaciones = [
        {
            "id": "cerca",
            "guardadaEn": 2,
            "texto": "Citación de noviembre",
            "resultado": {"datos_clave": {"fecha": "2026-11-10", "rol": "testigo"}},
        },
        {
            "id": "lejos",
            "guardadaEn": 1,
            "texto": "Citación de diciembre",
            "resultado": {"datos_clave": {"fecha": "2026-12-02", "rol": "testigo"}},
        },
    ]
    put = client.put("/api/me/estado", json={"citaciones": citaciones})
    assert put.status_code == 200
    assert [c["id"] for c in put.json()["citaciones"]] == ["cerca", "lejos"]

    get = client.get("/api/me/estado")
    assert get.status_code == 200
    assert len(get.json()["citaciones"]) == 2


def test_logout():
    email = _email()
    client.post("/api/auth/registro", json={"email": email, "password": "secreto12"})
    out = client.post("/api/auth/logout")
    assert out.status_code == 200
    me = client.get("/api/auth/me")
    assert me.status_code == 401


def test_estado_null_no_borra_y_sin_diagnostico():
    email = _email()
    client.post(
        "/api/auth/registro",
        json={"email": email, "password": "secreto12", "nombre": "Ana"},
    )
    client.put(
        "/api/me/estado",
        json={
            "practica": {"dias": ["2026-10-21"], "bienvenidaVistaTras": None},
            "perfil": {
                "nombre": "Ana",
                "rol": "testigo",
                "tolerancia": 2,
                "estimulosSensibles": [],
                "diagnostico": "no-guardar",
                "creado": 1,
                "actualizado": 1,
            },
        },
    )
    put = client.put(
        "/api/me/estado",
        json={"perfil": {"nombre": "Ana", "rol": "testigo", "tolerancia": 3,
                         "estimulosSensibles": [], "creado": 1, "actualizado": 2},
              "practica": None},
    )
    assert put.status_code == 200
    body = put.json()
    assert body["perfil"]["tolerancia"] == 3
    assert "diagnostico" not in (body["perfil"] or {})
    assert body["practica"]["dias"] == ["2026-10-21"]


def test_delete_me_art_17_rgpd():
    email = _email()
    reg = client.post(
        "/api/auth/registro",
        json={"email": email, "password": "secreto12", "nombre": "Marta"},
    )
    assert reg.status_code == 200

    # Guardar estado
    client.put(
        "/api/me/estado",
        json={"pasaporte": {"nombre": "Marta", "ajustes": ["sala-espera-tranquila"]}},
    )

    # Borrar cuenta
    del_res = client.delete("/api/auth/me")
    assert del_res.status_code == 200
    assert del_res.json()["ok"] is True

    # Comprobar que ya no existe sesión ni usuario
    me = client.get("/api/auth/me")
    assert me.status_code == 401

    # Login ya no debe funcionar
    login = client.post(
        "/api/auth/login",
        json={"email": email, "password": "secreto12"},
    )
    assert login.status_code == 401
