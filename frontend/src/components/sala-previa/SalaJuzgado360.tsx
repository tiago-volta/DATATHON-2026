'use client'

import dynamic from 'next/dynamic'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { BarritasEstimulo } from '@/components/sala-previa/BarritasEstimulo'
import type { IdEscenaJuzgado, IdEstimulo, ValoresEstimulo } from '@/lib/sala-previa/tipos'
import {
  MIRADAS_3D,
  PITCH_MAX,
  YAW_INICIAL_ESCENA,
  wrapDeg,
  type MiradaSala,
  type MiradaTarget,
} from '@/lib/sala-previa/salaVistasConfig'

const SalaVistas3D = dynamic(
  () => import('@/components/sala-previa/SalaVistas3D').then((m) => m.SalaVistas3D),
  {
    ssr: false,
    loading: () => (
      <p className="absolute inset-0 flex items-center justify-center text-court-700 text-sm bg-court-50/90">
        Cargando la sala…
      </p>
    ),
  }
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
  onChangeEstimulo?: (id: IdEstimulo, valor: number) => void
  deshabilitadoEstimulos?: boolean
  miradaExterna?: MiradaSala | null
  personaEntrando?: boolean
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
  onChangeEstimulo,
  deshabilitadoEstimulos,
  miradaExterna,
  personaEntrando,
}: Props) {
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

  const [yaw, setYaw] = useState(() => YAW_INICIAL_ESCENA[escenaId] ?? 0)
  const [pitch, setPitch] = useState(0)
  const [arrastrando, setArrastrando] = useState(false)
  const [enPantallaCompleta, setEnPantallaCompleta] = useState(false)
  const [enfoque, setEnfoque] = useState<MiradaSala | null>(null)
  const [animando, setAnimando] = useState(false)
  const [destino, setDestino] = useState<MiradaTarget | null>(null)

  useEffect(() => {
    const y = YAW_INICIAL_ESCENA[escenaId] ?? 0
    setYaw(y)
    setPitch(0)
    setEnfoque(null)
    setAnimando(false)
    setDestino(null)
  }, [escenaId])

  useEffect(() => {
    const syncFs = () => {
      const el = fsRootRef.current
      const activo =
        Boolean(document.fullscreenElement) && document.fullscreenElement === el
      setEnPantallaCompleta(activo)
    }
    document.addEventListener('fullscreenchange', syncFs)
    return () => document.removeEventListener('fullscreenchange', syncFs)
  }, [])

  useEffect(() => {
    if (!enPantallaCompleta) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && document.fullscreenElement) {
        void document.exitFullscreen?.()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enPantallaCompleta])

  const luz = enCalma ? Math.min(valores.luz, 12) : valores.luz
  const gente = enCalma ? 0 : valores.gente
  const ruido = enCalma ? 0 : valores.ruido

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
    const t = MIRADAS_3D[id]
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
    try {
      if (document.fullscreenElement === el) {
        await document.exitFullscreen()
      } else if (!document.fullscreenElement) {
        await el.requestFullscreen()
      }
    } catch {
      // El navegador puede denegar fullscreen; no rompemos la simulación.
    }
  }

  return (
    <div className="space-y-3">
      <div
        ref={fsRootRef}
        className={`sala-juzgado-fs-root flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-start ${
          enPantallaCompleta ? 'is-fullscreen' : ''
        }`}
      >
        <div
          className="sala-fs-barritas shrink-0 sm:sticky sm:top-4 self-start"
          data-sala-controles
          data-sala-ui
        >
          <BarritasEstimulo
            valores={{ ruido, luz, gente }}
            deshabilitado={deshabilitadoEstimulos || enCalma}
            onChange={onChangeEstimulo}
            className="w-full sm:w-[12.5rem]"
            idPrefix="barra-sala"
          />
        </div>

        <div className="sala-fs-columna min-w-0 flex-1 space-y-2 flex flex-col">
          <div
            className={`sala-fs-viewer relative aspect-[16/10] sm:aspect-video rounded-tarjeta overflow-hidden border-2 border-court-200 select-none touch-none bg-court-100 ${
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
              Vista en primera persona de {titulo}, sala de vistas en 3D.{' '}
              {reduced
                ? 'La rotación libre está desactivada. Usa los botones Entrada, Abogados o Juez para mirar.'
                : 'Arrastra para mirar en todas direcciones: izquierda, derecha, arriba, abajo y detrás.'}{' '}
              Ruido {Math.round(ruido)}, luz {Math.round(luz)}, gente {Math.round(gente)}.
              {enPantallaCompleta
                ? ' Pantalla completa activa. Pulsa Escape o el botón para salir.'
                : ''}
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
            />

            {/* Indicador visual discreto de ruido */}
            <div
              className="absolute bottom-2 left-3 right-14 flex items-end gap-0.5 h-5 pointer-events-none z-[2]"
              aria-hidden="true"
            >
              {Array.from({ length: 18 }, (_, i) => {
                const fase = (i / 17) * Math.PI
                const alto =
                  0.12 + (ruido / 100) * (0.45 + 0.45 * Math.abs(Math.sin(fase * 2)))
                return (
                  <span
                    key={i}
                    className="flex-1 rounded-full bg-court-800/45 origin-bottom"
                    style={{
                      height: '100%',
                      transform: `scaleY(${Math.min(1, alto)})`,
                      opacity: ruido < 2 ? 0.08 : 0.3 + ruido / 280,
                      transition: 'transform 1s ease-out, opacity 1s ease-out',
                    }}
                  />
                )
              })}
            </div>

            <div className="absolute top-2 right-2 z-[5] flex flex-col items-end gap-2" data-sala-ui>
              {enCalma && (
                <span className="inline-block bg-white text-court-800 font-bold px-3 py-1.5 rounded-suave text-sm border border-court-200">
                  Modo calma activo
                </span>
              )}
              <button
                type="button"
                className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] w-11 h-11 rounded-suave bg-white text-court-800 border border-court-200 hover:bg-calma-mist focus-visible:ring-4 focus-visible:ring-court-400"
                onClick={(e) => {
                  e.stopPropagation()
                  void alternarPantallaCompleta()
                }}
                onPointerDown={(e) => e.stopPropagation()}
                aria-label={
                  enPantallaCompleta
                    ? 'Salir de pantalla completa'
                    : 'Ampliar simulación a pantalla completa'
                }
                aria-pressed={enPantallaCompleta}
                title={enPantallaCompleta ? 'Salir (Esc)' : 'Pantalla completa'}
              >
                <IconoPantallaCompleta salir={enPantallaCompleta} />
              </button>
            </div>

            {!reduced && (
              <p
                className="absolute bottom-2 right-3 z-[3] text-sm text-court-800 bg-white px-2 py-1 rounded-suave border border-court-200 pointer-events-none"
                aria-hidden="true"
              >
                Arrastra para mirar
              </p>
            )}
          </div>

          <div
            className="sala-fs-miradas flex flex-wrap gap-2 items-center"
            role="group"
            aria-label="Mirar hacia un punto de la sala"
            data-sala-ui
          >
            {reduced && (
              <>
                <button
                  type="button"
                  className={`btn-secondary text-sm min-h-[44px] ${
                    enPantallaCompleta
                      ? '!text-white !border-white/70 !bg-white/10 hover:!bg-white/20'
                      : ''
                  }`}
                  onClick={() => mirarPaso(-35)}
                  aria-label="Mirar hacia la izquierda"
                >
                  Mirar izquierda
                </button>
                <button
                  type="button"
                  className={`btn-secondary text-sm min-h-[44px] ${
                    enPantallaCompleta
                      ? '!text-white !border-white/70 !bg-white/10 hover:!bg-white/20'
                      : ''
                  }`}
                  onClick={() => mirarPaso(35)}
                  aria-label="Mirar hacia la derecha"
                >
                  Mirar derecha
                </button>
              </>
            )}
            {MIRADAS_UI.map((m) => (
              <button
                type="button"
                key={m.id}
                className={`btn-ghost text-sm min-h-[44px] border ${
                  enPantallaCompleta
                    ? '!text-white !border-white/70 bg-white/10 hover:bg-white/20'
                    : 'border-court-200'
                } ${
                  enfoque === m.id
                    ? enPantallaCompleta
                      ? '!bg-white/30 font-bold !text-white'
                      : 'bg-court-100 font-bold'
                    : ''
                }`}
                onClick={() => mirarHacia(m.id)}
                aria-label={`Mirar hacia ${m.etiqueta.toLowerCase()}`}
                aria-pressed={enfoque === m.id}
              >
                {m.etiqueta}
              </button>
            ))}
          </div>

          {reduced && (
            <p
              className={`sala-fs-nota text-sm ${
                enPantallaCompleta ? '!text-white' : 'text-court-700'
              }`}
              role="note"
            >
              Vista con menos movimiento: usa los botones para mirar la entrada, los abogados
              o el juez. Las barritas de estímulo siguen a la izquierda
              {enPantallaCompleta ? ' (arriba a la izquierda en pantalla completa)' : ''}.
            </p>
          )}

          <p
            className={`sala-fs-credito text-xs leading-snug ${
              enPantallaCompleta ? '!text-white' : 'text-court-600'
            }`}
          >
            Sala de vistas en 3D (Three.js): texturas PBR CC0, HDRI de interior y
            figuras 3D. Ver CREDITOS en /sala-previa/.
          </p>
        </div>
      </div>
    </div>
  )
}
