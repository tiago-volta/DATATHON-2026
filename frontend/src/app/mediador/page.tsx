'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Cabecera } from '@/components/Cabecera'

const EJEMPLOS_PREGUNTAS = [
  {
    original: '¿No es cierto que usted no vio bien lo que pasó porque estaba lejos y había poca luz?',
    problemas: ['Doble negación', 'Pregunta compuesta', 'Sugestiva'],
    reformulada: '¿Viste lo que pasó? ¿Desde dónde lo viste? ¿Cómo era la luz en ese momento?',
    semaforo: 'rojo',
  },
  {
    original: '¿Por qué deberíamos creerle a usted?',
    problemas: ['Intimidante', 'No busca información'],
    reformulada: '¿Puedes explicar cómo sabes lo que nos has contado?',
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
  /^[¿\s]*(qu[eé]|qui[eé]n|qui[eé]nes|c[oó]mo|cu[aá]ndo|d[oó]nde|cu[aá]nto|cu[aá]nta|cu[aá]ntos|cu[aá]ntas|por\s+qu[eé]|para\s+qu[eé]|cu[aá]l|cu[aá]les|acaso|no\s+es|es\s+cierto|puede|puedes|podr[ií]a|vio|viste|estaba|estabas|hab[ií]a|conoce|conoces|recuerda|recuerdas|fue|era|tiene|tienes|hizo|hiciste|dijo|dijiste|sabe|sabes|escuch[oó]|escuchaste)\b/i

const JERGA_JURIDICA_RE =
  /\b(apercibe|apercibimiento|comparecencia|diligencias|incoado|autos|testifical|pericial|jurisdicci[oó]n|coartada|imputad[oa]|instrucci[oó]n|procesal|fehaciente|interfecto|deponer)\b/i

export default function PaginaMediador() {
  const [pregunta, setPregunta] = useState('')
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState<{
    original: string
    problemas: string[]
    reformulada: string | null
    semaforo: string
  } | null>(null)
  const [analizado, setAnalizado] = useState(false)

  const analizarPregunta = () => {
    const limpia = pregunta.trim()
    if (!limpia) {
      setError('Escribe una pregunta para analizar.')
      setAnalizado(false)
      return
    }

    const soloLetras = limpia.replace(/[^\p{L}]/gu, '')
    const palabras = limpia.split(/\s+/).filter(Boolean)
    if (limpia.length < 6 || soloLetras.length < 4 || palabras.length < 2) {
      setError('Escribe una pregunta completa con al menos dos palabras (por ejemplo: "¿Qué viste ese día?").')
      setAnalizado(false)
      return
    }

    const tieneInterrogacion = limpia.includes('?') || limpia.includes('¿')
    if (!tieneInterrogacion && !INICIO_PREGUNTA_RE.test(limpia)) {
      setError('El texto no parece una pregunta. Añade signos de interrogación "¿?" o empieza por qué, cómo, cuándo, dónde...')
      setAnalizado(false)
      return
    }

    setError('')
    const textoMinusculas = limpia.toLowerCase()
    const negaciones = textoMinusculas.match(/\b(no|nunca|jam[aá]s|tampoco|nadie|ning[uú]n|ninguna|sin)\b/g) || []
    const tieneDobleNegacion = negaciones.length >= 2
    const signosCierre = (limpia.match(/\?/g) || []).length
    const esCompuesta =
      signosCierre >= 2 ||
      (/\b(y|o|adem[aá]s|tambi[eé]n|mientras|porque)\b/.test(textoMinusculas) && palabras.length > 8)
    const esSugestiva =
      /^[¿\s]*(no\s+es\s+cierto|no\s+es\s+verdad|no\s+cree|no\s+ser[aá]\s+que|acaso\s+no)/i.test(limpia) ||
      /\b(verdad|no\s+es\s+as[ií])\s*\??$/i.test(limpia)
    const esIntimidante =
      /\b(por\s+qu[eé]\s+deber[ií]a(mos)?\s+creer|por\s+qu[eé]\s+miente|c[oó]mo\s+puede\s+estar\s+segur[oa]|c[oó]mo\s+pretende\s+que)\b/i.test(limpia)
    const esDemasiadoLarga = palabras.length > 20
    const tieneJerga = JERGA_JURIDICA_RE.test(limpia)

    const problemas: string[] = []
    const consejos: string[] = []

    if (tieneDobleNegacion) {
      problemas.push('Doble negación')
      consejos.push('Formula la pregunta en positivo (ej: "¿Viste lo que pasó?" en lugar de "¿No es cierto que no vio...?").')
    }
    if (esCompuesta) {
      problemas.push('Pregunta compuesta')
      consejos.push('Haz una sola pregunta cada vez y espera la respuesta antes de pasar a la siguiente.')
    }
    if (esSugestiva) {
      problemas.push('Sugestiva')
      consejos.push('Usa preguntas abiertas que no dirijan la respuesta (qué, dónde, cuándo, cómo).')
    }
    if (esIntimidante) {
      problemas.push('Intimidante')
      consejos.push('Pide hechos concretos sin cuestionar la credibilidad de la persona.')
    }
    if (tieneJerga) {
      problemas.push('Jerga jurídica')
      consejos.push('Sustituye los términos técnicos por palabras cotidianas.')
    }
    if (esDemasiadoLarga) {
      problemas.push('Frase demasiado larga')
      consejos.push('Acorta la pregunta a menos de 20 palabras (pauta UNE-ISO 24495-1).')
    }

    setResultado({
      original: limpia,
      problemas,
      reformulada: consejos.length > 0 ? consejos.join(' ') : null,
      semaforo:
        problemas.length === 0 ? 'verde' : problemas.length === 1 ? 'amarillo' : 'rojo',
    })
    setAnalizado(true)
  }

  return (
    <>
      <Cabecera />

      <main id="contenido-principal" className="max-w-3xl mx-auto px-4 py-8">
        <nav className="mb-6">
          <Link href="/" className="text-puente-600 hover:text-puente-800">
            ← Volver al inicio
          </Link>
        </nav>

        <h1 className="text-3xl font-bold text-puente-800 mb-2">
          Pregunta Clara
        </h1>
        <p className="text-lg text-puente-600 mb-8">
          Analiza si una pregunta puede confundir a una persona neurodivergente
          y obtén sugerencias para reformularla.
        </p>

        <div className="card mb-8">
          <label htmlFor="pregunta" className="block font-bold text-puente-800 mb-3">
            Escribe o pega una pregunta
          </label>
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
            placeholder="Ej: ¿No es cierto que usted no vio bien lo que pasó?"
            rows={3}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'error-pregunta' : undefined}
          />
          {error && (
            <p id="error-pregunta" className="text-sm text-red-700 font-medium mt-2" role="alert">
              {error}
            </p>
          )}
          <button type="button" onClick={analizarPregunta} className="btn-primary mt-4 w-full">
            Analizar pregunta
          </button>
        </div>

        {analizado && resultado && (
          <div className="card-destacada mb-8" aria-live="polite">
            <div className="flex items-center gap-4 mb-4">
              <div
                aria-hidden="true"
                className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                  resultado.semaforo === 'verde'
                    ? 'bg-accent-success/20'
                    : resultado.semaforo === 'amarillo'
                      ? 'bg-accent-alert/20'
                      : 'bg-red-100'
                }`}
              >
                {resultado.semaforo === 'verde' ? '✓' : resultado.semaforo === 'amarillo' ? '⚠' : '✗'}
              </div>
              <div>
                <h2 className="font-bold text-puente-800">
                  {resultado.semaforo === 'verde'
                    ? 'Pregunta clara'
                    : resultado.semaforo === 'amarillo'
                      ? 'Pregunta mejorable'
                      : 'Pregunta problemática'}
                </h2>
                <p className="text-puente-600">
                  {resultado.problemas.length === 0
                    ? 'Esta pregunta es clara y directa.'
                    : `Problemas detectados: ${resultado.problemas.join(', ')}`}
                </p>
              </div>
            </div>

            {resultado.reformulada && (
              <div className="bg-calma-sage rounded-lg p-4 mt-4">
                <p className="font-bold text-puente-800 mb-2">Sugerencia</p>
                <p className="text-puente-700">{resultado.reformulada}</p>
              </div>
            )}
          </div>
        )}

        <section>
          <h2 className="text-2xl font-bold text-puente-800 mb-4">Ejemplos</h2>
          <div className="space-y-4">
            {EJEMPLOS_PREGUNTAS.map((ej, i) => (
              <div key={i} className="card">
                <div className="flex items-start gap-3 mb-3">
                  <span
                    aria-hidden="true"
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      ej.semaforo === 'verde'
                        ? 'bg-accent-success/20 text-green-800'
                        : ej.semaforo === 'amarillo'
                          ? 'bg-accent-alert/20 text-amber-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {ej.semaforo === 'verde' ? '✓' : '!'}
                  </span>
                  <p className="text-puente-800 font-medium flex-1">"{ej.original}"</p>
                </div>

                {ej.problemas.length > 0 && (
                  <>
                    <div className="flex flex-wrap gap-2 mb-3 ml-11">
                      {ej.problemas.map((p) => (
                        <span key={p} className="etiqueta-alerta text-xs">{p}</span>
                      ))}
                    </div>
                    <div className="ml-11 bg-calma-sage rounded-lg p-3">
                      <p className="text-sm text-puente-600 mb-1">Mejor así:</p>
                      <p className="text-puente-700">"{ej.reformulada}"</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 p-4 bg-calma-sage rounded-lg text-sm text-puente-600">
          <strong>Nota para profesionales:</strong> Este análisis se basa en las pautas de
          The Advocate's Gateway (Reino Unido) para interrogar a personas vulnerables.
          Las sugerencias son orientativas y deben adaptarse a cada caso.
        </div>
      </main>
    </>
  )
}
