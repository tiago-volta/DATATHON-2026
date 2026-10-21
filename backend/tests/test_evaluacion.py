import pytest
from backend.evaluar import ejecutar_evaluacion


@pytest.mark.asyncio
async def test_suite_evaluacion_precision():
    informe = await ejecutar_evaluacion()
    assert informe["total_casos_evaluados"] == 10
    # Exigir un umbral mínimo de calidad de extracción superior al 90%
    assert informe["precision_global"] >= 90.0

