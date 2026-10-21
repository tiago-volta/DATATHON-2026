'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import { BotonLeerEnVoz } from '@/components/BotonLeerEnVoz'
import { Icono } from '@/components/Icono'
import { Pictograma } from '@/components/Pictograma'
import type { MiradaSala } from '@/lib/sala-previa/salaVistasConfig'

function urlArasaac(id: number) {
  return `https://static.arasaac.org/pictograms/${id}/${id}_500.png`
}

export type RolJuicio = 'juez' | 'abogado' | 'testigo'

export interface PreguntaJuicio {
  id: string
  rol: RolJuicio
  nombreHablante: string
  cargo: string
  mirada: MiradaSala
  texto: string
  pictogramas: { id: number; keyword: string }[]
  opcionesSugeridas: string[]
  ayuda?: {
    explicacion: string
    consejo: string
  }
}

export interface NivelJuicio {
  id: number
  nombre: string
  descripcion: string
  pictogramaId: number
  pictogramaKeyword: string
  preguntas: PreguntaJuicio[]
}

export const BLOQUES_ENSAYO_SALA: NivelJuicio[] = [
  {
    id: 1,
    nombre: 'Preguntas iniciales del juez',
    descripcion: 'Identificación y juramento para decir la verdad.',
    pictogramaId: 9847,
    pictogramaKeyword: 'preguntar',
    preguntas: [
      {
        id: 'n1-p1',
        rol: 'juez',
        nombreHablante: 'Juez/a de Sala',
        cargo: 'Preside el juicio y dirige la vista',
        mirada: 'juez',
        texto: '¿Cómo te llamas y cuál es tu número de DNI?',
        pictogramas: [
          { id: 27357, keyword: 'nombre' },
          { id: 6517, keyword: 'hablar' },
        ],
        opcionesSugeridas: [
          'Me llamo Luis y mi DNI es 12.345.678-A',
          'Prefiero mostrar mi carnet de identidad al personal de sala',
        ],
      },
      {
        id: 'n1-p2',
        rol: 'juez',
        nombreHablante: 'Juez/a de Sala',
        cargo: 'Preside el juicio y dirige la vista',
        mirada: 'juez',
        texto: '¿Juras o prometes decir la verdad en todo lo que se te pregunte?',
        pictogramas: [
          { id: 8715, keyword: 'verdad' },
          { id: 6517, keyword: 'promesa' },
        ],
        opcionesSugeridas: [
          'Prometo decir la verdad',
          'Juro decir la verdad',
        ],
        ayuda: {
          explicacion:
            'En España los testigos tienen la obligación de decir la verdad. Prometer o jurar tiene el mismo valor legal.',
          consejo: 'Basta con decir con voz tranquila: "Prometo decir la verdad".',
        },
      },
      {
        id: 'n1-p3',
        rol: 'juez',
        nombreHablante: 'Juez/a de Sala',
        cargo: 'Preside el juicio y dirige la vista',
        mirada: 'juez',
        texto: '¿Tienes alguna relación de amistad, enemistad o parentesco con las personas del juicio?',
        pictogramas: [
          { id: 34560, keyword: 'persona' },
          { id: 7117, keyword: 'familia' },
        ],
        opcionesSugeridas: [
          'No las conozco de nada',
          'Solo las vi el día de los hechos',
          'No tengo ningún interés personal en este asunto',
        ],
      },
    ],
  },
  {
    id: 2,
    nombre: 'Preguntas sobre lo ocurrido',
    descripcion: 'Interrogatorio de letrados sobre los hechos observados.',
    pictogramaId: 11291,
    pictogramaKeyword: 'abogado',
    preguntas: [
      {
        id: 'n2-p1',
        rol: 'abogado',
        nombreHablante: 'Abogado/a o Fiscal',
        cargo: 'Formula preguntas sobre los hechos',
        mirada: 'abogados',
        texto: '¿Qué día ocurrieron los hechos y qué hora era aproximadamente?',
        pictogramas: [
          { id: 32488, keyword: 'calendario' },
          { id: 6964, keyword: 'reloj' },
        ],
        opcionesSugeridas: [
          'Ocurrió el martes 14 de noviembre sobre las seis de la tarde',
          'No recuerdo la hora exacta, pero aún era de día',
        ],
      },
      {
        id: 'n2-p2',
        rol: 'abogado',
        nombreHablante: 'Abogado/a o Fiscal',
        cargo: 'Formula preguntas sobre los hechos',
        mirada: 'abogados',
        texto: '¿Dónde estabas tú en ese momento y qué estabas haciendo?',
        pictogramas: [
          { id: 6964, keyword: 'lugar' },
          { id: 34560, keyword: 'tú' },
        ],
        opcionesSugeridas: [
          'Estaba esperando el autobús en la acera de enfrente',
          'Salía de mi trabajo y caminaba por la calle principal',
        ],
      },
      {
        id: 'n2-p3',
        rol: 'abogado',
        nombreHablante: 'Abogado/a o Fiscal',
        cargo: 'Formula preguntas sobre los hechos',
        mirada: 'abogados',
        texto: '¿Qué viste exactamente con tus propios ojos?',
        pictogramas: [
          { id: 6564, keyword: 'ver' },
          { id: 6517, keyword: 'declarar' },
        ],
        opcionesSugeridas: [
          'Vi a dos personas discutir y cómo una empujó a la otra',
          'Solo vi el momento en el que cayó al suelo',
          'Lo que pasó antes no lo pude ver',
        ],
      },
    ],
  },
  {
    id: 3,
    nombre: 'Preguntas complejas y repreguntas',
    descripcion: 'Preguntas capciosas o con presión. Practica tus derechos de pausa y aclaración.',
    pictogramaId: 11697,
    pictogramaKeyword: 'no entender',
    preguntas: [
      {
        id: 'n3-p1',
        rol: 'abogado',
        nombreHablante: 'Abogado/a de la Defensa',
        cargo: 'Repregunta para contrastar tu versión',
        mirada: 'abogados',
        texto: '¿No es cierto que usted no vio bien lo que pasó porque había poca luz?',
        pictogramas: [
          { id: 11697, keyword: 'no entender' },
          { id: 8619, keyword: 'luz' },
          { id: 6564, keyword: 'ver' },
        ],
        opcionesSugeridas: [
          'Sí lo vi con claridad porque había farolas encendidas',
          'Perdone, esa pregunta tiene dos negaciones. ¿Me pregunta si vi lo que pasó?',
          'No lo recuerdo con suficiente exactitud para responder con un sí o un no',
        ],
        ayuda: {
          explicacion:
            'Esta pregunta contiene una doble negación ("no es cierto... que no vio") para confundirte.',
          consejo:
            'Tienes derecho a pedir que te formulen la pregunta de forma afirmativa y directa.',
        },
      },
      {
        id: 'n3-p2',
        rol: 'abogado',
        nombreHablante: 'Abogado/a de la Defensa',
        cargo: 'Repregunta para contrastar tu versión',
        mirada: 'abogados',
        texto: '¿Cómo puede estar seguro si estaba a distancia y con gente alrededor haciendo ruido?',
        pictogramas: [
          { id: 30385, keyword: 'lejos' },
          { id: 7117, keyword: 'ruido' },
        ],
        opcionesSugeridas: [
          'Estaba lo bastante cerca para reconocer la ropa y los gestos',
          'Le pido por favor que me haga una sola pregunta cada vez',
          'Prefiero tomar un momento para responder con tranquilidad',
        ],
        ayuda: {
          explicacion:
            'Mezcla varios datos a la vez (distancia y ruido) para restar valor a tu testimonio.',
          consejo:
            'Puedes pedir amablemente que desglosen la pregunta en partes.',
        },
      },
      {
        id: 'n3-p3',
        rol: 'abogado',
        nombreHablante: 'Abogado/a de la Defensa',
        cargo: 'Repregunta para contrastar tu versión',
        mirada: 'abogados',
        texto: '¿Por qué el tribunal debería creer su palabra frente a lo que han dicho otras personas?',
        pictogramas: [
          { id: 8715, keyword: 'verdad' },
          { id: 34560, keyword: 'persona' },
        ],
        opcionesSugeridas: [
          'Yo solo declaro con sinceridad lo que vi y escuché',
          'No me corresponde juzgar lo que digan otros, solo cuento mi testimonio',
          'Solicito una breve pausa para serenarme, señoría',
        ],
        ayuda: {
          explicacion:
            'Es una pregunta intimidante. Tu deber como testigo es relatar tus vivencias, no competir con otros testigos.',
          consejo:
            'Mantén la calma. Puedes apoyarte en el artículo 7 bis de la LEC para pedir una pausa.',
        },
      },
    ],
  },
]

interface Props {
  enCalma: boolean
  onCambioMirada?: (mirada: MiradaSala) => void
  onPedirPausa: () => void
  onNivelCompletado?: (nivelId: number) => void
  onProgresoPreguntas?: (totalRespondidas: number) => void
}

export function DialogoEnsayoSala({
  enCalma,
  onCambioMirada,
  onPedirPausa,
  onNivelCompletado,
  onProgresoPreguntas,
}: Props) {
  const [nivelIndex, setNivelIndex] = useState(0)
  const [preguntaIndex, setPreguntaIndex] = useState(0)
  const [respuestaEscrita, setRespuestaEscrita] = useState('')
  const [repetidaMensaje, setRepetidaMensaje] = useState<string | null>(null)
  const [pausaPedidaMensaje, setPausaPedidaMensaje] = useState<string | null>(null)
  const [mostrarAyuda, setMostrarAyuda] = useState(false)
  const [bloqueCompletado, setBloqueCompletado] = useState(false)
  const [totalRespondidas, setTotalRespondidas] = useState(0)

  const liveAnuncioId = useId()
  const textareaId = useId()

  const nivelActual = BLOQUES_ENSAYO_SALA[nivelIndex] ?? BLOQUES_ENSAYO_SALA[0]
  const preguntaActual =
    nivelActual.preguntas[preguntaIndex] ?? nivelActual.preguntas[0]

  // Orientar la cámara de la sala 3D según el rol que interviene
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

  const siguientePregunta = () => {
    const nuevoTotal = totalRespondidas + 1
    setTotalRespondidas(nuevoTotal)
    onProgresoPreguntas?.(nuevoTotal)
    setRespuestaEscrita('')
    setRepetidaMensaje(null)
    setPausaPedidaMensaje(null)
    setMostrarAyuda(false)

    if (preguntaIndex < nivelActual.preguntas.length - 1) {
      setPreguntaIndex((prev) => prev + 1)
    } else {
      setBloqueCompletado(true)
      onNivelCompletado?.(nivelActual.id)
    }
  }

  const anteriorPregunta = () => {
    setRespuestaEscrita('')
    setRepetidaMensaje(null)
    setPausaPedidaMensaje(null)
    setMostrarAyuda(false)

    if (preguntaIndex > 0) {
      setPreguntaIndex((prev) => prev - 1)
    } else if (nivelIndex > 0) {
      const previo = nivelIndex - 1
      setNivelIndex(previo)
      setPreguntaIndex(BLOQUES_ENSAYO_SALA[previo].preguntas.length - 1)
    }
  }

  const avanzarSiguienteBloque = () => {
    if (nivelIndex < BLOQUES_ENSAYO_SALA.length - 1) {
      setNivelIndex((prev) => prev + 1)
      setPreguntaIndex(0)
      setBloqueCompletado(false)
      setRespuestaEscrita('')
      setRepetidaMensaje(null)
      setPausaPedidaMensaje(null)
      setMostrarAyuda(false)
    }
  }

  const reiniciarTodo = () => {
    setNivelIndex(0)
    setPreguntaIndex(0)
    setBloqueCompletado(false)
    setRespuestaEscrita('')
    setRepetidaMensaje(null)
    setPausaPedidaMensaje(null)
    setMostrarAyuda(false)
  }

  const esPrimeraPregunta = nivelIndex === 0 && preguntaIndex === 0
  const colorBordeRol =
    preguntaActual.rol === 'juez'
      ? 'border-court-700 bg-court-50/70'
      : 'border-accent-navy/80 bg-slate-50'

  return (
    <section
      className="card border-2 border-court-300 shadow-md p-4 sm:p-6 space-y-4"
      aria-label="Ensayo de declaración dentro de la sala"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-court-200 pb-3">
        <div>
          <span className="text-xs uppercase font-bold tracking-wider text-court-600">
            Simulador de juicio • Nivel {nivelActual.id} de {BLOQUES_ENSAYO_SALA.length}
          </span>
          <h3 className="text-xl font-bold text-court-800">{nivelActual.nombre}</h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-court-700">
            Pregunta {preguntaIndex + 1} de {nivelActual.preguntas.length}
          </span>
        </div>
      </div>

      {bloqueCompletado ? (
        <div className="rounded-tarjeta bg-calma-sage/80 border-2 border-accent-success/50 p-5 space-y-4 text-court-900" aria-live="polite">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">🎯</span>
            <div>
              <h4 className="text-xl font-bold">¡Has superado este bloque de preguntas!</h4>
              <p className="text-court-800 text-sm mt-1">
                Has ensayado cómo responder y cómo usar tus derechos dentro de la sala del juzgado.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            {nivelIndex < BLOQUES_ENSAYO_SALA.length - 1 ? (
              <button
                type="button"
                onClick={avanzarSiguienteBloque}
                className="btn-primary min-h-[44px]"
              >
                Continuar al siguiente bloque de preguntas
              </button>
            ) : (
              <button
                type="button"
                onClick={reiniciarTodo}
                className="btn-secondary min-h-[44px]"
              >
                Volver a practicar desde el principio
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Tarjeta del Hablante Judicial */}
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

              <BotonLeerEnVoz texto={preguntaActual.texto} etiqueta="Escuchar pregunta" />
            </div>

            {/* Pictogramas ARASAAC */}
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

            {/* Texto de la pregunta formulada */}
            <p className="text-xl sm:text-2xl font-semibold text-court-900 text-center py-2 px-1">
              &ldquo;{preguntaActual.texto}&rdquo;
            </p>

            {/* Mensajes reactivos a peticiones del testigo */}
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

          {/* Opciones y Derechos del Testigo (Luis) */}
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2 items-center justify-between">
              <span className="text-sm font-bold text-court-800">
                Tus derechos como testigo (puedes pulsar cualquiera):
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={manejarPedirRepeticion}
                  className="btn-ghost text-xs py-1.5 px-3 min-h-[38px] border border-court-300"
                >
                  <Icono nombre="↺" />
                  Pedir que repitan
                </button>
                <button
                  type="button"
                  onClick={manejarPedirPausa}
                  className="btn-ghost text-xs py-1.5 px-3 min-h-[38px] border border-court-300 text-court-800"
                  aria-pressed={enCalma}
                >
                  <Icono nombre="⏸" />
                  Pedir pausa (art. 7 bis)
                </button>
              </div>
            </div>

            {/* Respuestas sugeridas tipo para orientar sin imponer */}
            {preguntaActual.opcionesSugeridas.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs text-court-600 font-medium">
                  Modelos de respuesta habituales (pulsa para usarla o inspírate):
                </p>
                <div className="flex flex-wrap gap-2">
                  {preguntaActual.opcionesSugeridas.map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => setRespuestaEscrita(sug)}
                      className="text-left text-xs sm:text-sm bg-white hover:bg-court-50 border border-court-300 rounded-suave px-3 py-2 text-court-800 focus-visible:ring-2 focus-visible:ring-court-500 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botón de ayuda contextual / FAQ */}
            {preguntaActual.ayuda && (
              <div>
                <button
                  type="button"
                  onClick={() => setMostrarAyuda(!mostrarAyuda)}
                  aria-expanded={mostrarAyuda}
                  className="btn-ghost text-xs sm:text-sm w-full border border-court-200 bg-amber-50/60 text-court-800 font-medium"
                >
                  {mostrarAyuda ? 'Ocultar explicación' : '¿Esta pregunta te parece difícil o capciosa? Ver explicación'}
                </button>

                {mostrarAyuda && (
                  <div className="mt-2 rounded-tarjeta bg-amber-50 border-2 border-amber-300 p-4 space-y-2 text-court-900" aria-live="polite">
                    <p className="font-bold text-sm text-court-800">Pauta de apoyo en lectura fácil:</p>
                    <p className="text-sm text-court-700">{preguntaActual.ayuda.explicacion}</p>
                    <p className="text-xs text-court-800 bg-white/80 p-2 rounded border border-amber-200">
                      <strong>Consejo:</strong> {preguntaActual.ayuda.consejo}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Campo de respuesta opcional */}
            <div className="space-y-1 pt-2">
              <label htmlFor={textareaId} className="block text-sm font-bold text-court-800">
                Tu respuesta (opcional para practicar):
              </label>
              <textarea
                id={textareaId}
                value={respuestaEscrita}
                onChange={(e) => setRespuestaEscrita(e.target.value.slice(0, 400))}
                rows={2}
                maxLength={400}
                className="textarea-accesible w-full text-sm"
                placeholder="Escribe aquí lo que responderías o pulsa una sugerencia de arriba..."
              />
            </div>

            {/* Botones de navegación entre preguntas */}
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
                  'Completar bloque de preguntas'
                )}
              </button>
            </div>
          </div>
        </>
      )}

      <p id={liveAnuncioId} className="sr-only" aria-live="polite">
        Pregunta {preguntaIndex + 1} de {nivelActual.preguntas.length}: {preguntaActual.texto}
      </p>
    </section>
  )
}

