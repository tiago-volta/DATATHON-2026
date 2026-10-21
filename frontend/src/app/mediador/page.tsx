'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Icono } from '@/components/Icono'
import { BotonLeerEnVoz } from '@/components/BotonLeerEnVoz'
import { analizarPreguntaAPI, type AnalisisPregunta } from '@/lib/api'

const PREGUNTAS_FRECUENTES = [
  {
    etiqueta: 'Doble negación + múltiple',
    pregunta:
      '¿No es cierto que usted no vio bien lo que pasó porque estaba lejos y había poca luz?',
  },
  {
    etiqueta: 'Jerga jurídica',
    pregunta:
      '¿Se ratifica usted en las diligencias incoadas o desea deponer algo más en esta comparecencia?',
  },
  {
    etiqueta: 'Metáfora (TEA)',
    pregunta:
      '¿Podría echar un vistazo a este documento y decir si pone la mano en el fuego por esa versión?',
  },
  {
    etiqueta: 'Pregunta intimidante',
    pregunta: '¿Por qué deberíamos creerle a usted?',
  },
  {
    etiqueta: 'Pregunta clara (ejemplo verde)',
    pregunta: '¿A qué hora ocurrieron los hechos aproximadamente?',
  },
]

const EJEMPLOS_REFERENCIA = [
  {
    original: '¿No es cierto que usted no vio bien lo que pasó porque estaba lejos y había poca luz?',
    problemas: ['Doble negación', 'Pregunta compuesta', 'Sugestiva'],
    reformulada: '¿Viste lo que pasó? ¿Desde dónde lo viste? ¿Cómo era la luz en ese momento?',
    semaforo: 'rojo',
  },
  {
    original:
      '¿Se ratifica usted en las diligencias incoadas o desea deponer algo más en esta comparecencia?',
    problemas: ['Jerga jurídica', 'Pregunta compuesta'],
    reformulada:
      '¿Confirmas lo que contaste en tu declaración anterior? ¿Quieres añadir algún dato más hoy?',
    semaforo: 'rojo',
  },
  {
    original: '¿Por qué deberíamos creerle a usted?',
    problemas: ['Intimidante', 'No busca hechos concretos'],
    reformulada: '¿Puedes explicar paso a paso cómo sabes lo que nos has contado?',
    semaforo: 'rojo',
  },
  {
    original: '¿A qué hora ocurrieron los hechos aproximadamente?',
    problemas: [],
    reformulada: null,
    semaforo: 'verde',
  },
]

const INICIO_PREGUNTA_RE =
  /^[¿\s]*(qu[eé]|qui[eé]n|qui[eé]nes|c[oó]mo|cu[aá]ndo|d[oó]nde|cu[aá]nto|cu[aá]nta|cu[aá]ntos|cu[aá]ntas|por\s+qu[eé]|para\s+qu[eé]|cu[aá]l|cu[aá]les|acaso|no\s+es|es\s+cierto|puede|puedes|podr[ií]a|vio|viste|estaba|estabas|hab[ií]a|conoce|conoces|recuerda|recuerdas|fue|era|tiene|tienes|hizo|hiciste|dijo|dijiste|sabe|sabes|escuch[oó]|escuchaste|se\s+ratifica|ratifica|desea|confirma)\b/i

const DICCIONARIO_JERGA_LOCAL: Record<string, string> = {
  apercibe: 'avisa de forma oficial',
  apercibimiento: 'aviso oficial',
  comparecencia: 'declaración en el juzgado',
  comparecer: 'ir al juzgado',
  comparezca: 'vaya al juzgado',
  diligencias: 'declaraciones anteriores',
  incoadas: 'abiertas en el juzgado',
  incoado: 'abierto en el juzgado',
  autos: 'documentos del caso',
  testifical: 'declaración como testigo',
  pericial: 'informe de un especialista',
  coartada: 'pruebas de dónde estabas',
  imputado: 'persona investigada',
  imputada: 'persona investigada',
  instrucción: 'investigación inicial',
  procesal: 'del juicio',
  fehaciente: 'que se puede comprobar con seguridad',
  interfecto: 'la persona fallecida',
  deponer: 'contar o añadir',
  manifestar: 'decir',
  manifieste: 'diga',
  ratifica: 'confirma',
  ratificar: 'confirmar',
}

function analizarPreguntaLocal(textoPregunta: string): AnalisisPregunta {
  const limpia = textoPregunta.replace(/\s+/g, ' ').trim()
  const minus = limpia.toLowerCase()

  if (minus.includes('no vio bien lo que pasó porque estaba lejos')) {
    return {
      original: limpia,
      semaforo: 'rojo',
      problemas: ['Doble negación', 'Pregunta compuesta', 'Sugestiva'],
      impacto_cognitivo:
        'Combina dos negaciones («no es cierto que no vio») con tres preguntas distintas en una sola frase. En TEA y discapacidad intelectual bloquea la respuesta; en TDAH sobrecarga la memoria de trabajo.',
      reformulada: '¿Viste lo que pasó? ¿A qué distancia estabas? ¿Cómo era la luz en ese lugar?',
      preguntas_divididas: [
        '1. ¿Viste lo que pasó ese día?',
        '2. ¿Desde qué lugar exactamente lo viste?',
        '3. ¿Había suficiente luz para ver con claridad?',
      ],
      consejos: [
        'Elimina el inicio «¿No es cierto que no...?» y pregunta siempre en positivo.',
        'Formula las 3 preguntas de una en una, esperando la respuesta entre cada una.',
      ],
    }
  }

  if (minus.includes('ratifica usted en las diligencias incoadas')) {
    return {
      original: limpia,
      semaforo: 'rojo',
      problemas: ['Jerga jurídica', 'Pregunta compuesta'],
      impacto_cognitivo:
        'Incluye cuatro tecnicismos («ratifica», «diligencias», «incoadas», «deponer») y dos preguntas en la misma oración. Una persona con dislexia, TEA o discapacidad intelectual no sabrá qué se le pide.',
      reformulada:
        '¿Confirmas lo que dijiste en tu declaración anterior? ¿Quieres contar algún dato más hoy?',
      preguntas_divididas: [
        '1. ¿Confirmas que lo que dijiste en tu declaración anterior es correcto?',
        '2. ¿Quieres añadir o explicar algo más hoy?',
      ],
      consejos: [
        'Sustituye «ratificarse en las diligencias» por «confirmar tu declaración anterior».',
        'Sustituye «deponer en esta comparecencia» por «contar algo más hoy».',
      ],
    }
  }

  if (minus.includes('echar un vistazo') || minus.includes('mano en el fuego')) {
    return {
      original: limpia,
      semaforo: 'rojo',
      problemas: ['Metáfora o lenguaje figurado', 'Pregunta compuesta'],
      impacto_cognitivo:
        'Las personas con autismo (TEA) procesan el lenguaje de forma literal. Expresiones como «echar un vistazo» o «poner la mano en el fuego» generan confusión e inseguridad.',
      reformulada:
        '¿Puedes mirar este documento? ¿Estás seguro de que los hechos ocurrieron así?',
      preguntas_divididas: [
        '1. ¿Puedes mirar este documento con calma?',
        '2. ¿Reconoces lo que aparece escrito o fotografiado aquí?',
        '3. ¿Estás seguro de que ocurrió como lo has explicado?',
      ],
      consejos: [
        'Evita dichos populares, metáforas e ironías (Guía Autismo España 2025).',
        'Usa verbos concretos: «mirar», «leer», «estar seguro».',
      ],
    }
  }

  if (minus.includes('por qué deberíamos creerle')) {
    return {
      original: limpia,
      semaforo: 'rojo',
      problemas: ['Intimidante', 'No busca hechos concretos'],
      impacto_cognitivo:
        'Cuestiona la honestidad de la persona en abstracto y puede provocar bloqueo emocional o mutismo en personas con autismo o ansiedad.',
      reformulada: '¿Puedes contarnos paso a paso cómo viste o supiste lo que ocurrió?',
      preguntas_divididas: [
        '1. ¿Qué fue lo primero que viste o escuchaste?',
        '2. ¿Hay algún mensaje, documento o persona que confirme lo ocurrido?',
      ],
      consejos: [
        'Pide hechos observables (qué vio, qué oyó, a qué hora) en lugar de cuestionar su credibilidad.',
      ],
    }
  }

  const palabras = limpia.split(/\s+/).filter(Boolean)
  const negaciones =
    minus.match(/\b(no|nunca|jam[aá]s|tampoco|nadie|ning[uú]n|ninguna|sin)\b/g) || []
  const tieneDobleNegacion = negaciones.length >= 2
  const signosCierre = (limpia.match(/\?/g) || []).length
  const esCompuesta =
    signosCierre >= 2 ||
    (/\b(y|o|adem[aá]s|tambi[eé]n|mientras|porque)\b/.test(minus) && palabras.length > 9)
  const esSugestiva =
    /^[¿\s]*(no\s+es\s+cierto|no\s+es\s+verdad|no\s+cree|no\s+ser[aá]\s+que|acaso\s+no)/i.test(
      limpia
    ) || /\b(verdad|no\s+es\s+as[ií])\s*\??$/i.test(limpia)
  const esIntimidante =
    /\b(por\s+qu[eé]\s+deber[ií]a(mos)?\s+creer|por\s+qu[eé]\s+miente|c[oó]mo\s+puede\s+estar\s+segur[oa]|c[oó]mo\s+pretende\s+que)\b/i.test(
      limpia
    )
  const esDemasiadoLarga = palabras.length > 20

  const problemas: string[] = []
  const consejos: string[] = []
  const impactos: string[] = []
  let borrador = limpia

  if (esSugestiva) {
    problemas.push('Sugestiva')
    borrador = borrador
      .replace(
        /^[¿\s]*(no\s+es\s+cierto\s+que|no\s+es\s+verdad\s+que|no\s+cree\s+que|acaso\s+no)\s*/i,
        '¿'
      )
      .replace(/,?\s*(¿?\s*verdad|¿?\s*no\s+es\s+as[ií])\s*\??$/i, '?')
    consejos.push('Usa preguntas abiertas que no dirijan la respuesta (qué, dónde, cuándo, cómo).')
    impactos.push('Las preguntas sugestivas inducen respuestas por presión social.')
  }

  if (tieneDobleNegacion) {
    problemas.push('Doble negación')
    borrador = borrador.replace(/\bno\s+vio\b/gi, 'viste').replace(/\bno\s+estaba\b/gi, 'estabas')
    consejos.push('Formula la pregunta en positivo para que responder «sí» o «no» sea inequívoco.')
    impactos.push('La doble negación exige invertir mentalmente la oración.')
  }

  const jergaDetectada: string[] = []
  for (const [termino, reemplazo] of Object.entries(DICCIONARIO_JERGA_LOCAL)) {
    const regex = new RegExp(`\\b${termino}\\b`, 'gi')
    if (regex.test(borrador)) {
      jergaDetectada.push(termino)
      borrador = borrador.replace(regex, reemplazo)
    }
  }
  if (jergaDetectada.length > 0) {
    problemas.push('Jerga jurídica')
    consejos.push(`Sustituye los términos técnicos (${jergaDetectada.join(', ')}) por palabras cotidianas.`)
    impactos.push('Los tecnicismos procesales bloquean la comprensión literal.')
  }

  if (esIntimidante) {
    problemas.push('Intimidante')
    borrador = '¿Puedes contar paso a paso qué ocurrió en ese momento?'
    consejos.push('Pide hechos concretos sin cuestionar la credibilidad de la persona.')
    impactos.push('El tono acusatorio aumenta la ansiedad y bloquea el recuerdo.')
  }

  const preguntasDivididas: string[] = []
  if (esCompuesta) {
    problemas.push('Pregunta compuesta')
    consejos.push('Haz una sola pregunta cada vez y espera la respuesta antes de pasar a la siguiente.')
    impactos.push('En TDAH y discapacidad intelectual, varias preguntas seguidas sobrecargan la memoria de trabajo.')
    const partes = borrador
      .replace(/^[¿\s]+|[?\s]+$/g, '')
      .split(/\?\s*¿?|\s+(?:y|o|porque|mientras)\s+/i)
      .map((p) => p.trim())
      .filter((p) => p.length > 3)
    if (partes.length >= 2) {
      partes.slice(0, 4).forEach((p, idx) => {
        const cap = p.charAt(0).toUpperCase() + p.slice(1)
        preguntasDivididas.push(`${idx + 1}. ¿${cap}?`)
      })
      borrador = partes
        .slice(0, 4)
        .map((p) => `¿${p.charAt(0).toUpperCase() + p.slice(1)}?`)
        .join(' ')
    }
  }

  if (esDemasiadoLarga) {
    problemas.push('Frase demasiado larga')
    consejos.push('Acorta cada pregunta a menos de 20 palabras (pauta UNE-ISO 24495-1).')
    impactos.push('Las frases largas dificultan mantener la atención.')
  }

  if (!borrador.startsWith('¿')) borrador = '¿' + borrador.replace(/^[¿\s]+/, '')
  if (!borrador.endsWith('?')) borrador = borrador.replace(/[?.\s]+$/, '') + '?'
  if (preguntasDivididas.length === 0) {
    preguntasDivididas.push(`1. ${borrador}`)
  }

  if (problemas.length === 0) {
    return {
      original: limpia,
      semaforo: 'verde',
      problemas: [],
      impacto_cognitivo: 'Es una pregunta directa, con una sola idea y en vocabulario cotidiano.',
      reformulada: null,
      preguntas_divididas: [`1. ${limpia}`],
      consejos: [
        'Deja entre 5 y 10 segundos de silencio tras formularla para que la persona procese y responda sin presión.',
      ],
    }
  }

  return {
    original: limpia,
    semaforo: problemas.length === 1 ? 'amarillo' : 'rojo',
    problemas,
    impacto_cognitivo:
      impactos.join(' ') ||
      'Simplificar la pregunta mejora la comprensión y la precisión del testimonio.',
    reformulada: borrador,
    preguntas_divididas: preguntasDivididas,
    consejos,
  }
}

export default function PaginaMediador() {
  const [pregunta, setPregunta] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [escuchando, setEscuchando] = useState(false)
  const [copiado, setCopiado] = useState(false)
  const [resultado, setResultado] = useState<AnalisisPregunta | null>(null)
  const [analizado, setAnalizado] = useState(false)
  const reconocimientoRef = useRef<{ stop: () => void } | null>(null)

  const ejecutarAnalisis = async (textoAAnalizar?: string) => {
    const limpia = (textoAAnalizar ?? pregunta).trim()
    if (!limpia) {
      setError('Escribe o dicta una pregunta para analizar.')
      setAnalizado(false)
      return
    }

    const soloLetras = limpia.replace(/[^\p{L}]/gu, '')
    const palabras = limpia.split(/\s+/).filter(Boolean)
    if (limpia.length < 6 || soloLetras.length < 4 || palabras.length < 2) {
      setError(
        'Escribe una pregunta completa con al menos dos palabras (por ejemplo: "¿Qué viste ese día?").'
      )
      setAnalizado(false)
      return
    }

    const tieneInterrogacion = limpia.includes('?') || limpia.includes('¿')
    if (!tieneInterrogacion && !INICIO_PREGUNTA_RE.test(limpia)) {
      setError(
        'El texto no parece una pregunta. Añade signos de interrogación "¿?" o empieza por qué, cómo, cuándo, dónde...'
      )
      setAnalizado(false)
      return
    }

    setError('')
    setCopiado(false)
    setCargando(true)

    try {
      const respuestaAPI = await analizarPreguntaAPI(limpia)
      setResultado(respuestaAPI)
      setAnalizado(true)
    } catch {
      const respaldo = analizarPreguntaLocal(limpia)
      setResultado(respaldo)
      setAnalizado(true)
    } finally {
      setCargando(false)
    }
  }

  const alternarDictadoPorVoz = () => {
    if (escuchando && reconocimientoRef.current) {
      reconocimientoRef.current.stop()
      setEscuchando(false)
      return
    }

    const w = window as unknown as {
      SpeechRecognition?: new () => {
        lang: string
        interimResults: boolean
        maxAlternatives: number
        onresult: (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void
        onerror: () => void
        onend: () => void
        start: () => void
        stop: () => void
      }
      webkitSpeechRecognition?: new () => {
        lang: string
        interimResults: boolean
        maxAlternatives: number
        onresult: (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void
        onerror: () => void
        onend: () => void
        start: () => void
        stop: () => void
      }
    }

    const SpeechRecognitionClass = w.SpeechRecognition || w.webkitSpeechRecognition
    if (!SpeechRecognitionClass) {
      setError(
        'Tu navegador no permite dictado por voz directo. Puedes escribir la pregunta o elegir una de las preguntas frecuentes.'
      )
      return
    }

    const recognition = new SpeechRecognitionClass()
    recognition.lang = 'es-ES'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const transcripcion = event.results[0]?.[0]?.transcript?.trim() || ''
      if (transcripcion) {
        const preguntaConSignos = transcripcion.endsWith('?')
          ? transcripcion.startsWith('¿')
            ? transcripcion
            : `¿${transcripcion}`
          : `¿${transcripcion}?`
        setPregunta(preguntaConSignos)
        setError('')
        ejecutarAnalisis(preguntaConSignos)
      }
    }

    recognition.onerror = () => {
      setEscuchando(false)
    }

    recognition.onend = () => {
      setEscuchando(false)
    }

    reconocimientoRef.current = recognition
    setEscuchando(true)
    recognition.start()
  }

  const copiarReformulada = async (textoCopiar: string) => {
    try {
      await navigator.clipboard.writeText(textoCopiar)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    } catch {
      setCopiado(false)
    }
  }

  return (
    <>
      <main id="contenido-principal" className="page-shell">
        <nav aria-label="Volver">
          <Link href="/" className="link-atras">
            <Icono nombre="←" />
            Volver al inicio
          </Link>
        </nav>

        <h1 className="titulo-pagina">
          Pregunta Clara (Mediador de Interrogatorio)
        </h1>
        <p className="entradilla">
          Detecta dobles negaciones, preguntas múltiples, jerga jurídica o metáforas,
          y reescribe la pregunta en lectura fácil para formularla de una en una.
        </p>

        {/* Preguntas frecuentes predefinidas (M03) */}
        <section className="mb-6" aria-labelledby="titulo-preguntas-frecuentes">
          <h2 id="titulo-preguntas-frecuentes" className="text-sm font-bold text-court-700 mb-2">
            Prueba con preguntas reales de sala (clic para analizar):
          </h2>
          <div className="flex flex-wrap gap-2">
            {PREGUNTAS_FRECUENTES.map((item) => (
              <button
                key={item.etiqueta}
                type="button"
                onClick={() => {
                  setPregunta(item.pregunta)
                  setError('')
                  ejecutarAnalisis(item.pregunta)
                }}
                className="btn-secondary text-sm py-2 px-3"
              >
                {item.etiqueta}
              </button>
            ))}
          </div>
        </section>

        <div className="card mb-8">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <label htmlFor="pregunta" className="block font-bold text-court-800">
              Escribe o dicta la pregunta del interrogatorio
            </label>
            <button
              type="button"
              onClick={alternarDictadoPorVoz}
              aria-pressed={escuchando}
              className={`btn text-sm py-2 px-4 ${
                escuchando ? 'bg-red-700 text-white' : 'btn-secondary'
              }`}
            >
              <Icono nombre={escuchando ? '⏹' : '🎤'} />
              {escuchando ? 'Parar dictado por voz' : 'Dictar pregunta por voz'}
            </button>
          </div>

          {escuchando && (
            <p className="text-sm text-court-700 font-medium mb-2" aria-live="polite">
              Escuchando tu voz... Di la pregunta en voz alta.
            </p>
          )}

          <textarea
            id="pregunta"
            value={pregunta}
            onChange={(e) => {
              setPregunta(e.target.value)
              setAnalizado(false)
              if (error) setError('')
            }}
            maxLength={500}
            className="textarea-accesible"
            placeholder="Ej: ¿No es cierto que usted no vio bien lo que pasó porque estaba lejos y había poca luz?"
            rows={3}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'error-pregunta' : undefined}
          />
          {error && (
            <p id="error-pregunta" className="text-sm text-red-700 font-medium mt-2" role="alert">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={() => ejecutarAnalisis()}
            disabled={cargando}
            className="btn-primary mt-4 w-full"
          >
            {cargando ? 'Analizando y reformulando pregunta...' : 'Analizar y reformular en lectura fácil'}
          </button>
        </div>

        {analizado && resultado && (
          <div className="card-destacada mb-8" aria-live="polite">
            <div className="flex items-start gap-4 mb-4">
              <div
                aria-hidden="true"
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${
                  resultado.semaforo === 'verde'
                    ? 'bg-accent-success/20 text-green-800'
                    : resultado.semaforo === 'amarillo'
                      ? 'bg-accent-alert/20 text-amber-800'
                      : 'bg-red-100 text-red-800'
                }`}
              >
                <Icono
                  nombre={
                    resultado.semaforo === 'verde'
                      ? '✓'
                      : resultado.semaforo === 'amarillo'
                        ? '⚠'
                        : '✗'
                  }
                  className="h-6 w-6"
                />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-court-800">
                  {resultado.semaforo === 'verde'
                    ? 'Pregunta clara y accesible'
                    : resultado.semaforo === 'amarillo'
                      ? 'Pregunta mejorable'
                      : 'Pregunta confusa: requiere adaptación'}
                </h2>
                <p className="text-court-700 mt-1">{resultado.impacto_cognitivo}</p>
                {resultado.problemas.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {resultado.problemas.map((prob) => (
                      <span key={prob} className="etiqueta-alerta text-xs">
                        {prob}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {resultado.reformulada && (
              <div className="bg-calma-sage rounded-lg p-5 mt-4 border border-court-200">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h3 className="font-bold text-court-800">
                    Pregunta reescrita en Lectura Fácil (lista para leer en sala)
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <BotonLeerEnVoz texto={resultado.reformulada} />
                    <button
                      type="button"
                      onClick={() => copiarReformulada(resultado.reformulada || '')}
                      className="btn-secondary text-sm py-2 px-3"
                    >
                      {copiado ? 'Copiada' : 'Copiar pregunta'}
                    </button>
                  </div>
                </div>
                <p className="text-xl font-bold text-court-900 mt-2">{resultado.reformulada}</p>
              </div>
            )}

            {resultado.preguntas_divididas && resultado.preguntas_divididas.length > 1 && (
              <div className="mt-4 p-4 bg-white rounded-lg border border-court-200">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <h3 className="font-bold text-court-800">
                    Desglose paso a paso (hazlas de una en una y espera respuesta):
                  </h3>
                  <BotonLeerEnVoz texto={resultado.preguntas_divididas.join(' ')} />
                </div>
                <ul className="space-y-2 text-court-800 font-medium">
                  {resultado.preguntas_divididas.map((sub, idx) => (
                    <li key={idx} className="p-3 bg-calma-sage rounded-lg">
                      {sub}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {resultado.consejos && resultado.consejos.length > 0 && (
              <div className="mt-4 pt-4 border-t border-court-200">
                <h3 className="font-bold text-court-800 text-sm mb-2">
                  Pautas para el operador jurídico (Guía CGPJ 2025 / The Advocate&apos;s Gateway):
                </h3>
                <ul className="list-disc pl-5 text-sm text-court-700 space-y-1">
                  {resultado.consejos.map((consejo, idx) => (
                    <li key={idx}>{consejo}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <section>
          <h2 className="text-2xl font-bold text-court-800 mb-4">
            Guía rápida de transformación de preguntas
          </h2>
          <div className="space-y-4">
            {EJEMPLOS_REFERENCIA.map((ej, i) => (
              <div key={i} className="card">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <span
                      aria-hidden="true"
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        ej.semaforo === 'verde'
                          ? 'bg-accent-success/20 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      <Icono nombre={ej.semaforo === 'verde' ? '✓' : '⚠'} className="h-4 w-4" />
                    </span>
                    <p className="text-court-800 font-medium">&ldquo;{ej.original}&rdquo;</p>
                  </div>
                </div>

                {ej.problemas.length > 0 && ej.reformulada && (
                  <>
                    <div className="flex flex-wrap gap-2 mb-3 ml-11">
                      {ej.problemas.map((p) => (
                        <span key={p} className="etiqueta-alerta text-xs">
                          {p}
                        </span>
                      ))}
                    </div>
                    <div className="ml-11 bg-calma-sage rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold uppercase text-court-600 mb-1">
                          Versión en Lectura Fácil:
                        </p>
                        <p className="text-court-800 font-medium">&ldquo;{ej.reformulada}&rdquo;</p>
                      </div>
                      <BotonLeerEnVoz texto={ej.reformulada} />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 p-4 bg-calma-sage rounded-lg text-sm text-court-600">
          <strong>Base metodológica:</strong> Adaptación fundamentada en el artículo 7 bis LEC, la
          Guía práctica del CGPJ sobre discapacidad (2025), la Guía de Autismo España (2025), la
          norma UNE 153101 (Lectura Fácil) y los toolkits de <em>The Advocate&apos;s Gateway</em>.
        </div>
      </main>
    </>
  )
}
