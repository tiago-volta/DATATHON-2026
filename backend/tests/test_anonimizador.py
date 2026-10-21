import pytest
from backend.app.anonimizador import anonimizar_documento_judicial


def test_anonimizar_dni_y_nie():
    texto = "DNI 12345678Z y NIE X1234567L con formato judicial 32.XXX.XXX-Y comparecen."
    anon, elementos = anonimizar_documento_judicial(texto)

    assert "12345678Z" not in anon
    assert "X1234567L" not in anon
    assert "32.XXX.XXX-Y" not in anon
    assert "[DNI_1]" in anon
    assert len(elementos) >= 3


def test_anonimizar_nombres_procesales():
    texto = (
        "Se cita a D. ROBERTO VÁZQUEZ BLANCO y a comparecer ante el tribunal a "
        "Dña. MARÍA CARMEN SOTO para prestar declaración."
    )
    anon, elementos = anonimizar_documento_judicial(texto)

    assert "ROBERTO VÁZQUEZ BLANCO" not in anon
    assert "MARÍA CARMEN SOTO" not in anon
    assert "[PERSONA_" in anon
    assert len(elementos) >= 2


def test_anonimizar_domicilio():
    texto = (
        "Se cita a D. Pedro Gómez domiciliado en Calle Mayor, 15, 28013 Madrid, "
        "para que comparezca ante el juzgado."
    )
    anon, elementos = anonimizar_documento_judicial(texto)

    assert "Calle Mayor, 15, 28013 Madrid" not in anon
    assert "[DOMICILIO_" in anon


def test_anonimizar_telefono_y_email():
    texto = "Contacto: info@ejemplo.es y teléfono 654987321 para incidencias."
    anon, elementos = anonimizar_documento_judicial(texto)

    assert "info@ejemplo.es" not in anon
    assert "654987321" not in anon
    assert "[EMAIL_1]" in anon
    assert "[TELEFONO_1]" in anon


def test_texto_vacio():
    anon, elementos = anonimizar_documento_judicial("")
    assert anon == ""
    assert elementos == []

