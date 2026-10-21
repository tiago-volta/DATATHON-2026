import pytest
from backend.app.llm import adaptar_documento_personalizado


def test_sentencia_condenatoria_no_absuelve():
    texto_condena = """
    JUZGADO DE LO PENAL Nº 1 DE A CORUÑA
    Procedimiento Abreviado 200/2026
    FALLO:
    Que debo condenar y condeno a D. PEDRO PÉREZ como autor responsable de un delito
    de estafa a la pena de 6 meses de prisión y costas.
    Notifíquese la presente resolución indicando que contra la misma cabe recurso de apelación
    en el plazo de diez días.
    """
    res = adaptar_documento_personalizado(texto_condena)
    datos = res["datos_clave"]
    assert datos["tipo_documento"] == "sentencia"
    assert datos.get("fallo") == "condena" or "conden" in datos.get("rol", "")
    assert "inocente" not in res["lectura_clara"].lower()
    assert "0 €" not in str(datos.get("apoyo_numerico", []))
    assert "790" in res["lectura_clara"] or "diez días" in res["lectura_clara"].lower()


def test_sentencia_absolutoria():
    texto_absolucion = """
    JUZGADO DE LO PENAL Nº 2 DE A CORUÑA
    Procedimiento Abreviado 114/2026
    FALLO:
    Que debo absolver y absuelvo libremente a Dña. MARÍA CARMEN del delito de hurto.
    """
    res = adaptar_documento_personalizado(texto_absolucion)
    datos = res["datos_clave"]
    assert datos["tipo_documento"] == "sentencia"
    assert "absuel" in res["lectura_clara"].lower() or "inocente" in res["lectura_clara"].lower()


def test_citacion_civil_no_es_testigo_penal():
    texto_civil = """
    JUZGADO DE PRIMERA INSTANCIA Nº 5 DE A CORUÑA
    Juicio Ordinario 340/2026
    CÉDULA DE EMPLAZAMIENTO
    Se emplaza a Dña. LAURA SÁNCHEZ en calidad de DEMANDADA para que conteste a la demanda
    en el plazo de veinte días con abogado y procurador.
    """
    res = adaptar_documento_personalizado(texto_civil)
    datos = res["datos_clave"]
    assert datos["rol"] != "testigo"
    assert "5.000" not in str(datos.get("apoyo_numerico", []))
    assert "delito" not in res["lectura_clara"].lower()


def test_citacion_investigado_delito_leve_abogado_no_gratis_automatico():
    texto_investigado = """
    JUZGADO DE INSTRUCCIÓN Nº 7 DE A CORUÑA
    Juicio por Delito Leve 892/2026
    CÉDULA DE CITACIÓN
    Se cita en calidad de INVESTIGADO por delito leve de estafa.
    """
    res = adaptar_documento_personalizado(texto_investigado)
    datos = res["datos_clave"]
    assert datos["rol"] == "investigado"
    # El abogado en delito leve no es garantizado gratis sin requisitos
    assert "te dan uno gratis" not in res["lectura_facil"].lower()
    assert "967" in res["lectura_clara"] or "opcional" in res["lectura_clara"].lower() or "si quieres" in res["lectura_facil"].lower()


def test_citacion_testigo_incluye_deber_verdad():
    texto_testigo = """
    JUZGADO DE INSTRUCCIÓN Nº 3 DE A CORUÑA
    Diligencias Previas 245/2026
    CÉDULA DE CITACIÓN
    Se cita a D. LUIS en calidad de TESTIGO para prestar declaración.
    """
    res = adaptar_documento_personalizado(texto_testigo)
    datos = res["datos_clave"]
    assert datos["rol"] == "testigo"
    assert "verdad" in res["lectura_clara"].lower() or "verdad" in res["lectura_facil"].lower()
    assert "sin ponerte ninguna multa" not in str(datos["que_pasa_si_no_voy"])

