"""
Datos estructurados para citaciones judiciales, sentencias en lectura fácil,
fases del procedimiento y roles judiciales.
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

MOCK_SENTENCIA = """
JUZGADO DE LO PENAL Nº 2 DE A CORUÑA
Procedimiento Abreviado 114/2026 — Sentencia nº 318/2026

FALLO

Que debo ABSOLVER Y ABSUELVO libremente a Dña. MARÍA CARMEN R. V. del delito de 
hurto continuado del artículo 234.1 del Código Penal por el que venía siendo acusada, 
con declaración de las costas procesales de oficio y alzamiento de cuantas medidas 
cautelares se hubieran adoptado contra su persona.

Contra la presente resolución cabe interponer recurso de apelación ante la Audiencia 
Provincial de A Coruña en el plazo de DIEZ DÍAS hábiles contados desde el siguiente 
al de su notificación, conforme al artículo 790 de la Ley de Enjuiciamiento Criminal.
"""

PIPELINE_SUMA_IAS = [
    {
        "paso": 1,
        "nombre": "Extracción y estructura documental",
        "detalle": "Identifica órgano judicial, rol de la persona, fechas, importes y artículos legales.",
    },
    {
        "paso": 2,
        "nombre": "Traducción jurídica a lenguaje claro (ISO 24495-1)",
        "detalle": "Sustituye tecnicismos procesales por frases directas en voz activa.",
    },
    {
        "paso": 3,
        "nombre": "Adaptación a Lectura Fácil (UNE 153101) y Discalculia",
        "detalle": "Divide en una idea por línea y convierte cifras y plazos en palabras comprensibles.",
    },
    {
        "paso": 4,
        "nombre": "Síntesis multimodal (Pictogramas ARASAAC + Voz)",
        "detalle": "Enlaza conceptos visuales validados y prepara la lectura por voz.",
    },
]

MOCK_RESPONSE_LUIS = {
    "datos_clave": {
        "tipo_documento": "citacion",
        "rol": "testigo",
        "tipo_procedimiento": "Diligencias Previas (penal)",
        "organo": "Juzgado de Instrucción nº 3 de A Coruña",
        "fecha": "10 de noviembre de 2026",
        "hora": "10:00",
        "lugar": "Juzgado de Instrucción nº 3, A Coruña",
        "numero_procedimiento": "245/2026",
        "que_llevar": ["DNI o documento de identidad"],
        "puedo_pedir_ajustes": True,
        "base_legal_ajustes": "Artículo 7 bis de la Ley de Enjuiciamiento Civil",
        "apoyo_numerico": [
            {
                "etiqueta": "Hora de la cita",
                "cifra": "10:00 h",
                "en_palabras": "Las diez en punto de la mañana (te recomendamos llegar a las diez menos cuarto).",
            },
            {
                "etiqueta": "Tiempo que falta",
                "cifra": "21 días",
                "en_palabras": "Faltan tres semanas completas desde hoy hasta el martes diez de noviembre.",
            },
            {
                "etiqueta": "Posible multa si no avisas",
                "cifra": "200 € a 5.000 €",
                "en_palabras": "Entre doscientos euros y cinco mil euros solo si faltas sin motivo ni aviso.",
            },
        ],
        "que_pasa_si_no_voy": {
            "resumen": "Como testigo tienes obligación de acudir, pero si ese día estás enfermo o tienes un motivo importante, puedes avisar antes al juzgado.",
            "pasos_si_no_puedes": [
                "Llama o escribe al Juzgado de Instrucción nº 3 de A Coruña en cuanto sepas que no puedes ir.",
                "Presenta un justificante (por ejemplo, un parte médico o certificado de trabajo).",
                "El juzgado te dará una nueva fecha sin ponerte ninguna multa.",
            ],
            "mensaje_calma": "La multa solo se aplica si una persona no va y tampoco avisa ni justifica el motivo.",
        },
        "pasos_super_simples": [
            "1. Te llaman como testigo: NO te acusan de nada.",
            "2. Día: martes 10 de noviembre a las 10 de la mañana.",
            "3. Lugar: Juzgado de Instrucción número 3 de A Coruña.",
            "4. Lleva tu carné de identidad (DNI).",
            "5. Solo tienes que contar lo que viste o escuchaste con tus propias palabras.",
            "6. Puedes llevar tu Pasaporte de Ajustes para esperar en un lugar tranquilo.",
        ],
        "pipeline_ia": PIPELINE_SUMA_IAS,
    },
    "lectura_clara": """Te citan como TESTIGO en un proceso penal.

📅 CUÁNDO: Martes 10 de noviembre de 2026, a las 10:00 de la mañana.

📍 DÓNDE: Juzgado de Instrucción número 3 de A Coruña.

🎯 QUÉ TIENES QUE HACER: Ir al juzgado y contar lo que viste o sabes sobre unos hechos. No te acusan de nada, solo quieren escuchar tu versión.

📋 QUÉ LLEVAR: Tu DNI o carné de identidad.

⚠️ SI NO PUEDES IR ESE DÍA: Tienes obligación de acudir. Si estás enfermo o tienes una causa justificada, avisa antes al juzgado con un justificante para que cambien la fecha sin multa.

✅ PUEDES PEDIR APOYOS: Tienes derecho a pedir una sala de espera tranquila, preguntas de una en una y más tiempo para responder (artículo 7 bis LEC).""",
    "lectura_facil": """Te llaman para ir al juzgado.

Eres TESTIGO.
Eso significa que no te acusan de nada.
Solo quieren que cuentes lo que sabes.

TIENES QUE IR el martes 10 de noviembre.
A las diez de la mañana.
Al Juzgado número 3 de A Coruña.

LLEVA tu DNI.

Si no vas y no avisas,
te pueden poner una multa.
La multa es dinero que tienes que pagar:
entre doscientos y cinco mil euros.
Si estás enfermo, avisa antes al juzgado.

PUEDES PEDIR AYUDA.
Por ejemplo:
- Esperar en una sala tranquila.
- Más tiempo para contestar.
- Que te hagan preguntas claras y de una en una.

Es tu derecho. La ley lo dice.""",
    "plazos": [
        {
            "descripcion": "Día de la declaración como testigo",
            "fecha": "2026-11-10",
            "dias_restantes": 20,
        }
    ],
    "pictogram_keywords": [
        "juzgado",
        "testigo",
        "hablar",
        "escuchar",
        "documento",
        "calendario",
        "ayuda",
        "tranquilo",
    ],
}

MOCK_RESPONSE_JUAN = {
    "datos_clave": {
        "tipo_documento": "citacion",
        "rol": "investigado",
        "tipo_procedimiento": "Juicio por delito leve",
        "delito": "Estafa leve (art. 248 CP, menos de 400 euros)",
        "organo": "Juzgado de Instrucción nº 7 de A Coruña",
        "fecha": "12 de noviembre de 2026",
        "hora": "09:30",
        "lugar": "Juzgado de Instrucción nº 7, A Coruña",
        "numero_procedimiento": "892/2026",
        "que_llevar": [
            "DNI o documento de identidad",
            "Pruebas de la venta (capturas de mensajes, Bizum y resguardo de envío)",
        ],
        "derechos": [
            "Puedes no decir nada (guardar silencio)",
            "No tienes que declarar contra ti mismo",
            "Tienes derecho a un abogado (gratis si no puedes pagarlo)",
            "Puedes presentar pruebas hasta el mismo día del juicio",
            "Tienen que explicarte los documentos en un formato accesible y por voz",
        ],
        "puedo_pedir_ajustes": True,
        "base_legal_ajustes": "Artículo 118 de la Ley de Enjuiciamiento Criminal y Art. 7 bis LEC",
        "apoyo_numerico": [
            {
                "etiqueta": "Importe reclamado",
                "cifra": "Menos de 400 €",
                "en_palabras": "Menos de cuatrocientos euros. Por eso se tramita como delito leve.",
            },
            {
                "etiqueta": "Hora del juicio",
                "cifra": "09:30 h",
                "en_palabras": "Las nueve y media de la mañana del jueves doce de noviembre.",
            },
            {
                "etiqueta": "Plazo para llevar pruebas",
                "cifra": "22 días",
                "en_palabras": "Tienes tres semanas completas para reunir tus capturas y recibos hasta el doce de noviembre.",
            },
        ],
        "que_pasa_si_no_voy": {
            "resumen": "Si no acudes al juicio sin avisar, el juicio puede celebrarse sin escuchar tu versión o pueden ponerte una sanción.",
            "pasos_si_no_puedes": [
                "Pide un abogado de oficio cuanto antes para que te asesore.",
                "Si tienes una urgencia médica ese día, avisa de inmediato al Juzgado de Instrucción nº 7.",
                "Lleva preparadas tus pruebas para que el juez escuche tu explicación.",
            ],
            "mensaje_calma": "Ir al juicio te permite explicar qué pasó con el envío y mostrar tus comprobantes.",
        },
        "pasos_super_simples": [
            "1. Te citan para aclarar una venta por internet de menos de cuatrocientos euros.",
            "2. Día: jueves 12 de noviembre a las nueve y media de la mañana.",
            "3. Lugar: Juzgado de Instrucción número 7 de A Coruña.",
            "4. Tienes derecho a un abogado gratis y a que te lean todos los documentos en voz alta.",
            "5. Lleva tus pruebas: los mensajes del comprador, el Bizum y el resguardo de Correos.",
            "6. Puedes pedir pausas cada quince minutos durante la vista.",
        ],
        "pipeline_ia": PIPELINE_SUMA_IAS,
    },
    "lectura_clara": """Te citan como INVESTIGADO en un juicio por delito leve.

📅 CUÁNDO: Jueves 12 de noviembre de 2026, a las 9 y media de la mañana.

📍 DÓNDE: Juzgado de Instrucción número 7 de A Coruña.

⚖️ DE QUÉ TRATA EL CASO: De una denuncia por una venta en internet por un importe menor de cuatrocientos euros (artículo 248 del Código Penal).

🛡️ TUS DERECHOS PRINCIPALES:
1. Puedes guardar silencio o contestar solo a las preguntas que quieras.
2. Tienes derecho a un abogado (si no puedes pagarlo, puedes pedir uno de oficio gratis).
3. Puedes llevar pruebas que demuestren tu versión hasta el mismo día del juicio.
4. Tienes derecho a que te describan por voz todas las pruebas visuales y documentos.

✅ APOYOS QUE PUEDES PEDIR: Lectura en voz alta de documentos, descripción verbal de pantallas o fotos, y pausas cada 15 minutos.""",
    "lectura_facil": """Te llaman para ir a un juicio.

Eres INVESTIGADO.
Eso significa que otra persona
puso una denuncia contra ti.

Es por una venta en internet.
La cantidad es menor de cuatrocientos euros.

TIENES DERECHOS:

1. Puedes NO hablar si no quieres.
2. Tienes derecho a un ABOGADO.
   Si no tienes dinero, te dan uno gratis.
3. Puedes llevar PRUEBAS.
   Las pruebas demuestran que dices la verdad.

EL JUICIO es el jueves 12 de noviembre.
A las nueve y media de la mañana.
En el Juzgado número 7 de A Coruña.

PUEDES PEDIR AYUDA.
Por ejemplo:
- Que te lean los papeles en voz alta.
- Que te describan las fotos y pantallas.
- Descansos cortos durante el juicio.""",
    "plazos": [
        {
            "descripcion": "Último día para aportar pruebas de la venta",
            "fecha": "2026-11-12",
            "dias_restantes": 22,
        },
        {
            "descripcion": "Celebración del juicio en el Juzgado nº 7",
            "fecha": "2026-11-12",
            "dias_restantes": 22,
        },
    ],
    "pictogram_keywords": [
        "juzgado",
        "juicio",
        "abogado",
        "derechos",
        "prueba",
        "escuchar",
        "hablar",
        "ayuda",
        "calendario",
    ],
}

MOCK_RESPONSE_SENTENCIA = {
    "datos_clave": {
        "tipo_documento": "sentencia",
        "rol": "persona absuelta (inocente)",
        "tipo_procedimiento": "Sentencia Penal 318/2026 (Procedimiento Abreviado)",
        "organo": "Juzgado de lo Penal nº 2 de A Coruña",
        "fecha": "Notificada hoy (plazo de 10 días hábiles para recurso)",
        "hora": "Sin cita presencial pendiente",
        "lugar": "Juzgado de lo Penal nº 2, A Coruña",
        "numero_procedimiento": "114/2026",
        "que_llevar": [
            "No tienes que ir al juzgado: el juicio ya ha terminado con resultado favorable",
            "Guarda una copia de esta sentencia para tus archivos",
        ],
        "derechos": [
            "Quedas libre de toda responsabilidad penal en este caso",
            "No tienes que pagar los gastos del juicio (costas de oficio)",
            "Se cancelan todas las medidas provisionales que hubiera contra ti",
        ],
        "puedo_pedir_ajustes": True,
        "base_legal_ajustes": "Art. 7 bis LEC y Convenio CGPJ sobre sentencias en Lectura Fácil",
        "apoyo_numerico": [
            {
                "etiqueta": "Multa o castigo",
                "cifra": "0 € (Absuelta)",
                "en_palabras": "Cero euros y ningún castigo. El juez te declara inocente.",
            },
            {
                "etiqueta": "Gastos del juicio (costas)",
                "cifra": "0 € para ti",
                "en_palabras": "Costas de oficio significa que el Estado asume los gastos y tú no pagas nada.",
            },
            {
                "etiqueta": "Plazo de recurso de la otra parte",
                "cifra": "10 días hábiles",
                "en_palabras": "Diez días laborables (sin contar sábados, domingos ni festivos) por si la acusación quiere recurrir.",
            },
        ],
        "que_pasa_si_no_voy": {
            "resumen": "Esta carta es una sentencia, no una citación. No tienes que ir al juzgado.",
            "pasos_si_no_puedes": [
                "Consulta con tu abogado para confirmar cuándo la sentencia es firme (definitiva).",
                "Pasados diez días hábiles sin recurso, el caso queda cerrado para siempre.",
            ],
            "mensaje_calma": "El resultado es favorable para ti: has sido declarada inocente.",
        },
        "pasos_super_simples": [
            "1. El juez ya ha tomado su decisión final.",
            "2. Eres declarada INOCENTE (absuelta).",
            "3. No recibirás ningún castigo ni multa.",
            "4. Tampoco tienes que pagar los gastos del juicio.",
            "5. Se quitan todas las medidas que hubiera contra ti.",
        ],
        "pipeline_ia": PIPELINE_SUMA_IAS,
    },
    "lectura_clara": """DECISIÓN DEL JUEZ (SENTENCIA): Eres declarada INOCENTE.

✅ RESULTADO PRINCIPAL: El Juzgado de lo Penal número 2 de A Coruña te absuelve del delito de hurto del que te acusaban. No tendrás ningún castigo.

💶 GASTOS DEL JUICIO: Las costas se declaran "de oficio". Eso significa que tú NO tienes que pagar los gastos del juzgado.

🔓 MEDIDAS CAUTELARES: Se cancela cualquier obligación o medida provisional que tuvieras durante el proceso.

📅 PLAZO DE DIEZ DÍAS: La otra parte tiene diez días laborables (sin contar fines de semana ni festivos) por si quiere recurrir la sentencia ante la Audiencia Provincial.""",
    "lectura_facil": """Esta carta es la SENTENCIA del juez.
La sentencia es la decisión final del juicio.

La mujer acusada del robo
finalmente NO será castigada.

El juez la declara INOCENTE
porque no hay pruebas contra ella.

No tienes que pagar ninguna multa.
Tampoco tienes que pagar los gastos del juicio.

Todas las medidas contra ti se terminan.

Durante diez días laborables,
la otra parte puede pedir que otro tribunal revise el caso.
Tu abogado te avisará cuando el caso quede cerrado del todo.""",
    "plazos": [
        {
            "descripcion": "Fin del plazo de 10 días hábiles para que la sentencia sea firme",
            "fecha": "2026-11-05",
            "dias_restantes": 15,
        }
    ],
    "pictogram_keywords": [
        "sentencia",
        "juez",
        "inocente",
        "documento",
        "derechos",
        "tranquilo",
    ],
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
                "pictograma": "carta",
            },
            {
                "numero": 2,
                "nombre": "Preparación",
                "descripcion": "Los días antes del juicio, puedes prepararte.",
                "icono": "📝",
                "que_hacer": "Recuerda lo que viste. Puedes pedir ajustes si los necesitas.",
                "pictograma": "pensar",
            },
            {
                "numero": 3,
                "nombre": "Llegada al juzgado",
                "descripcion": "El día de la cita, llegas al juzgado.",
                "icono": "🏛️",
                "que_hacer": "Llega 15 minutos antes. Pasa el control de seguridad. Espera a que te llamen.",
                "pictograma": "edificio",
            },
            {
                "numero": 4,
                "nombre": "Declaración",
                "descripcion": "Entras en la sala y cuentas lo que sabes.",
                "icono": "🗣️",
                "que_hacer": "Di la verdad. Si no entiendes una pregunta, pide que te la repitan. Puedes pedir pausas.",
                "pictograma": "hablar",
            },
            {
                "numero": 5,
                "nombre": "Fin",
                "descripcion": "Cuando terminas, te puedes ir.",
                "icono": "✅",
                "que_hacer": "Ya has cumplido. Normalmente no tienes que volver.",
                "pictograma": "terminado",
            },
        ],
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
                "pictograma": "carta",
            },
            {
                "numero": 2,
                "nombre": "Buscar abogado",
                "descripcion": "Tienes derecho a un abogado que te ayude.",
                "icono": "👔",
                "que_hacer": "Si no tienes dinero, pide uno de oficio (gratis). Cuéntale todo.",
                "pictograma": "abogado",
            },
            {
                "numero": 3,
                "nombre": "Preparar pruebas",
                "descripcion": "Busca pruebas que demuestren tu versión.",
                "icono": "🔍",
                "que_hacer": "Mensajes, fotos, testigos... Todo lo que te ayude.",
                "pictograma": "buscar",
            },
            {
                "numero": 4,
                "nombre": "El juicio",
                "descripcion": "Vas al juzgado y se celebra el juicio.",
                "icono": "⚖️",
                "que_hacer": "Tu abogado te guía. Puedes hablar o guardar silencio. Di la verdad si hablas.",
                "pictograma": "juicio",
            },
            {
                "numero": 5,
                "nombre": "Sentencia",
                "descripcion": "El juez decide si eres culpable o inocente.",
                "icono": "📜",
                "que_hacer": "Si no estás de acuerdo, puedes recurrir con tu abogado.",
                "pictograma": "documento",
            },
        ],
    },
}

ROLES_JUDICIALES = [
    {
        "nombre": "Juez / Jueza",
        "descripcion": "La persona que dirige el juicio y toma la decisión final.",
        "que_hace": "Escucha a todos, hace preguntas y decide quién tiene razón.",
        "como_reconocerlo": "Lleva toga negra y se sienta en el lugar más alto de la sala.",
        "icono": "⚖️",
        "pictograma": "juez",
    },
    {
        "nombre": "Fiscal",
        "descripcion": "Representa al Estado y a la sociedad.",
        "que_hace": "En casos penales, presenta la acusación cuando cree que hubo delito.",
        "como_reconocerlo": "Lleva toga negra y se sienta a un lado de la sala.",
        "icono": "🏛️",
        "pictograma": "fiscal",
    },
    {
        "nombre": "Letrado/a de la Administración de Justicia (LAJ)",
        "descripcion": "Antes se llamaba Secretario Judicial.",
        "que_hace": "Se encarga de los papeles, las citaciones, las fechas y de registrar los ajustes.",
        "como_reconocerlo": "Lleva toga negra y se sienta cerca del juez.",
        "icono": "📋",
        "pictograma": "secretario",
    },
    {
        "nombre": "Abogado/a defensor/a",
        "descripcion": "Tu abogado, la persona que te asesora y te defiende.",
        "que_hace": "Te ayuda, prepara el caso contigo y defiende tus derechos.",
        "como_reconocerlo": "Lleva toga negra y se sienta en el estrado a tu lado.",
        "icono": "👔",
        "pictograma": "abogado",
    },
    {
        "nombre": "Abogado/a de la acusación",
        "descripcion": "El abogado de la otra parte o de quien denunció.",
        "que_hace": "Defiende a la otra persona y también puede hacerte preguntas.",
        "como_reconocerlo": "Lleva toga negra y se sienta al otro lado de la sala.",
        "icono": "👔",
        "pictograma": "abogado",
    },
    {
        "nombre": "Facilitador/a judicial",
        "descripcion": "Profesional neutral que apoya tu comprensión y comunicación.",
        "que_hace": "Adapta las preguntas, explica qué pasa en cada momento y avisa al juez si necesitas una pausa.",
        "como_reconocerlo": "No lleva toga. Se sienta cerca de ti.",
        "icono": "🤝",
        "pictograma": "ayuda",
    },
    {
        "nombre": "Perito o Médico Forense",
        "descripcion": "Especialista técnico o médico que aporta un informe al juez.",
        "que_hace": "Explica datos médicos, psicológicos o técnicos y puede acreditar tus necesidades de ajuste.",
        "como_reconocerlo": "No lleva toga. Acude cuando lo llaman para explicar su informe.",
        "icono": "🩺",
        "pictograma": "persona",
    },
    {
        "nombre": "Testigo",
        "descripcion": "Persona que vio o escuchó algo relacionado con el caso.",
        "que_hace": "Cuenta lo que sabe contestando a las preguntas con la verdad.",
        "como_reconocerlo": "No lleva toga. Espera fuera y entra a la sala solo cuando le llaman.",
        "icono": "👁️",
        "pictograma": "testigo",
    },
]
