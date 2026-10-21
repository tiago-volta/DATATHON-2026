'use client'

import { useCallback, useEffect, useId, useState } from 'react'
import Link from 'next/link'
import { BotonLeerEnVoz } from '@/components/BotonLeerEnVoz'
import { Icono } from '@/components/Icono'
import { Pictograma } from '@/components/Pictograma'
import type { MiradaSala } from '@/lib/sala-previa/salaVistasConfig'

function urlArasaac(id: number) {
  return `https://static.arasaac.org/pictograms/${id}/${id}_500.png`
}

export type RolJuicio = 'juez' | 'abogado' | 'testigo'

export interface FaqPregunta {
  titulo: string
  queSignifica: string
  derechoTestigo: string
  consejos: string[]
  articuloLey?: string
  ejemploRespuesta: string
}

export interface PreguntaJuicio {
  id: string
  rol: RolJuicio
  nombreHablante: string
  cargo: string
  mirada: MiradaSala
  texto: string
  pictogramas: { id: number; keyword: string }[]
  opcionesSugeridas: string[]
  faq: FaqPregunta
}

export interface NivelJuicio {
  id: number
  nombre: string
  subtitulo: string
  descripcion: string
  pictogramaId: number
  pictogramaKeyword: string
  resumenSuperado: {
    clave1: string
    clave2: string
    clave3: string
  }
  preguntas: PreguntaJuicio[]
}

export const BLOQUES_ENSAYO_SALA: NivelJuicio[] = [
  {
    id: 1,
    nombre: 'Preguntas iniciales del juez',
    subtitulo: 'Filiación y juramento de veracidad',
    descripcion: 'Identificación oficial y promesa de decir la verdad ante el tribunal.',
    pictogramaId: 9847,
    pictogramaKeyword: 'preguntar',
    resumenSuperado: {
      clave1: 'Comprobaste tu identidad sin ponerte nervioso.',
      clave2: 'Aprendiste que prometer la verdad no significa tener memoria fotográfica.',
      clave3: 'Aclaraste tu neutralidad frente a las partes del proceso.',
    },
    preguntas: [
      {
        id: 'n1-p1',
        rol: 'juez',
        nombreHablante: 'Juez/a de Sala',
        cargo: 'Preside el juicio y vela por las garantías legales',
        mirada: 'juez',
        texto: '¿Cómo te llamas y cuál es tu número de DNI?',
        pictogramas: [
          { id: 27357, keyword: 'nombre' },
          { id: 6517, keyword: 'hablar' },
        ],
        opcionesSugeridas: [
          'Me llamo Luis y mi DNI es 12.345.678-A',
          'Prefiero mostrar mi carnet de identidad al personal de la sala',
        ],
        faq: {
          titulo: '¿Por qué me piden el DNI nada más empezar?',
          queSignifica:
            'El tribunal debe verificar quién eres antes de empezar tu testimonio formal.',
          derechoTestigo:
            'Si los nervios te impiden recordar tu documento de memoria, tienes derecho a entregar el carnet físico para que lo anoten en el acta.',
          articuloLey: 'Art. 433 Ley de Enjuiciamiento Criminal',
          consejos: [
            'Respira hondo antes de contestar.',
            'Lleva el DNI en la mano al entrar a la sala.',
            'No hay prisa por empezar: el juez esperará a que estés sentado y tranquilo.',
          ],
          ejemploRespuesta:
            '"Me llamo Luis, aquí tiene mi documento si prefiere comprobarlo."',
        },
      },
      {
        id: 'n1-p2',
        rol: 'juez',
        nombreHablante: 'Juez/a de Sala',
        cargo: 'Preside el juicio y vela por las garantías legales',
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
        faq: {
          titulo: '¿Qué implica prometer la verdad? ¿Y si no recuerdo algo?',
          queSignifica:
            'La ley exige que digas lo que sinceramente viviste. No exige que adivines ni inventes nada.',
          derechoTestigo:
            'Decir la verdad incluye reconocer con total naturalidad cuando no recuerdas un detalle. Nunca estás obligado a inventar datos.',
          articuloLey: 'Art. 433 y 706 LECrim',
          consejos: [
            'Jurar o prometer tiene exactamente el mismo valor legal.',
            'Basta con responder: "Prometo decir la verdad".',
            'Si dudas de algo más adelante, di sin miedo: "No lo recuerdo con seguridad".',
          ],
          ejemploRespuesta:
            '"Prometo decir la verdad de lo que vi con mis propios ojos."',
        },
      },
      {
        id: 'n1-p3',
        rol: 'juez',
        nombreHablante: 'Juez/a de Sala',
        cargo: 'Preside el juicio y vela por las garantías legales',
        mirada: 'juez',
        texto: '¿Tienes alguna relación de amistad, enemistad o parentesco con las partes?',
        pictogramas: [
          { id: 34560, keyword: 'persona' },
          { id: 7117, keyword: 'familia' },
        ],
        opcionesSugeridas: [
          'No las conozco de nada',
          'Solo las vi el día de los hechos',
          'No tengo ningún interés personal en el resultado del juicio',
        ],
        faq: {
          titulo: '¿Por qué preguntan sobre amistad o parentesco?',
          queSignifica:
            'Son las "preguntas generales de la ley" para conocer si tienes motivos personales para favorecer o perjudicar a alguien.',
          derechoTestigo:
            'Tienes derecho a expresar con sencillez que eres un testigo independiente y que solo acudes a explicar los hechos que viste.',
          articuloLey: 'Art. 436 Ley de Enjuiciamiento Criminal',
          consejos: [
            'Si no conoces a nadie, dilo tal cual: "No las conozco de nada".',
            'Si solo los viste ese día puntual en la calle, acláralo.',
            'No es una acusación, es una formalidad obligatoria para todos los testigos.',
          ],
          ejemploRespuesta:
            '"No conozco a ninguna de las partes implicadas."',
        },
      },
    ],
  },
  {
    id: 2,
    nombre: 'Preguntas sobre lo ocurrido',
    subtitulo: 'Interrogatorio de los letrados sobre los hechos',
    descripcion: 'Preguntas sobre fechas, lugares y sucesos presenciados directamente.',
    pictogramaId: 11291,
    pictogramaKeyword: 'abogado',
    resumenSuperado: {
      clave1: 'Describiste tu perspectiva espacial sin sentirte cuestionado.',
      clave2: 'Comprendiste que puedes dar referencias horarias aproximadas sin presión.',
      clave3: 'Limitaste tu testimonio únicamente a lo que percibieron tus sentidos.',
    },
    preguntas: [
      {
        id: 'n2-p1',
        rol: 'abogado',
        nombreHablante: 'Abogado/a o Fiscal',
        cargo: 'Formula preguntas para reconstruir la cronología',
        mirada: 'abogados',
        texto: '¿Qué día ocurrieron los hechos y qué hora era aproximadamente?',
        pictogramas: [
          { id: 32488, keyword: 'calendario' },
          { id: 6964, keyword: 'reloj' },
        ],
        opcionesSugeridas: [
          'Ocurrió el martes 14 de noviembre sobre las seis de la tarde',
          'No recuerdo el minuto exacto, pero acababa de anochecer',
          'Recuerdo el día concreto, pero no la hora precisa',
        ],
        faq: {
          titulo: '¿Tengo que saber la hora con exactitud de reloj?',
          queSignifica:
            'El letrado intenta fijar el momento exacto en el informe policial.',
          derechoTestigo:
            'Nadie tiene la obligación de recordar minutos exactos. Las referencias ambientales (atardecer, salida del trabajo) son perfectamente válidas.',
          articuloLey: 'Art. 7 bis Ley de Enjuiciamiento Civil (comprensión y tiempo)',
          consejos: [
            'No intentes adivinar una cifra si no estás seguro.',
            'Usa referencias cotidianas: "Acababa de cerrar la tienda", "Estaba oscureciendo".',
            'Si solo recuerdas el día, di la verdad.',
          ],
          ejemploRespuesta:
            '"Fue el 14 de noviembre a media tarde, no sé el minuto exacto."',
        },
      },
      {
        id: 'n2-p2',
        rol: 'abogado',
        nombreHablante: 'Abogado/a o Fiscal',
        cargo: 'Pregunta sobre tu posición física y campo de visión',
        mirada: 'abogados',
        texto: '¿Dónde estabas tú en ese momento y qué estabas haciendo?',
        pictogramas: [
          { id: 6964, keyword: 'lugar' },
          { id: 34560, keyword: 'tú' },
        ],
        opcionesSugeridas: [
          'Estaba esperando el autobús en la parada de enfrente',
          'Salía de mi trabajo y caminaba por la acera derecha',
        ],
        faq: {
          titulo: '¿Por qué quieren saber qué estaba haciendo?',
          queSignifica:
            'Quieren situar tu ángulo visual para saber si tenías línea directa de visión hacia los hechos.',
          derechoTestigo:
            'Solo tienes que describir tu posición física. No tienes que justificar tus motivos personales ni dar explicaciones íntimas.',
          articuloLey: 'Art. 708 Ley de Enjuiciamiento Criminal',
          consejos: [
            'Indica simplemente en qué acera o punto estabas.',
            'Menciona si había obstáculos visuales (árboles, coches) con sinceridad.',
          ],
          ejemploRespuesta:
            '"Estaba de pie en la parada de autobús, a unos diez metros."',
        },
      },
      {
        id: 'n2-p3',
        rol: 'abogado',
        nombreHablante: 'Abogado/a o Fiscal',
        cargo: 'Pregunta sobre los actos concretos observados',
        mirada: 'abogados',
        texto: '¿Qué viste exactamente con tus propios ojos?',
        pictogramas: [
          { id: 6564, keyword: 'ver' },
          { id: 6517, keyword: 'declarar' },
        ],
        opcionesSugeridas: [
          'Vi a dos personas discutir y cómo una empujó a la otra',
          'Solo vi el momento en el que la persona cayó al suelo',
          'Lo que ocurrió antes no lo pude ver porque estaba de espaldas',
        ],
        faq: {
          titulo: '¿Qué pasa si solo vi un trozo de lo que pasó?',
          queSignifica:
            'El tribunal necesita únicamente tus percepciones directas, no deducciones ni lo que te hayan contado después.',
          derechoTestigo:
            'Declarar "solo vi una parte" es lo más honesto y valorado por un juez. Es un derecho no pronunciarse sobre lo que no viste.',
          articuloLey: 'Art. 710 Ley de Enjuiciamiento Criminal',
          consejos: [
            'Separa lo que viste de lo que deduces.',
            'No sientas que decepcionas al tribunal por no haberlo visto todo.',
            'Di con tranquilidad: "Solo vi el empujón, el principio no lo vi".',
          ],
          ejemploRespuesta:
            '"Solo presencié el momento en que una persona cayó al suelo."',
        },
      },
    ],
  },
  {
    id: 3,
    nombre: 'Preguntas complejas y repreguntas',
    subtitulo: 'Preguntas capciosas o con presión procesal',
    descripcion: 'Aprende a identificar trampas verbales y a ejercer tus derechos de aclaración y pausa.',
    pictogramaId: 11697,
    pictogramaKeyword: 'no entender',
    resumenSuperado: {
      clave1: 'Identificaste dobles negaciones y supiste pedir preguntas directas.',
      clave2: 'Hiciste valer tu derecho a dividir preguntas complejas en partes.',
      clave3: 'Practicaste la solicitud de pausa según el artículo 7 bis de la LEC.',
    },
    preguntas: [
      {
        id: 'n3-p1',
        rol: 'abogado',
        nombreHablante: 'Abogado/a de la Defensa',
        cargo: 'Repregunta con doble negación para generar dudas',
        mirada: 'abogados',
        texto: '¿No es cierto que usted no vio bien lo que pasó porque había poca luz?',
        pictogramas: [
          { id: 11697, keyword: 'no entender' },
          { id: 8619, keyword: 'luz' },
          { id: 6564, keyword: 'ver' },
        ],
        opcionesSugeridas: [
          'Sí lo vi con claridad porque había farolas encendidas',
          'Perdone, esa frase tiene dos negaciones. ¿Me pregunta si lo vi bien?',
          'No puedo responder con sí o no a esa frase, prefiero explicar lo que vi',
        ],
        faq: {
          titulo: '¿Por qué usan dos negaciones en la misma frase?',
          queSignifica:
            'Una doble negación ("no es cierto que no vio") busca confundir a la mente para que dudes o digas "sí" o "no" por error.',
          derechoTestigo:
            'El art. 7 bis de la LEC y las directrices del CGPJ te garantizan el derecho a exigir que las preguntas se formulen en lenguaje claro y afirmativo.',
          articuloLey: 'Art. 7 bis Ley de Enjuiciamiento Civil (Adaptaciones procesales)',
          consejos: [
            'No respondas inmediatamente.',
            'Puedes decir educadamente: "¿Me puede hacer la pregunta sin negaciones, por favor?".',
            'No contestes con un simple sí o no si la pregunta está enredada.',
          ],
          ejemploRespuesta:
            '"Disculpe, ¿me está preguntando si había suficiente luz para ver?"',
        },
      },
      {
        id: 'n3-p2',
        rol: 'abogado',
        nombreHablante: 'Abogado/a de la Defensa',
        cargo: 'Formula una pregunta compuesta de presión',
        mirada: 'abogados',
        texto: '¿Cómo puede estar seguro si estaba a distancia y con gente haciendo ruido?',
        pictogramas: [
          { id: 30385, keyword: 'lejos' },
          { id: 7117, keyword: 'ruido' },
        ],
        opcionesSugeridas: [
          'Estaba lo bastante cerca para reconocer la ropa y los gestos',
          'Le pido por favor que me haga una sola pregunta cada vez',
          'El ruido no me impidió ver con claridad los hechos',
        ],
        faq: {
          titulo: '¿Qué hago si me preguntan varias cosas a la vez?',
          queSignifica:
            'Las preguntas compuestas mezclan dos factores (distancia y ruido) para obligarte a contestar a ambas a la vez y restar valor a tu palabra.',
          derechoTestigo:
            'Tienes el derecho explícito a solicitar que te separen los puntos en preguntas independientes y ordenadas.',
          articuloLey: 'Art. 708 LECrim y Guía Accesibilidad Cognitiva CGPJ 2025',
          consejos: [
            'Divide mentalmente la pregunta: 1) la distancia, 2) el ruido.',
            'Responde primero a una parte y luego a la otra.',
            'O pide: "Pregúnteme primero por la distancia y luego por el ruido".',
          ],
          ejemploRespuesta:
            '"Por favor, formúleme una pregunta para la distancia y otra para el ruido."',
        },
      },
      {
        id: 'n3-p3',
        rol: 'abogado',
        nombreHablante: 'Abogado/a de la Defensa',
        cargo: 'Plantea una pregunta intimidante y de confrontación',
        mirada: 'abogados',
        texto: '¿Por qué el tribunal debería creer su palabra frente a lo que han dicho otras personas?',
        pictogramas: [
          { id: 8715, keyword: 'verdad' },
          { id: 34560, keyword: 'persona' },
        ],
        opcionesSugeridas: [
          'Yo solo declaro con sinceridad lo que vi con mis propios ojos',
          'No me corresponde opinar sobre los demás, solo explicar mi testimonio',
          'Solicito una breve pausa para serenarme, señoría',
        ],
        faq: {
          titulo: '¿Tengo que demostrar que soy mejor que los demás testigos?',
          queSignifica:
            'El letrado intenta confrontarte para ver si te alteras o dudas. No es tu deber juzgar a otros.',
          derechoTestigo:
            'Un testigo nunca juzga ni compite con nadie. Tu única obligación legal es relatar tu experiencia de forma sincera. Además, puedes pedir una pausa si sientes agobio.',
          articuloLey: 'Art. 7 bis LEC (Pausas por sobrecarga sensorial/cognitiva)',
          consejos: [
            'Mantén la calma corporal: no es una discusión personal.',
            'No opines sobre lo que hayan dicho otros.',
            'Si sientes saturación, pulsa o pide la pausa del art. 7 bis.',
          ],
          ejemploRespuesta:
            '"Yo solo vengo a relatar con veracidad lo que presencié."',
        },
      },
    ],
  },
]

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

  const nivelActual = BLOQUES_ENSAYO_SALA[nivelIndex] ?? BLOQUES_ENSAYO_SALA[0]
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
            Simulador de juicio • Nivel {nivelActual.id} de {BLOQUES_ENSAYO_SALA.length}
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

            {nivelIndex < BLOQUES_ENSAYO_SALA.length - 1 ? (
              <button
                type="button"
                onClick={avanzarSiguienteBloque}
                className="btn-primary min-h-[44px] text-base px-6"
              >
                Avanzar al siguiente nivel: {BLOQUES_ENSAYO_SALA[nivelIndex + 1].nombre}
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

              <BotonLeerEnVoz texto={preguntaActual.texto} etiqueta="Escuchar pregunta" />
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
                      onClick={() => setRespuestaEscrita(sug)}
                      className="text-left text-xs sm:text-sm bg-white hover:bg-court-50 border border-court-300 rounded-suave px-3 py-2 text-court-800 focus-visible:ring-2 focus-visible:ring-court-500 transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>
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

      <p id={liveAnuncioId} className="sr-only" aria-live="polite">
        Pregunta {preguntaIndex + 1} de {nivelActual.preguntas.length}: {preguntaActual.texto}
      </p>
    </section>
  )
}
