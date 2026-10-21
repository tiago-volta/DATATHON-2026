'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { Icono } from '@/components/Icono'
import { AvisoInsignia } from '@/components/insignias/AvisoInsignia'
import { PanelInsignias } from '@/components/insignias/PanelInsignias'
import { BotonCalma } from '@/components/sala-previa/BotonCalma'
import { CheckInConfort } from '@/components/sala-previa/CheckInConfort'
import { IntroSalaPrevia } from '@/components/sala-previa/IntroSalaPrevia'
import { MapaNiveles } from '@/components/sala-previa/MapaNiveles'
import { MedidorConfianza } from '@/components/sala-previa/MedidorConfianza'
import { PanelLoQueTeAyuda } from '@/components/sala-previa/PanelLoQueTeAyuda'
import { PanelProgreso } from '@/components/sala-previa/PanelProgreso'
import { RecorridoEscenas } from '@/components/sala-previa/RecorridoEscenas'
import { useConfianza } from '@/hooks/useConfianza'
import { useInsigniasUtiles } from '@/hooks/useInsigniasUtiles'
import { usePractica } from '@/hooks/usePractica'
import { PanelDiasPractica } from '@/components/practica/PanelDiasPractica'
import { MotorAudioSala, CREDITO_AUDIO } from '@/lib/sala-previa/audio'
import { generarAgendaEventos, type EventoSala } from '@/lib/sala-previa/eventos'
import { distraccionDeAgenda, type TipoDistraccion } from '@/lib/sala-previa/distracciones'
import { NarradorAhoraDespues } from '@/components/sala-previa/NarradorAhoraDespues'
import { HerramientasSensoriales } from '@/components/sala-previa/HerramientasSensoriales'
import type { IdHerramienta } from '@/lib/perfil/tipos'
import { cargarPerfil, guardarPerfil, ROLES_DISPONIBLES, type RolPerfil } from '@/lib/perfil/perfil'
import {
  ESTIMULOS_VACIOS,
  NIVELES,
  VALORES_AMBIENTE_SALA,
  bajarEstimulosAComodo,
} from '@/lib/sala-previa/niveles'
import {
  cargarLoQueTeAyuda,
  derivarDesdeMolestiasProgreso,
  guardarLoQueTeAyuda,
  registrarCalmaLoQueTeAyuda,
  registrarCheckInLoQueTeAyuda,
  type LoQueTeAyuda,
} from '@/lib/sala-previa/loQueTeAyuda'
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
  const [rolUsuario, setRolUsuario] = useState<RolPerfil>('testigo')
  const [herramientasActivas, setHerramientasActivas] = useState<IdHerramienta[]>([])
  const [valores, setValores] = useState<ValoresEstimulo>(ESTIMULOS_VACIOS)
  const [enCalma, setEnCalma] = useState(false)
  const [audioListo, setAudioListo] = useState(false)
  const [progreso, setProgreso] = useState<ProgresoSala>(PROGRESO_INICIAL)
  const [progresoListo, setProgresoListo] = useState(false)
  const [loQueTeAyuda, setLoQueTeAyuda] = useState<LoQueTeAyuda>({
    molestias: [],
    ayudas: [],
    usoCalma: false,
    checkIns: 0,
  })
  const [mensaje, setMensaje] = useState<string | null>(null)
  /** Evita reaplicar el deep-link Ensaya → Sala Previa. */
  const deepLinkAplicado = useRef(false)
  const {
    conseguidas: insigniasUtiles,
    aviso: avisoInsignia,
    desbloquear,
    descartarAviso,
  } = useInsigniasUtiles({ enCalma })
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

  useEffect(() => {
    const p = cargarPerfil()
    if (p?.rol) {
      setRolUsuario(p.rol)
    }
  }, [])

  const agenda = useMemo(() => generarAgendaEventos(cargarPerfil()), [])

  const [eventoSala, setEventoSala] = useState<{ id: number; tipo: TipoDistraccion } | null>(
    null
  )

  const alDispararEvento = useCallback((ev: EventoSala) => {
    const visual = distraccionDeAgenda(ev.id, ev.tipo)
    if (visual) setEventoSala((prev) => ({ id: (prev?.id ?? 0) + 1, tipo: visual }))
    if (ev.tipo === 'gente') {
      motorRef.current?.reproducirTosMurmullo()
    } else if (ev.tipo === 'puerta') {
      motorRef.current?.reproducirPuerta()
    } else if (ev.tipo === 'movil') {
      motorRef.current?.reproducirTimbreMovil()
    } else if (ev.tipo === 'nombre-en-alto') {
      const nom = cargarPerfil()?.nombre || 'Luis García'
      motorRef.current?.reproducirNombreEnAlto(nom)
    }
  }, [])

  const toggleHerramienta = useCallback((id: IdHerramienta) => {
    setHerramientasActivas((prev) => {
      const existe = prev.includes(id)
      const next = existe ? prev.filter((h) => h !== id) : [...prev, id]
      // Aplicar modulación sonora o visual
      if (id === 'cascos') {
        const factor = existe ? 1 : 0.5
        motorRef.current?.actualizar({
          ...valores,
          ruido: Math.round(valores.ruido * factor),
        })
      }
      return next
    })
  }, [valores])

  const nivel = NIVELES[nivelActual]

  useEffect(() => {
    const cargado = cargarProgreso()
    setProgreso(cargado)
    let resumen = cargarLoQueTeAyuda()
    // Migración suave: si hay molestias antiguas y aún no hay resumen, derívalo.
    if (
      resumen.molestias.length === 0 &&
      resumen.ayudas.length === 0 &&
      cargado.molestias.length > 0
    ) {
      const derivado = derivarDesdeMolestiasProgreso(cargado.molestias)
      if (derivado) resumen = derivado
    }
    setLoQueTeAyuda(resumen)
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

  // Medallas de nivel: sincroniza si ya había progreso guardado (idempotente).
  useEffect(() => {
    if (!progresoListo) return
    if (progreso.nivelMaximo >= 1) desbloquear('ensaye-1-nivel')
    if (progreso.nivelMaximo >= 3) desbloquear('casi-listo')
    if (progreso.nivelMaximo >= 5) desbloquear('testigo-en-forma')
  }, [progresoListo, progreso.nivelMaximo, desbloquear])

  useEffect(() => {
    if (!progresoListo) return
    guardarLoQueTeAyuda(loQueTeAyuda)
  }, [loQueTeAyuda, progresoListo])

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
    if (params.get('ensayo') === '1' || params.get('modo') === 'ensayo') {
      deepLinkAplicado.current = true
      setEscenaIndice(3)
      setFase('simulacion')
      return
    }
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
    aplicarValores(VALORES_AMBIENTE_SALA)

    if (introYaVista()) {
      setFase('simulacion')
      setMensaje(
        destino === 0
          ? 'Sigues en nivel 0. El ambiente es estable; tú eliges las distracciones.'
          : `Sigues en el nivel ${destino}. El ambiente es estable; tú eliges las distracciones.`
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
      aplicarValores(VALORES_AMBIENTE_SALA)
      setProgreso((p) => {
        const next = marcarNivel(p, id)
        const subio = next.nivelMaximo > p.nivelMaximo
        // Nuevo máximo ≥ 1 = completaste al menos un nivel (más allá de la sala vacía).
        if (subio && next.nivelMaximo >= 1) {
          queueMicrotask(() => desbloquear('ensaye-1-nivel'))
        }
        // Refuerzo positivo por hitos de nivel (localStorage compatible).
        if (subio && next.nivelMaximo >= 3 && p.nivelMaximo < 3) {
          queueMicrotask(() => desbloquear('casi-listo'))
        }
        if (subio && next.nivelMaximo >= 5 && p.nivelMaximo < 5) {
          queueMicrotask(() => desbloquear('testigo-en-forma'))
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
    aplicarValores(VALORES_AMBIENTE_SALA)
    setProgreso((p) => registrarPractica(marcarNivel(p, destino)))
    registrarDiaPractica()
    registrarConfianza('nivel-probado', destino)
    setMensaje(
      destino === 0
        ? 'Nivel 0. Ambiente estable. Activa Pocas o Muchas distracciones si quieres practicar interrupciones.'
        : `Nivel ${destino}. Ambiente estable. Activa Pocas o Muchas distracciones si quieres practicar interrupciones.`
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
    }))
    desbloquear('primera-calma')
    setLoQueTeAyuda((d) => registrarCalmaLoQueTeAyuda(d))
    setMensaje(
      fase === 'intro'
        ? 'Calma. Cuidarte está bien. Puedes empezar cuando quieras.'
        : 'Calma. Cuidarte está bien. Puedes seguir cuando quieras.'
    )
  }

  const reanudar = () => {
    setEnCalma(false)
    if (fase !== 'intro') {
      aplicarValores(VALORES_AMBIENTE_SALA)
    }
    setMensaje(null)
  }

  const cerrarCheckIn = useCallback(() => {
    setFase('simulacion')
  }, [])

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
    setLoQueTeAyuda((d) =>
      registrarCheckInLoQueTeAyuda(d, confort, molestias, valores)
    )
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

  return (
    <>
      <main id="contenido-principal" className="page-shell-wide pb-32">
        <nav aria-label="Volver">
          <Link href="/" className="link-atras">
            <Icono nombre="←" />
            Volver al inicio
          </Link>
        </nav>

        <div className="min-w-0">
          <header className="mb-8">
            <h1 className="titulo-pagina mb-2">
              Sala Previa
            </h1>
            <p className="entradilla max-w-2xl mb-0">
              Recorre las fases del día en el juzgado: entrada, control, espera y
              sala de vistas. El ambiente es estable; practicas interrupciones reales
              (móvil, tos, puerta, martillo…) cuando tú quieras.
            </p>
          </header>

            {mensaje && (
              <p
                className="mb-4 bg-accent-success/15 border border-accent-success rounded-lg p-3 text-court-900 max-w-2xl"
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
                {progresoListo && <PanelLoQueTeAyuda dato={loQueTeAyuda} />}
              </div>
            )}

            {fase !== 'intro' && (
              <>
                <div className="flex flex-wrap gap-3 mb-6 items-center">
                  <button type="button" className="btn-ghost" onClick={volverAIntro}>
                    Ver intro otra vez
                  </button>
                  {audioListo && (
                    <span className="text-sm text-court-700 self-center">
                      Sonido ambiental activo. Usa los controles o la pausa.
                    </span>
                  )}
                </div>

                <div className="bg-calma-sage/70 border border-court-200 rounded-suave px-4 py-2 text-xs text-court-700 flex items-center justify-between gap-2 mb-4">
                  <span>ℹ️ <strong>Aviso legal:</strong> Esto es un ensayo preparatorio. No sustituye a tu citación oficial ni a un abogado. En el juicio decide la autoridad judicial (arts. 7 bis LEC y 709 LECrim).</span>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    {rolUsuario === 'desconocido' && (
                      <div className="card border-2 border-court-400 bg-court-50 p-5 mb-6" aria-live="polite">
                        <h3 className="text-xl font-bold text-court-800 mb-2">¿Para qué vas al juzgado?</h3>
                        <p className="text-court-700 text-sm mb-4">
                          Elige tu papel para que el recorrido y las explicaciones se adapten a tu situación:
                        </p>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {ROLES_DISPONIBLES.map((r) => (
                            <button
                              key={r.id}
                              type="button"
                              onClick={() => {
                                const p = cargarPerfil()
                                guardarPerfil({
                                  nombre: p?.nombre || 'Visitante',
                                  rol: r.id,
                                  tolerancia: p?.tolerancia ?? 1,
                                  estimulosSensibles: p?.estimulosSensibles ?? [],
                                })
                                setRolUsuario(r.id)
                                setEscenaIndice(0)
                              }}
                              className="p-3 text-left rounded-suave border-2 border-court-300 hover:border-court-600 bg-white transition-colors min-h-[44px]"
                            >
                              <span className="text-lg mr-2" aria-hidden="true">{r.icono}</span>
                              <strong className="text-court-800">{r.nombre}</strong>
                              <span className="text-xs text-court-700 block mt-1">{r.subtitulo}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <NarradorAhoraDespues
                      agenda={agenda}
                      enCalma={enCalma}
                      nivel={nivelActual}
                      onDispararEvento={alDispararEvento}
                    />

                    <HerramientasSensoriales
                      herramientasActivas={herramientasActivas}
                      onToggleHerramienta={toggleHerramienta}
                    />

                    <RecorridoEscenas
                      indice={escenaIndice}
                      onCambiar={cambiarEscena}
                      rol={rolUsuario}
                      eventoSala={eventoSala}
                      valores={valores}
                      enCalma={enCalma}
                      onPedirPausa={pausarCalma}
                      onNivelCompletado={(id) => {
                        desbloquear('ensaye-1-nivel')
                        registrarConfianza('ensaya-nivel', id)
                        setProgreso((p) => registrarPractica(p))
                        registrarDiaPractica()
                      }}
                      onProgresoPreguntas={() => {
                        registrarDiaPractica()
                      }}
                    />

                    <p className="text-sm text-court-700">
                      Debajo de la sala 3D elige Distracciones: Apagadas, Pocas o Muchas.
                      En modo calma se silencian las interrupciones.
                    </p>

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
                    <PanelProgreso
                      progreso={progreso}
                      mensaje={mensaje}
                      semana={semanaPractica}
                      totalDias={totalDiasPractica}
                      diasEstaSemana={diasPracticaSemana}
                      bienvenida={bienvenidaPractica}
                      onDescartarBienvenida={descartarBienvenidaPractica}
                    />

                    <PanelLoQueTeAyuda dato={loQueTeAyuda} />
                  </div>
                </div>

                <p className="text-sm text-court-700 mt-8">{CREDITO_AUDIO}</p>
              </>
            )}

          <div className="mt-12 max-w-2xl">
            <PanelInsignias conseguidas={insigniasUtiles} apartado="sala-previa" />
          </div>
        </div>
      </main>

      <BotonCalma enCalma={enCalma} onPausa={pausarCalma} onReanudar={reanudar} />
      <AvisoInsignia insignia={avisoInsignia} onDescartar={descartarAviso} />

      {fase === 'checkin' && (
        <CheckInConfort
          nivelNombre={nivel.nombre}
          valores={valores}
          herramientasUsadas={herramientasActivas}
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
