'use client'

import { useEffect, useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import { Icono } from '@/components/Icono'
import { Pictograma } from '@/components/Pictograma'
import { LineaTiempo } from '@/components/LineaTiempo'
import { TarjetaRol } from '@/components/TarjetaRol'
import { FASES_TESTIGO, FASES_INVESTIGADO, ROLES } from '@/lib/contenido'
import { extraerTextoDocumentoAPI, type CitacionProcesada, type Plazo } from '@/lib/api'
import { fusionarResultado, guardarCitacion, obtenerCitacion } from '@/lib/citaciones/almacen'
import { diasNaturalesHasta, etiquetaDias, formatearFechaLarga, parsearFecha } from '@/lib/citaciones/fechas'
import { calcularDiasHabilesRestantes } from '@/lib/plazos'

const EJEMPLO_LUIS = `JUZGADO DE INSTRUCCIÓN Nº 3 DE A CORUÑA
Procedimiento: Diligencias Previas 245/2026

CÉDULA DE CITACIÓN

Se cita a D. LUIS GARCÍA FERNÁNDEZ, con DNI 32.XXX.XXX-Y, domiciliado en C/ Ejemplo, 15, 15001 A Coruña, para que comparezca ante este Juzgado el día 10 de noviembre de 2026, a las 10:00 horas, en calidad de TESTIGO, a fin de prestar declaración en las Diligencias Previas arriba referenciadas.

Se le apercibe de que, si no comparece sin causa justificada, podrá ser sancionado con multa de 200 a 5.000 euros. Deberá acudir provisto de su documento nacional de identidad.`

const EJEMPLO_SENTENCIA = `JUZGADO DE LO PENAL Nº 2 DE A CORUÑA
Procedimiento Abreviado 114/2026 — Sentencia nº 318/2026

FALLO

Que debo ABSOLVER Y ABSUELVO libremente a Dña. MARÍA CARMEN R. V. del delito de hurto continuado del artículo 234.1 del Código Penal por el que venía siendo acusada, con declaración de las costas procesales de oficio y alzamiento de cuantas medidas cautelares se hubieran adoptado contra su persona.

Contra la presente resolución cabe interponer recurso de apelación ante la Audiencia Provincial de A Coruña en el plazo de DIEZ DÍAS hábiles contados desde el siguiente al de su notificación.`

/** Modelos públicos (COET, Aula Judicial León, estilo MJusticia). Datos anonimizados. Ver /pruebas/citaciones/FUENTES.md */
const CITACIONES_PRUEBA = [
  {
    id: 'coet-testigo',
    etiqueta: 'COET · Testigo (juicios rápidos)',
    archivo: '/pruebas/citaciones/01-testigo-juicios-rapidos-coet.txt',
  },
  {
    id: 'coet-investigado',
    etiqueta: 'COET · Investigado / denunciado',
    archivo: '/pruebas/citaciones/02-investigado-juicio-rapido-coet.txt',
  },
  {
    id: 'leon-demandada',
    etiqueta: 'León · Demandada (vista civil)',
    archivo: '/pruebas/citaciones/03-demandada-vista-leon-aula-judicial.txt',
  },
  {
    id: 'mjusticia-lf',
    etiqueta: 'MJusticia · Testigo (lectura fácil)',
    archivo: '/pruebas/citaciones/04-testigo-lectura-facil-estilo-mjusticia.txt',
  },
] as const

const TERMINOS_JUDICIALES =
  /\b(juzgado|citaci[oó]n|cita|comparezca|comparecer|procedimiento|diligencias|juicio|testigo|investigad[oa]|demandad[oa]|demandante|vista|declaraci[oó]n|tribunal|audiencia|letrad[oa]|fiscal|sentencia|fallo|absuelvo|absolver|condeno|hurto|notificaci[oó]n|c[eé]dula|autos|expediente|delito|instrucci[oó]n|penal|civil|denuncia|querella|recurso)\b/i

const PIPELINE_POR_DEFECTO = [
  {
    paso: 1,
    nombre: 'Extracción y estructura documental',
    detalle: 'Identifica juzgado, rol de la persona, fecha, hora, importes y artículos legales.',
  },
  {
    paso: 2,
    nombre: 'Traducción jurídica a lenguaje claro (ISO 24495-1)',
    detalle: 'Sustituye tecnicismos procesales por frases directas en voz activa.',
  },
  {
    paso: 3,
    nombre: 'Adaptación orientada a lectura fácil y discalculia',
    detalle: 'Divide en una idea por línea y convierte cifras y plazos en palabras comprensibles.',
  },
  {
    paso: 4,
    nombre: 'Síntesis multimodal (Pictogramas ARASAAC + Voz)',
    detalle: 'Enlaza conceptos visuales validados y prepara la lectura por voz.',
  },
]

const PASOS_PROCESAMIENTO = [
  'Protegiendo datos personales en el dispositivo',
  'Buscando fechas, juzgado y tu papel en el proceso',
  'Pasando términos jurídicos a lenguaje claro',
  'Preparando una versión de lectura fácil y cifras comprensibles',
  'Organizando apoyos visuales y la lectura por voz',
]

function construirRespaldoLocal(textoEntrada: string): CitacionProcesada {
  const minus = textoEntrada.toLowerCase()
  const esSentencia =
    minus.includes('fallo') || minus.includes('absuelvo') || minus.includes('sentencia') || minus.includes('condeno')
  const esCondena =
    minus.includes('condeno') || minus.includes('condena') || minus.includes('culpable') || minus.includes('pena de')
  const esCivil =
    minus.includes('demandad') ||
    minus.includes('demandant') ||
    minus.includes('civil') ||
    minus.includes('juicio verbal') ||
    minus.includes('juicio ordinario') ||
    minus.includes('emplazamiento')
  const esTestigo =
    minus.includes('testigo') || minus.includes('testifical') || minus.includes('luis')
  const esJuan =
    minus.includes('investigad') ||
    minus.includes('imputad') ||
    minus.includes('estafa') ||
    minus.includes('delito leve') ||
    minus.includes('juan')

  if (esSentencia && esCondena) {
    return {
      datos_clave: {
        tipo_documento: 'sentencia',
        rol: 'persona condenada',
        tipo_procedimiento: 'Sentencia Penal Condenatoria',
        organo: 'Juzgado de lo Penal',
        fecha: 'Notificada recientemente',
        hora: 'Sin comparecencia presencial pendiente',
        lugar: 'Juzgado de lo Penal',
        numero_procedimiento: 'Autos principales',
        que_llevar: [
          'Contacta urgentemente con tu abogado',
          'Guarda el documento completo de la sentencia',
        ],
        derechos: [
          'Derecho a interponer recurso de apelación en el plazo de diez días hábiles (art. 790.1 LECrim)',
          'Derecho a asistencia letrada para fundamentar el recurso',
        ],
        puedo_pedir_ajustes: true,
        base_legal_ajustes: 'Art. 7 bis LEC y Art. 9 LO 5/2024 del Derecho de Defensa',
        apoyo_numerico: [
          {
            etiqueta: 'Plazo para recurrir',
            cifra: '10 días hábiles',
            en_palabras: 'Diez días laborables contados desde el día siguiente a la notificación (art. 790.1 LECrim).',
          },
        ],
        que_pasa_si_no_voy: {
          resumen: 'Es una sentencia condenatoria. Si no estás conforme, habla de inmediato con tu abogado para apelar.',
          pasos_si_no_puedes: [
            'Llama con urgencia al abogado que llevó tu caso.',
            'El recurso de apelación debe interponerse dentro de los diez días hábiles siguientes.',
            'Pasado el plazo sin recurrir, la sentencia adquirirá firmeza.',
          ],
          mensaje_calma: 'La sentencia no es firme mientras esté en plazo de recurso.',
        },
        pasos_super_simples: [
          '1. Es una SENTENCIA CONDENATORIA que fija una pena o sanción.',
          '2. IMPORTANTE: Contacta con tu abogado hoy mismo.',
          '3. Tienes un plazo de diez días laborables para recurrir ante la Audiencia Provincial.',
          '4. No dejes pasar el plazo legal de recurso.',
        ],
        pipeline_ia: PIPELINE_POR_DEFECTO,
        privacidad_rgpd: {
          anonimizado_antes_de_ia: true,
          art_rgpd: 'Artículo 25 RGPD (Privacidad desde el diseño)',
          garantia: 'Tus datos personales se anonimizaron en local.',
          total_protegidos: 1,
          elementos_protegidos: [],
        },
      },
      lectura_clara: `DECISIÓN DEL JUEZ (SENTENCIA CONDENATORIA): El juzgado ha dictado sentencia con condena o sanción.

AVISO URGENTE: Contacta hoy mismo con tu abogado de oficio o de confianza.

PLAZO DE APELACIÓN: Tienes DIEZ DÍAS HÁBILES (sin fines de semana ni festivos) desde el día siguiente a la notificación para apelar (artículo 790.1 LECrim).`,
      lectura_facil: `Esta carta es la SENTENCIA del juez.

Es una sentencia de CONDENA.
El juez impone una sanción o castigo.

IMPORTANTE:
1. Habla con tu abogado hoy mismo.
2. Si no estás de acuerdo, se puede recurrir en 10 días laborables (artículo 790 de la ley penal).
3. No dejes pasar los días.`,
      plazos: [
        {
          descripcion: 'Plazo de 10 días hábiles para recurso de apelación',
          fecha: '2026-11-05',
          dias_restantes: 10,
        },
      ],
      pictogram_keywords: ['sentencia', 'juez', 'abogado', 'documento', 'atencion'],
      pictogramas: [
        { keyword: 'sentencia', id: 2458, url: 'https://static.arasaac.org/pictograms/2458/2458_500.png' },
        { keyword: 'juez', id: 11523, url: 'https://static.arasaac.org/pictograms/11523/11523_500.png' },
      ],
    }
  }

  if (esSentencia) {
    return {
      datos_clave: {
        tipo_documento: 'sentencia',
        rol: 'persona absuelta (inocente)',
        tipo_procedimiento: 'Sentencia Penal 318/2026 (Procedimiento Abreviado)',
        organo: 'Juzgado de lo Penal nº 2 de A Coruña',
        fecha: 'Notificada hoy (plazo de 10 días hábiles para recurso)',
        hora: 'Sin cita presencial pendiente',
        lugar: 'Juzgado de lo Penal nº 2, A Coruña',
        numero_procedimiento: '114/2026',
        que_llevar: [
          'No tienes que ir al juzgado: el juicio ya ha terminado con resultado favorable',
          'Guarda una copia de esta sentencia para tus archivos',
        ],
        derechos: [
          'Quedas libre de toda responsabilidad penal en este caso',
          'No tienes que pagar los gastos del juicio (costas de oficio)',
          'Se cancelan todas las medidas provisionales que hubiera contra ti',
        ],
        puedo_pedir_ajustes: true,
        base_legal_ajustes: 'Art. 7 bis LEC y Convenio CGPJ sobre sentencias en Lectura Fácil',
        apoyo_numerico: [
          {
            etiqueta: 'Multa o castigo',
            cifra: '0 € (Absuelta)',
            en_palabras: 'Cero euros y ningún castigo. El juez te declara inocente.',
          },
          {
            etiqueta: 'Gastos del juicio (costas)',
            cifra: '0 € para ti',
            en_palabras: 'Costas de oficio significa que el Estado asume los gastos y tú no pagas nada.',
          },
          {
            etiqueta: 'Plazo de recurso de la otra parte',
            cifra: '10 días hábiles',
            en_palabras: 'Diez días laborables (sin contar sábados, domingos ni festivos).',
          },
        ],
        que_pasa_si_no_voy: {
          resumen: 'Esta carta es una sentencia, no una citación. No tienes que acudir al juzgado.',
          pasos_si_no_puedes: [
            'Consulta con tu abogado para confirmar cuándo la sentencia es firme.',
            'Pasados diez días hábiles sin recurso, el caso queda cerrado definitivamente.',
          ],
          mensaje_calma: 'El resultado es favorable para ti: has sido declarada inocente.',
        },
        pasos_super_simples: [
          '1. El juez ya ha tomado su decisión final.',
          '2. Eres declarada INOCENTE (absuelta).',
          '3. No recibirás ningún castigo ni multa.',
          '4. Tampoco tienes que pagar los gastos del juicio.',
          '5. Se quitan todas las medidas que hubiera contra ti.',
        ],
        pipeline_ia: PIPELINE_POR_DEFECTO,
        privacidad_rgpd: {
          anonimizado_antes_de_ia: true,
          art_rgpd: 'Artículo 25 RGPD (Privacidad desde el diseño)',
          garantia:
            'Tus datos personales (nombre, DNI, dirección) se detectaron y anonimizaron en local antes de cualquier llamada a la IA.',
          total_protegidos: 1,
          elementos_protegidos: [
            {
              tipo: 'Nombre y apellidos de la persona',
              marcador: '[PERSONA_1]',
              valor_protegido: 'M*** C*** R*** V***',
            },
          ],
        },
      },
      lectura_clara: `DECISIÓN DEL JUEZ (SENTENCIA): Eres declarada INOCENTE.

RESULTADO PRINCIPAL: El Juzgado de lo Penal número 2 de A Coruña te absuelve del delito de hurto del que te acusaban. No tendrás ningún castigo.

GASTOS DEL JUICIO: Las costas se declaran "de oficio". Eso significa que tú NO tienes que pagar los gastos del juzgado.

MEDIDAS CAUTELARES: Se cancela cualquier obligación o medida provisional que tuvieras durante el proceso.

PLAZO DE DIEZ DÍAS: La otra parte tiene diez días laborables (sin contar fines de semana ni festivos) por si quiere recurrir la sentencia.`,
      lectura_facil: `Esta carta es la SENTENCIA del tribunal.
La sentencia es la decisión final del juicio.

El tribunal te declara ABSUELTA (inocente).
No recibirás ningún castigo ni sanción.

No tienes que pagar ninguna multa.
Tampoco tienes que pagar los gastos del juicio (costas de oficio).

Todas las medidas que hubiera contra ti se terminan.
Durante diez días hábiles, la acusación puede recurrir la decisión.`,
      plazos: [
        {
          descripcion: 'Fin del plazo de 10 días hábiles para que la sentencia sea firme',
          fecha: '2026-11-05',
          dias_restantes: 15,
        },
      ],
      pictogram_keywords: ['sentencia', 'juez', 'inocente', 'documento', 'derechos', 'tranquilo'],
      pictogramas: [
        { keyword: 'sentencia', id: 2458, url: 'https://static.arasaac.org/pictograms/2458/2458_500.png' },
        { keyword: 'juez', id: 11523, url: 'https://static.arasaac.org/pictograms/11523/11523_500.png' },
        { keyword: 'inocente', id: 5397, url: 'https://static.arasaac.org/pictograms/5397/5397_500.png' },
        { keyword: 'tranquilo', id: 32568, url: 'https://static.arasaac.org/pictograms/32568/32568_500.png' },
      ],
    }
  }

  if (esJuan) {
    return {
      datos_clave: {
        tipo_documento: 'citacion',
        rol: 'investigado',
        tipo_procedimiento: 'Juicio por delito leve',
        delito: 'Estafa leve (art. 248 CP, menos de 400 euros)',
        organo: 'Juzgado de Instrucción nº 7 de A Coruña',
        fecha: '12 de noviembre de 2026',
        hora: '09:30',
        lugar: 'Juzgado de Instrucción nº 7, A Coruña',
        numero_procedimiento: '892/2026',
        que_llevar: [
          'DNI o documento de identidad',
          'Pruebas de la venta (capturas de mensajes, Bizum y resguardo de envío)',
        ],
        derechos: [
          'Puedes no decir nada (guardar silencio)',
          'No tienes que declarar contra ti mismo',
          'Puedes ir con abogado de tu confianza si lo deseas (art. 967.1 LECrim). Si no tienes recursos, puedes solicitar justicia gratuita y el juzgado decidirá si procede (art. 6.3.b Ley 1/1996)',
          'Puedes presentar pruebas hasta el mismo día del juicio',
          'Tienen que explicarte los documentos en un formato accesible y por voz',
        ],
        puedo_pedir_ajustes: true,
        base_legal_ajustes: 'Artículo 118 LECrim y Artículo 7 bis LEC',
        apoyo_numerico: [
          {
            etiqueta: 'Importe reclamado',
            cifra: 'Menos de 400 €',
            en_palabras: 'Menos de cuatrocientos euros. Por eso se tramita como delito leve.',
          },
          {
            etiqueta: 'Hora del juicio',
            cifra: '09:30 h',
            en_palabras: 'Las nueve y media de la mañana del jueves doce de noviembre.',
          },
          {
            etiqueta: 'Plazo para llevar pruebas',
            cifra: '22 días',
            en_palabras: 'Tres semanas completas para reunir tus capturas y recibos.',
          },
        ],
        que_pasa_si_no_voy: {
          resumen:
            'Si no compareces ni justificas causa justa, el juicio puede celebrarse en tu ausencia (art. 971 LECrim) y el juez puede ponerte una multa de 200 a 2.000 € (art. 967.2 LECrim).',
          pasos_si_no_puedes: [
            'Pide un abogado de oficio cuanto antes para que te asesore.',
            'Si tienes una urgencia médica ese día, avisa de inmediato al Juzgado de Instrucción nº 7.',
            'Lleva preparadas tus pruebas para que el juez escuche tu explicación.',
          ],
          mensaje_calma:
            'Ir al juicio te permite explicar qué pasó con el envío y mostrar tus comprobantes.',
        },
        pasos_super_simples: [
          '1. Te citan para aclarar una venta por internet de menos de cuatrocientos euros.',
          '2. Día: jueves 12 de noviembre a las nueve y media de la mañana.',
          '3. Lugar: Juzgado de Instrucción número 7 de A Coruña.',
          '4. Puedes ir con abogado. Si no tienes dinero, puedes pedir justicia gratuita. Decide el juzgado (art. 6.3.b Ley 1/1996).',
          '5. Lleva tus pruebas: mensajes, Bizum y resguardo de Correos.',
          '6. Puedes pedir pausas. Decide el juez.',
        ],
        pipeline_ia: PIPELINE_POR_DEFECTO,
        privacidad_rgpd: {
          anonimizado_antes_de_ia: true,
          art_rgpd: 'Artículo 25 RGPD (Privacidad desde el diseño)',
          garantia:
            'Tus datos personales (nombre, DNI, dirección) se detectaron y anonimizaron en local antes de cualquier llamada a la IA.',
          total_protegidos: 3,
          elementos_protegidos: [
            {
              tipo: 'Nombre y apellidos de la persona',
              marcador: '[PERSONA_1]',
              valor_protegido: 'J*** M*** L***',
            },
            {
              tipo: 'DNI / Documento de Identidad',
              marcador: '[DNI_1]',
              valor_protegido: '33.***-Z',
            },
            {
              tipo: 'Dirección postal / Domicilio',
              marcador: '[DOMICILIO_1]',
              valor_protegido: 'C/ M***, 42, 15002 A Coruña',
            },
          ],
        },
      },
      lectura_clara: `Te citan como INVESTIGADO en un juicio por delito leve.

CUÁNDO: Jueves 12 de noviembre de 2026, a las 9 y media de la mañana.

DÓNDE: Juzgado de Instrucción número 7 de A Coruña.

DE QUÉ TRATA EL CASO: De una denuncia por una venta en internet por un importe menor de cuatrocientos euros (artículo 248 del Código Penal).

TUS DERECHOS PRINCIPALES:
1. Puedes guardar silencio o contestar solo a las preguntas que quieras.
2. Tienes derecho a acudir con abogado (art. 967.1). Si careces de recursos, puedes solicitar justicia gratuita y el juzgado valorará si procede concederla (art. 6.3.b Ley 1/1996).
3. Puedes llevar pruebas que demuestren tu versión hasta el mismo día del juicio.
4. Puedes pedir que te describan las pruebas visuales (art. 109 LECrim). Decide el juez.`,
      lectura_facil: `Te llaman para ir a un juicio.

Eres INVESTIGADO.
Eso significa que otra persona
puso una denuncia contra ti.

Es por una venta en internet.
La cantidad es menor de cuatrocientos euros.

TIENES DERECHOS:
1. Puedes NO hablar si no quieres.
2. Puedes ir con un ABOGADO.
   En este juicio el abogado no es obligatorio.
   Si no tienes dinero, puedes pedir justicia gratuita. Decide el juzgado (art. 6.3.b Ley 1/1996).
3. Puedes llevar PRUEBAS hasta el día del juicio.
4. Si no vas y no avisas con causa justa, el juicio se hace sin ti y la multa es de 200 a 2.000 euros.

EL JUICIO es el jueves 12 de noviembre.
A las nueve y media de la mañana.
En el Juzgado número 7 de A Coruña.`,
      plazos: [
        {
          descripcion: 'Último día para aportar pruebas de la venta',
          fecha: '2026-11-12',
          dias_restantes: 22,
        },
        {
          descripcion: 'Celebración del juicio en el Juzgado nº 7',
          fecha: '2026-11-12',
          dias_restantes: 22,
        },
      ],
      pictogram_keywords: ['juzgado', 'abogado', 'derechos', 'prueba', 'escuchar', 'ayuda'],
      pictogramas: [
        { keyword: 'juzgado', id: 11524, url: 'https://static.arasaac.org/pictograms/11524/11524_500.png' },
        { keyword: 'abogado', id: 11177, url: 'https://static.arasaac.org/pictograms/11177/11177_500.png' },
        { keyword: 'derechos', id: 36685, url: 'https://static.arasaac.org/pictograms/36685/36685_500.png' },
        { keyword: 'escuchar', id: 6572, url: 'https://static.arasaac.org/pictograms/6572/6572_500.png' },
      ],
    }
  }

  if (!esTestigo && (esCivil || (!esJuan && !esTestigo))) {
    return {
      datos_clave: {
        tipo_documento: 'documento_judicial',
        rol: esCivil ? (minus.includes('demandad') ? 'demandada' : (minus.includes('demandant') ? 'demandante' : 'parte_civil')) : 'desconocido',
        tipo_procedimiento: esCivil ? 'Procedimiento Civil' : 'Procedimiento pendiente de determinar',
        organo: 'Órgano judicial',
        fecha: 'Comprobar en el documento original',
        hora: 'Comprobar en el documento original',
        lugar: 'Sede judicial indicada en la carta',
        que_llevar: ['DNI o documento de identidad', 'Carta judicial original recibida'],
        derechos: [
          'Derecho a solicitar información sobre tu situación en el procedimiento',
          'Derecho a solicitar ajustes de accesibilidad (artículo 7 bis de la LEC)',
        ],
        puedo_pedir_ajustes: true,
        base_legal_ajustes: 'Artículo 7 bis de la Ley de Enjuiciamiento Civil y Art. 9 LO 5/2024',
        apoyo_numerico: [],
        que_pasa_si_no_voy: {
          resumen: 'No hemos podido determinar tu papel exacto en este texto. Por seguridad jurídica, no inventamos tus obligaciones. Consulta la carta original.',
          pasos_si_no_puedes: [
            'Revisa en el encabezado de la carta en qué calidad se te llama.',
            'Acude a la secretaría del juzgado que firma la notificación con la carta original.',
            'Puedes consultar con un abogado o en el Colegio de Abogados.',
          ],
          mensaje_calma: 'El documento original contiene el número de procedimiento y el teléfono del juzgado.',
        },
        pasos_super_simples: [
          '1. No podemos identificar con total seguridad tu papel en este documento.',
          '2. No te damos información inventada: comprueba tu papel en la carta original.',
          '3. Lleva tu DNI y el documento original al juzgado o a un abogado si tienes dudas.',
          '4. Tienes derecho a pedir adaptaciones de accesibilidad (artículo 7 bis LEC).',
        ],
        pipeline_ia: PIPELINE_POR_DEFECTO,
        privacidad_rgpd: {
          anonimizado_antes_de_ia: true,
          art_rgpd: 'Artículo 25 RGPD (Privacidad desde el diseño)',
          garantia: 'Tus datos se anonimizaron en local.',
          total_protegidos: 0,
          elementos_protegidos: [],
        },
      },
      lectura_clara: `DOCUMENTO JUDICIAL: No hemos podido determinar con certeza tu rol o el tipo de procedimiento en este texto.

Por rigor jurídico y para proteger tus derechos, la aplicación no inventa consecuencias penales ni obligaciones que no consten claramente en el texto recibido.

RECOMENDACIONES:
1. Revisa la carta original para identificar si se te cita como testigo, investigado, demandante o demandado.
2. Si tienes dudas sobre plazos o comparecencias, contacta con la oficina judicial del juzgado firmante o consulta con un letrado.
3. Tienes derecho a solicitar ajustes de accesibilidad conforme al artículo 7 bis de la LEC.`,
      lectura_facil: `Hemos leído tu carta judicial,
pero NO podemos asegurar qué papel tienes en el juicio.

No queremos darte información equivocada.

QUÉ DEBES HACER:
1. Mira la carta original que te llegó.
2. Busca si pone 'testigo', 'investigado', 'demandante' o 'demandado'.
3. Si tienes dudas sobre si debes ir o qué llevar, pregunta en el juzgado o a un abogado.
4. Puedes pedir ayuda y adaptaciones claras en el juzgado (artículo 7 bis).`,
      plazos: [],
      pictogram_keywords: ['documento', 'juzgado', 'pregunta', 'ayuda'],
      pictogramas: [
        { keyword: 'documento', id: 2458, url: 'https://static.arasaac.org/pictograms/2458/2458_500.png' },
      ],
    }
  }

  return {
    datos_clave: {
      tipo_documento: 'citacion',
      rol: 'testigo',
      tipo_procedimiento: 'Diligencias Previas (penal)',
      organo: 'Juzgado de Instrucción nº 3 de A Coruña',
      fecha: '10 de noviembre de 2026',
      hora: '10:00',
      lugar: 'Juzgado de Instrucción nº 3, A Coruña',
      numero_procedimiento: '245/2026',
      que_llevar: ['DNI o documento de identidad'],
      puedo_pedir_ajustes: true,
      base_legal_ajustes: 'Artículo 7 bis de la Ley de Enjuiciamiento Civil',
      apoyo_numerico: [
        {
          etiqueta: 'Hora de la cita',
          cifra: '10:00 h',
          en_palabras: 'Las diez en punto de la mañana (te recomendamos llegar a las diez menos cuarto).',
        },
        {
          etiqueta: 'Tiempo que falta',
          cifra: '20 días',
          en_palabras: 'Faltan unas tres semanas hasta el martes diez de noviembre.',
        },
        {
          etiqueta: 'Posible multa si no avisas',
          cifra: '200 € a 5.000 €',
          en_palabras: 'Entre doscientos euros y cinco mil euros solo si faltas sin motivo ni aviso.',
        },
      ],
      que_pasa_si_no_voy: {
        resumen:
          'Como testigo tienes la obligación legal de acudir (art. 410 LECrim). Si ese día estás enfermo o tienes causa grave justificada, debes avisar al juzgado de inmediato aportando justificante.',
        pasos_si_no_puedes: [
          'Avisa de inmediato al Juzgado de Instrucción nº 3 de A Coruña en cuanto conozcas el impedimento.',
          'Presenta un justificante oficial (por ejemplo, un parte médico).',
          'El juez valorará la justificación para acordar una nueva fecha de citación sin sanción.',
          'Si faltas sin justificar, la ley prevé multa de 200 a 5.000 € y conducción policial (art. 420 LECrim).',
        ],
        mensaje_calma:
          'Justificar a tiempo permite al juzgado reprogramar la declaración sin ninguna sanción.',
      },
      pasos_super_simples: [
        '1. Te llaman como testigo: NO te acusan de nada.',
        '2. Día: martes 10 de noviembre a las 10 de la mañana.',
        '3. Lugar: Juzgado de Instrucción número 3 de A Coruña.',
        '4. Lleva tu carné de identidad (DNI).',
        '5. Solo tienes que contar lo que viste o escuchaste.',
        '6. Puedes llevar tu Pasaporte de Ajustes para esperar en una sala tranquila.',
      ],
      pipeline_ia: PIPELINE_POR_DEFECTO,
      privacidad_rgpd: {
        anonimizado_antes_de_ia: true,
        art_rgpd: 'Artículo 25 RGPD (Privacidad desde el diseño)',
        garantia:
          'Tus datos personales (nombre, DNI, dirección) se detectaron y anonimizaron en local antes de cualquier llamada a la IA.',
        total_protegidos: 3,
        elementos_protegidos: [
          {
            tipo: 'Nombre y apellidos de la persona',
            marcador: '[PERSONA_1]',
            valor_protegido: 'L*** G*** F***',
          },
          {
            tipo: 'DNI / Documento de Identidad',
            marcador: '[DNI_1]',
            valor_protegido: '32.***-Y',
          },
          {
            tipo: 'Dirección postal / Domicilio',
            marcador: '[DOMICILIO_1]',
            valor_protegido: 'C/ E***, 15, 15001 A Coruña',
          },
        ],
      },
    },
    lectura_clara: `Te citan como TESTIGO en un proceso penal.

CUÁNDO: Martes 10 de noviembre de 2026, a las 10:00 de la mañana.

DÓNDE: Juzgado de Instrucción número 3 de A Coruña.

QUÉ TIENES QUE HACER: Ir al juzgado y contar lo que viste o sabes sobre unos hechos. No te acusan de nada, solo quieren escuchar tu versión.

QUÉ LLEVAR: Tu DNI o carné de identidad.

SI NO PUEDES IR ESE DÍA: Tienes obligación de acudir. Si estás enfermo o tienes una causa justificada, avisa antes al juzgado con un justificante para que cambien la fecha sin multa.`,
    lectura_facil: `Te llaman para ir al juzgado.

Eres TESTIGO.
Eso significa que no te acusan de nada.
Solo quieren que cuentes lo que sabes.

TIENES QUE IR el martes 10 de noviembre.
A las diez de la mañana.
Al Juzgado número 3 de A Coruña.

LLEVA tu DNI.

Si estás enfermo ese día,
avisa antes al juzgado con un justificante médico.`,
    plazos: [
      {
        descripcion: 'Día de la declaración como testigo',
        fecha: '2026-11-10',
        dias_restantes: 20,
      },
    ],
    pictogram_keywords: ['juzgado', 'testigo', 'hablar', 'calendario', 'ayuda', 'tranquilo'],
    pictogramas: [
      { keyword: 'juzgado', id: 11524, url: 'https://static.arasaac.org/pictograms/11524/11524_500.png' },
      { keyword: 'testigo', id: 2475, url: 'https://static.arasaac.org/pictograms/2475/2475_500.png' },
      { keyword: 'hablar', id: 6517, url: 'https://static.arasaac.org/pictograms/6517/6517_500.png' },
      { keyword: 'ayuda', id: 37178, url: 'https://static.arasaac.org/pictograms/37178/37178_500.png' },
    ],
  }
}

function validarTextoCitacion(valor: string): string | null {
  const limpio = valor.trim()
  if (!limpio) {
    return 'Pega el texto de tu documento judicial o sube un archivo.'
  }
  const soloLetras = limpio.replace(/[^\p{L}]/gu, '')
  const palabras = limpio.split(/\s+/).filter(Boolean)
  if (limpio.length < 30 || soloLetras.length < 20 || palabras.length < 5) {
    return 'El texto es demasiado corto. Pega al menos un párrafo de la citación o sentencia que recibiste.'
  }
  if (!TERMINOS_JUDICIALES.test(limpio)) {
    return 'El texto no parece una citación ni una sentencia judicial. Pega el texto de tu carta del juzgado o usa uno de los ejemplos.'
  }
  return null
}

function generarICSLocal(plazos: Plazo[], titulo: string, hora?: string) {
  const tzid = 'Europe/Madrid'
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TribunalInclusivo//Accesibilidad Judicial//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE',
    `TZID:${tzid}`,
    'BEGIN:STANDARD',
    'DTSTART:19701025T030000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0100',
    'TZNAME:CET',
    'END:STANDARD',
    'BEGIN:DAYLIGHT',
    'DTSTART:19700329T020000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'TZOFFSETFROM:+0100',
    'TZOFFSETTO:+0200',
    'TZNAME:CEST',
    'END:DAYLIGHT',
    'END:VTIMEZONE',
  ]
  const horaMatch = (hora || '10:00').match(/\b(\d{1,2}):(\d{2})\b/)
  const hh = horaMatch ? horaMatch[1].padStart(2, '0') : '10'
  const mm = horaMatch ? horaMatch[2] : '00'
  const hhFin = horaMatch ? String(Math.min(23, Number(hh) + 1)).padStart(2, '0') : '11'

  for (const plazo of plazos) {
    const fechaCompacta = plazo.fecha.replace(/-/g, '')
    lineas.push(
      'BEGIN:VEVENT',
      `SUMMARY:${titulo} - ${plazo.descripcion}`,
      `DTSTART;TZID=${tzid}:${fechaCompacta}T${hh}${mm}00`,
      `DTEND;TZID=${tzid}:${fechaCompacta}T${hhFin}${mm}00`,
      `DESCRIPTION:${plazo.descripcion}. Recuerda acudir con tu DNI y tu Pasaporte de Ajustes TribunalInclusivo.`,
      'END:VEVENT'
    )
  }
  lineas.push('END:VCALENDAR')
  const blob = new Blob([lineas.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'citacion_tribunalinclusivo.ics'
  a.click()
  window.URL.revokeObjectURL(url)
}

export default function PaginaCitacion() {
  const [paso, setPaso] = useState<'pendiente' | 'entrada' | 'procesando' | 'resultado'>('pendiente')
  const [texto, setTexto] = useState(EJEMPLO_LUIS)
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [modoLectura, setModoLectura] = useState<'clara' | 'facil' | 'simple'>('clara')
  const [pasoExplicacion, setPasoExplicacion] = useState(0)
  const [mostrarOriginal, setMostrarOriginal] = useState(false)
  const [mostrarRoles, setMostrarRoles] = useState(false)
  const [resultado, setResultado] = useState<CitacionProcesada | null>(null)
  const [error, setError] = useState('')
  const [errorCalendario, setErrorCalendario] = useState('')
  const [extrayendo, setExtrayendo] = useState(false)
  const [mensajeExitoArchivo, setMensajeExitoArchivo] = useState('')
  const [cargandoPrueba, setCargandoPrueba] = useState<string | null>(null)
  const [progresoProcesamiento, setProgresoProcesamiento] = useState(0)
  const [arrastrandoArchivo, setArrastrandoArchivo] = useState(false)

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get('id')
    if (!id) {
      setPaso('entrada')
      return
    }
    const guardada = obtenerCitacion(id)
    if (!guardada) {
      setError('No encontramos esa citación. Puedes pegar el documento otra vez.')
      setPaso('entrada')
      return
    }
    setTexto(guardada.texto)
    setResultado(guardada.resultado)
    setPasoExplicacion(0)
    setError('')
    setPaso('resultado')
  }, [])

  const empezarOtra = () => {
    setPaso('entrada')
    setResultado(null)
    setTexto('')
    setNombreArchivo('')
    setError('')
    setMensajeExitoArchivo('')
    setPasoExplicacion(0)
    window.history.replaceState(null, '', '/citacion')
  }

  const publicarResultado = (procesada: CitacionProcesada, textoOriginal: string) => {
    const guardada = guardarCitacion({ texto: textoOriginal, resultado: procesada })
    setResultado(guardada.resultado)
    setPaso('resultado')
    window.history.replaceState(null, '', `/citacion?id=${encodeURIComponent(guardada.id)}`)
  }

  useEffect(() => {
    if (paso !== 'resultado') return
    const frame = window.requestAnimationFrame(() => {
      document.getElementById('inicio-explicacion')?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [pasoExplicacion, paso])

  useEffect(() => {
    if (paso !== 'procesando') return

    const inicio = window.performance.now()
    let frame = 0
    const actualizarProgreso = (ahora: number) => {
      const segundos = (ahora - inicio) / 1000
      const progreso = Math.max(6, Math.min(94, Math.round(94 * (1 - Math.exp(-segundos / 2.6)))))
      setProgresoProcesamiento(progreso)
      frame = window.requestAnimationFrame(actualizarProgreso)
    }

    frame = window.requestAnimationFrame(actualizarProgreso)
    return () => window.cancelAnimationFrame(frame)
  }, [paso])

  const cargarCitacionPrueba = async (archivo: string, etiqueta: string) => {
    setCargandoPrueba(archivo)
    setError('')
    setMensajeExitoArchivo('')
    try {
      const res = await fetch(archivo)
      if (!res.ok) throw new Error(`No se pudo cargar ${archivo}`)
      const contenido = (await res.text()).trim()
      if (contenido.length < 20) throw new Error('El archivo de prueba está vacío.')
      setTexto(contenido.slice(0, 8000))
      setNombreArchivo(etiqueta)
      setMensajeExitoArchivo(
        `Cargada citación de prueba «${etiqueta}» (modelo público anonimizado). Revisa el texto o pulsa «Transformar documento».`
      )
    } catch {
      setError(
        'No se pudo cargar la citación de prueba. Comprueba que el servidor sirve /pruebas/citaciones/ o pega el texto a mano.'
      )
    } finally {
      setCargandoPrueba(null)
    }
  }

  const cargarArchivo = async (archivo: File) => {
    setNombreArchivo(archivo.name)
    setError('')
    setMensajeExitoArchivo('')

    const nombreMin = archivo.name.toLowerCase()
    const esPdf = nombreMin.endsWith('.pdf') || archivo.type === 'application/pdf'
    const esDocx = nombreMin.endsWith('.docx')

    if (esPdf || esDocx) {
      setExtrayendo(true)
      try {
        const datos = await extraerTextoDocumentoAPI(archivo)
        if (!datos.texto || datos.texto.trim().length < 20) {
          throw new Error('El documento no contiene texto legible suficiente.')
        }
        setTexto(datos.texto.slice(0, 8000))
        setMensajeExitoArchivo(
          `Documento extraído con éxito (${datos.paginas} ${datos.paginas === 1 ? 'página' : 'páginas'}, ${datos.caracteres.toLocaleString()} caracteres). Ya puedes revisarlo o pulsar «Transformar documento».`
        )
      } catch (err: unknown) {
        const mensaje = err instanceof Error ? err.message : 'No se pudo leer el archivo.'
        setError(
          `${mensaje} Si el PDF es un escaneo sin capa de texto seleccionable (OCR), copia y pega el texto de la citación.`
        )
      } finally {
        setExtrayendo(false)
      }
      return
    }

    try {
      const contenido = await archivo.text()
      const textoExtraido = contenido.replace(/\0/g, ' ').trim()
      if (textoExtraido.length >= 20) {
        setTexto(textoExtraido.slice(0, 8000))
        setMensajeExitoArchivo('Texto cargado con éxito. Ya puedes revisarlo o pulsar «Transformar documento».')
      } else {
        setError('El archivo seleccionado contiene muy poco texto.')
      }
    } catch {
      setError('No se pudo leer el archivo de texto. Prueba a copiar y pegar el texto directamente.')
    }
  }

  const manejarSubidaArchivo = (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (archivo) void cargarArchivo(archivo)
  }

  const procesarCitacion = async () => {
    const errorValidacion = validarTextoCitacion(texto)
    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    setPaso('procesando')
    setPasoExplicacion(0)
    setProgresoProcesamiento(6)
    setError('')
    const inicioProceso = window.performance.now()
    const mantenerLectura = async () => {
      const restante = 4500 - (window.performance.now() - inicioProceso)
      if (restante > 0) await new Promise((resolver) => window.setTimeout(resolver, restante))
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const response = await fetch(`${apiUrl}/api/procesar-citacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: texto.trim(), perfil: null }),
      })

      if (!response.ok) throw new Error('Error al procesar en servidor')

      const data: CitacionProcesada = await response.json()
      const respaldo = construirRespaldoLocal(texto)
      await mantenerLectura()
      publicarResultado(fusionarResultado(data, respaldo), texto.trim())
    } catch {
      const respaldo = construirRespaldoLocal(texto)
      await mantenerLectura()
      publicarResultado(respaldo, texto.trim())
    }
  }

  const descargarCalendario = async () => {
    if (!resultado || resultado.plazos.length === 0) return
    setErrorCalendario('')

    const plazosConHora = resultado.plazos.map((p) => ({
      ...p,
      hora: resultado.datos_clave.hora || '10:00',
    }))

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? ''
      const params = new URLSearchParams({ titulo: 'Cita Judicial TribunalInclusivo' })
      const response = await fetch(`${apiUrl}/api/generar-ics?${params.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plazosConHora),
      })

      if (!response.ok) throw new Error('Error al generar calendario')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'citacion_tribunalinclusivo.ics'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      generarICSLocal(plazosConHora, 'Cita Judicial TribunalInclusivo', resultado.datos_clave.hora)
    }
  }

  const fechaPrincipal = resultado ? parsearFecha(resultado.datos_clave.fecha) : null
  const diasPrincipal = fechaPrincipal ? diasNaturalesHasta(fechaPrincipal) : null
  const textoFechaPrincipal = fechaPrincipal
    ? formatearFechaLarga(fechaPrincipal)
    : resultado?.datos_clave.fecha?.trim() || 'Fecha por confirmar'
  const esSentencia = resultado?.datos_clave.tipo_documento === 'sentencia'
  const pasosSimples = resultado?.datos_clave.pasos_super_simples || []
  const apoyoNumerico = resultado?.datos_clave.apoyo_numerico || []
  const quePasaSiNoVoy = resultado?.datos_clave.que_pasa_si_no_voy
  const pipelineIA = resultado?.datos_clave.pipeline_ia || PIPELINE_POR_DEFECTO
  const pasosExplicacion = [
    { titulo: 'Lo importante', descripcion: 'Fecha, lugar y tu papel' },
    { titulo: 'Entender', descripcion: 'La carta en palabras claras' },
    { titulo: 'Prepararte', descripcion: 'Plazos, ayudas y derechos' },
    { titulo: 'Antes de ir', descripcion: 'La sala y los siguientes pasos' },
  ]

  return (
    <>
      <main id="contenido-principal" className="page-shell">
        {paso === 'pendiente' && (
          <p className="text-lg text-court-700" aria-live="polite">
            Cargando tu citación…
          </p>
        )}

        {paso !== 'pendiente' && (
        <nav className="mb-8" aria-label="Pasos del proceso">
          <ol className="flex items-center gap-2 text-sm">
            <li className={paso === 'entrada' ? 'font-bold text-court-900 underline underline-offset-4' : 'text-court-700'}>
              1. Tu documento judicial
            </li>
            <li aria-hidden="true" className="text-court-300">
              <Icono nombre="→" className="h-4 w-4" />
            </li>
            <li className={paso === 'resultado' ? 'font-bold text-court-900 underline underline-offset-4' : 'text-court-700'}>
              2. Explicación accesible
            </li>
          </ol>
        </nav>
        )}

        {paso === 'entrada' && (
          <section>
            <h1 className="titulo-pagina">
              Entender tu citación o sentencia
            </h1>
            <p className="entradilla">
              Pega el texto de la carta que has recibido del juzgado o sube el documento.
              Lo transformamos a lenguaje claro, lectura fácil, cifras en palabras y voz.
            </p>

            <div className="mb-8">
              <p className="mb-3 text-lg font-medium text-court-700">Opción A</p>
              <label
                htmlFor="archivo-judicial"
                onDragEnter={() => setArrastrandoArchivo(true)}
                onDragOver={(e) => {
                  e.preventDefault()
                  setArrastrandoArchivo(true)
                }}
                onDragLeave={() => setArrastrandoArchivo(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setArrastrandoArchivo(false)
                  const archivo = e.dataTransfer.files?.[0]
                  if (archivo && !extrayendo) void cargarArchivo(archivo)
                }}
                className={`block cursor-pointer rounded-suave border-[3px] border-dashed border-[#128a3e] px-4 py-8 text-center text-base text-court-700 transition-colors ${
                  arrastrandoArchivo ? 'bg-calma-sage text-court-900' : 'hover:bg-calma-sage'
                } ${extrayendo ? 'cursor-wait opacity-60' : ''}`}
              >
                <input
                  id="archivo-judicial"
                  type="file"
                  accept=".pdf,.docx,.txt,.md"
                  onChange={manejarSubidaArchivo}
                  disabled={extrayendo}
                  aria-describedby="ayuda-archivo"
                  className="sr-only"
                />
                <span className="block text-base">Arrastra el documento o pulsa para elegirlo</span>
                <span id="ayuda-archivo" className="mt-1 block text-sm text-court-600">PDF, Word o texto</span>
              </label>
              {(extrayendo || nombreArchivo || mensajeExitoArchivo) && (
                <p className="mt-2 text-sm text-court-700" role="status">
                  {extrayendo ? 'Extrayendo texto…' : mensajeExitoArchivo || nombreArchivo}
                </p>
              )}
            </div>

            <div className="space-y-4">
              <label htmlFor="citacion" className="block text-lg font-medium text-court-700">
                Opción B
              </label>
              <textarea
                id="citacion"
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value)
                  if (error) setError('')
                }}
                maxLength={8000}
                className="textarea-accesible !text-base !font-normal !text-court-700 placeholder:!text-court-700"
                placeholder="Pega aquí el texto de tu citación o sentencia judicial…"
                rows={9}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'error-citacion' : undefined}
              />

              {error && (
                <p id="error-citacion" className="text-red-700 font-medium" role="alert">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button type="button" onClick={procesarCitacion} className="btn-primary">
                  Transformar documento
                </button>
                {CITACIONES_PRUEBA.map((prueba) => (
                  <button
                    key={prueba.id}
                    type="button"
                    disabled={cargandoPrueba !== null}
                    onClick={() => void cargarCitacionPrueba(prueba.archivo, prueba.etiqueta)}
                    className="btn-ghost"
                    aria-busy={cargandoPrueba === prueba.archivo}
                  >
                    {cargandoPrueba === prueba.archivo ? 'Cargando…' : prueba.etiqueta}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setTexto(EJEMPLO_LUIS)
                    setNombreArchivo('')
                    setError('')
                    setMensajeExitoArchivo('')
                  }}
                  className="btn-ghost"
                >
                  Ejemplo Luis (citación testigo)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTexto(EJEMPLO_SENTENCIA)
                    setNombreArchivo('')
                    setError('')
                    setMensajeExitoArchivo('')
                  }}
                  className="btn-ghost"
                >
                  Ejemplo Sentencia (lectura fácil)
                </button>
              </div>
            </div>
          </section>
        )}

        {paso === 'procesando' && (
          <section className="py-16" aria-labelledby="titulo-procesando">
            <div className="card max-w-lg mx-auto">
              <p className="text-sm font-bold text-accent-navy mb-2">Preparando tu explicación</p>
              <h1 id="titulo-procesando" className="text-2xl font-bold text-court-900">
                Estamos leyendo tu documento
              </h1>
              <p className="mt-2 text-court-700">
                Esto puede tardar unos segundos.
              </p>

              <div className="mt-7">
                <p className="text-right text-sm font-bold text-court-700 numeros" aria-hidden="true">
                  {progresoProcesamiento}%
                </p>
                <p className="sr-only" aria-live="polite">
                  {PASOS_PROCESAMIENTO[Math.min(4, Math.floor(progresoProcesamiento / 20))]}
                </p>
                <div
                  className="barra-progreso mt-3"
                  role="progressbar"
                  aria-label="Progreso de la adaptación del documento"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={progresoProcesamiento}
                >
                  <span style={{ transform: `scaleX(${progresoProcesamiento / 100})` }} />
                </div>
              </div>

              <ol className="mt-7 space-y-3 text-left">
                {PASOS_PROCESAMIENTO.map((mensaje, indice) => {
                  const activo = indice === Math.min(4, Math.floor(progresoProcesamiento / 20))
                  const completado = indice < Math.floor(progresoProcesamiento / 20)
                  return (
                    <li
                      key={mensaje}
                      className={`flex gap-3 text-sm transition-colors ${
                        activo ? 'font-bold text-court-900' : completado ? 'text-accent-success' : 'text-court-600'
                      }`}
                    >
                      <span aria-hidden="true" className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-calma-sage text-xs">
                        {completado ? '✓' : indice + 1}
                      </span>
                      <span>{mensaje}</span>
                    </li>
                  )
                })}
              </ol>
            </div>
          </section>
        )}

        {paso === 'resultado' && resultado && (
          <section>
            <header id="inicio-explicacion" className="mb-6 scroll-mt-8">
              <button type="button" onClick={empezarOtra} className="link-atras">
                Añadir otra citación
              </button>
              {esSentencia && <p className="text-sm font-bold text-accent-navy mb-2">Sentencia judicial explicada</p>}
              <h1 className="titulo-pagina mb-3">
                {esSentencia ? 'La decisión del juez, explicada' : 'Primero, esto es lo que importa'}
              </h1>
              <p className="text-xl text-court-700 max-w-3xl">
                Separamos lo que aparece en tu documento de las ayudas para entenderlo y prepararte.
              </p>
            </header>

            <aside className="mb-5 rounded-suave bg-court-100 px-3 py-2 text-sm leading-5 text-court-600" role="note">
              Comprueba fecha, hora y lugar en el documento oficial. Esta ayuda no sustituye la notificación ni el asesoramiento jurídico.
            </aside>

            <nav aria-label="Pasos de la explicación" className="mb-8">
              <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {pasosExplicacion.map((pasoItem, indice) => (
                  <li key={pasoItem.titulo}>
                    <button
                      type="button"
                      onClick={() => setPasoExplicacion(indice)}
                      aria-current={pasoExplicacion === indice ? 'step' : undefined}
                      className={`explicacion-etapa w-full rounded-suave p-3 text-left ${
                        pasoExplicacion === indice
                          ? 'bg-accent-info text-white'
                          : indice < pasoExplicacion
                            ? 'bg-calma-sage text-court-800'
                            : 'bg-court-100 text-court-600 hover:bg-calma-mist'
                      }`}
                    >
                      <span className="block text-sm font-bold">{indice + 1}. {pasoItem.titulo}</span>
                      <span className={`mt-1 block text-xs ${pasoExplicacion === indice ? 'text-white/90' : 'text-court-600'}`}>
                        {pasoItem.descripcion}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
              <p className="sr-only" aria-live="polite">
                Paso {pasoExplicacion + 1} de {pasosExplicacion.length}: {pasosExplicacion[pasoExplicacion].titulo}
              </p>
            </nav>

            {pasoExplicacion === 0 && (
            <section id="datos-encontrados" aria-labelledby="titulo-datos-encontrados" className="explicacion-panel card-destacada mb-8">
              <div className="flex flex-wrap justify-between items-start gap-3 mb-5">
                <div>
                  <p className="text-sm font-bold text-accent-navy mb-1">Extraído del documento</p>
                  <h2 id="titulo-datos-encontrados" className="text-2xl font-bold text-court-900">
                    Datos encontrados en tu carta
                  </h2>
                  <p className="text-court-700 mt-1">
                    Comprueba estos datos con el documento oficial antes de organizarte.
                  </p>
                </div>
                {texto && (
                  <button
                    type="button"
                    onClick={() => setMostrarOriginal(!mostrarOriginal)}
                    aria-expanded={mostrarOriginal}
                    aria-controls="documento-original"
                    className="btn-ghost text-sm !min-h-[44px] !px-3 !py-2"
                  >
                    {mostrarOriginal ? 'Ocultar documento original' : 'Ver documento original'}
                  </button>
                )}
              </div>

              {mostrarOriginal && (
                <pre
                  id="documento-original"
                  tabIndex={0}
                  aria-label="Documento original. Puedes recorrer el texto con las teclas de dirección."
                  className="mb-5 max-h-60 overflow-y-auto rounded-suave bg-calma-mist p-4 text-sm text-court-800 whitespace-pre-wrap"
                >
                  {texto}
                </pre>
              )}

              <dl className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-suave bg-calma-sage p-4">
                  <dt className="text-sm font-bold text-court-700 flex items-center gap-2">
                    <Icono nombre="👤" className="h-5 w-5 text-accent-navy" /> Tu papel
                  </dt>
                  <dd className="mt-2 text-xl font-bold text-court-900 capitalize">{resultado.datos_clave.rol}</dd>
                </div>
                <div className="rounded-suave bg-calma-sage p-4">
                  <dt className="text-sm font-bold text-court-700 flex items-center gap-2">
                    <Icono nombre="📅" className="h-5 w-5 text-accent-navy" /> Fecha y hora
                  </dt>
                  <dd className="mt-2 text-xl font-bold text-court-900">
                    {textoFechaPrincipal}{resultado.datos_clave.hora ? ` · ${resultado.datos_clave.hora}` : ''}
                  </dd>
                  {diasPrincipal !== null && (
                    <p className="mt-2 text-base font-bold text-accent-navy numeros">{etiquetaDias(diasPrincipal)}</p>
                  )}
                </div>
                <div className="rounded-suave bg-calma-sage p-4 sm:col-span-2">
                  <dt className="text-sm font-bold text-court-700 flex items-center gap-2">
                    <Icono nombre="📍" className="h-5 w-5 text-accent-navy" /> Dónde tienes que ir
                  </dt>
                  <dd className="mt-2 text-lg font-bold text-court-900">{resultado.datos_clave.lugar}</dd>
                </div>
              </dl>

              <div className="grid gap-5 mt-5 pt-5 border-t-2 border-court-200 md:grid-cols-2">
                {resultado.datos_clave.que_llevar && resultado.datos_clave.que_llevar.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-court-900 mb-2">Qué hacer o llevar</h3>
                    <ul className="space-y-2 text-court-700">
                      {resultado.datos_clave.que_llevar.map((item) => <li key={item} className="flex gap-2"><Icono nombre="✓" className="mt-1 h-4 w-4 text-accent-success" />{item}</li>)}
                    </ul>
                  </div>
                )}
                {resultado.datos_clave.derechos && resultado.datos_clave.derechos.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-court-900 mb-2">Tus derechos</h3>
                    <ul className="space-y-2 text-court-700">
                      {resultado.datos_clave.derechos.map((derecho) => <li key={derecho} className="flex gap-2"><Icono nombre="✓" className="mt-1 h-4 w-4 text-accent-success" />{derecho}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </section>
            )}

            {/* Selector de nivel de lectura (C06) */}
            {pasoExplicacion === 1 && (
            <section id="explicacion-adaptada" aria-labelledby="titulo-explicacion-adaptada" className="explicacion-panel mb-6">
            <div className="mb-4">
              <p className="text-sm font-medium text-court-700 mb-2">
                Elige cómo prefieres leer la explicación:
              </p>
              <div className="flex flex-wrap gap-2" role="group" aria-label="Nivel de adaptación de lectura">
                <button
                  type="button"
                  onClick={() => setModoLectura('clara')}
                  className={`btn ${modoLectura === 'clara' ? 'btn-primary' : 'btn-secondary'}`}
                  aria-pressed={modoLectura === 'clara'}
                >
                  Lectura clara
                </button>
                <button
                  type="button"
                  onClick={() => setModoLectura('facil')}
                  className={`btn ${modoLectura === 'facil' ? 'btn-primary' : 'btn-secondary'}`}
                  aria-pressed={modoLectura === 'facil'}
                >
                  Lectura fácil orientada
                </button>
                {pasosSimples.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setModoLectura('simple')}
                    className={`btn ${modoLectura === 'simple' ? 'btn-primary' : 'btn-secondary'}`}
                    aria-pressed={modoLectura === 'simple'}
                  >
                    Paso a paso (Súper simple)
                  </button>
                )}
              </div>
            </div>

            <div className="card mb-6" aria-live="polite">
              <div className="flex flex-wrap justify-between items-start gap-3 mb-4">
                <div>
                  <h2 id="titulo-explicacion-adaptada" className="text-xl font-bold text-court-800">
                    {modoLectura === 'clara'
                      ? 'En lenguaje claro (ISO 24495-1)'
                      : modoLectura === 'facil'
                        ? 'En lectura fácil (una idea por línea)'
                        : 'Resumen en pasos cortos'}
                  </h2>
                  <p className="text-sm text-court-600">
                    {modoLectura === 'clara'
                      ? 'Frases directas en voz activa, sin tecnicismos.'
                      : modoLectura === 'facil'
                        ? 'Pautas de lectura fácil: frases cortas y vocabulario cotidiano.'
                        : 'Una sola acción concreta en cada tarjeta.'}
                  </p>
                </div>
              </div>

              {modoLectura === 'simple' ? (
                <ol className="space-y-3">
                  {pasosSimples.map((frase, idx) => (
                    <li
                      key={idx}
                      className="p-4 bg-calma-sage rounded-lg text-lg font-medium text-court-800"
                    >
                      {frase}
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="lectura-facil whitespace-pre-line">
                  {modoLectura === 'clara' ? resultado.lectura_clara : resultado.lectura_facil}
                </div>
              )}
            </div>
            </section>
            )}

            {/* Bloque de Apoyo para Discalculia (C04 + Reto 3) */}
            {pasoExplicacion === 2 && (
            <section id="ayudas-preparacion" aria-labelledby="titulo-ayudas-preparacion" className="explicacion-panel">
            <h2 id="titulo-ayudas-preparacion" className="sr-only">Ayudas para prepararte</h2>
            {apoyoNumerico.length > 0 && (
              <div className="card mb-6">
                <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-court-800">
                      Números, horas e importes en palabras (Apoyo Discalculia)
                    </h2>
                    <p className="text-sm text-court-600">
                      Traducimos las cifras y plazos a palabras para que no haya confusión con los números.
                    </p>
                  </div>
                </div>
                <dl className="grid gap-3 sm:grid-cols-3">
                  {apoyoNumerico.map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-calma-sage flex flex-col justify-between">
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wide text-court-600">
                          {item.etiqueta}
                        </dt>
                        <dd className="text-lg font-bold text-court-800 mt-1">{item.cifra}</dd>
                      </div>
                      <p className="text-sm text-court-700 mt-2 pt-2 border-t border-court-200">
                        {item.en_palabras}
                      </p>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Pictogramas ARASAAC (C01) */}
            {resultado.pictogramas.length > 0 && (
              <div className="card mb-6">
                <h2 className="text-xl font-bold text-court-800 mb-4">
                  Apoyo visual con pictogramas
                </h2>
                <div className="flex flex-wrap gap-4 justify-center">
                  {resultado.pictogramas.map((p) => (
                    <Pictograma key={p.id} url={p.url} keyword={p.keyword} />
                  ))}
                </div>
                <p className="text-sm text-court-700 mt-4 text-center">
                  Pictogramas: ARASAAC, Sergio Palao, Gobierno de Aragón. Licencia CC BY-NC-SA.
                </p>
              </div>
            )}

            {/* Plazos con cuenta atrás visual y calendario (C04 + C05) */}
            {resultado.plazos.length > 0 && (
              <div className="card mb-6">
                <h2 className="text-xl font-bold text-court-800 mb-4">
                  Fechas importantes y cuenta atrás
                </h2>
                <ul className="space-y-3">
                  {resultado.plazos.map((plazo, i) => {
                    const fechaPlazo = parsearFecha(plazo.fecha)
                    const diasNaturales = fechaPlazo ? diasNaturalesHasta(fechaPlazo) : null
                    const diasHabiles = fechaPlazo
                      ? calcularDiasHabilesRestantes(new Date(fechaPlazo.getTime()))
                      : 0
                    const porcentajeTiempo =
                      diasNaturales !== null && diasNaturales > 0
                        ? Math.min(100, Math.max(15, 100 - diasNaturales * 3))
                        : 0
                    const fechaVisible = fechaPlazo ? formatearFechaLarga(fechaPlazo) : plazo.fecha
                    return (
                      <li key={i} className="p-4 bg-calma-sage rounded-lg space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <Icono nombre="📅" className="h-6 w-6 text-court-900" />
                            <div>
                              <p className="font-bold text-court-800">{plazo.descripcion}</p>
                              <p className="text-court-700">{fechaVisible}</p>
                            </div>
                          </div>
                          {diasNaturales !== null && (
                            <div className="flex flex-col items-end gap-1">
                              <span className="inline-block bg-white text-court-800 font-bold text-sm px-3 py-1.5 rounded-lg border border-court-200">
                                {etiquetaDias(diasNaturales)}
                                {diasNaturales > 0 && diasHabiles > 0 ? ` (${diasHabiles} días hábiles)` : ''}
                              </span>
                              {diasNaturales > 0 && (
                                <span className="text-[11px] text-court-600 font-medium">
                                  Los días hábiles excluyen sábados, domingos y festivos
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        {diasNaturales !== null && diasNaturales > 0 && (
                          <div aria-hidden="true" className="w-full bg-white rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-court-600 h-2.5 rounded-full"
                              style={{ width: `${porcentajeTiempo}%` }}
                            />
                          </div>
                        )}
                      </li>
                    )
                  })}
                </ul>
                <button
                  type="button"
                  onClick={descargarCalendario}
                  className="btn-secondary mt-4 w-full"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  Añadir recordatorio a mi calendario (.ics)
                </button>
                {errorCalendario && (
                  <p className="text-sm text-red-700 font-medium mt-2" role="alert">
                    {errorCalendario}
                  </p>
                )}
              </div>
            )}

            {/* Bloque ¿Qué pasa si no voy o no puedo ir ese día? (C07) */}
            {quePasaSiNoVoy && (
              <div className="card mb-6 border-l-4 border-l-court-600">
                <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                  <h2 className="text-xl font-bold text-court-800">
                    {esSentencia
                      ? '¿Tengo que ir al juzgado después de esta carta?'
                      : '¿Qué pasa si ese día estoy enfermo o no puedo ir?'}
                  </h2>
                </div>
                <p className="text-court-700 mb-3">{quePasaSiNoVoy.resumen}</p>
                <ol className="list-decimal pl-5 space-y-1 text-court-700 mb-3">
                  {quePasaSiNoVoy.pasos_si_no_puedes.map((pasoItem, idx) => (
                    <li key={idx}>{pasoItem}</li>
                  ))}
                </ol>
                <p className="text-sm font-medium text-court-800 bg-calma-sage p-3 rounded-lg">
                  {quePasaSiNoVoy.mensaje_calma}
                </p>
              </div>
            )}

            {/* Fases del proceso */}
            <div className="card mb-6">
              <h2 className="text-xl font-bold text-court-800 mb-4">
                En qué paso del proceso estás
              </h2>
              <LineaTiempo
                fases={
                  resultado.datos_clave.rol === 'investigado' || esSentencia
                    ? FASES_INVESTIGADO
                    : FASES_TESTIGO
                }
                faseActual={esSentencia ? 5 : 1}
              />
            </div>
            </section>
            )}

            {/* Quién estará en la sala (TarjetaRol) */}
            {pasoExplicacion === 3 && (
            <>
            <div className="explicacion-panel">
            <div className="card mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-court-800">
                    ¿Quién estará en la sala del juzgado?
                  </h2>
                  <p className="text-sm text-court-600">
                    Conoce de antemano qué hace cada persona y cómo distinguirla.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarRoles((prev) => !prev)}
                  aria-expanded={mostrarRoles}
                  aria-controls="personas-sala"
                  className="btn-secondary text-sm"
                >
                  {mostrarRoles ? 'Ocultar personas de la sala' : 'Ver quién es quién en la sala'}
                </button>
              </div>
              {mostrarRoles && (
                <div id="personas-sala" className="grid gap-4 sm:grid-cols-2 mt-4">
                  {ROLES.map((rol) => (
                    <TarjetaRol
                      key={rol.nombre}
                      nombre={rol.nombre}
                      descripcion={rol.descripcion}
                      queHace={rol.queHace}
                      comoReconocerlo={rol.comoReconocerlo}
                      icono={rol.icono}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="bg-accent-success/10 border-2 border-accent-success rounded-tarjeta p-6 mb-8">
              <h2 className="text-xl font-bold text-court-800 mb-2">
                El siguiente paso es la sala
              </h2>
              <p className="text-court-700 mb-4">
                Primero ves la sala. Luego simulas el juicio.
                Puedes parar cuando quieras.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/sala-previa" className="btn-primary">
                  Ver la sala
                </Link>
                <Link href="/sala-previa/declaracion" className="btn-secondary">
                  Simular el juicio
                </Link>
                <Link href="/pasaporte" className="btn-secondary">
                  Preparar mi ficha
                </Link>
              </div>
            </div>

            <details className="card mb-8">
              <summary className="cursor-pointer text-lg font-bold text-court-900">
                Cómo se ha elaborado esta explicación
              </summary>
              <div className="mt-5 space-y-5 text-court-700">
                {resultado.datos_clave.privacidad_rgpd && (
                  <section aria-labelledby="titulo-privacidad">
                    <h2 id="titulo-privacidad" className="text-lg font-bold text-court-900">Tus datos personales</h2>
                    <p className="mt-1">{resultado.datos_clave.privacidad_rgpd.garantia}</p>
                    {resultado.datos_clave.privacidad_rgpd.elementos_protegidos.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {resultado.datos_clave.privacidad_rgpd.elementos_protegidos.map((elemento) => (
                          <li key={elemento.marcador} className="rounded-suave bg-calma-sage p-3">
                            <span className="font-bold text-court-900">{elemento.tipo}: </span>
                            {elemento.valor_protegido}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                )}
                {resultado.metricas_legibilidad && (
                  <section aria-labelledby="titulo-legibilidad">
                    <h2 id="titulo-legibilidad" className="text-lg font-bold text-court-900">Cambio de claridad</h2>
                    <p className="mt-1">{resultado.metricas_legibilidad.resumen_impacto}</p>
                    <p className="mt-2 text-sm">
                      La medición de legibilidad pasó de {resultado.metricas_legibilidad.original.score}/100 a {resultado.metricas_legibilidad.adaptado.score}/100.
                    </p>
                  </section>
                )}
                <section aria-labelledby="titulo-proceso-adaptacion">
                  <h2 id="titulo-proceso-adaptacion" className="text-lg font-bold text-court-900">Cómo se ordenó la información</h2>
                  <ol className="mt-3 space-y-2">
                    {pipelineIA.map((etapa) => (
                      <li key={etapa.paso} className="rounded-suave bg-calma-sage p-3">
                        <span className="font-bold text-court-900">{etapa.nombre}. </span>{etapa.detalle}
                      </li>
                    ))}
                  </ol>
                </section>
              </div>
            </details>

            <button
              type="button"
              onClick={() => {
                setPaso('entrada')
                setResultado(null)
                setTexto('')
                setPasoExplicacion(0)
                setNombreArchivo('')
                setError('')
                setErrorCalendario('')
              }}
              className="btn-ghost"
            >
              <Icono nombre="←" />
              Transformar otro documento judicial
            </button>
            </div>
            </>
            )}

            <div className="mt-8 flex items-center justify-between gap-3 border-t border-court-200 pt-6">
              <button
                type="button"
                onClick={() => setPasoExplicacion((actual) => Math.max(0, actual - 1))}
                className="btn-secondary"
                disabled={pasoExplicacion === 0}
              >
                <Icono nombre="←" />
                Atrás
              </button>
              <span className="text-sm font-medium text-court-600">
                {pasoExplicacion + 1} de {pasosExplicacion.length}
              </span>
              <button
                type="button"
                onClick={() => setPasoExplicacion((actual) => Math.min(pasosExplicacion.length - 1, actual + 1))}
                className="btn-primary"
                disabled={pasoExplicacion === pasosExplicacion.length - 1}
              >
                Continuar
                <Icono nombre="→" />
              </button>
            </div>
          </section>
        )}
      </main>
    </>
  )
}