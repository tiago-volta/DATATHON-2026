"""
Banco de casos de prueba y documentos judiciales anonimizados para evaluación objetiva.
Cubre 10 casos diversos (penal, civil, faltas/delitos leves, sentencias y vistas telemáticas)
para medir la precisión de extracción de PUENTE en el DATAthon Justicia 2026.
"""

CASOS_EVALUACION = [
    {
        "id": "caso_01_testigo_coruna",
        "texto": """JUZGADO DE INSTRUCCIÓN Nº 3 DE A CORUÑA
Procedimiento: Diligencias Previas 245/2026
CÉDULA DE CITACIÓN
Se cita a D. LUIS GARCÍA FERNÁNDEZ, con DNI 32.XXX.XXX-Y, domiciliado en C/ Ejemplo, 15, 15001 A Coruña, para que comparezca ante este Juzgado el día 10 de noviembre de 2026, a las 10:00 horas, en calidad de TESTIGO, a fin de prestar declaración en las Diligencias Previas arriba referenciadas.
Se le apercibe de que, si no comparece sin causa justificada, podrá ser sancionado con multa de 200 a 5.000 euros. Deberá acudir provisto de su documento nacional de identidad.""",
        "rol_esperado": "testigo",
        "organo_esperado_contiene": "Instrucción nº 3",
        "fecha_esperada_contiene": "10 de noviembre",
        "hora_esperada": "10:00",
        "espera_ajustes": True,
        "pii_presente": ["32.XXX.XXX-Y", "LUIS GARCÍA FERNÁNDEZ", "C/ Ejemplo, 15"],
    },
    {
        "id": "caso_02_investigado_estafa",
        "texto": """JUZGADO DE INSTRUCCIÓN Nº 7 DE A CORUÑA
Juicio por Delito Leve 892/2026
CÉDULA DE CITACIÓN
Se cita a D. JUAN MARTÍNEZ LÓPEZ con DNI 33.123.456-Z, domiciliado en C/ Marina, 42, 15002 A Coruña, para que comparezca ante este Juzgado el día 12 de noviembre de 2026, a las 09:30 horas, en calidad de INVESTIGADO, para la celebración del juicio por delito leve de estafa (art. 248 CP).
Se le informa de sus derechos conforme al artículo 118 de la Ley de Enjuiciamiento Criminal: derecho a guardar silencio, a designar abogado o solicitar uno de oficio y a presentar pruebas de descargo.""",
        "rol_esperado": "investigado",
        "organo_esperado_contiene": "Instrucción nº 7",
        "fecha_esperada_contiene": "12 de noviembre",
        "hora_esperada": "09:30",
        "espera_ajustes": True,
        "pii_presente": ["33.123.456-Z", "JUAN MARTÍNEZ LÓPEZ", "C/ Marina, 42"],
    },
    {
        "id": "caso_03_sentencia_absolutoria",
        "texto": """JUZGADO DE LO PENAL Nº 2 DE A CORUÑA
Procedimiento Abreviado 114/2026 — Sentencia nº 318/2026
FALLO:
Que debo ABSOLVER Y ABSUELVO libremente a Dña. MARÍA CARMEN R. V. del delito de hurto continuado del artículo 234.1 del Código Penal por el que venía siendo acusada, con declaración de las costas procesales de oficio y alzamiento de cuantas medidas cautelares se hubieran adoptado contra su persona.
Contra la presente resolución cabe interponer recurso de apelación en el plazo de DIEZ DÍAS hábiles contados desde el siguiente al de su notificación.""",
        "rol_esperado": "absuelt",
        "organo_esperado_contiene": "Penal nº 2",
        "fecha_esperada_contiene": "Notificada",
        "hora_esperada": None,
        "espera_ajustes": True,
        "pii_presente": ["MARÍA CARMEN R. V."],
    },
    {
        "id": "caso_04_testigo_vigo",
        "texto": """JUZGADO DE PRIMERA INSTANCIA E INSTRUCCIÓN Nº 4 DE VIGO
Procedimiento Ordinario 512/2026
CÉDULA DE CITACIÓN PARA TESTIGO
Por medio de la presente, se cita a D. ALBERTO SOUTO BLANCO, con DNI 35.889.123-W, con domicilio en Rúa do Príncipe, 8, 36202 Vigo, a fin de que comparezca ante este órgano jurisdiccional el día 18 de noviembre de 2026, a las 11:15 horas, en concepto de TESTIGO en el procedimiento de referencia.
Se le apercibe de las responsabilidades civiles y penales si no compareciere.""",
        "rol_esperado": "testigo",
        "organo_esperado_contiene": "Instrucción nº 4",
        "fecha_esperada_contiene": "18 de noviembre",
        "hora_esperada": "11:15",
        "espera_ajustes": True,
        "pii_presente": ["35.889.123-W", "ALBERTO SOUTO BLANCO", "Rúa do Príncipe, 8"],
    },
    {
        "id": "caso_05_investigado_lesiones",
        "texto": """JUZGADO DE INSTRUCCIÓN Nº 1 DE SANTIAGO DE COMPOSTELA
Diligencias Previas 301/2026
CÉDULA DE NOTIFICACIÓN Y CITACIÓN
Se cita a comparecer en calidad de INVESTIGADO a D. CARLOS VÁZQUEZ PÉREZ, provisto de DNI 34.567.890-K, residente en Rúa do Franco, 14, 15702 Santiago, el próximo día 24 de noviembre de 2026, a las 10:30 horas, para prestar declaración asistido por letrado en relación a un presunto delito leve de lesiones.
Podrá acudir asistido de abogado de libre designación o se le nombrará de oficio.""",
        "rol_esperado": "investigado",
        "organo_esperado_contiene": "Instrucción nº 1",
        "fecha_esperada_contiene": "24 de noviembre",
        "hora_esperada": "10:30",
        "espera_ajustes": True,
        "pii_presente": ["34.567.890-K", "CARLOS VÁZQUEZ PÉREZ", "Rúa do Franco, 14"],
    },
    {
        "id": "caso_06_vista_telemática",
        "texto": """JUZGADO DE LO SOCIAL Nº 5 DE A CORUÑA
Procedimiento: Despido 441/2026
CÉDULA DE CITACIÓN PARA ACTO DE JUICIO TELEMÁTICO
Se convoca a las partes para la celebración de la vista el día 2 de diciembre de 2026, a las 12:00 horas.
La comparecencia se realizará mediante videoconferencia segura a través del sistema oficial de la Administración de Justicia.
Se cita a Dña. ANA CASTRO REY con DNI 32.774.221-M para que se conecte con 15 minutos de antelación provista de cámara, micrófono y su documento de identidad.""",
        "rol_esperado": "testigo|demand",
        "organo_esperado_contiene": "Social nº 5",
        "fecha_esperada_contiene": "2 de diciembre",
        "hora_esperada": "12:00",
        "espera_ajustes": True,
        "pii_presente": ["32.774.221-M", "ANA CASTRO REY"],
    },
    {
        "id": "caso_07_perito_forense",
        "texto": """JUZGADO DE LO PENAL Nº 1 DE OURENSE
Procedimiento Abreviado 88/2026
CITACIÓN JUDICIAL
Se cita a D. ROBERTO NÚÑEZ IGLESIAS con DNI 36.111.222-P domiciliado en Calle Progreso 5, Ourense, para que comparezca el día 15 de diciembre de 2026 a las 09:45 horas ante este Juzgado para ratificar su informe pericial psicológico emitido en la causa de referencia.""",
        "rol_esperado": "testigo|perito",
        "organo_esperado_contiene": "Penal nº 1",
        "fecha_esperada_contiene": "15 de diciembre",
        "hora_esperada": "09:45",
        "espera_ajustes": True,
        "pii_presente": ["36.111.222-P", "ROBERTO NÚÑEZ IGLESIAS", "Calle Progreso 5"],
    },
    {
        "id": "caso_08_investigado_hurto",
        "texto": """JUZGADO DE GUARDA DE A CORUÑA
Juicio Rápido 105/2026
CÉDULA DE CITACIÓN URGENTE
Se cita a comparecer a D. MARCOS VEIGA LAGE, DNI 32.999.888-Q, con domicilio en Avda. Finisterre, 120, A Coruña, en calidad de INVESTIGADO por delito de hurto, el día 5 de noviembre de 2026 a las 11:30 horas, con la prevención de que si no asiste podrá ser conducido por la fuerza pública.""",
        "rol_esperado": "investigado",
        "organo_esperado_contiene": "Juzgado de Guarda",
        "fecha_esperada_contiene": "5 de noviembre",
        "hora_esperada": "11:30",
        "espera_ajustes": True,
        "pii_presente": ["32.999.888-Q", "MARCOS VEIGA LAGE", "Avda. Finisterre, 120"],
    },
    {
        "id": "caso_09_testigo_accidente",
        "texto": """JUZGADO DE PRIMERA INSTANCIA Nº 6 DE A CORUÑA
Juicio Verbal 670/2026
CÉDULA DE CITACIÓN
Se cita a Dña. PATRICIA BLANCO LÓPEZ con DNI 33.444.555-J vecina de C/ San Andrés, 30, A Coruña, para que comparezca el día 9 de diciembre de 2026 a las 10:15 horas ante este Juzgado en calidad de TESTIGO para declarar sobre el siniestro de circulación objeto de la litis.""",
        "rol_esperado": "testigo",
        "organo_esperado_contiene": "Primera Instancia nº 6",
        "fecha_esperada_contiene": "9 de diciembre",
        "hora_esperada": "10:15",
        "espera_ajustes": True,
        "pii_presente": ["33.444.555-J", "PATRICIA BLANCO LÓPEZ", "C/ San Andrés, 30"],
    },
    {
        "id": "caso_10_sentencia_conformidad",
        "texto": """JUZGADO DE LO PENAL Nº 3 DE FERROL
Procedimiento Abreviado 220/2026 — Sentencia 190/2026
FALLO
Que en virtud de la conformidad prestada en sala, debo ABSOLVER a D. SANTIAGO DIZ LORENZO de los delitos continuados contra la seguridad vial que venían imputándosele en autos, acordando el cese de toda medida cautelar dictada en el presente procedimiento.""",
        "rol_esperado": "absuelt",
        "organo_esperado_contiene": "Penal nº 3",
        "fecha_esperada_contiene": "Notificada",
        "hora_esperada": None,
        "espera_ajustes": True,
        "pii_presente": ["SANTIAGO DIZ LORENZO"],
    },
]
