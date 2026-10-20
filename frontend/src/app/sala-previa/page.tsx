'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Cabecera } from '@/components/Cabecera'
import { BotonLeerEnVoz } from '@/components/BotonLeerEnVoz'
import { BotonCalma } from '@/components/sala-previa/BotonCalma'
import { CheckInConfort } from '@/components/sala-previa/CheckInConfort'
import { ControlesEstimulo } from '@/components/sala-previa/ControlesEstimulo'
import { IntroSalaPrevia } from '@/components/sala-previa/IntroSalaPrevia'
import { MapaNiveles } from '@/components/sala-previa/MapaNiveles'
import { PanelProgreso } from '@/components/sala-previa/PanelProgreso'
import { RecorridoEscenas } from '@/components/sala-previa/RecorridoEscenas'
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
  marcarNivel,
  registrarPractica,
  sumarConfianza,
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

  const irANivel = useCallback(
    (id: number, opts?: { checkin?: boolean }) => {
      const destino = NIVELES[id]
      if (!destino) return
      setNivelActual(id)
      setEnCalma(false)
      aplicarValores(destino.preset)
      setProgreso((p) => marcarNivel(p, id))
      if (opts?.checkin) setFase('checkin')
    },
    [aplicarValores]
  )

  const empezarNivel0 = async () => {
    // El audio solo arranca aquí, tras el aviso de la intro.
    await motorRef.current?.iniciar()
    setAudioListo(true)
    setEnCalma(false)
    setFase('simulacion')
    setNivelActual(0)
    setEscenaIndice(0)
    aplicarValores(NIVELES[0].preset)
    setProgreso((p) => registrarPractica(marcarNivel(p, 0)))
    setMensaje('Nivel 0. Sala casi vacía. Subes solo si quieres.')
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
    setMensaje('Calma. Puedes seguir cuando quieras.')
  }

  const reanudar = () => {
    setEnCalma(false)
    aplicarValores(NIVELES[nivelActual].preset)
    setMensaje(null)
  }

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
      setProgreso((p) => sumarConfianza(p, 8))
      setMensaje('Bien. Vas a tu ritmo.')
    } else if (confort === 'regular') {
      setProgreso((p) => sumarConfianza(p, 3))
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

      <main id="contenido-principal" className="max-w-5xl mx-auto px-4 py-8 pb-28">
        <nav className="mb-6">
          <Link href="/" className="text-puente-600 hover:text-puente-800">
            ← Volver al inicio
          </Link>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl font-bold text-puente-800 mb-2">
            Sala Previa
          </h1>
          <p className="text-lg text-puente-600 max-w-2xl">
            Recorre las fases del día en el juzgado: entrada, control, espera y
            sala de vistas. Empiezas en silencio. Subes estímulos solo cuando tú digas.
          </p>
        </header>

        {fase === 'intro' && <IntroSalaPrevia onEmpezar={empezarNivel0} />}

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
                <span className="text-sm text-puente-500 self-center">
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
                    <p className="text-puente-600 mt-3 text-sm" aria-live="polite">
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
                <PanelProgreso progreso={progreso} mensaje={mensaje} />

                {progreso.molestias.length > 0 && (
                  <div className="card border-2 border-accent-success">
                    <h2 className="font-bold text-puente-800 mb-2">
                      Para tu Pasaporte
                    </h2>
                    <p className="text-puente-600 mb-3">
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

            <p className="text-sm text-puente-500 mt-8">{CREDITO_AUDIO}</p>
          </>
        )}
      </main>

      {fase !== 'intro' && (
        <BotonCalma enCalma={enCalma} onPausa={pausarCalma} onReanudar={reanudar} />
      )}

      {fase === 'checkin' && (
        <CheckInConfort
          nivelNombre={nivel.nombre}
          valores={valores}
          puedeBajar={nivelActual > 0}
          puedeSubir={nivelActual < NIVELES.length - 1}
          onBajarEstimulos={bajarEstimulosMolestos}
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
