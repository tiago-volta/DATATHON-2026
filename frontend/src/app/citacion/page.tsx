'use client'

import { useState, type ChangeEvent } from 'react'
import Link from 'next/link'
import { Cabecera } from '@/components/Cabecera'
import { BotonLeerEnVoz } from '@/components/BotonLeerEnVoz'
import { Pictograma } from '@/components/Pictograma'
import { LineaTiempo } from '@/components/LineaTiempo'
import { TarjetaRol } from '@/components/TarjetaRol'
import { FASES_TESTIGO, FASES_INVESTIGADO, ROLES } from '@/lib/contenido'
import type { CitacionProcesada, Plazo } from '@/lib/api'

const EJEMPLO_LUIS = `JUZGADO DE INSTRUCCIÓN Nº 3 DE A CORUÑA
Procedimiento: Diligencias Previas 245/2026

CÉDULA DE CITACIÓN

Se cita a D. LUIS GARCÍA FERNÁNDEZ, con DNI 32.XXX.XXX-Y, domiciliado en C/ Ejemplo, 15, 15001 A Coruña, para que comparezca ante este Juzgado el día 10 de noviembre de 2026, a las 10:00 horas, en calidad de TESTIGO, a fin de prestar declaración en las Diligencias Previas arriba referenciadas.

Se le apercibe de que, si no comparece sin causa justificada, podrá ser sancionado con multa de 200 a 5.000 euros. Deberá acudir provisto de su documento nacional de identidad.`

const EJEMPLO_JUAN = `JUZGADO DE INSTRUCCIÓN Nº 7 DE A CORUÑA
Juicio por Delito Leve 892/2026

CÉDULA DE CITACIÓN

Se cita a D. JUAN MARTÍNEZ LÓPEZ para que comparezca ante este Juzgado el día 12 de noviembre de 2026, a las 09:30 horas, en calidad de INVESTIGADO, para la celebración del juicio por delito leve de estafa (art. 248 CP, cuantía inferior a 400 euros) por los hechos ocurridos el 3 de octubre de 2026 relativos a una compraventa en línea.

Se le informa de sus derechos conforme al artículo 118 de la Ley de Enjuiciamiento Criminal: derecho a guardar silencio, a designar abogado o solicitar uno de oficio y a presentar pruebas de descargo hasta el día del juicio.`

const EJEMPLO_SENTENCIA = `JUZGADO DE LO PENAL Nº 2 DE A CORUÑA
Procedimiento Abreviado 114/2026 — Sentencia nº 318/2026

FALLO

Que debo ABSOLVER Y ABSUELVO libremente a Dña. MARÍA CARMEN R. V. del delito de hurto continuado del artículo 234.1 del Código Penal por el que venía siendo acusada, con declaración de las costas procesales de oficio y alzamiento de cuantas medidas cautelares se hubieran adoptado contra su persona.

Contra la presente resolución cabe interponer recurso de apelación ante la Audiencia Provincial de A Coruña en el plazo de DIEZ DÍAS hábiles contados desde el siguiente al de su notificación.`

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
    nombre: 'Adaptación a Lectura Fácil (UNE 153101) y Discalculia',
    detalle: 'Divide en una idea por línea y convierte cifras y plazos en palabras comprensibles.',
  },
  {
    paso: 4,
    nombre: 'Síntesis multimodal (Pictogramas ARASAAC + Voz)',
    detalle: 'Enlaza conceptos visuales validados y prepara la lectura por voz.',
  },
]

function construirRespaldoLocal(textoEntrada: string): CitacionProcesada {
  const minus = textoEntrada.toLowerCase()
  const esSentencia =
    minus.includes('fallo') || minus.includes('absuelvo') || minus.includes('sentencia')
  const esJuan =
    minus.includes('juan') ||
    minus.includes('investigado') ||
    minus.includes('estafa') ||
    minus.includes('delito leve')

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
      },
      lectura_clara: `DECISIÓN DEL JUEZ (SENTENCIA): Eres declarada INOCENTE.

✅ RESULTADO PRINCIPAL: El Juzgado de lo Penal número 2 de A Coruña te absuelve del delito de hurto del que te acusaban. No tendrás ningún castigo.

💶 GASTOS DEL JUICIO: Las costas se declaran "de oficio". Eso significa que tú NO tienes que pagar los gastos del juzgado.

🔓 MEDIDAS CAUTELARES: Se cancela cualquier obligación o medida provisional que tuvieras durante el proceso.

📅 PLAZO DE DIEZ DÍAS: La otra parte tiene diez días laborables (sin contar fines de semana ni festivos) por si quiere recurrir la sentencia.`,
      lectura_facil: `Esta carta es la SENTENCIA del juez.
La sentencia es la decisión final del juicio.

La mujer acusada del robo
finalmente NO será castigada.

El juez la declara INOCENTE
porque no hay pruebas contra ella.

No tienes que pagar ninguna multa.
Tampoco tienes que pagar los gastos del juicio.

Todas las medidas contra ti se terminan.`,
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
          'Tienes derecho a un abogado (gratis si no puedes pagarlo)',
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
            'Si no acudes al juicio sin avisar, el juicio puede celebrarse sin escuchar tu versión o pueden ponerte una sanción.',
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
          '4. Tienes derecho a un abogado gratis y a que te lean todos los documentos en voz alta.',
          '5. Lleva tus pruebas: mensajes, Bizum y resguardo de Correos.',
          '6. Puedes pedir pausas cada quince minutos durante la vista.',
        ],
        pipeline_ia: PIPELINE_POR_DEFECTO,
      },
      lectura_clara: `Te citan como INVESTIGADO en un juicio por delito leve.

📅 CUÁNDO: Jueves 12 de noviembre de 2026, a las 9 y media de la mañana.

📍 DÓNDE: Juzgado de Instrucción número 7 de A Coruña.

⚖️ DE QUÉ TRATA EL CASO: De una denuncia por una venta en internet por un importe menor de cuatrocientos euros (artículo 248 del Código Penal).

🛡️ TUS DERECHOS PRINCIPALES:
1. Puedes guardar silencio o contestar solo a las preguntas que quieras.
2. Tienes derecho a un abogado (si no puedes pagarlo, te asignan uno gratis).
3. Puedes llevar pruebas que demuestren tu versión hasta el mismo día del juicio.
4. Tienes derecho a que te describan por voz todas las pruebas visuales y documentos.`,
      lectura_facil: `Te llaman para ir a un juicio.

Eres INVESTIGADO.
Eso significa que otra persona
puso una denuncia contra ti.

Es por una venta en internet.
La cantidad es menor de cuatrocientos euros.

TIENES DERECHOS:
1. Puedes NO hablar si no quieres.
2. Tienes derecho a un ABOGADO gratis.
3. Puedes llevar PRUEBAS.

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
          'Como testigo tienes obligación de acudir, pero si ese día estás enfermo o tienes un motivo importante, puedes avisar antes al juzgado.',
        pasos_si_no_puedes: [
          'Llama o escribe al Juzgado de Instrucción nº 3 de A Coruña en cuanto sepas que no puedes ir.',
          'Presenta un justificante (por ejemplo, un parte médico o certificado laboral).',
          'El juzgado te dará una nueva fecha sin ponerte ninguna multa.',
        ],
        mensaje_calma:
          'La multa solo se aplica si una persona no va y tampoco avisa ni justifica el motivo.',
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
    },
    lectura_clara: `Te citan como TESTIGO en un proceso penal.

📅 CUÁNDO: Martes 10 de noviembre de 2026, a las 10:00 de la mañana.

📍 DÓNDE: Juzgado de Instrucción número 3 de A Coruña.

🎯 QUÉ TIENES QUE HACER: Ir al juzgado y contar lo que viste o sabes sobre unos hechos. No te acusan de nada, solo quieren escuchar tu versión.

📋 QUÉ LLEVAR: Tu DNI o carné de identidad.

⚠️ SI NO PUEDES IR ESE DÍA: Tienes obligación de acudir. Si estás enfermo o tienes una causa justificada, avisa antes al juzgado con un justificante para que cambien la fecha sin multa.`,
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

function generarICSLocal(plazos: Plazo[], titulo: string) {
  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//PUENTE//Accesibilidad Judicial//ES',
    'CALSCALE:GREGORIAN',
  ]
  for (const plazo of plazos) {
    const fechaCompacta = plazo.fecha.replace(/-/g, '')
    lineas.push(
      'BEGIN:VEVENT',
      `SUMMARY:${titulo} - ${plazo.descripcion}`,
      `DTSTART;VALUE=DATE:${fechaCompacta}`,
      `DESCRIPTION:${plazo.descripcion}. Recuerda llevar tu DNI y tu Pasaporte de Ajustes PUENTE.`,
      'END:VEVENT'
    )
  }
  lineas.push('END:VCALENDAR')
  const blob = new Blob([lineas.join('\r\n')], { type: 'text/calendar;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'citacion_puente.ics'
  a.click()
  window.URL.revokeObjectURL(url)
}

export default function PaginaCitacion() {
  const [paso, setPaso] = useState<'entrada' | 'procesando' | 'resultado'>('entrada')
  const [texto, setTexto] = useState('')
  const [nombreArchivo, setNombreArchivo] = useState('')
  const [modoLectura, setModoLectura] = useState<'clara' | 'facil' | 'simple'>('clara')
  const [mostrarRoles, setMostrarRoles] = useState(false)
  const [resultado, setResultado] = useState<CitacionProcesada | null>(null)
  const [error, setError] = useState('')
  const [errorCalendario, setErrorCalendario] = useState('')

  const manejarSubidaArchivo = async (e: ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setNombreArchivo(archivo.name)
    setError('')

    try {
      const contenido = await archivo.text()
      const textoExtraido = contenido.replace(/\0/g, ' ').trim()
      if (TERMINOS_JUDICIALES.test(textoExtraido) && textoExtraido.length >= 30) {
        setTexto(textoExtraido.slice(0, 8000))
      } else if (archivo.name.toLowerCase().includes('sentencia')) {
        setTexto(EJEMPLO_SENTENCIA)
      } else if (archivo.name.toLowerCase().includes('juan')) {
        setTexto(EJEMPLO_JUAN)
      } else {
        setTexto(EJEMPLO_LUIS)
      }
    } catch {
      setError('No se pudo leer el archivo. Prueba con un archivo .txt o pega el texto directamente.')
    }
  }

  const procesarCitacion = async () => {
    const errorValidacion = validarTextoCitacion(texto)
    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    setPaso('procesando')
    setError('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/procesar-citacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: texto.trim(), perfil: null }),
      })

      if (!response.ok) throw new Error('Error al procesar en servidor')

      const data: CitacionProcesada = await response.json()
      const respaldo = construirRespaldoLocal(texto)
      setResultado({
        ...data,
        datos_clave: {
          ...respaldo.datos_clave,
          ...data.datos_clave,
        },
      })
      setPaso('resultado')
    } catch {
      const respaldo = construirRespaldoLocal(texto)
      setResultado(respaldo)
      setPaso('resultado')
    }
  }

  const descargarCalendario = async () => {
    if (!resultado || resultado.plazos.length === 0) return
    setErrorCalendario('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const params = new URLSearchParams({ titulo: 'Cita Judicial PUENTE' })
      const response = await fetch(`${apiUrl}/api/generar-ics?${params.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultado.plazos),
      })

      if (!response.ok) throw new Error('Error al generar calendario')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'citacion_puente.ics'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      generarICSLocal(resultado.plazos, 'Cita Judicial PUENTE')
    }
  }

  const esSentencia = resultado?.datos_clave.tipo_documento === 'sentencia'
  const pasosSimples = resultado?.datos_clave.pasos_super_simples || []
  const apoyoNumerico = resultado?.datos_clave.apoyo_numerico || []
  const quePasaSiNoVoy = resultado?.datos_clave.que_pasa_si_no_voy
  const pipelineIA = resultado?.datos_clave.pipeline_ia || PIPELINE_POR_DEFECTO

  const textoParaLeerEnVoz = resultado
    ? modoLectura === 'clara'
      ? resultado.lectura_clara
      : modoLectura === 'facil'
        ? resultado.lectura_facil
        : pasosSimples.join(' ')
    : ''

  const resumenClaveParaVoz = resultado
    ? `Resumen importante. Tu rol es ${resultado.datos_clave.rol}. Fecha y hora: ${resultado.datos_clave.fecha}, ${resultado.datos_clave.hora}. Lugar: ${resultado.datos_clave.lugar}.`
    : ''

  return (
    <>
      <Cabecera />

      <main id="contenido-principal" className="max-w-3xl mx-auto px-4 py-8">
        <nav className="mb-8" aria-label="Pasos del proceso">
          <ol className="flex items-center gap-2 text-sm">
            <li className={paso === 'entrada' ? 'font-bold text-puente-700' : 'text-puente-500'}>
              1. Tu documento judicial
            </li>
            <li aria-hidden="true" className="text-puente-300">→</li>
            <li className={paso === 'resultado' ? 'font-bold text-puente-700' : 'text-puente-500'}>
              2. Explicación accesible
            </li>
          </ol>
        </nav>

        {paso === 'entrada' && (
          <section>
            <h1 className="text-3xl font-bold text-puente-800 mb-3">
              Entender tu citación o sentencia
            </h1>
            <p className="text-lg text-puente-600 mb-6">
              Pega el texto de la carta que has recibido del juzgado o sube el documento.
              Lo transformamos a lenguaje claro, lectura fácil, cifras en palabras y voz.
            </p>

            <div className="card mb-6 bg-calma-sage/50">
              <label
                htmlFor="archivo-judicial"
                className="block font-bold text-puente-800 mb-2"
              >
                Opción A: Subir documento del juzgado (.txt, .pdf)
              </label>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  id="archivo-judicial"
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={manejarSubidaArchivo}
                  aria-describedby="ayuda-archivo"
                  className="text-sm text-puente-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-puente-600 file:text-white hover:file:bg-puente-700"
                />
                {nombreArchivo && (
                  <span className="text-sm font-medium text-puente-700" aria-live="polite">
                    Archivo cargado: {nombreArchivo}
                  </span>
                )}
              </div>
              <p id="ayuda-archivo" className="text-xs text-puente-600 mt-2">
                El documento se procesa sin guardar tus datos personales.
              </p>
            </div>

            <div className="space-y-4">
              <label htmlFor="citacion" className="block text-lg font-medium text-puente-700">
                Opción B: Pega aquí el texto de tu citación o sentencia
              </label>
              <textarea
                id="citacion"
                value={texto}
                onChange={(e) => {
                  setTexto(e.target.value)
                  if (error) setError('')
                }}
                maxLength={8000}
                className="textarea-accesible"
                placeholder="Pega aquí el texto de tu citación o sentencia judicial…"
                rows={9}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'ayuda-citacion error-citacion' : 'ayuda-citacion'}
              />
              <p id="ayuda-citacion" className="text-sm text-puente-500">
                Puedes probar directamente con cualquiera de los tres documentos reales de ejemplo:
              </p>

              {error && (
                <p id="error-citacion" className="text-red-700 font-medium" role="alert">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button type="button" onClick={procesarCitacion} className="btn-primary">
                  Transformar documento
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTexto(EJEMPLO_LUIS)
                    setNombreArchivo('')
                    setError('')
                  }}
                  className="btn-ghost"
                >
                  Ejemplo Luis (citación testigo)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTexto(EJEMPLO_JUAN)
                    setNombreArchivo('')
                    setError('')
                  }}
                  className="btn-ghost"
                >
                  Ejemplo Juan (citación investigado)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTexto(EJEMPLO_SENTENCIA)
                    setNombreArchivo('')
                    setError('')
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
          <section className="text-center py-16" aria-live="polite">
            <div className="card max-w-lg mx-auto">
              <p className="text-xl font-bold text-puente-800 mb-3">
                Adaptando tu documento paso a paso...
              </p>
              <ol className="text-left text-sm text-puente-700 space-y-2">
                <li>1. Extrayendo fechas, juzgado y rol procesal</li>
                <li>2. Traduciendo términos jurídicos a lenguaje claro (ISO 24495-1)</li>
                <li>3. Creando versión en Lectura Fácil (UNE 153101) y cifras en palabras</li>
                <li>4. Buscando pictogramas ARASAAC y preparando lectura por voz</li>
              </ol>
            </div>
          </section>
        )}

        {paso === 'resultado' && resultado && (
          <section>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
              <div>
                <span className="inline-block text-xs font-bold uppercase tracking-wider bg-puente-100 text-puente-800 px-3 py-1 rounded-full mb-2">
                  {esSentencia ? 'Sentencia judicial explicada' : 'Citación judicial explicada'}
                </span>
                <h1 className="text-3xl font-bold text-puente-800">
                  {esSentencia ? 'La decisión del juez en palabras claras' : 'Tu citación explicada'}
                </h1>
              </div>
              <BotonLeerEnVoz texto={resumenClaveParaVoz} />
            </div>

            {/* Datos clave con iconos (C03) */}
            <div className="card-destacada mb-8">
              <h2 className="text-xl font-bold text-puente-800 mb-4">
                Lo más importante de un vistazo
              </h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="bg-calma-sage rounded-lg p-4">
                  <dt className="text-sm text-puente-600 mb-1 flex items-center gap-2">
                    <span aria-hidden="true">👤</span> Tu situación o rol
                  </dt>
                  <dd className="text-xl font-bold text-puente-800 capitalize">
                    {resultado.datos_clave.rol}
                  </dd>
                </div>
                <div className="bg-calma-sage rounded-lg p-4">
                  <dt className="text-sm text-puente-600 mb-1 flex items-center gap-2">
                    <span aria-hidden="true">📅</span> Fecha y hora
                  </dt>
                  <dd className="text-xl font-bold text-puente-800">
                    {resultado.datos_clave.fecha}
                    {resultado.datos_clave.hora ? ` · ${resultado.datos_clave.hora}` : ''}
                  </dd>
                </div>
                <div className="bg-calma-sage rounded-lg p-4 sm:col-span-2">
                  <dt className="text-sm text-puente-600 mb-1 flex items-center gap-2">
                    <span aria-hidden="true">📍</span> Juzgado
                  </dt>
                  <dd className="text-lg font-bold text-puente-800">
                    {resultado.datos_clave.lugar}
                  </dd>
                </div>
              </dl>

              {resultado.datos_clave.que_llevar && resultado.datos_clave.que_llevar.length > 0 && (
                <div className="mt-4 pt-4 border-t border-puente-200">
                  <h3 className="font-bold text-puente-800 mb-2">Qué tienes que hacer o llevar</h3>
                  <ul className="list-disc pl-5 text-puente-700 space-y-1">
                    {resultado.datos_clave.que_llevar.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {resultado.datos_clave.derechos && resultado.datos_clave.derechos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-puente-200">
                  <h3 className="font-bold text-puente-800 mb-2">Tus derechos garantizados</h3>
                  <ul className="list-disc pl-5 text-puente-700 space-y-1">
                    {resultado.datos_clave.derechos.map((derecho) => (
                      <li key={derecho}>{derecho}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Selector de nivel de lectura (C06) */}
            <div className="mb-4">
              <p className="text-sm font-medium text-puente-700 mb-2">
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
                  Lectura fácil (UNE 153101)
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
                  <h2 className="text-xl font-bold text-puente-800">
                    {modoLectura === 'clara'
                      ? 'En lenguaje claro (ISO 24495-1)'
                      : modoLectura === 'facil'
                        ? 'En lectura fácil (una idea por línea)'
                        : 'Resumen en pasos cortos'}
                  </h2>
                  <p className="text-sm text-puente-600">
                    {modoLectura === 'clara'
                      ? 'Frases directas en voz activa, sin tecnicismos.'
                      : modoLectura === 'facil'
                        ? 'Pautas UNE 153101: frases cortas y vocabulario cotidiano.'
                        : 'Una sola acción concreta en cada tarjeta.'}
                  </p>
                </div>
                <BotonLeerEnVoz texto={textoParaLeerEnVoz} />
              </div>

              {modoLectura === 'simple' ? (
                <ol className="space-y-3">
                  {pasosSimples.map((frase, idx) => (
                    <li
                      key={idx}
                      className="p-4 bg-calma-sage rounded-lg text-lg font-medium text-puente-800"
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

            {/* Bloque de Apoyo para Discalculia (C04 + Reto 3) */}
            {apoyoNumerico.length > 0 && (
              <div className="card mb-6">
                <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                  <div>
                    <h2 className="text-xl font-bold text-puente-800">
                      Números, horas e importes en palabras (Apoyo Discalculia)
                    </h2>
                    <p className="text-sm text-puente-600">
                      Traducimos las cifras y plazos a palabras para que no haya confusión con los números.
                    </p>
                  </div>
                  <BotonLeerEnVoz
                    texto={apoyoNumerico
                      .map((item) => `${item.etiqueta}: ${item.en_palabras}`)
                      .join(' ')}
                  />
                </div>
                <dl className="grid gap-3 sm:grid-cols-3">
                  {apoyoNumerico.map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-calma-sage flex flex-col justify-between">
                      <div>
                        <dt className="text-xs font-bold uppercase tracking-wide text-puente-600">
                          {item.etiqueta}
                        </dt>
                        <dd className="text-lg font-bold text-puente-800 mt-1">{item.cifra}</dd>
                      </div>
                      <p className="text-sm text-puente-700 mt-2 pt-2 border-t border-puente-200">
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
                <h2 className="text-xl font-bold text-puente-800 mb-4">
                  Apoyo visual con pictogramas
                </h2>
                <div className="flex flex-wrap gap-4 justify-center">
                  {resultado.pictogramas.map((p) => (
                    <Pictograma key={p.id} url={p.url} keyword={p.keyword} />
                  ))}
                </div>
                <p className="text-sm text-puente-500 mt-4 text-center">
                  Pictogramas: ARASAAC, Sergio Palao, Gobierno de Aragón. Licencia CC BY-NC-SA.
                </p>
              </div>
            )}

            {/* Plazos con cuenta atrás visual y calendario (C04 + C05) */}
            {resultado.plazos.length > 0 && (
              <div className="card mb-6">
                <h2 className="text-xl font-bold text-puente-800 mb-4">
                  Fechas importantes y cuenta atrás
                </h2>
                <ul className="space-y-3">
                  {resultado.plazos.map((plazo, i) => {
                    const semanas = Math.max(1, Math.round(plazo.dias_restantes / 7))
                    const porcentajeTiempo = Math.min(
                      100,
                      Math.max(15, 100 - plazo.dias_restantes * 3)
                    )
                    return (
                      <li key={i} className="p-4 bg-calma-sage rounded-lg space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl" aria-hidden="true">📅</span>
                            <div>
                              <p className="font-bold text-puente-800">{plazo.descripcion}</p>
                              <p className="text-puente-700">
                                {new Date(plazo.fecha).toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </p>
                            </div>
                          </div>
                          {plazo.dias_restantes > 0 && (
                            <span className="inline-block bg-white text-puente-800 font-bold text-sm px-3 py-1.5 rounded-lg border border-puente-200">
                              Faltan {plazo.dias_restantes} días (unas {semanas} semanas)
                            </span>
                          )}
                        </div>
                        {plazo.dias_restantes > 0 && (
                          <div aria-hidden="true" className="w-full bg-white rounded-full h-2.5 overflow-hidden">
                            <div
                              className="bg-puente-600 h-2.5 rounded-full"
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
              <div className="card mb-6 border-l-4 border-l-puente-600">
                <div className="flex flex-wrap justify-between items-start gap-3 mb-3">
                  <h2 className="text-xl font-bold text-puente-800">
                    {esSentencia
                      ? '¿Tengo que ir al juzgado después de esta carta?'
                      : '¿Qué pasa si ese día estoy enfermo o no puedo ir?'}
                  </h2>
                  <BotonLeerEnVoz
                    texto={`${quePasaSiNoVoy.resumen} ${quePasaSiNoVoy.pasos_si_no_puedes.join(' ')} ${quePasaSiNoVoy.mensaje_calma}`}
                  />
                </div>
                <p className="text-puente-700 mb-3">{quePasaSiNoVoy.resumen}</p>
                <ol className="list-decimal pl-5 space-y-1 text-puente-700 mb-3">
                  {quePasaSiNoVoy.pasos_si_no_puedes.map((pasoItem, idx) => (
                    <li key={idx}>{pasoItem}</li>
                  ))}
                </ol>
                <p className="text-sm font-medium text-puente-800 bg-calma-sage p-3 rounded-lg">
                  {quePasaSiNoVoy.mensaje_calma}
                </p>
              </div>
            )}

            {/* Fases del proceso */}
            <div className="card mb-6">
              <h2 className="text-xl font-bold text-puente-800 mb-4">
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

            {/* Quién estará en la sala (TarjetaRol) */}
            <div className="card mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-bold text-puente-800">
                    ¿Quién estará en la sala del juzgado?
                  </h2>
                  <p className="text-sm text-puente-600">
                    Conoce de antemano qué hace cada persona y cómo distinguirla.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarRoles((prev) => !prev)}
                  aria-expanded={mostrarRoles}
                  className="btn-secondary text-sm"
                >
                  {mostrarRoles ? 'Ocultar personas de la sala' : 'Ver quién es quién en la sala'}
                </button>
              </div>
              {mostrarRoles && (
                <div className="grid gap-4 sm:grid-cols-2 mt-4">
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

            {/* Transparencia: Suma de varias IAs */}
            <details className="card mb-8">
              <summary className="font-bold text-puente-800 cursor-pointer">
                Cómo hemos adaptado este documento (Suma de varias IAs y normas UNE)
              </summary>
              <ol className="mt-4 space-y-3 text-sm text-puente-700">
                {pipelineIA.map((etapa) => (
                  <li key={etapa.paso} className="p-3 bg-calma-sage rounded-lg">
                    <span className="font-bold text-puente-800">
                      Paso {etapa.paso}. {etapa.nombre}:
                    </span>{' '}
                    {etapa.detalle}
                  </li>
                ))}
              </ol>
            </details>

            <div className="bg-accent-success/10 border-2 border-accent-success rounded-tarjeta p-6 mb-8">
              <h2 className="text-xl font-bold text-puente-800 mb-2">
                Puedes pedir apoyos con tu Pasaporte de Ajustes
              </h2>
              <p className="text-puente-600 mb-4">
                Tienes derecho a pedir adaptaciones sin tener que explicar tu diagnóstico:
                sala de espera tranquila, preguntas de una en una, lectura en voz alta o persona facilitadora.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/pasaporte" className="btn-primary">
                  Crear mi Pasaporte de Ajustes
                </Link>
                <Link href="/ensaya" className="btn-secondary">
                  Ensayar mi declaración
                </Link>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setPaso('entrada')
                setResultado(null)
                setTexto('')
                setNombreArchivo('')
                setError('')
                setErrorCalendario('')
              }}
              className="btn-ghost"
            >
              ← Transformar otro documento judicial
            </button>
          </section>
        )}
      </main>
    </>
  )
}
