'use client'

import dynamic from 'next/dynamic'
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useDistracciones } from '@/hooks/useDistracciones'
import { ControlDistracciones } from '@/components/sala-previa/ControlDistracciones'
import { MiniMenuSala } from '@/components/sala-previa/MiniMenuSala'
import { bancoSonidos } from '@/lib/sala-previa/bancoSonidos'
import type { IdEscenaJuzgado, ValoresEstimulo } from '@/lib/sala-previa/tipos'
import type { NivelDistracciones, TipoDistraccion } from '@/lib/sala-previa/distracciones'
import {
  PAPELES_SALA,
  PITCH_MAX,
  YAW_INICIAL_ESCENA,
  miradasPapel,
  numPublicoVisible,
  wrapDeg,
  type MiradaSala,
  type MiradaTarget,
  type PapelSala,
} from '@/lib/sala-previa/salaVistasConfig'

const loadingSala = (
  <p className="absolute inset-0 flex items-center justify-center text-court-700 text-sm bg-court-50/90">
    Cargando la sala…
  </p>
)

const SalaVistas3D = dynamic(
  () => import('@/components/sala-previa/SalaVistas3D').then((m) => m.SalaVistas3D),
  { ssr: false, loading: () => loadingSala }
)

const MIRADAS_UI: { id: MiradaSala; etiqueta: string }[] = [
  { id: 'entrada', etiqueta: 'Entrada' },
  { id: 'abogados', etiqueta: 'Abogados' },
  { id: 'juez', etiqueta: 'Juez' },
]

interface Props {
  escenaId: IdEscenaJuzgado
  titulo: string
  valores: ValoresEstimulo
  enCalma: boolean
  miradaExterna?: MiradaSala | null
  personaEntrando?: boolean
  papel?: PapelSala
  /** Evento de la agenda anunciada que también se ve en la sala 3D. */
  eventoExterno?: { id: number; tipo: TipoDistraccion } | null
  /** Controles extra bajo las miradas (opcional). */
  panelExtra?: ReactNode
  /** Vista más alta + menú integrado (ajustes, miradas, distracciones). */
  vistaAmplia?: boolean
  onCambiarValores?: (valores: ValoresEstimulo) => void
  /** Tutorial: fuerza el menú abierto o cerrado. */
  tutorialMenuAbierto?: boolean
  /** Tutorial: muestra un aviso de ejemplo en la barra negra. */
  tutorialAvisoDemo?: string | null
}

const CLAVE_AJUSTES = 'sala-previa-distracciones-v2'

interface AjustesDistraccion {
  nivel: NivelDistracciones
  avisar: boolean
}

function leerAjustes(): AjustesDistraccion {
  const defecto: AjustesDistraccion = { nivel: 'pocas', avisar: true }
  if (typeof window === 'undefined') return defecto
  try {
    const raw = window.localStorage.getItem(CLAVE_AJUSTES)
    if (!raw) return defecto
    const v = JSON.parse(raw) as Partial<typeof defecto>
    return {
      nivel: v.nivel === 'apagadas' || v.nivel === 'muchas' ? v.nivel : 'pocas',
      avisar: v.avisar !== false,
    }
  } catch {
    return defecto
  }
}

function IconoPantallaCompleta({ salir }: { salir?: boolean }) {
  if (salir) {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SalaJuzgado360({
  escenaId,
  titulo,
  valores,
  enCalma,
  miradaExterna,
  personaEntrando,
  papel = 'publico',
  eventoExterno,
  panelExtra,
  vistaAmplia = false,
  onCambiarValores,
  tutorialMenuAbierto,
  tutorialAvisoDemo = null,
}: Props) {
  const [fsCss, setFsCss] = useState(false)
  const reduced = useReducedMotion()
  const labelId = useId()
  const fsRootRef = useRef<HTMLDivElement>(null)
  const arrastre = useRef<{
    activo: boolean
    x: number
    y: number
    yaw: number
    pitch: number
  } | null>(null)

  const miradas = useMemo(() => miradasPapel(papel), [papel])
  const yawInicial =
    papel === 'publico'
      ? YAW_INICIAL_ESCENA[escenaId] ?? 0
      : miradas.juez.yaw
  const pitchInicial = papel === 'publico' ? 0 : miradas.juez.pitch
  const [yaw, setYaw] = useState(yawInicial)
  const [pitch, setPitch] = useState(pitchInicial)
  const [arrastrando, setArrastrando] = useState(false)
  const [enPantallaCompleta, setEnPantallaCompleta] = useState(false)
  const [enfoque, setEnfoque] = useState<MiradaSala | null>(null)
  const [animando, setAnimando] = useState(false)
  const [destino, setDestino] = useState<MiradaTarget | null>(null)

  useEffect(() => {
    setYaw(yawInicial)
    setPitch(pitchInicial)
    setEnfoque(null)
    setAnimando(false)
    setDestino(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- solo al cambiar de escena o papel
  }, [escenaId, papel])

  useEffect(() => {
    const syncFs = () => {
      const el = fsRootRef.current
      const nativo =
        Boolean(document.fullscreenElement) && document.fullscreenElement === el
      if (nativo) {
        setFsCss(false)
        setEnPantallaCompleta(true)
        return
      }
      if (!fsCss) setEnPantallaCompleta(false)
    }
    document.addEventListener('fullscreenchange', syncFs)
    document.addEventListener('webkitfullscreenchange', syncFs as EventListener)
    return () => {
      document.removeEventListener('fullscreenchange', syncFs)
      document.removeEventListener('webkitfullscreenchange', syncFs as EventListener)
    }
  }, [fsCss])

  useEffect(() => {
    if (!enPantallaCompleta && !fsCss) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (document.fullscreenElement) {
        void document.exitFullscreen?.()
      } else if (fsCss) {
        setFsCss(false)
        setEnPantallaCompleta(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enPantallaCompleta, fsCss])

  const luz = enCalma ? Math.min(valores.luz, 12) : valores.luz
  const gente = enCalma ? 0 : valores.gente
  const ruido = enCalma ? 0 : valores.ruido

  const [ajustes, setAjustes] = useState<AjustesDistraccion>({
    nivel: 'pocas',
    avisar: true,
  })
  useEffect(() => {
    setAjustes(leerAjustes())
  }, [])
  const cambiarAjustes = (cambio: Partial<AjustesDistraccion>) => {
    bancoSonidos().desbloquear()
    const siguiente = { ...ajustes, ...cambio }
    setAjustes(siguiente)
    try {
      window.localStorage.setItem(CLAVE_AJUSTES, JSON.stringify(siguiente))
    } catch {
      // Sin almacenamiento: los ajustes duran solo esta visita.
    }
  }

  const { activa, aviso, explicacion, historial, disparar } = useDistracciones({
    nivel: ajustes.nivel,
    // En Mira la sala siempre avisamos antes (sin interruptor).
    avisar: true,
    enCalma,
    papel,
    numPublico: numPublicoVisible(gente, papel),
  })

  useEffect(() => {
    if (eventoExterno) disparar(eventoExterno.tipo, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- un disparo por id
  }, [eventoExterno?.id])

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (reduced || animando) return
      const target = e.target as HTMLElement
      if (target.closest('[data-sala-ui]')) return
      ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
      arrastre.current = {
        activo: true,
        x: e.clientX,
        y: e.clientY,
        yaw,
        pitch,
      }
      setArrastrando(true)
      setEnfoque(null)
    },
    [animando, pitch, reduced, yaw]
  )

  const onPointerMove = useCallback((e: ReactPointerEvent) => {
    const a = arrastre.current
    if (!a?.activo) return
    const dx = e.clientX - a.x
    const dy = e.clientY - a.y
    setYaw(a.yaw - dx * 0.28)
    setPitch(Math.max(-PITCH_MAX, Math.min(PITCH_MAX, a.pitch + dy * 0.18)))
  }, [])

  const finArrastre = useCallback(() => {
    if (arrastre.current) arrastre.current.activo = false
    setArrastrando(false)
  }, [])

  useEffect(() => {
    if (miradaExterna) {
      mirarHacia(miradaExterna)
    }
  }, [miradaExterna])

  const mirarHacia = (id: MiradaSala) => {
    const t = miradas[id]
    setEnfoque(id)
    if (reduced) {
      setYaw(t.yaw)
      setPitch(t.pitch)
      setAnimando(false)
      setDestino(null)
      return
    }
    setDestino(t)
    setAnimando(true)
  }

  const onAnimFin = useCallback((y: number, p: number) => {
    setYaw(y)
    setPitch(p)
    setAnimando(false)
    setDestino(null)
  }, [])

  const mirarPaso = (deltaYaw: number) => {
    setEnfoque(null)
    setYaw((y) => wrapDeg(y + deltaYaw))
  }

  const alternarPantallaCompleta = async () => {
    const el = fsRootRef.current
    if (!el) return
    const doc = document as Document & {
      webkitExitFullscreen?: () => Promise<void> | void
    }
    const nodo = el as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void> | void
    }
    try {
      if (document.fullscreenElement === el || fsCss) {
        if (document.fullscreenElement) {
          await (document.exitFullscreen?.() ?? doc.webkitExitFullscreen?.())
        }
        setFsCss(false)
        setEnPantallaCompleta(false)
        return
      }
      if (nodo.requestFullscreen) {
        await nodo.requestFullscreen()
        setEnPantallaCompleta(true)
        return
      }
      if (nodo.webkitRequestFullscreen) {
        await nodo.webkitRequestFullscreen()
        setEnPantallaCompleta(true)
        return
      }
      setFsCss(true)
      setEnPantallaCompleta(true)
    } catch {
      setFsCss(true)
      setEnPantallaCompleta(true)
    }
  }

  const menuIntegrado = Boolean(vistaAmplia && onCambiarValores)
  const enFs = enPantallaCompleta || fsCss

  return (
    <div className="space-y-3">
      <div
        ref={fsRootRef}
        className={`sala-juzgado-fs-root ${enFs ? 'is-fullscreen' : ''} ${
          fsCss ? 'sala-juzgado-fs-fallback' : ''
        }`}
      >
        <div className="sala-fs-columna min-w-0 flex-1 space-y-2 flex flex-col h-full">
          <div
            className={`sala-fs-viewer relative rounded-tarjeta overflow-hidden border-2 border-court-200 select-none touch-none bg-court-100 ${
              enFs
                ? 'flex-1 min-h-0 h-full w-full !rounded-none !border-0'
                : vistaAmplia
                  ? 'h-[min(72vh,860px)] min-h-[380px] w-full'
                  : 'aspect-[16/10] sm:aspect-video'
            } ${
              reduced ? 'cursor-default' : arrastrando ? 'cursor-grabbing' : 'cursor-grab'
            }`}
            role="img"
            aria-labelledby={labelId}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={finArrastre}
            onPointerCancel={finArrastre}
            onPointerLeave={finArrastre}
          >
            <p id={labelId} className="sr-only">
              Vista en primera persona de {titulo}. Sala de vistas en 3D.{' '}
              {PAPELES_SALA[papel].descripcion}{' '}
              {reduced
                ? 'La rotación libre está desactivada. Usa el menú para mirar Entrada, Abogados o Juez.'
                : 'Arrastra para mirar en todas direcciones.'}{' '}
              {enFs ? 'Pantalla completa activa. Pulsa Escape o el botón para salir.' : ''}
            </p>

            <SalaVistas3D
              yaw={yaw}
              pitch={pitch}
              luz={luz}
              gente={gente}
              enfoque={enfoque}
              animando={animando}
              destino={destino}
              onAnimFin={onAnimFin}
              reduced={reduced}
              arrastrando={arrastrando}
              personaEntrando={personaEntrando}
              papel={papel}
              distraccion={activa}
              enCalma={enCalma}
            />

            {(tutorialAvisoDemo || aviso) && (
              <div
                data-tutorial="aviso"
                className="absolute bottom-0 inset-x-0 z-[6] px-4 py-3 bg-court-900/95 text-white pointer-events-none"
                role="status"
                aria-live="polite"
              >
                <p className="text-sm font-bold text-court-100">Aviso</p>
                <p className="text-base sm:text-lg leading-snug">
                  {tutorialAvisoDemo || aviso}
                </p>
              </div>
            )}

            {menuIntegrado && onCambiarValores ? (
              <div className="absolute top-2 left-2 z-[7] max-w-[calc(100%-4.5rem)]" data-sala-ui>
                <MiniMenuSala
                  valores={valores}
                  onValores={onCambiarValores}
                  nivelDistracciones={ajustes.nivel}
                  onNivelDistracciones={(nivel) => cambiarAjustes({ nivel })}
                  enCalma={enCalma}
                  enfoque={enfoque}
                  onMirar={mirarHacia}
                  abierto={tutorialMenuAbierto}
                  miradasExtra={
                    reduced ? (
                      <>
                        <button
                          type="button"
                          className="btn-ghost text-xs min-h-[40px] px-2 border border-court-200"
                          onClick={() => mirarPaso(-35)}
                        >
                          Izquierda
                        </button>
                        <button
                          type="button"
                          className="btn-ghost text-xs min-h-[40px] px-2 border border-court-200"
                          onClick={() => mirarPaso(35)}
                        >
                          Derecha
                        </button>
                      </>
                    ) : null
                  }
                />
              </div>
            ) : null}

            <div className="absolute top-2 right-2 z-[7] flex flex-col items-end gap-2" data-sala-ui>
              {enCalma && (
                <span className="inline-block bg-white text-court-800 font-bold px-3 py-1.5 rounded-suave text-sm border border-court-200">
                  Modo calma activo
                </span>
              )}
              <button
                type="button"
                data-tutorial="pantalla-completa"
                className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-suave bg-white text-court-800 border border-court-200 hover:bg-calma-mist focus-visible:ring-4 focus-visible:ring-court-400"
                onClick={(e) => {
                  e.stopPropagation()
                  void alternarPantallaCompleta()
                }}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label={enFs ? 'Salir de pantalla completa' : 'Ampliar a pantalla completa'}
                aria-pressed={enFs}
                title={enFs ? 'Salir (Esc)' : 'Pantalla completa'}
              >
                <IconoPantallaCompleta salir={enFs} />
              </button>
            </div>

            <div
              data-tutorial="arrastrar"
              className="pointer-events-none absolute inset-0 z-[2]"
              aria-hidden="true"
            />

            {!reduced && !(tutorialAvisoDemo || aviso) && (
              <p
                className="absolute bottom-2 right-3 z-[3] text-sm text-court-800 bg-white px-2 py-1 rounded-suave border border-court-200 pointer-events-none"
                aria-hidden="true"
              >
                Arrastra para mirar
              </p>
            )}
          </div>

          {!menuIntegrado && (
            <>
              <div
                className="sala-fs-miradas flex flex-wrap gap-2 items-center"
                role="group"
                aria-label="Mirar hacia un punto de la sala"
                data-sala-ui
              >
                {MIRADAS_UI.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    className={`btn-ghost text-sm min-h-[44px] border border-court-200 ${
                      enfoque === m.id ? 'bg-court-100 font-bold' : ''
                    }`}
                    onClick={() => mirarHacia(m.id)}
                    aria-label={`Mirar hacia ${m.etiqueta.toLowerCase()}`}
                    aria-pressed={enfoque === m.id}
                  >
                    {m.etiqueta}
                  </button>
                ))}
              </div>
              {panelExtra ? <div data-sala-ui>{panelExtra}</div> : null}
              <ControlDistracciones
                modo="preparacion"
                nivel={ajustes.nivel}
                enCalma={enCalma}
                aviso={aviso}
                explicacion={explicacion}
                historial={historial}
                onNivel={(nivel) => cambiarAjustes({ nivel })}
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
