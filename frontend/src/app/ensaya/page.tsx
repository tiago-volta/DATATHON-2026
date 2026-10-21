'use client'

import { useCallback, useState } from 'react'
import Link from 'next/link'
import { Icono } from '@/components/Icono'
import { BotonLeerEnVoz } from '@/components/BotonLeerEnVoz'
import { CheckInConfortEnsaya } from '@/components/ensaya/CheckInConfortEnsaya'
import { AvisoInsignia } from '@/components/insignias/AvisoInsignia'
import { PanelInsignias } from '@/components/insignias/PanelInsignias'
import { Pictograma } from '@/components/Pictograma'
import { PanelDiasPractica } from '@/components/practica/PanelDiasPractica'
import { useConfianza } from '@/hooks/useConfianza'
import { useInsigniasUtiles } from '@/hooks/useInsigniasUtiles'
import { usePractica } from '@/hooks/usePractica'
import { MEDALLA_NIVEL_ENSAYA } from '@/lib/insignias'
import { nivelSensorialConservado } from '@/lib/sala-previa/progreso'
import type { ConfortCheckIn } from '@/lib/sala-previa/tipos'

/** Pictogramas ARASAAC (CC BY-NC-SA, Sergio Palao / Gobierno de Aragón). */
function urlArasaac(id: number) {
  return `https://static.arasaac.org/pictograms/${id}/${id}_500.png`
}

interface PictoRef {
  id: number
  keyword: string
}

interface PreguntaItem {
  texto: string
  pictogramas: PictoRef[]
  ayuda?: {
    explicacion: string
    ejemplos: string[]
  }
}

const NIVELES: {
  id: number
  nombre: string
  descripcion: string
  pictograma: PictoRef
  preguntas: PreguntaItem[]
}[] = [
  {
    id: 1,
    nombre: 'Preguntas claras',
    descripcion: 'Preguntas sencillas como las que te hará el juez al principio.',
    pictograma: { id: 9847, keyword: 'preguntar' },
    preguntas: [
      {
        texto: '¿Cómo te llamas?',
        pictogramas: [
          { id: 27357, keyword: 'nombre' },
          { id: 6517, keyword: 'hablar' },
        ],
      },
      {
        texto: '¿Dónde vives?',
        pictogramas: [
          { id: 6964, keyword: 'casa' },
        ],
      },
      {
        texto: '¿A qué te dedicas?',
        pictogramas: [
          { id: 16087, keyword: 'trabajo' },
        ],
      },
      {
        texto: '¿Conoces a la persona de la que hablamos?',
        pictogramas: [
          { id: 34560, keyword: 'persona' },
          { id: 7117, keyword: 'gente' },
        ],
      },
    ],
  },
  {
    id: 2,
    nombre: 'Preguntas de los abogados',
    descripcion: 'Preguntas más concretas sobre lo que pasó.',
    pictograma: { id: 11291, keyword: 'juez' },
    preguntas: [
      {
        texto: '¿Qué día ocurrieron los hechos?',
        pictogramas: [
          { id: 32488, keyword: 'calendario' },
        ],
      },
      {
        texto: '¿Dónde estabas tú en ese momento?',
        pictogramas: [
          { id: 6964, keyword: 'lugar' },
          { id: 34560, keyword: 'tú' },
        ],
      },
      {
        texto: '¿Qué viste exactamente?',
        pictogramas: [
          { id: 6564, keyword: 'ver' },
        ],
      },
      {
        texto: '¿Había alguien más contigo?',
        pictogramas: [
          { id: 7117, keyword: 'gente' },
          { id: 34560, keyword: 'persona' },
        ],
      },
    ],
  },
  {
    id: 3,
    nombre: 'Preguntas difíciles',
    descripcion: 'Preguntas que pueden confundir. Aprende a pedir que te las repitan.',
    pictograma: { id: 11697, keyword: 'no entender' },
    preguntas: [
      {
        texto: '¿No es cierto que usted no vio bien lo que pasó?',
        pictogramas: [
          { id: 11697, keyword: 'no entender' },
          { id: 6564, keyword: 'ver' },
        ],
        ayuda: {
          explicacion:
            'Tiene una doble negación ("no es cierto... que no vio"). Está hecha para confundirte.',
          ejemplos: [
            '"Perdone, no entiendo la pregunta con dos negaciones. ¿Me pregunta si vi lo que pasó?"',
            '"Sí vi lo que pasó desde donde yo estaba."',
          ],
        },
      },
      {
        texto: '¿Cómo puede estar seguro si estaba lejos y había poca luz?',
        pictogramas: [
          { id: 30385, keyword: 'lejos' },
          { id: 8619, keyword: 'luz' },
          { id: 6564, keyword: 'ver' },
        ],
        ayuda: {
          explicacion:
            'Junta varias cosas a la vez (distancia y luz) y pone en duda tu palabra.',
          ejemplos: [
            '"¿Puede hacerme una pregunta cada vez, por favor?"',
            '"Había una farola encendida y pude verlo con claridad."',
          ],
        },
      },
      {
        texto: '¿Por qué debería creerle a usted y no a la otra persona?',
        pictogramas: [
          { id: 8715, keyword: 'verdad' },
          { id: 6517, keyword: 'hablar' },
          { id: 34560, keyword: 'persona' },
        ],
        ayuda: {
          explicacion:
            'Es una pregunta intimidante. Tú no tienes que explicar lo que dice otra persona, solo lo que tú sabes.',
          ejemplos: [
            '"Yo solo puedo contar lo que vi y escuché."',
            '"Necesito un momento para responder con calma, por favor."',
          ],
        },
      },
    ],
  },
]

const PICTOS_INTRO: PictoRef[] = [
  { id: 6517, keyword: 'hablar' },
  { id: 6572, keyword: 'oír' },
  { id: 9847, keyword: 'preguntar' },
  { id: 2380, keyword: 'escribir' },
]

const PICTOS_AYUDA: PictoRef[] = [
  { id: 11697, keyword: 'no entender' },
  { id: 36109, keyword: 'pausa' },
  { id: 32826, keyword: 'calma' },
]

export default function PaginaEnsaya() {
  const [nivelActual, setNivelActual] = useState(0)
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuesta, setRespuesta] = useState('')
  const [mostrarAyuda, setMostrarAyuda] = useState(false)
  const [iniciado, setIniciado] = useState(false)
  const [completado, setCompletado] = useState(false)
  /** Nivel de Ensaya acabado: muestra CTA a Sala Previa antes de seguir. */
  const [nivelAcabado, setNivelAcabado] = useState<number | null>(null)
  /** Check-in de confort tras completar un bloque (antes de CTAs). */
  const [checkInPendiente, setCheckInPendiente] = useState(false)
  const [preguntasRespondidas, setPreguntasRespondidas] = useState(0)
  const {
    conseguidas: insigniasUtiles,
    aviso: avisoInsignia,
    desbloquear,
    descartarAviso,
  } = useInsigniasUtiles()
  const { registrar: registrarConfianza } = useConfianza()
  const {
    total: totalDiasPractica,
    estaSemana: diasPracticaSemana,
    semana: semanaPractica,
    bienvenida: bienvenidaPractica,
    registrar: registrarDiaPractica,
    descartarBienvenida: descartarBienvenidaPractica,
  } = usePractica()

  const nivel = NIVELES[nivelActual]
  const itemPregunta = nivel?.preguntas[preguntaActual]
  const esPrimera = nivelActual === 0 && preguntaActual === 0
  const esUltima =
    nivelActual === NIVELES.length - 1 &&
    preguntaActual === nivel.preguntas.length - 1

  /** Enlace a Sala Previa con el nivel sensorial que ya tenga la persona (nunca al alza). */
  const enlaceSalaPrevia = () => {
    const nivelSala = nivelSensorialConservado()
    return `/sala-previa?desde=ensaya&nivel=${nivelSala}`
  }

  const seguirTrasNivel = () => {
    if (nivelAcabado === null) return
    const idx = NIVELES.findIndex((n) => n.id === nivelAcabado)
    if (idx < 0 || idx >= NIVELES.length - 1) {
      setNivelAcabado(null)
      setCompletado(true)
      return
    }
    setNivelActual(idx + 1)
    setPreguntaActual(0)
    setNivelAcabado(null)
  }

  /** Medalla del bloque + compat `ensaye-1-nivel` (toast = medalla del nivel). */
  const desbloquearMedallasBloque = useCallback(
    (idNivel: number) => {
      if (idNivel !== 1 && idNivel !== 2 && idNivel !== 3) return
      // Legacy sin toast: evita doble aviso/sonido.
      desbloquear('ensaye-1-nivel', { silencioso: true })
      desbloquear(MEDALLA_NIVEL_ENSAYA[idNivel])
    },
    [desbloquear]
  )

  const cerrarCheckIn = useCallback(() => {
    setCheckInPendiente(false)
    // Si era el último nivel, tras el check-in mostramos el resumen final.
    if (nivelAcabado === NIVELES[NIVELES.length - 1]?.id) {
      setCompletado(true)
    }
  }, [nivelAcabado])

  const alResponderCheckIn = useCallback(
    (confort: ConfortCheckIn) => {
      if (confort === 'bien') {
        desbloquear('ensaye-con-calma')
      }
      cerrarCheckIn()
    },
    [cerrarCheckIn, desbloquear]
  )

  const siguientePregunta = () => {
    if (respuesta.trim().length > 0) {
      setPreguntasRespondidas((prev) => prev + 1)
    }
    // Avanzar cuenta como práctica del día (compartida con Sala Previa).
    registrarDiaPractica()
    setRespuesta('')
    setMostrarAyuda(false)

    if (preguntaActual < nivel.preguntas.length - 1) {
      setPreguntaActual((prev) => prev + 1)
    } else {
      // Terminaste el bloque → medallas + check-in (antes de CTAs).
      desbloquearMedallasBloque(nivel.id)
      registrarConfianza('ensaya-nivel', nivel.id)
      setNivelAcabado(nivel.id)
      setCheckInPendiente(true)
    }
  }

  const preguntaAnterior = () => {
    setRespuesta('')
    setMostrarAyuda(false)

    if (preguntaActual > 0) {
      setPreguntaActual((prev) => prev - 1)
    } else if (nivelActual > 0) {
      const nivelPrevio = NIVELES[nivelActual - 1]
      setNivelActual((prev) => prev - 1)
      setPreguntaActual(nivelPrevio.preguntas.length - 1)
    }
  }

  const reiniciar = () => {
    setNivelActual(0)
    setPreguntaActual(0)
    setRespuesta('')
    setMostrarAyuda(false)
    setCompletado(false)
    setNivelAcabado(null)
    setCheckInPendiente(false)
    setPreguntasRespondidas(0)
    setIniciado(true)
  }

  const nivelAcabadoMeta =
    nivelAcabado !== null ? NIVELES.find((n) => n.id === nivelAcabado) : null
  const hayMasNiveles =
    nivelAcabado !== null &&
    NIVELES.findIndex((n) => n.id === nivelAcabado) < NIVELES.length - 1

  return (
    <>
      <main id="contenido-principal" className="page-shell">
        <nav aria-label="Volver">
          <Link href="/" className="link-atras">
            <Icono nombre="←" />
            Volver al inicio
          </Link>
        </nav>

        {!iniciado ? (
          <section>
            <h1 className="titulo-pagina max-w-[16ch]">
              Ensaya tu declaración
            </h1>
            <p className="entradilla max-w-xl">
              Practica responder preguntas como las que te harán en el juzgado.
              Hay tres niveles, de más fácil a más difícil.
            </p>

            <div
              className="flex flex-wrap gap-4 justify-center mb-8 p-4 rounded-tarjeta bg-white border border-court-200"
              aria-label="Pictogramas: hablar, oír, preguntar, escribir"
            >
              {PICTOS_INTRO.map((p) => (
                <Pictograma
                  key={p.id}
                  url={urlArasaac(p.id)}
                  keyword={p.keyword}
                  size="md"
                />
              ))}
            </div>
            <p className="text-sm text-court-600 mb-8 text-center max-w-xl mx-auto">
              Cada pregunta lleva pictogramas para entenderla mejor si lees con
              apoyos visuales o si usas lengua de signos junto al texto.
            </p>

            <div className="grid gap-4 mb-8 text-left">
              {NIVELES.map((n, i) => (
                <div key={n.id} className="card flex items-start gap-4">
                  <span className="paso-indicador shrink-0" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-court-800">{n.nombre}</h2>
                        <p className="text-court-600">{n.descripcion}</p>
                      </div>
                      <Pictograma
                        url={urlArasaac(n.pictograma.id)}
                        keyword={n.pictograma.keyword}
                        size="sm"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIniciado(true)}
              className="btn-primary text-xl px-8"
            >
              Empezar a practicar
            </button>

            <p className="text-court-700 mt-6">
              Puedes parar cuando quieras. No hay respuestas buenas ni malas.
            </p>

            <div className="mt-10 max-w-md space-y-4">
              <PanelDiasPractica
                semana={semanaPractica}
                total={totalDiasPractica}
                estaSemana={diasPracticaSemana}
                bienvenida={bienvenidaPractica}
                onDescartarBienvenida={descartarBienvenidaPractica}
              />
            </div>

            <p className="text-xs text-court-700 mt-8">
              Pictogramas:{' '}
              <a
                href="https://arasaac.org"
                className="underline underline-offset-2 hover:text-court-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                ARASAAC
              </a>
              , Sergio Palao, Gobierno de Aragón. Licencia CC BY-NC-SA.
            </p>
          </section>
        ) : nivelAcabado !== null &&
          !completado &&
          !checkInPendiente &&
          nivelAcabadoMeta ? (
          <section className="card-destacada" aria-live="polite">
            <h1 className="text-3xl font-bold text-court-800 mb-3">
              Has terminado el nivel
            </h1>
            <p className="text-lg text-court-700 mb-6">
              Completaste «{nivelAcabadoMeta.nombre}». Puedes seguir ensayando o
              probar la sala del juzgado con calma, en el nivel sensorial que ya
              tengas.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Link
                href={enlaceSalaPrevia()}
                className="btn-primary text-center flex-1"
              >
                Probar la sala con calma
              </Link>
              {hayMasNiveles && (
                <button
                  type="button"
                  onClick={seguirTrasNivel}
                  className="btn-secondary min-h-[44px]"
                >
                  Seguir ensayando
                </button>
              )}
            </div>

            <p className="text-court-600 text-sm">
              La sala no sube el estímulo por ti. Empiezas donde lo dejaste.
            </p>
          </section>
        ) : checkInPendiente && nivelAcabadoMeta ? (
          <section className="card-destacada" aria-live="polite">
            <h1 className="text-3xl font-bold text-court-800 mb-3">
              Has terminado el nivel
            </h1>
            <p className="text-lg text-court-700 mb-2">
              Completaste «{nivelAcabadoMeta.nombre}».
            </p>
            <p className="text-court-600 text-sm">
              Antes de seguir, cuéntanos cómo te sientes. No hay respuesta
              correcta.
            </p>
          </section>
        ) : completado ? (
          <section className="card-destacada" aria-live="polite">
            <h1 className="text-3xl font-bold text-court-800 mb-3">
              Has terminado el ensayo
            </h1>
            <p className="text-lg text-court-700 mb-4">
              Has recorrido los 3 niveles de preguntas
              {preguntasRespondidas > 0
                ? ` y has escrito ${preguntasRespondidas} ${preguntasRespondidas === 1 ? 'respuesta' : 'respuestas'}.`
                : '.'}
            </p>
            <div className="bg-calma-sage rounded-lg p-4 mb-6 text-court-800 space-y-2">
              <p className="font-bold">Recuerda para el día del juzgado:</p>
              <ul className="list-disc pl-5 space-y-1 text-court-700">
                <li>Si no entiendes una pregunta, tienes derecho a pedir que la repitan con palabras sencillas.</li>
                <li>Si no recuerdas un dato exacto, puedes decir: &ldquo;No lo recuerdo con seguridad&rdquo;.</li>
                <li>Puedes pedir una pausa si necesitas tranquilizarte.</li>
              </ul>
            </div>

            <div className="flex flex-col gap-3 mb-4">
              <Link
                href={enlaceSalaPrevia()}
                className="btn-primary text-center"
              >
                Probar la sala con calma
              </Link>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/pasaporte?ajustes=preguntas-claras,mas-tiempo,pausas"
                  className="btn-secondary text-center flex-1"
                >
                  Añadir estos ajustes a mi Pasaporte
                </Link>
                <button
                  type="button"
                  onClick={reiniciar}
                  className="btn-ghost"
                >
                  Practicar otra vez
                </button>
              </div>
            </div>

            <p className="text-court-600 text-sm mb-6">
              Si pruebas la sala, entras en el nivel sensorial que ya tengas. No
              subimos nada por ti.
            </p>

            <div className="mt-8 max-w-md space-y-4">
              <PanelDiasPractica
                semana={semanaPractica}
                total={totalDiasPractica}
                estaSemana={diasPracticaSemana}
                bienvenida={bienvenidaPractica}
                onDescartarBienvenida={descartarBienvenidaPractica}
              />
            </div>
          </section>
        ) : (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-court-700">Nivel {nivelActual + 1} de 3</p>
                <h1 className="text-2xl font-bold text-court-800">{nivel.nombre}</h1>
              </div>
              <span className="etiqueta-info" aria-live="polite">
                Pregunta {preguntaActual + 1} de {nivel.preguntas.length}
              </span>
            </div>

            <div
              className="w-full bg-court-100 rounded-full h-2 mb-8 overflow-hidden"
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={nivel.preguntas.length}
              aria-valuenow={preguntaActual + 1}
              aria-label="Avance de las preguntas"
            >
              <div
                className="bg-court-600 h-2 rounded-full origin-left"
                style={{
                  width: '100%',
                  transform: `scaleX(${(preguntaActual + 1) / nivel.preguntas.length})`,
                  transition: 'transform 200ms cubic-bezier(0.23, 1, 0.32, 1)',
                }}
              />
            </div>

            <div className="card-destacada mb-6">
              <div className="flex justify-between items-start mb-4 gap-3">
                <p className="text-sm text-court-700">Te preguntan:</p>
                <BotonLeerEnVoz texto={itemPregunta.texto} etiqueta="Escuchar" />
              </div>

              <div
                className="flex flex-wrap gap-4 justify-center mb-5"
                aria-label="Pictogramas de apoyo a la pregunta"
              >
                {itemPregunta.pictogramas.map((p) => (
                  <Pictograma
                    key={`${p.id}-${p.keyword}`}
                    url={urlArasaac(p.id)}
                    keyword={p.keyword}
                    size="lg"
                  />
                ))}
              </div>

              <p className="text-2xl text-court-800 font-medium text-center">
                {itemPregunta.texto}
              </p>
            </div>

            {itemPregunta.ayuda && (
              <button
                type="button"
                onClick={() => setMostrarAyuda(!mostrarAyuda)}
                aria-expanded={mostrarAyuda}
                className="btn-ghost mb-4 w-full"
              >
                {mostrarAyuda ? 'Ocultar ayuda' : '¿Esta pregunta te confunde? Ver ayuda'}
              </button>
            )}

            {mostrarAyuda && itemPregunta.ayuda && (
              <div className="bg-accent-alert/10 border-2 border-accent-alert rounded-tarjeta p-6 mb-6" aria-live="polite">
                <div className="flex flex-wrap gap-3 justify-center mb-4" aria-hidden="true">
                  {PICTOS_AYUDA.map((p) => (
                    <Pictograma
                      key={p.id}
                      url={urlArasaac(p.id)}
                      keyword={p.keyword}
                      size="sm"
                    />
                  ))}
                </div>
                <h2 className="font-bold text-court-800 mb-2">Esta pregunta es confusa</h2>
                <p className="text-court-700 mb-4">
                  {itemPregunta.ayuda.explicacion}{' '}
                  <strong>No tienes que responder con prisa.</strong> Puedes decir:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-court-700">
                  {itemPregunta.ayuda.ejemplos.map((ej) => (
                    <li key={ej}>{ej}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="card mb-6">
              <div className="flex items-center justify-between gap-3 mb-3">
                <label htmlFor="respuesta" className="block font-bold text-court-800">
                  Tu respuesta (opcional)
                </label>
                <div className="shrink-0" aria-hidden="true">
                  <Pictograma
                    url={urlArasaac(9031)}
                    keyword="responder"
                    size="sm"
                  />
                </div>
              </div>
              <textarea
                id="respuesta"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value.slice(0, 500))}
                maxLength={500}
                className="textarea-accesible"
                placeholder="Escribe lo que responderías…"
                rows={4}
                aria-describedby="ayuda-respuesta"
              />
              <div className="flex justify-between items-center text-sm text-court-700 mt-2" id="ayuda-respuesta">
                <span>Esto es solo práctica. Nadie más ve lo que escribes.</span>
                <span aria-hidden="true">{respuesta.length}/500</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {!esPrimera && (
                <button
                  type="button"
                  onClick={preguntaAnterior}
                  className="btn-secondary"
                >
                  <Icono nombre="←" />
                  Anterior
                </button>
              )}
              <button
                type="button"
                onClick={siguientePregunta}
                className="btn-primary flex-1"
              >
                {preguntaActual < nivel.preguntas.length - 1
                  ? 'Siguiente pregunta'
                  : !esUltima
                    ? 'Siguiente nivel'
                    : 'Terminar ensayo'}
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setIniciado(false)
                setCompletado(false)
              }}
              className="btn-ghost mt-4 w-full"
            >
              Salir del ensayo
            </button>

            <p className="text-xs text-court-700 mt-8 text-center">
              Pictogramas:{' '}
              <a
                href="https://arasaac.org"
                className="underline underline-offset-2 hover:text-court-700"
                target="_blank"
                rel="noopener noreferrer"
              >
                ARASAAC
              </a>
              , Sergio Palao, Gobierno de Aragón. Licencia CC BY-NC-SA.
            </p>
          </section>
        )}

        <div className="mt-12 max-w-2xl mx-auto">
          <PanelInsignias conseguidas={insigniasUtiles} apartado="ensaya" />
        </div>
      </main>

      {checkInPendiente && nivelAcabadoMeta && (
        <CheckInConfortEnsaya
          nivelNombre={nivelAcabadoMeta.nombre}
          onContinuar={alResponderCheckIn}
          onCerrar={cerrarCheckIn}
        />
      )}

      <AvisoInsignia insignia={avisoInsignia} onDescartar={descartarAviso} />
    </>
  )
}
