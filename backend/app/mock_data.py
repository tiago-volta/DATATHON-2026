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

Se le apercibe de que, si no comparece al primer llamamiento sin causa justificada, 
podrá ser sancionado con multa de 200 a 5.000 euros (art. 420 LECrim). Si persiste 
en no comparecer, podrá ser conducido por los agentes de la autoridad ante el juzgado 
y perseguido por obstrucción a la justicia (arts. 420 LECrim y 463 CP). Si comparece 
y se niega a declarar sin causa legal, podrá incurrir en delito de desobediencia grave.

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
la celebración del juicio por delito leve de estafa (art. 248.3 CP, cuantía que no 
excede de 400 euros) por los hechos ocurridos el 3 de octubre de 2026 relativos a una 
compraventa en línea.

Se le informa de sus derechos conforme al artículo 118 de la Ley de Enjuiciamiento 
Criminal:
- Derecho a guardar silencio no declarando si no desea hacerlo (art. 118.1.h).
- Derecho a no declarar contra sí mismo y a no confesarse culpable (art. 118.1.g).
- Derecho a designar abogado de su elección o a solicitar asistencia jurídica gratuita 
  (art. 118.1.e y Ley 1/1996, art. 6.3.b; la asistencia letrada es optativa en delito leve, art. 967.1).
- Derecho a ser informado de los hechos y a examinar las actuaciones (art. 118.1.a y b). 
  Se adjunta copia de la denuncia conforme al art. 967.1 LECrim.
- Derecho a traducción e interpretación gratuitas si fuera necesario (art. 118.1.f).
- Derecho a adaptaciones y apoyos en la comunicación (art. 7 bis LEC y art. 109 LECrim).

Podrá presentar pruebas de descargo hasta el día del juicio.
Se le apercibe de que, si no comparece ni alega causa justa, el juicio podrá celebrarse 
en su ausencia (art. 971 LECrim) y podrá imponérsele una multa de 200 a 2.000 euros (art. 967.2 LECrim).

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
            "resumen": "Como testigo tienes la obligación legal de acudir (art. 410 LECrim). Si tienes un impedimento médico o de fuerza mayor justificado, debes avisar al juzgado de inmediato aportando justificante.",
            "pasos_si_no_puedes": [
                "Llama o escribe al Juzgado de Instrucción nº 3 de A Coruña en cuanto sepas que no puedes ir.",
                "Presenta un justificante (por ejemplo, un parte médico o certificado de trabajo).",
                "El juez valorará la causa justificada para acordar una nueva fecha de citación sin sanción (art. 420 LECrim).",
            ],
            "mensaje_calma": "La ley prevé multa de 200 a 5.000 € y conducción policial si faltas sin causa justificada (art. 420 LECrim). Justificar a tiempo protege tus derechos.",
        },
        "pasos_super_simples": [
            "1. Te llaman como testigo: NO te acusan de nada.",
            "2. Día: martes 10 de noviembre a las 10 de la mañana.",
            "3. Lugar: Juzgado de Instrucción número 3 de A Coruña.",
            "4. Lleva tu carné de identidad (DNI).",
            "5. Tienes la obligación legal de decir la verdad (art. 433 LECrim). Si no recuerdas algo, responder 'no me acuerdo' es válido. Si eres pariente directo del investigado, puedes no declarar contra él (art. 416 LECrim).",
            "6. Puedes llevar tu Pasaporte de Ajustes para esperar en un lugar tranquilo.",
        ],
        "privacidad_rgpd": {
            "anonimizado_antes_de_ia": True,
            "art_rgpd": "Artículo 25 RGPD (Privacidad desde el diseño) y Minimización de Datos",
            "garantia": "Tus datos personales identificativos (DNI/NIE, nombres, domicilio, teléfonos o emails) se detectaron y enmascararon en local antes de enviar el documento al modelo de IA.",
            "total_protegidos": 3,
            "elementos_protegidos": [
                {
                    "tipo": "Nombre y apellidos de la persona",
                    "marcador": "[PERSONA_1]",
                    "valor_protegido": "L*** G*** F***",
                },
                {
                    "tipo": "DNI / Documento de Identidad",
                    "marcador": "[DNI_1]",
                    "valor_protegido": "32.***-Y",
                },
                {
                    "tipo": "Dirección postal / Domicilio",
                    "marcador": "[DOMICILIO_1]",
                    "valor_protegido": "C/ E***, 15, 15001 A Coruña",
                },
            ],
        },
        "pipeline_ia": PIPELINE_SUMA_IAS,
    },
    "lectura_clara": """Te citan como TESTIGO en un proceso penal (Diligencias Previas).

📅 CUÁNDO: Martes 10 de noviembre de 2026, a las 10:00 horas.

📍 DÓNDE: Juzgado de Instrucción número 3 de A Coruña.

🎯 QUÉ TIENES QUE HACER: Ir al juzgado y declarar sobre los hechos. No estás acusado de ningún delito.

⚖️ DEBER DE DECIR LA VERDAD: Prestarás juramento o promesa de decir la verdad. Mentir conscientemente es delito de falso testimonio (art. 433 LECrim). Si dudas o no recuerdas algo con exactitud, responder "no lo recuerdo" o "no lo sé" es plenamente legítimo.

🛡️ DISPENSA POR PARENTESCO: Si la persona investigada es tu cónyuge o familiar directo, la ley te dispensa de declarar contra ella (art. 416 LECrim).

⚠️ OBLIGACIÓN DE ACUDIR: Comparecer es obligatorio por ley. Si no vas ni justiprecisas tu ausencia, el juez puede imponer multa de 200 a 5.000 € y ordenar conducción policial (art. 420 LECrim). Si estás enfermo o impedido, avisa de inmediato aportando justificante.

✅ DERECHO A APOYOS: Puedes pedir sala de espera tranquila, pausas y preguntas comprensibles de una en una (artículo 7 bis LEC y art. 109 LECrim).""",
    "lectura_facil": """Te llaman para ir al juzgado.

Eres TESTIGO.
Eso significa que no te acusan de nada.
Solo quieren que cuentes con la verdad lo que sabes.

TIENES QUE IR el martes 10 de noviembre.
A las diez de la mañana.
Al Juzgado número 3 de A Coruña.

OBLIGACIÓN DE DECIR LA VERDAD:
1. Tienes la obligación legal de decir la verdad.
2. Mentir en el juicio es un delito de falso testimonio (art. 458 del Código Penal).
3. Si no te acuerdas de algo, puedes decir tranquilamente "no me acuerdo".
4. Si el investigado es tu familiar cercano, la ley te permite no declarar contra él (artículo 416).

SI NO PUEDES IR:
- Avisa con urgencia al juzgado y entrega un justificante médico.
- El juez valorará el justificante para fijar otro día sin multa.
- Si no vas y no avisas, la multa es de 200 a 5.000 euros y la policía puede ir a buscarte (artículo 420).

PUEDES PEDIR AYUDA (artículo 7 bis):
- Esperar en una sala tranquila.
- Más tiempo para contestar.
- Preguntas claras, una a una.""",
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
        "delito": "Estafa leve (art. 248.3 CP, cuantía no superior a 400 euros)",
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
            "Derecho a guardar silencio y no declarar si no deseas hacerlo (art. 118.1.h LECrim)",
            "Derecho a no declarar contra ti mismo y a no confesarte culpable (art. 118.1.g LECrim)",
            "Derecho a ser asistido por abogado si lo deseas (art. 967.1 LECrim). La asistencia letrada no es obligatoria en delito leve. Si careces de recursos, puedes solicitar justicia gratuita y el juzgado resolverá si procede (art. 6.3.b Ley 1/1996)",
            "Derecho a ser informado de los hechos y a examinar la denuncia adjunta (art. 118.1.a y b LECrim)",
            "Derecho a aportar pruebas y comprobantes hasta el mismo día del juicio (art. 967.1 LECrim)",
            "Derecho a adaptaciones de accesibilidad y apoyos en la comunicación (art. 7 bis LEC y art. 109 LECrim)",
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
            "resumen": "Si no compareces ni justificas causa justa, el juicio puede celebrarse en tu ausencia (art. 971 LECrim) y el juzgado puede imponerte una multa de 200 a 2.000 € (art. 967.2 LECrim).",
            "pasos_si_no_puedes": [
                "Puedes pedir justicia gratuita cuanto antes; el juzgado valorará tu solicitud según tus recursos y circunstancias (art. 6.3.b Ley 1/1996).",
                "Si tienes una urgencia médica ese día, avisa de inmediato al Juzgado de Instrucción nº 7.",
                "Lleva preparadas tus pruebas para que el juez escuche tu explicación.",
            ],
            "mensaje_calma": "Ir al juicio te permite explicar qué pasó con el envío y mostrar tus comprobantes.",
        },
        "pasos_super_simples": [
            "1. Te citan como investigado por una presunta estafa leve de menos de 400 euros (art. 248.3 CP).",
            "2. Día: jueves 12 de noviembre a las 9:30 h en el Juzgado de Instrucción número 7 de A Coruña.",
            "3. Puedes ir con abogado si quieres. Si no puedes pagarlo, puedes solicitar justicia gratuita y el juzgado decidirá si te lo asigna.",
            "4. Si no vas ni justiprecisas, el juicio se hace sin ti (art. 971) y la multa es de 200 a 2.000 euros (art. 967.2).",
            "5. Lleva tus pruebas: mensajes del comprador, Bizum y justificante de envío.",
            "6. Puedes pedir lectura en voz alta de documentos y pausas en sala.",
        ],
        "privacidad_rgpd": {
            "anonimizado_antes_de_ia": True,
            "art_rgpd": "Artículo 25 RGPD (Privacidad desde el diseño) y Minimización de Datos",
            "garantia": "Tus datos personales identificativos (DNI/NIE, nombres, domicilio, teléfonos o emails) se detectaron y enmascararon en local antes de enviar el documento al modelo de IA.",
            "total_protegidos": 3,
            "elementos_protegidos": [
                {
                    "tipo": "Nombre y apellidos de la persona",
                    "marcador": "[PERSONA_1]",
                    "valor_protegido": "J*** M*** L***",
                },
                {
                    "tipo": "DNI / Documento de Identidad",
                    "marcador": "[DNI_1]",
                    "valor_protegido": "33.***-Z",
                },
                {
                    "tipo": "Dirección postal / Domicilio",
                    "marcador": "[DOMICILIO_1]",
                    "valor_protegido": "C/ M***, 42, 15002 A Coruña",
                },
            ],
        },
        "pipeline_ia": PIPELINE_SUMA_IAS,
    },
    "lectura_clara": """Te citan como INVESTIGADO en un juicio por delito leve.

📅 CUÁNDO: Jueves 12 de noviembre de 2026, a las 09:30 horas.

📍 DÓNDE: Juzgado de Instrucción número 7 de A Coruña.

⚖️ DE QUÉ TRATA EL CASO: Denuncia por una venta en internet por un importe que no excede de 400 euros (artículo 248.3 del Código Penal).

🛡️ TUS DERECHOS Y GARANTÍAS:
1. Derecho a guardar silencio y a no confesarte culpable (art. 118.1 LECrim).
2. Derecho a acudir con abogado de tu confianza si lo deseas (art. 967.1 LECrim). La asistencia letrada no es preceptiva en delitos leves; si no tienes ingresos, puedes solicitar justicia gratuita y el tribunal decidirá sobre su asignación (art. 6.3.b Ley 1/1996).
3. Puedes aportar pruebas de descargo (mensajes, resguardos, transferencias) hasta el día del juicio.
4. Si no acudes ni justificas impedimento legal, el juicio puede celebrarse en tu ausencia (art. 971 LECrim) y pueden imponerte multa de 200 a 2.000 € (art. 967.2 LECrim).

✅ APOYOS QUE PUEDES PEDIR: Lectura en voz alta de documentos, descripción verbal de pantallas y pausas durante la vista (art. 7 bis LEC y art. 109 LECrim).""",
    "lectura_facil": """Te llaman para ir a un juicio.

Eres INVESTIGADO.
Otra persona puso una denuncia contra ti
por una venta por internet de menos de 400 euros.

TIENES DERECHOS:

1. Puedes NO hablar si no quieres.
2. Puedes ir con un ABOGADO.
   En este tipo de juicio el abogado no es obligatorio.
   Si no tienes dinero, puedes pedir justicia gratuita.
   Decide el juzgado (art. 6.3.b Ley 1/1996).
3. Puedes llevar PRUEBAS hasta el día del juicio.
4. Si no vas y no avisas con justificante,
   el juicio se hará sin ti y la multa es de 200 a 2.000 euros.

EL JUICIO es el jueves 12 de noviembre a las 9:30 h
en el Juzgado número 7 de A Coruña.

PUEDES PEDIR AYUDA (artículo 7 bis):
- Lectura de documentos en voz alta.
- Descripción de imágenes y pantallas.
- Descansos cortos durante la vista.""",
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
        "privacidad_rgpd": {
            "anonimizado_antes_de_ia": True,
            "art_rgpd": "Artículo 25 RGPD (Privacidad desde el diseño) y Minimización de Datos",
            "garantia": "Tus datos personales identificativos (DNI/NIE, nombres, domicilio, teléfonos o emails) se detectaron y enmascararon en local antes de enviar el documento al modelo de IA.",
            "total_protegidos": 1,
            "elementos_protegidos": [
                {
                    "tipo": "Nombre y apellidos de la persona",
                    "marcador": "[PERSONA_1]",
                    "valor_protegido": "M*** C*** R*** V***",
                },
            ],
        },
        "pipeline_ia": PIPELINE_SUMA_IAS,
    },
    "lectura_clara": """DECISIÓN DEL JUEZ (SENTENCIA): Eres declarada INOCENTE.

✅ RESULTADO PRINCIPAL: El Juzgado de lo Penal número 2 de A Coruña te absuelve del delito de hurto del que te acusaban. No tendrás ningún castigo.

💶 GASTOS DEL JUICIO: Las costas se declaran "de oficio". Eso significa que tú NO tienes que pagar los gastos del juzgado.

🔓 MEDIDAS CAUTELARES: Se cancela cualquier obligación o medida provisional que tuvieras durante el proceso.

📅 PLAZO DE DIEZ DÍAS: La otra parte tiene diez días laborables (sin contar fines de semana ni festivos) por si quiere recurrir la sentencia ante la Audiencia Provincial.""",
    "lectura_facil": """Esta carta es la SENTENCIA del tribunal.
La sentencia es la decisión final del juicio.

El tribunal te declara ABSUELTA (inocente).
No recibirás ningún castigo ni sanción.

No tienes que pagar ninguna multa.
Tampoco tienes que pagar los gastos del juicio (costas de oficio).

Todas las medidas que hubiera contra ti se terminan.

Durante diez días laborables (artículo 790 de la ley penal),
la otra parte puede pedir que la Audiencia Provincial revise el caso.
Tu abogado te avisará cuando la sentencia sea firme del todo.""",
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


MOCK_RESPONSE_CONDENA = {
    "datos_clave": {
        "tipo_documento": "sentencia",
        "rol": "persona condenada",
        "tipo_procedimiento": "Sentencia Penal Condenatoria",
        "organo": "Juzgado de lo Penal",
        "fecha": "Notificada recientemente",
        "hora": "Sin comparecencia presencial pendiente",
        "lugar": "Juzgado de lo Penal",
        "fallo": "condena",
        "que_llevar": [
            "Ponte en contacto con tu abogado de inmediato",
            "Conserva la sentencia íntegra notificada",
        ],
        "derechos": [
            "Derecho a interponer recurso de apelación en el plazo de 10 días hábiles (art. 790.1 LECrim)",
            "Derecho a ser asistido por abogado para la redacción del recurso",
            "Derecho a solicitar aclaración de sentencia si contiene errores manifiestos",
        ],
        "puedo_pedir_ajustes": True,
        "base_legal_ajustes": "Artículo 7 bis de la Ley de Enjuiciamiento Civil y Art. 9 LO 5/2024",
        "apoyo_numerico": [
            {
                "etiqueta": "Plazo para recurrir",
                "cifra": "10 días hábiles",
                "en_palabras": "Diez días laborables desde la notificación (art. 790.1 LECrim).",
            },
        ],
        "que_pasa_si_no_voy": {
            "resumen": "Es una sentencia condenatoria. Si no estás conforme con la resolución, es fundamental contactar con tu abogado de inmediato para presentar recurso dentro del plazo legal.",
            "pasos_si_no_puedes": [
                "Llama urgentemente al abogado que llevó tu defensa.",
                "Discute si existen motivos legales para apelar ante la Audiencia Provincial.",
                "Recuerda que pasados los diez días hábiles la sentencia deviene firme.",
            ],
            "mensaje_calma": "La condena no es firme mientras esté abierto el plazo legal de recurso de apelación.",
        },
        "pasos_super_simples": [
            "1. Esta carta es una SENTENCIA CONDENATORIA que impone una pena o sanción.",
            "2. IMPORTANTE: Contacta con tu abogado hoy mismo.",
            "3. Tienes 10 días laborables para presentar recurso de apelación (art. 790.1 LECrim).",
            "4. No dejes pasar el plazo: tu abogado debe presentar el escrito ante el juzgado.",
        ],
        "privacidad_rgpd": {
            "anonimizado_antes_de_ia": True,
            "art_rgpd": "Artículo 25 RGPD (Privacidad desde el diseño)",
            "garantia": "Tus datos personales identificativos se anonimizaron en local.",
            "total_protegidos": 1,
            "elementos_protegidos": [
                {
                    "tipo": "Nombre y apellidos de la persona",
                    "marcador": "[PERSONA_1]",
                    "valor_protegido": "Persona interesada",
                },
            ],
        },
        "pipeline_ia": PIPELINE_SUMA_IAS,
    },
    "lectura_clara": """DECISIÓN DEL JUEZ (SENTENCIA CONDENATORIA): El juzgado ha dictado sentencia imponiendo una condena o sanción.

⚠️ AVISO IMPORTANTE: No dejes pasar los plazos. Contacta hoy mismo con tu abogado para analizar la sentencia.

📅 PLAZO DE APELACIÓN: Tienes DIEZ DÍAS HÁBILES (sin contar fines de semana ni festivos) desde el día siguiente a la notificación para interponer recurso de apelación (artículo 790 de la Ley de Enjuiciamiento Criminal) si no estás conforme.

⚖️ ASISTENCIA LETRADA: Tu abogado de oficio o de confianza es quien debe redactar y presentar el recurso ante el juzgado.""",
    "lectura_facil": """Esta carta es la SENTENCIA del juez.

Es una sentencia de CONDENA.
El juez impone una sanción o castigo.

LO MÁS IMPORTANTE:
1. Habla con tu abogado hoy mismo.
2. Si no estás de acuerdo con la decisión, se puede pedir que otro tribunal la revise (recurso de apelación).
3. Tienes un plazo de diez días laborables para presentar el recurso (artículo 790 de la Ley de Enjuiciamiento Criminal).
4. No dejes pasar los días sin hablar con tu abogado.""",
    "plazos": [
        {
            "descripcion": "Plazo de 10 días hábiles para interponer recurso de apelación (art. 790 LECrim)",
            "fecha": "2026-11-05",
            "dias_restantes": 10,
        }
    ],
    "pictogram_keywords": [
        "sentencia",
        "juez",
        "abogado",
        "documento",
        "calendario",
        "atencion",
    ],
}

MOCK_RESPONSE_DESCONOCIDO = {
    "datos_clave": {
        "tipo_documento": "documento_judicial",
        "rol": "desconocido",
        "tipo_procedimiento": "Procedimiento pendiente de determinar",
        "organo": "Órgano judicial",
        "fecha": "Pendiente de comprobar en el documento original",
        "hora": "Pendiente de comprobar",
        "lugar": "Sede judicial",
        "que_llevar": ["DNI o documento de identidad", "Carta original recibida del juzgado"],
        "derechos": [
            "Derecho a ser informado de tu papel en el procedimiento",
            "Derecho a solicitar ajustes de accesibilidad (artículo 7 bis de la LEC)",
            "Derecho a consultar tus dudas en la secretaría del juzgado",
        ],
        "puedo_pedir_ajustes": True,
        "base_legal_ajustes": "Artículo 7 bis de la Ley de Enjuiciamiento Civil y Art. 9 LO 5/2024",
        "apoyo_numerico": [],
        "que_pasa_si_no_voy": {
            "resumen": "No hemos podido determinar tu papel exacto en el texto recibido. Por rigor jurídico, no inventamos tus consecuencias ni tus plazos. Revisa la carta original.",
            "pasos_si_no_puedes": [
                "Localiza en la carta original si acudes como testigo, investigado, demandante o demandado.",
                "Si tienes dudas sobre tus obligaciones, acude con la citación al juzgado o al Colegio de Abogados.",
                "Puedes llamar al número de teléfono del juzgado que aparece en el encabezado de la carta.",
            ],
            "mensaje_calma": "La notificación física original contiene el órgano y el número de autos para resolver tus dudas.",
        },
        "pasos_super_simples": [
            "1. Hemos leído el texto pero no podemos identificar tu papel con total certeza.",
            "2. No te damos información inventada: comprueba tu papel en la carta original.",
            "3. Lleva tu DNI y el documento original al juzgado o a un abogado si tienes dudas.",
            "4. Tienes derecho a pedir adaptaciones de accesibilidad (artículo 7 bis LEC).",
        ],
        "privacidad_rgpd": {
            "anonimizado_antes_de_ia": True,
            "art_rgpd": "Artículo 25 RGPD (Privacidad desde el diseño)",
            "garantia": "Tus datos personales identificativos se anonimizaron en local.",
            "total_protegidos": 0,
            "elementos_protegidos": [],
        },
        "pipeline_ia": PIPELINE_SUMA_IAS,
    },
    "lectura_clara": """DOCUMENTO JUDICIAL: No hemos podido determinar con certeza tu rol o el tipo de procedimiento en este texto.

Por rigor jurídico y para proteger tus derechos, la aplicación no inventa consecuencias penales ni obligaciones que no consten claramente en el texto recibido.

RECOMENDACIONES:
1. Revisa la carta original para identificar si se te cita como testigo, investigado, demandante o demandado.
2. Si tienes dudas sobre plazos o comparecencias, contacta con la oficina judicial del juzgado firmante o consulta con un letrado.
3. Tienes derecho a solicitar ajustes de accesibilidad conforme al artículo 7 bis de la LEC.""",
    "lectura_facil": """Hemos leído tu carta judicial,
pero NO podemos asegurar qué papel tienes en el juicio.

No queremos darte información equivocada.

QUÉ DEBES HACER:
1. Mira la carta original que te llegó.
2. Busca si pone 'testigo', 'investigado', 'demandante' o 'demandado'.
3. Si tienes dudas sobre si debes ir o qué llevar, pregunta en el juzgado o a un abogado.
4. Puedes pedir ayuda y adaptaciones claras en el juzgado (artículo 7 bis).""",
    "plazos": [],
    "pictogram_keywords": [
        "documento",
        "juzgado",
        "pregunta",
        "ayuda",
        "abogado",
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
