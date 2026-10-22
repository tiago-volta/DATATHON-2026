'use client'

import { FormEvent, useCallback, useEffect, useId, useRef, useState } from 'react'
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
      'El simulador te permite ver la sala de vistas en 3D, graduar el ruido, la luz y el aforo, y ensayar las preguntas habituales de jueces y abogados, para que el día del juicio nada te resulte desconocido.',
    fundamentoLegal: 'Anticipación cognitiva y desensibilización sensorial',
  },
]

type Mensaje = {
  id: string
  rol: 'persona' | 'asistente'
  texto: string
}

/**
 * Pregunta a PUENTE: dudas por texto.
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
        'Hola. Soy el asistente de PUENTE. Puedes preguntarme por la citación, el Pasaporte o la Sala Previa. Escribe tu duda. No pido datos de salud.',
    },
  ])
  const [enviando, setEnviando] = useState(false)
  const [faqAbierta, setFaqAbierta] = useState<string | null>(null)
  const [rolUsuario, setRolUsuario] = useState<RolPerfil | null>(null)
  const [anuncio, setAnuncio] = useState('')
  const listaRef = useRef<HTMLUListElement>(null)
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
      const idInclusiveCourt = `r-${Date.now()}`
      setMensajes((prev) => [
        ...prev,
        { id: idInclusiveCourt, rol: 'asistente', texto: respuesta },
      ])
      setAnuncio('Respuesta lista.')
    } catch {
      const fallback =
        'Ahora mismo no puedo responder. Prueba otra vez en unos segundos, o mira Citación, Pasaporte o Sala en el menú.'
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
    listaRef.current?.lastElementChild?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [mensajes])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void enviarPregunta(pregunta)
  }

  return (
    <main id="contenido-principal" className="page-shell">
      <header className="mb-8">
        <p className="text-sm font-bold tracking-wide text-court-700 mb-2">
          Pregunta a PUENTE
        </p>
        <h1 id={tituloId} className="titulo-pagina">
          Ayuda
        </h1>
        <p className="entradilla max-w-[40ch]">
          Escribe tu duda. Te respondo con frases cortas. No hago diagnósticos ni
          pido datos de salud.
        </p>
      </header>

      <ul
        ref={listaRef}
        className="space-y-4 mb-8"
        aria-label="Conversación"
        aria-live="polite"
        aria-relevant="additions"
      >
        {mensajes.map((m) => (
          <li
            key={m.id}
            className={
              m.rol === 'persona'
                ? 'ml-4 md:ml-12 p-4 rounded-tarjeta bg-court-50 border border-court-200'
                : 'mr-4 md:mr-12 p-4 rounded-tarjeta bg-calma-sage border border-court-200'
            }
          >
            <p className="text-sm font-bold text-court-700 mb-1">
              {m.rol === 'persona' ? 'Tú' : 'PUENTE'}
            </p>
            <p className="text-court-900 leading-relaxed">{m.texto}</p>
          </li>
        ))}
      </ul>

      <p id={liveId} className="sr-only" role="status" aria-live="polite">
        {anuncio}
      </p>

      {anuncio && (
        <p
          className="mb-4 text-court-800 bg-court-50 border border-court-200 rounded-lg p-3"
          role="status"
          aria-live="polite"
        >
          {anuncio}
        </p>
      )}

      <form onSubmit={onSubmit} className="card mb-6" aria-labelledby={tituloId}>
        <label htmlFor={campoId} className="block text-lg font-medium text-court-800 mb-2">
          Tu pregunta
        </label>
        <textarea
          id={campoId}
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value.slice(0, 800))}
          className="textarea-accesible min-h-[120px] mb-4"
          placeholder="Ejemplo: ¿Qué es el Pasaporte de ajustes?"
          maxLength={800}
          disabled={enviando}
          aria-describedby="ayuda-pregunta-hint"
        />
        <p id="ayuda-pregunta-hint" className="text-sm text-court-700 mb-4">
          Escribe tu duda con el teclado. Máximo 800 caracteres.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="btn-primary min-h-[44px]"
            disabled={enviando || pregunta.trim().length < 2}
          >
            {enviando ? 'Enviando…' : 'Enviar'}
          </button>
        </div>
      </form>

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
          onSeleccionarPregunta={(txt) => {
            setPregunta(txt)
            window.scrollTo({ top: 250, behavior: 'smooth' })
          }}
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
                      onClick={() => {
                        setPregunta(faq.pregunta)
                        window.scrollTo({ top: 250, behavior: 'smooth' })
                      }}
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
