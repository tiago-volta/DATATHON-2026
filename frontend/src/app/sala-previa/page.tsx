'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Cabecera } from '@/components/Cabecera'
import { BotonLeerEnVoz } from '@/components/BotonLeerEnVoz'
import { AvisoInsignia } from '@/components/insignias/AvisoInsignia'
import { PanelInsignias } from '@/components/insignias/PanelInsignias'
import { BotonCalma } from '@/components/sala-previa/BotonCalma'
import { CheckInConfort } from '@/components/sala-previa/CheckInConfort'
import { ControlesEstimulo } from '@/components/sala-previa/ControlesEstimulo'
import { IntroSalaPrevia } from '@/components/sala-previa/IntroSalaPrevia'
import { MapaNiveles } from '@/components/sala-previa/MapaNiveles'
import { MedidorConfianza } from '@/components/sala-previa/MedidorConfianza'
import { PanelProgreso } from '@/components/sala-previa/PanelProgreso'
import { RecorridoEscenas } from '@/components/sala-previa/RecorridoEscenas'
import { useConfianza } from '@/hooks/useConfianza'
import { useInsigniasUtiles } from '@/hooks/useInsigniasUtiles'
import { usePractica } from '@/hooks/usePractica'
import { PanelDiasPractica } from '@/components/practica/PanelDiasPractica'
import { MotorAudioSala, CREDITO_AUDIO } from '@/lib/sala-previa/audio'
import { AJUSTES_DISPONIBLES } from '@/lib/contenido'
import { escenaPorIndice } from '@/lib/sala-previa/escenas'
import {
  ESTIMULOS_VACIOS,
  NIVELES,
  ajustesDesdeMolestias,
  bajarEstimulosAComodo,
} from '@/lib/sala-previa/niveles'
import {
  anadirMolestia,
  cargarProgreso,
  guardarProgreso,
  introYaVista,
  marcarIntroVista,
  marcarNivel,
  registrarPractica,
} from '@/lib/sala-previa/progreso'
import type { ConfortCheckIn, IdEstimulo, ProgresoSala, ValoresEstimulo } from '@/lib/sala-previa/tipos'

type Fase = 'intro' | 'simulacion' | 'checkin'

const PROGRESO_INICIAL: ProgresoSala = {
  nivelMaximo: 0,
  insignias: [],
  confianza: 20,
  racha: 0,
  ultimaPractica: null,
  molestias: [],
  sesionesCompletadas: 0,
}

export default function PaginaSalaPrevia() {
  const motorRef = useRef<MotorAudioSala | null>(null)
  const [fase, setFase] = useState<Fase>('intro')
  const [nivelActual, setNivelActual] = useState(0)
  const [escenaIndice, setEscenaIndice] = useState(0)
  const [valores, setValores] = useState<ValoresEstimulo>(ESTIMULOS_VACIOS)
  const [enCalma, setEnCalma] = useState(false)
  const [audioListo, setAudioListo] = useState(false)
  const [progreso, setProgreso] = useState<ProgresoSala>(PROGRESO_INICIAL)
  const [progresoListo, setProgresoListo] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [modoAudioguia, setModoAudioguia] = useState(false)
  /** Evita reaplicar el deep-link Ensaya → Sala Previa. */
  const deepLinkAplicado = useRef(false)
  const {
    conseguidas: insigniasUtiles,
    aviso: avisoInsignia,
    desbloquear,
    descartarAviso,
  } = useInsigniasUtiles()
  const {
    score: scoreConfianza,
    etiqueta: etiquetaConfianza,
    mensaje: mensajeConfianza,
    registrar: registrarConfianza,
    descartarMensaje: descartarMensajeConfianza,
  } = useConfianza()
  const {
    total: totalDiasPractica,
    estaSemana: diasPracticaSemana,
    semana: semanaPractica,
    bienvenida: bienvenidaPractica,
    registrar: registrarDiaPractica,
    descartarBienvenida: descartarBienvenidaPractica,
  } = usePractica()

  const nivel = NIVELES[nivelActual]
  const escena = escenaPorIndice(escenaIndice)

  useEffect(() => {
    setProgreso(cargarProgreso())
    setProgresoListo(true)
    motorRef.current = new MotorAudioSala()
    return () => {
      motorRef.current?.detener(false)
    }
  }, [])

  useEffect(() => {
    if (!progresoListo) return
    guardarProgreso(progreso)
  }, [progreso, progresoListo])

  const aplicarValores = useCallback((nuevos: ValoresEstimulo, segundos?: number) => {
    setValores(nuevos)
    motorRef.current?.actualizar(nuevos, segundos)
  }, [])

  /**
   * Deep-link desde Ensaya: conserva el nivel sensorial (nunca al alza),
   * salta la intro si ya se vio, y no registra práctica/confianza de nuevo.
   */
  useEffect(() => {
    if (!progresoListo || deepLinkAplicado.current) return
    if (typeof window === 'undefined') return

    const params = new URLSearchParams(window.location.search)
    if (params.get('desde') !== 'ensaya') return
    deepLinkAplicado.current = true

    const cargado = cargarProgreso()
    const maxIdx = NIVELES.length - 1
    const conservado = Math.min(maxIdx, Math.max(0, cargado.nivelMaximo))
    const rawUrl = Number.parseInt(params.get('nivel') ?? '', 10)
    // Solo aplica el de la URL si no supera el conservado (nunca subir solo).
    const destino = Number.isFinite(rawUrl)
      ? Math.min(conservado, Math.max(0, Math.trunc(rawUrl)))
      : conservado

    setProgreso(cargado)
    setNivelActual(destino)
    setEscenaIndice(0)
    setEnCalma(false)
    aplicarValores(NIVELES[destino]?.preset ?? ESTIMULOS_VACIOS)

    if (introYaVista()) {
      setFase('simulacion')
      setMensaje(
        destino === 0
          ? 'Sigues en nivel 0. La sala no sube el estímulo por ti.'
          : `Sigues en el nivel ${destino}. La sala no sube el estímulo por ti.`
      )
    }
    // Si la intro no se ha visto, se queda en fase intro (2.1).
  }, [progresoListo, aplicarValores])

  const irANivel = useCallback(
    (id: number, opts?: { checkin?: boolean }) => {
      const destino = NIVELES[id]
      if (!destino) return
      setNivelActual(id)
      setEnCalma(false)
      aplicarValores(destino.preset)
      setProgreso((p) => {
        const next = marcarNivel(p, id)
        // Nuevo máximo ≥ 1 = completaste al menos un nivel (más allá de la sala vacía).
        if (next.nivelMaximo > p.nivelMaximo && next.nivelMaximo >= 1) {
          queueMicrotask(() => desbloquear('ensaye-1-nivel'))
        }
        return next
      })
      // Confianza en paralelo: practicar un nivel suma una vez (nunca resta).
      queueMicrotask(() => registrarConfianza('nivel-probado', id))
      if (opts?.checkin) setFase('checkin')
    },
    [aplicarValores, desbloquear, registrarConfianza]
  )

  const empezarNivel0 = async () => {
    // El audio solo arranca aquí, tras el aviso de la intro.
    await motorRef.current?.iniciar()
    setAudioListo(true)
    setEnCalma(false)
    setFase('simulacion')
    marcarIntroVista()
    // Si venimos de Ensaya con un nivel conservado > 0, no forzar a 0.
    const destino = Math.min(
      NIVELES.length - 1,
      Math.max(0, nivelActual > 0 ? nivelActual : 0)
    )
    setNivelActual(destino)
    setEscenaIndice(0)
    aplicarValores(NIVELES[destino].preset)
    setProgreso((p) => registrarPractica(marcarNivel(p, destino)))
    registrarDiaPractica()
    registrarConfianza('nivel-probado', destino)
    setMensaje(
      destino === 0
        ? 'Nivel 0. Sala casi vacía. Subes solo si quieres.'
        : `Nivel ${destino}. Sigues donde lo dejaste. Subes solo si quieres.`
    )
  }

  /** Cambia de escena del juzgado sin tocar los estímulos elegidos. */
  const cambiarEscena = useCallback((indice: number) => {
    setEscenaIndice(indice)
  }, [])

  const volverAIntro = () => {
    motorRef.current?.detener(true)
    setAudioListo(false)
    setEnCalma(false)
    setValores(ESTIMULOS_VACIOS)
    setFase('intro')
    setMensaje(null)
  }

  const pausarCalma = () => {
    setEnCalma(true)
    motorRef.current?.volverACalma()
    setValores((v) => ({
      ruido: 0,
      luz: Math.min(v.luz, 12),
      gente: 0,
      eco: 0,
    }))
    desbloquear('primera-calma')
    setMensaje(
      fase === 'intro'
        ? 'Calma. Cuidarte está bien. Puedes empezar cuando quieras.'
        : 'Calma. Cuidarte está bien. Puedes seguir cuando quieras.'
    )
  }

  const reanudar = () => {
    setEnCalma(false)
    if (fase !== 'intro') {
      aplicarValores(NIVELES[nivelActual].preset)
    }
    setMensaje(null)
  }

  const cerrarCheckIn = useCallback(() => {
    setFase('simulacion')
  }, [])

  const onSlider = (id: IdEstimulo, valor: number) => {
    if (enCalma) setEnCalma(false)
    const limpio = Math.min(100, Math.max(0, Math.round(valor)))
    const siguientes = { ...valores, [id]: limpio }
    aplicarValores(siguientes)
  }

  const procesarMolestias = (molestias: IdEstimulo[]) => {
    setProgreso((p) => {
      let next = p
      for (const m of molestias) {
        next = anadirMolestia(next, m)
      }
      return next
    })
  }

  const trasCheckIn = (confort: ConfortCheckIn, molestias: IdEstimulo[]) => {
    procesarMolestias(molestias)
    if (confort === 'bien') {
      // Solo "bien" suma; regular/mal no restan. El aviso lo muestra MedidorConfianza.
      registrarConfianza('checkin-bien')
      setMensaje(null)
    } else if (confort === 'regular') {
      setMensaje('Está bien quedarse. No hay prisa.')
    } else {
      setMensaje('Parar también cuenta. Cuida tu espacio.')
    }
  }

  const bajarEstimulosMolestos = useCallback(
    (molestias: IdEstimulo[]) => {
      setEnCalma(false)
      const siguientes = bajarEstimulosAComodo(valores, molestias)
      aplicarValores(siguientes)
      setMensaje('Estímulos más bajos. Puedes seguir cuando quieras.')
    },
    [valores, aplicarValores]
  )

  const enlacePasaporte = useMemo(() => {
    const ids = ajustesDesdeMolestias(progreso.molestias)
    if (ids.length === 0) return '/pasaporte'
    return `/pasaporte?ajustes=${ids.join(',')}`
  }, [progreso.molestias])

  const descripcionAudioguia = useMemo(() => {
    const partes = [
      escena.audioguia,
      `Ruido: ${Math.round(valores.ruido)}. Luz: ${Math.round(valores.luz)}. Gente: ${Math.round(valores.gente)}. Eco: ${Math.round(valores.eco)}.`,
      enCalma ? 'Modo calma activo. Los estímulos están bajos.' : '',
    ]
    return partes.filter(Boolean).join(' ')
  }, [escena, valores, enCalma])

  return (
    <>
      <Cabecera />

      <main id="contenido-principal" className="max-w-5xl mx-auto px-4 py-8 pb-32">
        <nav className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center min-h-[44px] text-puente-700 hover:text-puente-900"
          >
            ← Volver al inicio
          </Link>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-puente-800 mb-2">
            Sala Previa
          </h1>
          <p className="text-lg text-puente-700 max-w-2xl">
            Recorre las fases del día en el juzgado: entrada, control, espera y
            sala de vistas. Empiezas en silencio. Subes estímulos solo cuando tú digas.
          </p>
        </header>

        {mensaje && fase === 'intro' && (
          <p
            className="mb-4 bg-accent-success/15 border border-accent-success rounded-lg p-3 text-puente-900 max-w-2xl"
            role="status"
            aria-live="polite"
          >
            {mensaje}
          </p>
        )}

        {fase === 'intro' && (
          <div className="space-y-6 max-w-2xl">
            <IntroSalaPrevia onEmpezar={empezarNivel0} />
            <PanelDiasPractica
              semana={semanaPractica}
              total={totalDiasPractica}
              estaSemana={diasPracticaSemana}
              bienvenida={bienvenidaPractica}
              onDescartarBienvenida={descartarBienvenidaPractica}
            />
          </div>
        )}

        {fase !== 'intro' && (
          <>
            <div className="flex flex-wrap gap-3 mb-6">
              <button
                type="button"
                className={`btn ${modoAudioguia ? 'btn-primary' : 'btn-secondary'}`}
                aria-pressed={modoAudioguia}
                onClick={() => setModoAudioguia((v) => !v)}
              >
                Modo audioguía
              </button>
              <button type="button" className="btn-ghost" onClick={volverAIntro}>
                Ver intro otra vez
              </button>
              {audioListo && (
                <span className="text-sm text-puente-700 self-center">
                  Audio activo. Usa los controles o la pausa.
                </span>
              )}
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <RecorridoEscenas
                  indice={escenaIndice}
                  onCambiar={cambiarEscena}
                  valores={valores}
                  enCalma={enCalma}
                />

                <div className="card">
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h2 className="font-bold text-puente-800">Audioguía</h2>
                    <BotonLeerEnVoz texto={descripcionAudioguia} etiqueta="Escuchar sala" />
                  </div>
                  <p className="text-puente-700">{escena.audioguia}</p>
                  {modoAudioguia && (
                    <p className="text-puente-700 mt-3 text-sm" aria-live="polite">
                      Ahora: ruido {Math.round(valores.ruido)}, luz {Math.round(valores.luz)},
                      gente {Math.round(valores.gente)}, eco {Math.round(valores.eco)}.
                    </p>
                  )}
                </div>

                <ControlesEstimulo
                  valores={valores}
                  onChange={onSlider}
                  deshabilitado={enCalma}
                />

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setFase('checkin')}
                  >
                    ¿Cómo me siento?
                  </button>
                  {nivelActual < NIVELES.length - 1 && (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => setFase('checkin')}
                    >
                      Quiero subir de nivel
                    </button>
                  )}
                  {nivelActual > 0 && (
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() => irANivel(nivelActual - 1)}
                    >
                      Bajar un nivel
                    </button>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <MapaNiveles
                  nivelActual={nivelActual}
                  nivelMaximo={progreso.nivelMaximo}
                  onSeleccionar={(id) => irANivel(id)}
                />
                <MedidorConfianza
                  score={scoreConfianza}
                  etiqueta={etiquetaConfianza}
                  mensaje={mensajeConfianza}
                  onDescartarMensaje={descartarMensajeConfianza}
                />
                <PanelInsignias conseguidas={insigniasUtiles} />
                <PanelProgreso
                  progreso={progreso}
                  mensaje={mensaje}
                  semana={semanaPractica}
                  totalDias={totalDiasPractica}
                  diasEstaSemana={diasPracticaSemana}
                  bienvenida={bienvenidaPractica}
                  onDescartarBienvenida={descartarBienvenidaPractica}
                />

                {progreso.molestias.length > 0 && (
                  <div className="card border-2 border-accent-success">
                    <h2 className="font-bold text-puente-800 mb-2">
                      Para tu Pasaporte
                    </h2>
                    <p className="text-puente-700 mb-3">
                      Marcaste estímulos que te molestan. Puedes pedir estos ajustes:
                    </p>
                    <ul className="space-y-2 mb-4">
                      {ajustesDesdeMolestias(progreso.molestias).map((id) => {
                        const ajuste = AJUSTES_DISPONIBLES.find((a) => a.id === id)
                        return (
                          <li key={id} className="flex gap-2 text-puente-700">
                            <span aria-hidden="true">✓</span>
                            <span>{ajuste?.nombre ?? id}</span>
                          </li>
                        )
                      })}
                    </ul>
                    <Link href={enlacePasaporte} className="btn-primary w-full">
                      Añadir a mi Pasaporte
                    </Link>
                  </div>
                )}
              </div>
            </div>

            <p className="text-sm text-puente-700 mt-8">{CREDITO_AUDIO}</p>
          </>
        )}
      </main>

      <BotonCalma enCalma={enCalma} onPausa={pausarCalma} onReanudar={reanudar} />
      <AvisoInsignia insignia={avisoInsignia} onDescartar={descartarAviso} />

      {fase === 'checkin' && (
        <CheckInConfort
          nivelNombre={nivel.nombre}
          valores={valores}
          puedeBajar={nivelActual > 0}
          puedeSubir={nivelActual < NIVELES.length - 1}
          onBajarEstimulos={bajarEstimulosMolestos}
          onCerrar={cerrarCheckIn}
          onContinuar={(confort, molestias) => {
            trasCheckIn(confort, molestias)
            setFase('simulacion')
            if (nivelActual < NIVELES.length - 1) {
              irANivel(nivelActual + 1)
            }
          }}
          onQuedarse={(confort, molestias) => {
            trasCheckIn(confort, molestias)
            setFase('simulacion')
          }}
          onBajarNivel={(confort, molestias) => {
            trasCheckIn(confort, molestias)
            setFase('simulacion')
            irANivel(Math.max(0, nivelActual - 1))
          }}
        />
      )}
    </>
  )
}
