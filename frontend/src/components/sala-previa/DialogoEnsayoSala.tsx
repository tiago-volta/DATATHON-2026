'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { Icono } from '@/components/Icono'
import { Pictograma } from '@/components/Pictograma'
import type { MiradaSala } from '@/lib/sala-previa/salaVistasConfig'

function urlArasaac(id: number) {
  return `https://static.arasaac.org/pictograms/${id}/${id}_500.png`
}

import {
  bloquesPorRol,
  BLOQUES_ENSAYO_SALA,
  type FaqPregunta,
  type NivelJuicio,
  type PreguntaJuicio,
  type RolJuicio,
} from '@/lib/ensaya/bancoPreguntas'
import { cargarPerfil, registrarPreguntaDificil } from '@/lib/perfil/perfil'

export type { RolJuicio, FaqPregunta, PreguntaJuicio, NivelJuicio }
export { BLOQUES_ENSAYO_SALA }

interface Props {
  enCalma: boolean
  aforoGente?: number
  onCambioMirada?: (mirada: MiradaSala) => void
  onPedirPausa: () => void
  onNivelCompletado?: (nivelId: number) => void
  onProgresoPreguntas?: (totalRespondidas: number) => void
  onSubirAforoEstimulo?: () => void
  onPersonaEntrando?: (activo: boolean) => void
}

export function DialogoEnsayoSala({
  enCalma,
  aforoGente = 0,
  onCambioMirada,
  onPedirPausa,
  onNivelCompletado,
  onProgresoPreguntas,
  onSubirAforoEstimulo,
  onPersonaEntrando,
}: Props) {
  const [nivelIndex, setNivelIndex] = useState(0)
  const [preguntaIndex, setPreguntaIndex] = useState(0)
  const [respuestaEscrita, setRespuestaEscrita] = useState('')
  const [repetidaMensaje, setRepetidaMensaje] = useState<string | null>(null)
  const [pausaPedidaMensaje, setPausaPedidaMensaje] = useState<string | null>(null)
  const [mostrarFaq, setMostrarFaq] = useState(false)
  const [bloqueCompletado, setBloqueCompletado] = useState(false)
  const [totalRespondidas, setTotalRespondidas] = useState(0)

  // Estado del evento sensorial de distracción y reconducción de atención
  const [distraccionActiva, setDistraccionActiva] = useState(false)
  const [atencionRecuperada, setAtencionRecuperada] = useState(false)

  const liveAnuncioId = useId()
  const textareaId = useId()

  const perfil = cargarPerfil()
  const bloques = bloquesPorRol(perfil?.rol)
  const nivelActual = bloques[nivelIndex] ?? bloques[0]
  const [aciertoDetectado, setAciertoDetectado] = useState<string | null>(null)

  const seleccionarOpcion = (sug: string) => {
    setRespuestaEscrita(sug)
    if (preguntaActual?.tipoDificil) {
      const esSegura =
        sug === preguntaActual.respuestaSegura ||
        sug.toLowerCase().includes('otra forma') ||
        sug.toLowerCase().includes('una en una') ||
        sug.toLowerCase().includes('no lo recuerdo') ||
        sug.toLowerCase().includes('no lo sé') ||
        sug.toLowerCase().includes('no declarar') ||
        sug.toLowerCase().includes('pausa') ||
        sug.toLowerCase().includes('no es correcto')

      if (esSegura) {
        registrarPreguntaDificil(preguntaActual.tipoDificil, true)
        setAciertoDetectado(
          '✓ Respuesta segura: has pedido reformulación o precisión (arts. 7 bis LEC y 709 LECrim).'
        )
      } else {
        setAciertoDetectado(null)
      }
    }
  }
  const preguntaActual =
    nivelActual.preguntas[preguntaIndex] ?? nivelActual.preguntas[0]

  useEffect(() => {
    if (preguntaActual?.mirada && onCambioMirada) {
      onCambioMirada(preguntaActual.mirada)
    }
  }, [preguntaActual, onCambioMirada])

  const manejarPedirRepeticion = useCallback(() => {
    setRepetidaMensaje(
      `Disculpa, te lo repito despacio: "${preguntaActual.texto}"`
    )
    setPausaPedidaMensaje(null)
  }, [preguntaActual])

  const manejarPedirPausa = useCallback(() => {
    setPausaPedidaMensaje(
      'El juez acepta tu petición: "Concedemos una pausa de tranquilidad (art. 7 bis LEC). Respira con calma y continuamos cuando quieras".'
    )
    setRepetidaMensaje(null)
    onPedirPausa()
  }, [onPedirPausa])

  // Disparar evento de distracción sensorial (entra una persona por la puerta)
  const activarDistraccion = useCallback(() => {
    setDistraccionActiva(true)
    setAtencionRecuperada(false)
    onPersonaEntrando?.(true)
  }, [onPersonaEntrando])

  // Reconducir la atención de nuevo al Juez
  const reconducirAtencionAlJuez = useCallback(() => {
    onCambioMirada?.('juez')
    setDistraccionActiva(false)
    setAtencionRecuperada(true)
    setTimeout(() => {
      onPersonaEntrando?.(false)
      setAtencionRecuperada(false)
    }, 4000)
  }, [onCambioMirada, onPersonaEntrando])

  const siguientePregunta = () => {
    const nuevoTotal = totalRespondidas + 1
    setTotalRespondidas(nuevoTotal)
    setAciertoDetectado(null)
    onProgresoPreguntas?.(nuevoTotal)
    setRespuestaEscrita('')
    setRepetidaMensaje(null)
    setPausaPedidaMensaje(null)
    setMostrarFaq(false)
    setDistraccionActiva(false)
    setAtencionRecuperada(false)
    onPersonaEntrando?.(false)

    if (preguntaIndex < nivelActual.preguntas.length - 1) {
      setPreguntaIndex((prev) => prev + 1)
    } else {
      setBloqueCompletado(true)
      onNivelCompletado?.(nivelActual.id)
    }
  }

  const anteriorPregunta = () => {
    setAciertoDetectado(null)
    setRespuestaEscrita('')
    setRepetidaMensaje(null)
    setPausaPedidaMensaje(null)
    setMostrarFaq(false)
    setDistraccionActiva(false)
    setAtencionRecuperada(false)
    onPersonaEntrando?.(false)

    if (preguntaIndex > 0) {
      setPreguntaIndex((prev) => prev - 1)
    } else if (nivelIndex > 0) {
      const previo = nivelIndex - 1
      setNivelIndex(previo)
      setPreguntaIndex(bloques[previo].preguntas.length - 1)
    }
  }

  const avanzarSiguienteBloque = () => {
    if (nivelIndex < bloques.length - 1) {
      setNivelIndex((prev) => prev + 1)
      setPreguntaIndex(0)
      setBloqueCompletado(false)
      setRespuestaEscrita('')
      setRepetidaMensaje(null)
      setPausaPedidaMensaje(null)
      setMostrarFaq(false)
      setDistraccionActiva(false)
      setAtencionRecuperada(false)
      onPersonaEntrando?.(false)
    }
  }

  const reiniciarBloqueActual = () => {
    setPreguntaIndex(0)
    setBloqueCompletado(false)
    setRespuestaEscrita('')
    setRepetidaMensaje(null)
    setPausaPedidaMensaje(null)
    setMostrarFaq(false)
    setDistraccionActiva(false)
    setAtencionRecuperada(false)
    onPersonaEntrando?.(false)
  }

  const esPrimeraPregunta = nivelIndex === 0 && preguntaIndex === 0
  const colorBordeRol =
    preguntaActual.rol === 'juez'
      ? 'border-court-700 bg-court-50/70'
      : 'border-accent-navy/80 bg-slate-50'

  return (
    <section
      className="card border-2 border-court-300 shadow-md p-4 sm:p-6 space-y-4"
      aria-label="Simulador y ensayo de declaración en sala judicial"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-court-200 pb-3">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-court-600">
            Ensayo de preguntas difíciles • Nivel {nivelActual.id} de {bloques.length}
          </span>
          <h3 className="text-xl font-bold text-court-800">{nivelActual.nombre}</h3>
          <p className="text-xs text-court-600">{nivelActual.subtitulo}</p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-court-700 bg-court-100 px-3 py-1 rounded-full">
            Pregunta {preguntaIndex + 1} de {nivelActual.preguntas.length}
          </span>
        </div>
      </div>

      {bloqueCompletado ? (
        /* ================= CRITERIO VISIBLE DE NIVEL SUPERADO ================= */
        <div
          className="rounded-tarjeta bg-calma-sage border-2 border-accent-success p-6 space-y-6 text-court-900 shadow-sm"
          aria-live="polite"
        >
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="w-16 h-16 rounded-full bg-accent-success text-white flex items-center justify-center shrink-0 shadow">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path
                  d="M5 13l4 4L19 7"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <span className="inline-block bg-accent-success/20 text-accent-navy text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                Criterio cumplido
              </span>
              <h4 className="text-2xl font-bold text-court-900">
                ¡Nivel {nivelActual.id} superado con éxito!
              </h4>
              <p className="text-court-700 text-sm">
                Has completado todas las preguntas de este bloque y ejercido tus derechos de forma serena.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="bg-white/80 p-3 rounded-suave border border-accent-success/30 text-center">
              <p className="text-2xl font-bold text-court-800">
                {nivelActual.preguntas.length}/{nivelActual.preguntas.length}
              </p>
              <p className="text-xs text-court-600 font-medium">Preguntas completadas</p>
            </div>
            <div className="bg-white/80 p-3 rounded-suave border border-accent-success/30 text-center">
              <p className="text-2xl font-bold text-accent-success">100%</p>
              <p className="text-xs text-court-600 font-medium">Derecho a pausas activo</p>
            </div>
            <div className="bg-white/80 p-3 rounded-suave border border-accent-success/30 text-center">
              <p className="text-2xl font-bold text-court-800">+10</p>
              <p className="text-xs text-court-600 font-medium">Confianza acumulada</p>
            </div>
          </div>

          {/* ================= PROGRESIÓN DE TOLERANCIA ================= */}
          <div className="rounded-tarjeta bg-amber-50/90 border-2 border-amber-300 p-4 space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-2xl" aria-hidden="true">📈</span>
              <div className="space-y-1">
                <p className="font-bold text-sm text-court-900">
                  Progresión de tolerancia conseguida ({Math.round(aforoGente)}% aforo de sala)
                </p>
                <p className="text-xs text-court-700">
                  Has ensayado en este nivel tolerando el estímulo de la sala sin desregularte.
                  {aforoGente < 60
                    ? ' Puedes aumentar el aforo para entrenar con más asistentes de público.'
                    : ' Tienes un nivel de tolerancia muy sólido ante una sala con público real.'}
                </p>
              </div>
            </div>

            {onSubirAforoEstimulo && aforoGente < 80 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={onSubirAforoEstimulo}
                  className="btn-secondary text-xs py-1.5 px-3 min-h-[38px] bg-white border-amber-300"
                >
                  Subir aforo de la sala (+20 personas)
                </button>
              </div>
            )}
          </div>

          <div className="bg-white p-4 rounded-suave border border-court-200 space-y-2">
            <p className="font-bold text-sm text-court-800 flex items-center gap-2">
              <Icono nombre="✓" />
              Puntos clave consolidados en este nivel:
            </p>
            <ul className="text-xs sm:text-sm text-court-700 space-y-1.5 list-disc pl-5">
              <li>{nivelActual.resumenSuperado.clave1}</li>
              <li>{nivelActual.resumenSuperado.clave2}</li>
              <li>{nivelActual.resumenSuperado.clave3}</li>
            </ul>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={reiniciarBloqueActual}
              className="btn-ghost text-sm min-h-[44px]"
            >
              <Icono nombre="↺" />
              Practicar este nivel otra vez
            </button>

            {nivelIndex < bloques.length - 1 ? (
              <button
                type="button"
                onClick={avanzarSiguienteBloque}
                className="btn-primary min-h-[44px] text-base px-6"
              >
                Avanzar al siguiente nivel: {bloques[nivelIndex + 1].nombre}
                <Icono nombre="→" />
              </button>
            ) : (
              <Link
                href="/pasaporte?ajustes=preguntas-claras,mas-tiempo,pausas"
                className="btn-primary min-h-[44px] text-base px-6 inline-flex items-center gap-2"
              >
                Finalizar ensayo y guardar mis ajustes
                <Icono nombre="→" />
              </Link>
            )}
          </div>
        </div>
      ) : (
        /* ================= ESCENA ACTIVA DE PREGUNTAS ================= */
        <>
          <div className={`rounded-tarjeta border-2 p-4 transition-colors ${colorBordeRol}`}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    preguntaActual.rol === 'juez'
                      ? 'bg-court-800 text-white'
                      : 'bg-accent-navy text-white'
                  }`}
                >
                  {preguntaActual.rol === 'juez' ? 'Juez / Presidencia' : 'Abogado / Letrado'}
                </span>
                <span className="text-xs text-court-600 hidden sm:inline">
                  {preguntaActual.cargo}
                </span>
              </div>

            </div>

            <div
              className="flex flex-wrap gap-3 justify-center my-3 p-2 rounded-suave bg-white/80 border border-court-200"
              aria-label="Pictogramas de apoyo a la pregunta"
            >
              {preguntaActual.pictogramas.map((p) => (
                <Pictograma
                  key={`${p.id}-${p.keyword}`}
                  url={urlArasaac(p.id)}
                  keyword={p.keyword}
                  size="md"
                />
              ))}
            </div>

            <p className="text-xl sm:text-2xl font-semibold text-court-900 text-center py-2 px-1">
              &ldquo;{preguntaActual.texto}&rdquo;
            </p>

            {repetidaMensaje && (
              <div
                className="mt-3 p-3 rounded-suave bg-white border-2 border-court-400 text-court-800 text-sm"
                aria-live="polite"
              >
                <p className="font-bold">Aclaración de la sala:</p>
                <p>{repetidaMensaje}</p>
              </div>
            )}

            {pausaPedidaMensaje && (
              <div
                className="mt-3 p-3 rounded-suave bg-calma-sage border-2 border-accent-success text-court-900 text-sm"
                aria-live="polite"
              >
                <p className="font-bold">Pausa concedida:</p>
                <p>{pausaPedidaMensaje}</p>
              </div>
            )}
          </div>

          {/* ================= ALERTA DE DISTRACCIÓN / ATENCIÓN ================= */}
          {distraccionActiva && (
            <div
              className="rounded-tarjeta bg-amber-50 border-2 border-amber-400 p-4 space-y-3 shadow-sm"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl" aria-hidden="true">🚪</span>
                <div className="space-y-1 flex-1">
                  <p className="font-bold text-sm sm:text-base text-court-900">
                    Entrenamiento atencional: Alguien entra por la puerta del fondo
                  </p>
                  <p className="text-xs sm:text-sm text-court-700">
                    En los juicios es habitual que entren funcionarios o abogados. Tienes derecho a desviar la mirada unos instantes y volver al juez con serenidad.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onCambioMirada?.('entrada')}
                  className="btn-ghost text-xs py-1.5 px-3 min-h-[38px] border border-amber-300 bg-white"
                >
                  Mirar hacia la puerta
                </button>
                <button
                  type="button"
                  onClick={reconducirAtencionAlJuez}
                  className="btn-primary text-xs py-1.5 px-4 min-h-[38px]"
                >
                  Reconducir atención al Juez
                </button>
              </div>
            </div>
          )}

          {atencionRecuperada && (
            <div
              className="rounded-suave bg-calma-sage border border-accent-success p-3 text-xs sm:text-sm text-court-900 flex items-center gap-2"
              role="status"
              aria-live="polite"
            >
              <span className="text-accent-success font-bold text-base">✓</span>
              <span>
                <strong>Atención recuperada:</strong> Tu mirada vuelve a centrarse en el interrogatorio.
              </span>
            </div>
          )}

          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <span className="text-sm font-bold text-court-800">
                Tus derechos como testigo (puedes activar cualquiera):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={activarDistraccion}
                  className="btn-ghost text-xs py-1.5 px-2.5 min-h-[38px] border border-amber-300 bg-amber-50/50 text-court-800"
                  title="Simula un evento de distracción en la sala para entrenar el foco"
                >
                  <span aria-hidden="true">🚪</span>
                  Simular distracción
                </button>
                <button
                  type="button"
                  onClick={manejarPedirRepeticion}
                  className="btn-ghost text-xs py-1.5 px-2.5 min-h-[38px] border border-court-300 bg-white"
                >
                  <Icono nombre="↺" />
                  Pedir que repitan
                </button>
                <button
                  type="button"
                  onClick={manejarPedirPausa}
                  className="btn-ghost text-xs py-1.5 px-2.5 min-h-[38px] border border-court-300 bg-white text-court-800"
                  aria-pressed={enCalma}
                >
                  <Icono nombre="⏸" />
                  Pedir pausa (art. 7 bis)
                </button>
              </div>
            </div>

            {/* ================= TARJETA FAQ CONTEXTUAL ================= */}
            <div className="rounded-tarjeta border-2 border-amber-300 bg-amber-50/70 p-3 sm:p-4 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarFaq(!mostrarFaq)}
                  aria-expanded={mostrarFaq}
                  className="flex items-center gap-2 text-left font-bold text-court-900 text-sm hover:text-court-700 min-h-[44px] flex-1"
                >
                  <span className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 inline-flex items-center justify-center text-xs font-black shrink-0">
                    ?
                  </span>
                  <span>{preguntaActual.faq.titulo}</span>
                  <span className="text-xs text-court-600 font-normal ml-auto">
                    {mostrarFaq ? 'Cerrar tarjeta FAQ ▲' : 'Ver tarjeta FAQ ▼'}
                  </span>
                </button>
              </div>

              {mostrarFaq && (
                <div className="space-y-3 pt-2 border-t border-amber-200/80 text-sm text-court-800" aria-live="polite">
                  <div>
                    <p className="font-bold text-xs uppercase tracking-wider text-court-600">
                      ¿Qué significa en la sala?
                    </p>
                    <p className="mt-0.5">{preguntaActual.faq.queSignifica}</p>
                  </div>

                  <div className="bg-white/80 p-3 rounded-suave border border-amber-200">
                    <p className="font-bold text-xs uppercase tracking-wider text-accent-navy">
                      Tu derecho legal protegido:
                    </p>
                    <p className="mt-0.5 text-court-900">{preguntaActual.faq.derechoTestigo}</p>
                    {preguntaActual.faq.articuloLey && (
                      <span className="inline-block mt-1 text-[11px] font-bold text-court-600 bg-court-100 px-2 py-0.5 rounded">
                        {preguntaActual.faq.articuloLey}
                      </span>
                    )}
                  </div>

                  <div>
                    <p className="font-bold text-xs uppercase tracking-wider text-court-600 mb-1">
                      Pautas prácticas para responder:
                    </p>
                    <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                      {preguntaActual.faq.consejos.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-1">
                    <p className="text-xs text-court-600 font-medium">Ejemplo de respuesta serena:</p>
                    <p className="text-xs sm:text-sm font-semibold text-court-900 italic mt-0.5">
                      {preguntaActual.faq.ejemploRespuesta}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modelos sugeridos de respuesta */}
            {preguntaActual.opcionesSugeridas.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-court-600 font-medium">
                  Modelos de respuesta rápida (pulsa una para ensayarla):
                </p>
                <div className="flex flex-wrap gap-2">
                  {preguntaActual.opcionesSugeridas.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => seleccionarOpcion(sug)}
                      className="text-left text-xs sm:text-sm bg-white hover:bg-court-50 border border-court-300 rounded-suave px-3 py-2 text-court-800 focus-visible:ring-2 focus-visible:ring-court-500 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {aciertoDetectado && (
              <div
                className="rounded-suave bg-calma-sage border-2 border-accent-success p-3 text-xs sm:text-sm text-court-900 flex items-center gap-2"
                role="status"
                aria-live="polite"
              >
                <span className="text-accent-success font-bold text-base">✓</span>
                <span className="font-medium">{aciertoDetectado}</span>
              </div>
            )}

            {/* Campo opcional de respuesta */}
            <div className="space-y-1 pt-1">
              <label htmlFor={textareaId} className="block text-sm font-bold text-court-800">
                Tu respuesta (opcional):
              </label>
              <textarea
                id={textareaId}
                value={respuestaEscrita}
                onChange={(e) => setRespuestaEscrita(e.target.value.slice(0, 400))}
                rows={2}
                maxLength={400}
                className="textarea-accesible w-full text-sm"
                placeholder="Escribe lo que dirías en la sala o usa una opción de arriba..."
              />
            </div>

            {/* Controles de avance */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={anteriorPregunta}
                disabled={esPrimeraPregunta}
                className="btn-secondary min-h-[44px]"
              >
                <Icono nombre="←" />
                Anterior
              </button>

              <button
                type="button"
                onClick={siguientePregunta}
                className="btn-primary min-h-[44px]"
              >
                {preguntaIndex < nivelActual.preguntas.length - 1 ? (
                  <>
                    Siguiente pregunta
                    <Icono nombre="→" />
                  </>
                ) : (
                  'Ver resultado del nivel'
                )}
              </button>
            </div>
          </div>
        </>
      )}

      <div className="pt-2 border-t border-court-200 text-center">
        <Link href="/ayuda" className="text-xs text-court-700 underline font-medium hover:text-court-900">
          ¿Dudas sobre tus derechos? Consulta las preguntas frecuentes según el papel →
        </Link>
      </div>

      <p id={liveAnuncioId} className="sr-only" aria-live="polite">
        Pregunta {preguntaIndex + 1} de {nivelActual.preguntas.length}: {preguntaActual.texto}
      </p>
    </section>
  )
}
