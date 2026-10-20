"""
Datos de ejemplo para las demos de Luis y Juan.
Citaciones ficticias y respuestas estructuradas.
"""

MOCK_CITACION_LUIS = """
JUZGADO DE INSTRUCCIÓN Nº 3 DE A CORUÑA
Procedimiento: Diligencias Previas 245/2026

CÉDULA DE CITACIÓN

Se cita a D. LUIS GARCÍA FERNÁNDEZ, con DNI 32.XXX.XXX-Y, domiciliado en 
C/ Ejemplo, 15, 15001 A Coruña, para que comparezca ante este Juzgado el día 
10 de noviembre de 2026, a las 10:00 horas, en calidad de TESTIGO, a fin de 
prestar declaración en las Diligencias Previas arriba referenciadas.

Se le apercibe de que, si no comparece sin causa justificada, podrá ser sancionado 
con multa de 200 a 5.000 euros y, si persiste en su negativa, podrá incurrir en 
un delito de desobediencia grave a la autoridad.

Deberá acudir provisto de su documento nacional de identidad.

Si necesita ajustes o adaptaciones para su comparecencia por razón de discapacidad 
o cualquier otra circunstancia personal, puede solicitarlos conforme al artículo 7 bis 
de la Ley de Enjuiciamiento Civil.

En A Coruña, a 27 de octubre de 2026.

EL/LA LETRADO/A DE LA ADMINISTRACIÓN DE JUSTICIA
"""

MOCK_CITACION_JUAN = """
JUZGADO DE INSTRUCCIÓN Nº 7 DE A CORUÑA
Juicio por Delito Leve 892/2026

CÉDULA DE CITACIÓN

Se cita a D. JUAN MARTÍNEZ LÓPEZ, con DNI 33.XXX.XXX-Z, domiciliado en 
C/ Marina, 42, 15002 A Coruña, para que comparezca ante este Juzgado el día 
12 de noviembre de 2026, a las 09:30 horas, en calidad de INVESTIGADO, para 
la celebración del juicio por delito leve de estafa (art. 248 CP, cuantía inferior 
a 400 euros) por los hechos ocurridos el 3 de octubre de 2026 relativos a una 
compraventa en línea.

Se le informa de sus derechos conforme al artículo 118 de la Ley de Enjuiciamiento 
Criminal:
- Derecho a guardar silencio no declarando si no desea hacerlo.
- Derecho a no declarar contra sí mismo y a no confesarse culpable.
- Derecho a designar abogado o a solicitar uno de oficio.
- Derecho a acceder a los elementos de las actuaciones que sean esenciales para 
  impugnar la legalidad de la detención o privación de libertad.
- Derecho a que se ponga en conocimiento de un familiar o persona que desee 
  el hecho de la citación.
- Derecho a ser asistido gratuitamente por un intérprete si no comprende el 
  castellano.
- Derecho a que la información se le facilite en un lenguaje comprensible y que 
  resulte accesible, adaptada a su discapacidad y cualquier otra circunstancia personal.

Podrá presentar pruebas de descargo hasta el día del juicio.

En A Coruña, a 22 de octubre de 2026.

EL/LA LETRADO/A DE LA ADMINISTRACIÓN DE JUSTICIA
"""

MOCK_RESPONSE_LUIS = {
    "datos_clave": {
        "rol": "testigo",
        "tipo_procedimiento": "Diligencias Previas (penal)",
        "organo": "Juzgado de Instrucción nº 3 de A Coruña",
        "fecha": "10 de noviembre de 2026",
        "hora": "10:00",
        "lugar": "Juzgado de Instrucción nº 3, A Coruña",
        "numero_procedimiento": "245/2026",
        "que_llevar": ["DNI o documento de identidad"],
        "puedo_pedir_ajustes": True,
        "base_legal_ajustes": "Artículo 7 bis de la Ley de Enjuiciamiento Civil"
    },
    "lectura_clara": """
Te citan como TESTIGO en un juicio.

📅 CUÁNDO: Martes 10 de noviembre de 2026, a las 10:00 de la mañana.

📍 DÓNDE: Juzgado de Instrucción número 3 de A Coruña.

🎯 QUÉ TIENES QUE HACER: Ir al juzgado y contar lo que viste o sabes sobre unos hechos. No te acusan de nada, solo quieren escuchar tu versión.

📋 QUÉ LLEVAR: Tu DNI o carné de identidad.

⚠️ IMPORTANTE: Tienes que ir. Si no vas sin una razón válida, pueden ponerte una multa.

✅ PUEDES PEDIR AYUDA: Si necesitas adaptaciones (por ejemplo, un lugar tranquilo, más tiempo para responder, o que te expliquen las cosas de otra forma), puedes pedirlo. Es tu derecho según la ley.
""",
    "lectura_facil": """
Te llaman para ir al juzgado.

Eres TESTIGO.
Eso significa que no te acusan de nada.
Solo quieren que cuentes lo que sabes.

TIENES QUE IR el día 10 de noviembre.
A las 10 de la mañana.
Al Juzgado número 3 de A Coruña.

LLEVA tu DNI.

Si no vas, te pueden poner una multa.
La multa es dinero que tienes que pagar.

PUEDES PEDIR AYUDA.
Por ejemplo:
- Una sala tranquila.
- Más tiempo para contestar.
- Que te expliquen las cosas despacio.

Es tu derecho. La ley lo dice.
""",
    "plazos": [
        {
            "descripcion": "Día de la citación (tienes que ir)",
            "fecha": "2026-11-10",
            "dias_restantes": 21
        }
    ],
    "pictogram_keywords": ["juzgado", "testigo", "hablar", "escuchar", "documento", "calendario", "ayuda", "persona", "tranquilo"]
}

MOCK_RESPONSE_JUAN = {
    "datos_clave": {
        "rol": "investigado",
        "tipo_procedimiento": "Juicio por delito leve",
        "delito": "Estafa leve (art. 248 CP, menos de 400 euros)",
        "organo": "Juzgado de Instrucción nº 7 de A Coruña",
        "fecha": "12 de noviembre de 2026",
        "hora": "09:30",
        "lugar": "Juzgado de Instrucción nº 7, A Coruña",
        "numero_procedimiento": "892/2026",
        "derechos": [
            "Puedes no decir nada (guardar silencio)",
            "No tienes que declarar contra ti mismo",
            "Tienes derecho a un abogado (gratis si no puedes pagarlo)",
            "Puedes ver los documentos del caso",
            "Pueden avisar a tu familia",
            "Te lo tienen que explicar de forma que lo entiendas"
        ],
        "puedo_pedir_ajustes": True,
        "base_legal_ajustes": "Artículo 118 de la Ley de Enjuiciamiento Criminal"
    },
    "lectura_clara": """
Te citan como INVESTIGADO en un juicio por delito leve.

📅 CUÁNDO: Jueves 12 de noviembre de 2026, a las 9 y media de la mañana.

📍 DÓNDE: Juzgado de Instrucción número 7 de A Coruña.

⚖️ DE QUÉ TE ACUSAN: De una estafa pequeña (menos de cuatrocientos euros) por una venta en internet.

🛡️ TUS DERECHOS:
1. Puedes quedarte callado. No tienes que hablar si no quieres.
2. Tienes derecho a un abogado. Si no puedes pagarlo, te dan uno gratis.
3. Puedes presentar pruebas que demuestren que no hiciste nada malo.
4. Te lo tienen que explicar todo de forma que lo entiendas.

📋 PLAZO IMPORTANTE: Puedes presentar pruebas hasta el día del juicio.

✅ PUEDES PEDIR AYUDA: Que te lean los documentos en voz alta, pausas durante el juicio, más tiempo para responder.
""",
    "lectura_facil": """
Te llaman para ir a un juicio.

Eres INVESTIGADO.
Eso significa que piensan
que hiciste algo malo.

Te acusan de una estafa pequeña.
Es por una venta en internet.
La cantidad es menos de cuatrocientos euros.

TIENES DERECHOS:

1. Puedes NO hablar.
   Eso se llama guardar silencio.
   
2. Tienes derecho a un ABOGADO.
   Si no tienes dinero, te dan uno gratis.
   
3. Puedes llevar PRUEBAS.
   Las pruebas demuestran que dices la verdad.

EL JUICIO es el día 12 de noviembre.
A las 9 y media de la mañana.
En el Juzgado número 7 de A Coruña.

PUEDES PEDIR AYUDA.
Por ejemplo:
- Que te lean los papeles en voz alta.
- Descansos durante el juicio.
- Más tiempo para pensar las respuestas.
""",
    "plazos": [
        {
            "descripcion": "Último día para presentar pruebas",
            "fecha": "2026-11-12",
            "dias_restantes": 23
        },
        {
            "descripcion": "Día del juicio (tienes que ir)",
            "fecha": "2026-11-12",
            "dias_restantes": 23
        }
    ],
    "pictogram_keywords": ["juzgado", "juicio", "abogado", "silencio", "derechos", "prueba", "escuchar", "hablar", "ayuda", "calendario"]
}

FASES_JUDICIALES = {
    "penal_testigo": {
        "titulo": "Proceso penal - Testigo",
        "descripcion": "Fases cuando te llaman como testigo en un caso penal",
        "fases": [
            {
                "numero": 1,
                "nombre": "Citación",
                "descripcion": "Recibes una carta que te dice que tienes que ir al juzgado.",
                "icono": "📬",
                "que_hacer": "Lee bien la fecha, hora y lugar. Guarda la carta.",
                "pictograma": "carta"
            },
            {
                "numero": 2,
                "nombre": "Preparación",
                "descripcion": "Los días antes del juicio, puedes prepararte.",
                "icono": "📝",
                "que_hacer": "Recuerda lo que viste. Puedes pedir ajustes si los necesitas.",
                "pictograma": "pensar"
            },
            {
                "numero": 3,
                "nombre": "Llegada al juzgado",
                "descripcion": "El día de la cita, llegas al juzgado.",
                "icono": "🏛️",
                "que_hacer": "Llega 15 minutos antes. Pasa el control de seguridad. Espera a que te llamen.",
                "pictograma": "edificio"
            },
            {
                "numero": 4,
                "nombre": "Declaración",
                "descripcion": "Entras en la sala y cuentas lo que sabes.",
                "icono": "🗣️",
                "que_hacer": "Di la verdad. Si no entiendes una pregunta, pide que te la repitan. Puedes pedir pausas.",
                "pictograma": "hablar"
            },
            {
                "numero": 5,
                "nombre": "Fin",
                "descripcion": "Cuando terminas, te puedes ir.",
                "icono": "✅",
                "que_hacer": "Ya has cumplido. Normalmente no tienes que volver.",
                "pictograma": "terminado"
            }
        ]
    },
    "penal_investigado": {
        "titulo": "Proceso penal - Investigado (delito leve)",
        "descripcion": "Fases cuando te investigan por un delito leve",
        "fases": [
            {
                "numero": 1,
                "nombre": "Citación",
                "descripcion": "Recibes una carta que dice que te acusan de algo.",
                "icono": "📬",
                "que_hacer": "Lee bien tus derechos. Busca un abogado.",
                "pictograma": "carta"
            },
            {
                "numero": 2,
                "nombre": "Buscar abogado",
                "descripcion": "Tienes derecho a un abogado que te ayude.",
                "icono": "👔",
                "que_hacer": "Si no tienes dinero, pide uno de oficio (gratis). Cuéntale todo.",
                "pictograma": "abogado"
            },
            {
                "numero": 3,
                "nombre": "Preparar pruebas",
                "descripcion": "Busca pruebas que demuestren tu versión.",
                "icono": "🔍",
                "que_hacer": "Mensajes, fotos, testigos... Todo lo que te ayude.",
                "pictograma": "buscar"
            },
            {
                "numero": 4,
                "nombre": "El juicio",
                "descripcion": "Vas al juzgado y se celebra el juicio.",
                "icono": "⚖️",
                "que_hacer": "Tu abogado te guía. Puedes hablar o guardar silencio. Di la verdad si hablas.",
                "pictograma": "juicio"
            },
            {
                "numero": 5,
                "nombre": "Sentencia",
                "descripcion": "El juez decide si eres culpable o inocente.",
                "icono": "📜",
                "que_hacer": "Si no estás de acuerdo, puedes recurrir con tu abogado.",
                "pictograma": "documento"
            }
        ]
    }
}

ROLES_JUDICIALES = [
    {
        "nombre": "Juez / Jueza",
        "descripcion": "La persona que dirige el juicio y toma la decisión final.",
        "que_hace": "Escucha a todos, hace preguntas y decide quién tiene razón.",
        "como_reconocerlo": "Lleva toga negra y se sienta en el lugar más alto de la sala.",
        "icono": "⚖️",
        "pictograma": "juez"
    },
    {
        "nombre": "Fiscal",
        "descripcion": "Representa al Estado y a la sociedad.",
        "que_hace": "En casos penales, acusa a la persona investigada.",
        "como_reconocerlo": "Lleva toga negra y se sienta a un lado de la sala.",
        "icono": "🏛️",
        "pictograma": "fiscal"
    },
    {
        "nombre": "Letrado/a de la Administración de Justicia (LAJ)",
        "descripcion": "Antes se llamaba Secretario Judicial.",
        "que_hace": "Se encarga de los papeles, las fechas y que todo se haga bien.",
        "como_reconocerlo": "Lleva toga negra y se sienta cerca del juez.",
        "icono": "📋",
        "pictograma": "secretario"
    },
    {
        "nombre": "Abogado/a defensor/a",
        "descripcion": "Tu abogado, el que te defiende.",
        "que_hace": "Te ayuda, habla por ti y defiende tus derechos.",
        "como_reconocerlo": "Lleva toga negra y se sienta a tu lado.",
        "icono": "👔",
        "pictograma": "abogado"
    },
    {
        "nombre": "Abogado/a de la acusación",
        "descripcion": "El abogado de la otra parte o de la víctima.",
        "que_hace": "Defiende a la otra persona y puede hacerte preguntas.",
        "como_reconocerlo": "Lleva toga negra y se sienta enfrente.",
        "icono": "👔",
        "pictograma": "abogado"
    },
    {
        "nombre": "Facilitador/a",
        "descripcion": "Una persona que te ayuda a entender y comunicarte.",
        "que_hace": "Adapta las preguntas, te explica las cosas y te ayuda si te bloqueas.",
        "como_reconocerlo": "No lleva toga. Se sienta cerca de ti.",
        "icono": "🤝",
        "pictograma": "ayuda"
    },
    {
        "nombre": "Testigo",
        "descripcion": "Persona que vio o sabe algo del caso.",
        "que_hace": "Cuenta lo que sabe. Tiene que decir la verdad.",
        "como_reconocerlo": "No lleva toga. Entra a la sala cuando le llaman.",
        "icono": "👁️",
        "pictograma": "testigo"
    }
]
