import pytest
from backend.app.metricas import (
    contar_silabas_palabra,
    calcular_legibilidad,
    comparar_legibilidad,
)


def test_contar_silabas_palabra():
    assert contar_silabas_palabra("ley") == 1
    assert contar_silabas_palabra("juez") == 1
    assert contar_silabas_palabra("juzgado") == 3
    assert contar_silabas_palabra("día") == 2
    assert contar_silabas_palabra("declaración") == 4
    assert contar_silabas_palabra("procedimiento") == 5


def test_calcular_legibilidad():
    texto_dificil = (
        "El recurrente aduce quebrantamiento de las garantías procesales "
        "con infracción del principio acusatorio y vulneración del derecho a la tutela "
        "judicial efectiva con indefensión material determinante."
    )
    res = calcular_legibilidad(texto_dificil)
    assert res["score"] < 40
    assert "Difícil" in res["nivel"] or "Muy difícil" in res["nivel"]

    texto_facil = (
        "El juez dice que eres inocente.\n"
        "No tienes que pagar ninguna multa.\n"
        "El caso se ha cerrado."
    )
    res_facil = calcular_legibilidad(texto_facil)
    assert res_facil["score"] >= 80
    assert "fácil" in res_facil["nivel"].lower()


def test_comparar_legibilidad():
    original = (
        "Se le apercibe de que si no comparece podrá ser sancionado con multa "
        "y podrá incurrir en delito de desobediencia grave a la autoridad judicial."
    )
    adaptado = (
        "Tienes que ir al juzgado.\n"
        "Si estás enfermo, avisa antes para cambiar la fecha."
    )
    comp = comparar_legibilidad(original, adaptado)
    assert comp["incremento_puntos"] > 0
    assert comp["adaptado"]["score"] > comp["original"]["score"]
    assert comp["cumple_coga_longitud_frase"] is True
