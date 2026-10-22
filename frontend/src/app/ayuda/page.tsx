'use client'

import { FormEvent, KeyboardEvent, useCallback, useEffect, useId, useRef, useState } from 'react'
import { preguntarAyudaAPI } from '@/lib/api'
import { cargarPerfil } from '@/lib/perfil/perfil'
import { TarjetasFaq } from '@/components/faq/TarjetasFaq'
import type { RolPerfil } from '@/lib/perfil/tipos'

interface FaqItem {
  id: string
  pregunta: string
  categoria: string
  respuesta: string
  fundamentoLegal?: string
  icono: string
}

const FAQS_RECURRENTES: FaqItem[] = [
  {
    id: 'no-puedo-ir',
    categoria: 'El día del juicio',
    icono: '📅',
    pregunta: '¿Qué pasa si ese día estoy enfermo o no puedo ir?',
    respuesta:
      'Avisa al juzgado en cuanto sepas que no puedes ir. Lleva un justificante, por ejemplo un parte médico. El juez puede cambiar la fecha. Si avisas a tiempo, no hay multa.',
    fundamentoLegal: 'Artículos 410 y 420 de la Ley de Enjuiciamiento Criminal',
  },
  {
    id: 'pausas',
    categoria: 'Sobrecarga y nervios',
    icono: '⏸️',
    pregunta: '¿Qué pasa si me bloqueo o me pongo muy nervioso durante el juicio?',
    respuesta:
      'Tienes derecho a solicitar una pausa para serenarte conforme al artículo 7 bis de la LEC. El juez o tribunal valorará tu solicitud y acordará la suspensión momentánea para que puedas beber agua, descansar o regularte sensorialmente.',
    fundamentoLegal: 'Artículo 7 bis de la Ley de Enjuiciamiento Civil',
  },
  {
    id: 'memoria',
    categoria: 'Tu declaración',
    icono: '🧠',
    pregunta: '¿Tengo que acordarme de todo al detalle o saber horas exactas?',
    respuesta:
      'No. Tu única obligación como testigo es decir con sinceridad lo que viviste. Si no recuerdas una fecha, una hora o un detalle concreto, puedes decir con total tranquilidad: "No lo recuerdo con seguridad". Nunca estás obligado a adivinar.',
    fundamentoLegal: 'Artículo 433 de la Ley de Enjuiciamiento Criminal',
  },
  {
    id: 'preguntas-claras',
    categoria: 'Comprensión',
    icono: '💬',
    pregunta: '¿Puedo pedir que me repitan una pregunta o que usen palabras más sencillas?',
    respuesta:
      'Sí. Si una pregunta tiene dobles negaciones, es muy larga o junta varias cosas a la vez, tienes derecho a pedir que te la separen en partes y te la formulen en lenguaje claro.',
    fundamentoLegal: 'Guía de Buenas Prácticas del CGPJ y Art. 7 bis LEC',
  },
  {
    id: 'acompanamiento',
    categoria: 'Apoyo en sala',
    icono: '🤝',
    pregunta: '¿Puedo acudir acompañado de una persona de confianza o facilitador?',
    respuesta:
      'Sí. Puedes solicitar la presencia de un facilitador judicial o de una persona de apoyo para que esté a tu lado durante la vista, ayudándote a entender y reduciendo el estrés.',
    fundamentoLegal: 'Estatuto de la Víctima y Art. 7 bis LEC',
  },
  {
    id: 'privacidad',
    categoria: 'Privacidad y salud',
    icono: '🛡️',
    pregunta: '¿Tengo que enseñar mi informe médico o decir mi diagnóstico en público?',
    respuesta:
      'No. Tu diagnóstico médico es un dato confidencial protegido. Con el Pasaporte de Ajustes solo comunicas las medidas de accesibilidad prácticas que necesitas (pausas, luz tenue, preguntas directas), sin compartir tu historial clínico.',
    fundamentoLegal: 'Reglamento General de Protección de Datos (RGPD) Art. 9',
  },
  {
    id: 'simulador',
    categoria: 'Preparación',
    icono: '🏛️',
    pregunta: '¿Cómo me ayuda el simulador de la sala antes de ir al juzgado?',
    respuesta:
      'Primero ves la sala: quién hay y qué se oye. Después simulas un juicio con preguntas. Puedes parar cuando quieras.',
    fundamentoLegal: 'Anticipación cognitiva y desensibilización sensorial',
  },
]

type Mensaje = {
  id: string
  rol: 'persona' | 'asistente'
  texto: string
}

const SUGERENCIAS = [
  '¿Puedo pedir una pausa si me bloqueo?',
  '¿Tengo que decir mi diagnóstico?',
  '¿Puedo ir con una persona de apoyo?',
] as const

const AVISO_INFORMACION = 'Esto es información. No es asesoramiento.'

function separarFuentes(cita: string): string[] {
  const tieneBoe = /boe\.es/i.test(cita)
  const sinBoe = cita.replace(/,?\s*en boe\.es\.?$/i, '').trim()
  if (!sinBoe) return []

  const partes = sinBoe.split(/\s+y\s+(?=art\.)/i).map((parte) => parte.trim()).filter(Boolean)
  return partes.map((parte) => (tieneBoe ? `${parte}, en boe.es.` : `${parte}.`))
}

function partirRespuesta(texto: string): { cuerpo: string; fuentes: string[] } {
  const sinAviso = texto.replaceAll(AVISO_INFORMACION, ' ').replace(/\s+/g, ' ').trim()
  const indice = sinAviso.search(/fuente:/i)
  if (indice < 0) {
    return { cuerpo: sinAviso, fuentes: [] }
  }

  const cita = sinAviso.slice(indice).replace(/^fuente:\s*/i, '').trim()
  return {
    cuerpo: sinAviso.slice(0, indice).trim(),
    fuentes: separarFuentes(cita),
  }
}

function TextoAsistente({ texto }: { texto: string }) {
  const { cuerpo, fuentes } = partirRespuesta(texto)
  const varias = fuentes.length > 1

  return (
    <>
      {cuerpo && <p className="whitespace-pre-wrap leading-relaxed">{cuerpo}</p>}
      {fuentes.length === 1 && (
        <p className="mt-3 text-sm leading-snug text-court-500">
          <span className="font-bold">Fuente. </span>
          {fuentes[0]}
        </p>
      )}
      {varias && (
        <div className="mt-3 text-sm leading-snug text-court-500">
          <p className="font-bold">Fuentes.</p>
          <ul className="mt-1 list-disc pl-5">
            {fuentes.map((fuente) => (
              <li key={fuente}>{fuente}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

/**
 * Pregunta a TribunalInclusivo: dudas por texto.
 * Sin diagnóstico médico.
 */
export default function PaginaAyuda() {
  const tituloId = useId()
  const campoId = useId()
  const liveId = useId()
  const [pregunta, setPregunta] = useState('')
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 'saludo',
      rol: 'asistente',
      texto:
        'Hola. Pregúntame por el juicio, tus derechos y los ajustes. Cito la ley y el artículo.',
    },
  ])
  const [enviando, setEnviando] = useState(false)
  const [faqAbierta, setFaqAbierta] = useState<string | null>(null)
  const [rolUsuario, setRolUsuario] = useState<RolPerfil | null>(null)
  const [anuncio, setAnuncio] = useState('')
  const listaRef = useRef<HTMLDivElement>(null)
  const campoRef = useRef<HTMLTextAreaElement>(null)
  const enviandoRef = useRef(false)

  useEffect(() => {
    const p = cargarPerfil()
    if (p?.rol) {
      setRolUsuario(p.rol)
    }
  }, [])

  const enviarPregunta = useCallback(async (textoRaw: string) => {
    const texto = textoRaw.trim()
    if (texto.length < 2 || enviandoRef.current) return

    const idPersona = `p-${Date.now()}`
    setMensajes((prev) => [
      ...prev,
      { id: idPersona, rol: 'persona', texto },
    ])
    setPregunta('')
    enviandoRef.current = true
    setEnviando(true)
    setAnuncio('Pensando la respuesta…')

    try {
      const { respuesta } = await preguntarAyudaAPI(texto)
      const idTribunalInclusivo = `r-${Date.now()}`
      setMensajes((prev) => [
        ...prev,
        { id: idTribunalInclusivo, rol: 'asistente', texto: respuesta },
      ])
      setAnuncio('Respuesta lista.')
    } catch {
      const fallback =
        'Ahora mismo no puedo responder. Prueba otra vez en unos segundos.'
      setMensajes((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, rol: 'asistente', texto: fallback },
      ])
      setAnuncio(fallback)
    } finally {
      enviandoRef.current = false
      setEnviando(false)
    }
  }, [])

  useEffect(() => {
    const campo = campoRef.current
    if (!campo || pregunta.length > 0) return
    campo.style.height = 'auto'
  }, [pregunta])

  useEffect(() => {
    if (mensajes.length <= 1 && !enviando) return
    const lista = listaRef.current
    if (!lista) return
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    lista.scrollTo({
      top: lista.scrollHeight,
      behavior: reducido ? 'auto' : 'smooth',
    })
  }, [mensajes, enviando])

  const enfocarCampo = (texto: string) => {
    setPregunta(texto.slice(0, 800))
    campoRef.current?.focus()
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void enviarPregunta(pregunta)
  }

  const onTecla = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== 'Enter' || e.shiftKey) return
    e.preventDefault()
    void enviarPregunta(pregunta)
  }

  const ajustarAlto = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`
  }

  return (
    <main id="contenido-principal" className="page-shell">
      <header className="mb-6">
        <p className="text-sm font-bold tracking-wide text-court-700 mb-2">
          Pregunta a TribunalInclusivo
        </p>
        <h1 id={tituloId} className="titulo-pagina mb-2">
          Ayuda
        </h1>
        <p className="text-lg text-court-800 max-w-[42ch]">
          Escribe una duda legal. Te cito la ley y el artículo.
        </p>
      </header>

      <section
        className="mb-10 flex h-[min(34rem,calc(100svh-20.5rem))] min-h-[16rem] flex-col overflow-hidden rounded-tarjeta border border-court-200 bg-white shadow-sm"
        aria-labelledby={tituloId}
      >
        <div className="border-b border-court-200 bg-calma-mist px-4 py-3">
          <div className="flex items-center gap-3">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent-success"
              aria-hidden="true"
            />
            <p className="text-sm font-bold text-court-900">TribunalInclusivo</p>
          </div>
          <p className="mt-1 pl-5 text-sm text-court-500">{AVISO_INFORMACION}</p>
        </div>

        <div
          ref={listaRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4"
        >
          <ul className="space-y-3" aria-label="Conversación">
            {mensajes.map((m) => {
              const propio = m.rol === 'persona'
              return (
                <li key={m.id} className={propio ? 'flex justify-end' : 'flex justify-start'}>
                  <div
                    className={
                      propio
                        ? 'max-w-[85%] rounded-2xl rounded-br-md bg-accent-info px-4 py-3 text-white'
                        : 'max-w-[85%] rounded-2xl rounded-bl-md border border-court-200 bg-calma-sage px-4 py-3 text-court-900'
                    }
                  >
                    <p className="sr-only">{propio ? 'Tú' : 'TribunalInclusivo'}</p>
                    {propio ? (
                      <p className="whitespace-pre-wrap leading-relaxed">{m.texto}</p>
                    ) : (
                      <TextoAsistente texto={m.texto} />
                    )}
                  </div>
                </li>
              )
            })}
            {enviando && (
              <li className="flex justify-start">
                <p className="chat-escribiendo rounded-2xl rounded-bl-md border border-court-200 bg-calma-sage px-4 py-3 text-sm font-medium text-court-700">
                  Escribiendo…
                </p>
              </li>
            )}
          </ul>
        </div>

        <p id={liveId} className="sr-only" role="status" aria-live="polite">
          {anuncio}
        </p>

        <form onSubmit={onSubmit} className="border-t border-court-200 bg-white p-3 sm:p-4">
          <div className="mb-2 flex flex-wrap gap-2" aria-label="Preguntas de ejemplo">
            {SUGERENCIAS.map((texto) => (
              <button
                key={texto}
                type="button"
                onClick={() => void enviarPregunta(texto)}
                disabled={enviando}
                className="min-h-[44px] shrink-0 rounded-full border border-court-200 bg-calma-mist px-3 py-2 text-left text-sm font-medium text-court-800 hover:border-accent-info disabled:opacity-50"
              >
                {texto}
              </button>
            ))}
          </div>
          <label htmlFor={campoId} className="sr-only">
            Tu pregunta
          </label>
          <div className="flex items-end gap-2">
            <textarea
              ref={campoRef}
              id={campoId}
              value={pregunta}
              rows={1}
              onChange={(e) => {
                setPregunta(e.target.value.slice(0, 800))
                ajustarAlto(e.target)
              }}
              onKeyDown={onTecla}
              className="input-accesible max-h-[7.5rem] min-h-[56px] flex-1 py-3"
              placeholder="Escribe tu duda"
              maxLength={800}
              disabled={enviando}
            />
            <button
              type="submit"
              className="btn-primary shrink-0 px-5"
              disabled={enviando || pregunta.trim().length < 2}
            >
              {enviando ? 'Enviando…' : 'Enviar'}
            </button>
          </div>
        </form>
      </section>

      <section className="mb-8 space-y-6" aria-labelledby="seccion-faqs">
        <div className="border-t border-court-200 pt-6">
          <h2 id="seccion-faqs" className="text-2xl font-bold text-court-800 mb-1">
            Preguntas frecuentes según el papel
          </h2>
          <p className="text-court-700 text-sm">
            Respuestas con fundamento legal y enlace al BOE.
            Elige un papel para ver las dudas de ese caso.
          </p>
        </div>

        <TarjetasFaq
          rolInicial={rolUsuario}
          onSeleccionarPregunta={enfocarCampo}
        />

        <div className="border-t border-court-200 pt-6">
          <h3 className="text-xl font-bold text-court-800 mb-1">
            Dudas generales del proceso
          </h3>
          <p className="text-court-700 text-sm mb-4">
            Pausas, acompañamiento, facilitador y privacidad garantizada.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {FAQS_RECURRENTES.map((faq) => {
            const abierta = faqAbierta === faq.id
            return (
              <div
                key={faq.id}
                className="card border-2 border-court-200 hover:border-court-400 transition-colors p-4 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-court-600">
                      {faq.icono} {faq.categoria}
                    </span>
                    {faq.fundamentoLegal && (
                      <span className="text-[11px] bg-court-100 text-court-700 px-2 py-0.5 rounded font-medium">
                        Legal
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-court-900 text-base mb-2">
                    {faq.pregunta}
                  </h3>
                </div>

                {abierta ? (
                  <div className="space-y-3 pt-2 border-t border-court-100" aria-live="polite">
                    <p className="text-sm text-court-800 leading-relaxed">
                      {faq.respuesta}
                    </p>
                    {faq.fundamentoLegal && (
                      <p className="text-xs text-court-600 font-medium">
                        Norma aplicable: {faq.fundamentoLegal}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setFaqAbierta(null)}
                        className="btn-ghost text-xs py-1 px-2.5 min-h-[36px] text-court-600"
                      >
                        Cerrar ▲
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setFaqAbierta(faq.id)}
                      className="btn-secondary text-xs py-1.5 px-3 min-h-[38px]"
                      aria-expanded={false}
                    >
                      Ver respuesta ▼
                    </button>
                    <button
                      type="button"
                      onClick={() => enfocarCampo(faq.pregunta)}
                      className="text-xs text-court-600 hover:text-court-900 underline font-medium min-h-[38px] inline-flex items-center"
                    >
                      Usar en mi pregunta
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}
