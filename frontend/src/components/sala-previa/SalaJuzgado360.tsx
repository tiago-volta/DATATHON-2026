'use client'

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { BarritasEstimulo } from '@/components/sala-previa/BarritasEstimulo'
import type { IdEscenaJuzgado, IdEstimulo, ValoresEstimulo } from '@/lib/sala-previa/tipos'

/** Panorama equirectangular 2:1 (derivado del juzgado de St. Louis). */
const PANORAMA_SRC = '/sala-previa/sala-vistas-360.jpg'

/** Ángulo inicial (yaw) por escena: 0 ≈ juez; 180 ≈ entrada. */
const YAW_INICIAL: Record<IdEscenaJuzgado, number> = {
  entrada: 178,
  'control-seguridad': 150,
  'sala-espera': 95,
  'sala-vistas': 8,
}

/** Miradas rápidas (reduced-motion y atajos). */
const MIRADAS = [
  { id: 'entrada', etiqueta: 'Entrada', yaw: 178, pitch: 0 },
  { id: 'abogados', etiqueta: 'Abogados', yaw: 42, pitch: -2 },
  { id: 'juez', etiqueta: 'Juez', yaw: 8, pitch: -4 },
] as const

const FOV_DEG = 78
const PITCH_MAX = 28

interface Props {
  escenaId: IdEscenaJuzgado
  titulo: string
  valores: ValoresEstimulo
  enCalma: boolean
  onChangeEstimulo?: (id: IdEstimulo, valor: number) => void
  deshabilitadoEstimulos?: boolean
}

function wrapDeg(deg: number): number {
  return ((deg % 360) + 360) % 360
}

function SiluetaPersona({
  style,
  tono,
  escala = 1,
}: {
  style: CSSProperties
  tono: string
  escala?: number
}) {
  const w = 36 * escala
  const h = 72 * escala
  return (
    <div className="absolute pointer-events-none" style={{ ...style, width: w, height: h }} aria-hidden="true">
      <svg width={w} height={h} viewBox="0 0 36 72" fill="none" style={{ width: '100%', height: '100%' }}>
        <circle cx="18" cy="10" r="8" fill={tono} />
        <path d="M6 28c0-4 5-7 12-7s12 3 12 7v22H6V28Z" fill={tono} />
        <path d="M10 50h6v20H10V50Zm10 0h6v20h-6V50Z" fill={tono} />
      </svg>
    </div>
  )
}

export function SalaJuzgado360({
  escenaId,
  titulo,
  valores,
  enCalma,
  onChangeEstimulo,
  deshabilitadoEstimulos,
}: Props) {
  const reduced = useReducedMotion()
  const labelId = useId()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const arrastre = useRef<{
    activo: boolean
    x: number
    y: number
    yaw: number
    pitch: number
  } | null>(null)

  const [yaw, setYaw] = useState(() => YAW_INICIAL[escenaId] ?? 0)
  const [pitch, setPitch] = useState(0)
  const [arrastrando, setArrastrando] = useState(false)
  const [imgLista, setImgLista] = useState(false)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    setYaw(YAW_INICIAL[escenaId] ?? 0)
    setPitch(0)
  }, [escenaId])

  useEffect(() => {
    const img = new Image()
    img.decoding = 'async'
    img.src = PANORAMA_SRC
    img.onload = () => {
      imgRef.current = img
      setImgLista(true)
      setImgError(false)
    }
    img.onerror = () => {
      setImgError(true)
      setImgLista(false)
    }
    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [])

  const luz = enCalma ? Math.min(valores.luz, 12) : valores.luz
  const gente = enCalma ? 0 : valores.gente
  const ruido = enCalma ? 0 : valores.ruido
  const eco = enCalma ? 0 : valores.eco

  const brillo = 0.62 + (luz / 100) * 0.48
  const veloOscuro = Math.min(0.45, (100 - luz) / 210)
  const veloRuido = Math.min(0.3, (ruido * 0.5 + eco * 0.5) / 190)
  const numGente = Math.round((gente / 100) * 8)

  const pintar = useCallback(() => {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return

    const parent = canvas.parentElement
    const cssW = parent?.clientWidth || 640
    const cssH = parent?.clientHeight || 400
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const w = Math.max(1, Math.round(cssW * dpr))
    const h = Math.max(1, Math.round(cssH * dpr))
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }

    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    const srcW = img.naturalWidth
    const srcH = img.naturalHeight
    const aspect = w / h
    const fovH = (FOV_DEG * Math.PI) / 180
    const fovV = 2 * Math.atan(Math.tan(fovH / 2) / aspect)
    const spanU = fovH / (Math.PI * 2)
    const spanV = fovV / Math.PI
    const uCenter = wrapDeg(yaw) / 360
    const vCenter = 0.5 - pitch / 180

    const srcX = (uCenter - spanU / 2) * srcW
    const srcY = Math.max(0, Math.min(srcH - spanV * srcH, (vCenter - spanV / 2) * srcH))
    const srcSpanW = spanU * srcW
    const srcSpanH = Math.max(1, spanV * srcH)

    ctx.fillStyle = 'hsl(198, 14%, 82%)'
    ctx.fillRect(0, 0, w, h)
    ctx.filter = `brightness(${brillo})`

    const x0 = ((srcX % srcW) + srcW) % srcW
    const firstW = Math.min(srcSpanW, srcW - x0)
    const firstDestW = (firstW / srcSpanW) * w
    ctx.drawImage(img, x0, srcY, firstW, srcSpanH, 0, 0, firstDestW, h)
    const rest = srcSpanW - firstW
    if (rest > 1) {
      const restDestW = (rest / srcSpanW) * w
      ctx.drawImage(img, 0, srcY, rest, srcSpanH, firstDestW, 0, restDestW, h)
    }
    ctx.filter = 'none'
  }, [brillo, pitch, yaw])

  useEffect(() => {
    if (!imgLista) return
    const tick = () => {
      pintar()
      rafRef.current = null
    }
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [imgLista, pintar, arrastrando])

  useEffect(() => {
    if (!imgLista) return
    const onResize = () => pintar()
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [imgLista, pintar])

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (reduced) return
      ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
      arrastre.current = {
        activo: true,
        x: e.clientX,
        y: e.clientY,
        yaw,
        pitch,
      }
      setArrastrando(true)
    },
    [pitch, reduced, yaw]
  )

  const onPointerMove = useCallback((e: ReactPointerEvent) => {
    const a = arrastre.current
    if (!a?.activo) return
    const dx = e.clientX - a.x
    const dy = e.clientY - a.y
    setYaw(a.yaw - dx * 0.22)
    setPitch(Math.max(-PITCH_MAX, Math.min(PITCH_MAX, a.pitch + dy * 0.14)))
  }, [])

  const finArrastre = useCallback(() => {
    if (arrastre.current) arrastre.current.activo = false
    setArrastrando(false)
  }, [])

  const mirarHacia = (nuevoYaw: number, nuevoPitch: number) => {
    setYaw(nuevoYaw)
    setPitch(nuevoPitch)
  }

  const mirarPaso = (deltaYaw: number) => {
    setYaw((y) => wrapDeg(y + deltaYaw))
  }

  const tonoPersonas = 'hsla(195, 28%, 22%, 0.72)'
  const posicionesGente = [
    { yawRel: -55, bottom: '18%', scale: 0.85 },
    { yawRel: -32, bottom: '16%', scale: 0.95 },
    { yawRel: -12, bottom: '17%', scale: 0.8 },
    { yawRel: 18, bottom: '15%', scale: 1 },
    { yawRel: 38, bottom: '18%', scale: 0.9 },
    { yawRel: 58, bottom: '16%', scale: 0.85 },
    { yawRel: -70, bottom: '22%', scale: 0.7 },
    { yawRel: 75, bottom: '21%', scale: 0.75 },
  ]

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-start">
        {/* Barritas FUERA del viewport, a la izquierda */}
        <div className="shrink-0 sm:sticky sm:top-4 self-start" data-sala-controles>
          <BarritasEstimulo
            valores={{ ruido, luz, gente, eco }}
            deshabilitado={deshabilitadoEstimulos || enCalma}
            onChange={onChangeEstimulo}
            className="w-full sm:w-[12.5rem]"
          />
        </div>

        <div className="min-w-0 flex-1 space-y-2">
          <div
            className={`relative aspect-[16/10] sm:aspect-video rounded-tarjeta overflow-hidden border-2 border-puente-200 select-none touch-none bg-puente-100 ${
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
              Vista en primera persona de {titulo}, panorama de una sala de juzgado.{' '}
              {reduced
                ? 'La rotación libre está desactivada. Usa los botones Entrada, Abogados o Juez para mirar.'
                : 'Arrastra con el ratón o el dedo para mirar alrededor (entrada, juez, abogados).'}{' '}
              Ruido {Math.round(ruido)}, luz {Math.round(luz)}, gente {Math.round(gente)}, eco{' '}
              {Math.round(eco)}.
            </p>

            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full block"
              aria-hidden="true"
            />

            {!imgLista && !imgError && (
              <p className="absolute inset-0 flex items-center justify-center text-puente-700 text-sm bg-puente-50/80">
                Cargando la sala…
              </p>
            )}
            {imgError && (
              <p className="absolute inset-0 flex items-center justify-center text-puente-800 text-sm p-4 text-center bg-puente-50">
                No se pudo cargar el panorama. Revisa la conexión o recarga la página.
              </p>
            )}

            {/* Siluetas según estímulo «gente» */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
              {posicionesGente.map((p, i) => {
                const visible = i < numGente
                if (!visible) return null
                const rel = ((p.yawRel - (wrapDeg(yaw) - 8) + 540) % 360) - 180
                if (Math.abs(rel) > 55) return null
                const leftPct = 50 + (rel / 55) * 42
                const fuerza =
                  i < numGente - 1
                    ? 1
                    : Math.max(0.3, (gente / 100) * 8 - (numGente - 1))
                return (
                  <SiluetaPersona
                    key={i}
                    tono={tonoPersonas}
                    escala={p.scale}
                    style={{
                      left: `${leftPct}%`,
                      bottom: p.bottom,
                      transform: 'translateX(-50%)',
                      opacity: 0.35 + fuerza * 0.45,
                      transition: 'opacity 1s ease-out',
                    }}
                  />
                )
              })}
            </div>

            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'hsl(200, 14%, 18%)',
                opacity: veloOscuro,
                transition: 'opacity 1.2s ease-out',
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at 50% 0%, hsla(45, 70%, 92%, 0.5) 0%, transparent 55%)',
                opacity: Math.min(0.8, 0.12 + (luz / 100) * 0.65),
                transition: 'opacity 1.2s ease-out',
              }}
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'hsla(195, 32%, 20%, 1)',
                opacity: veloRuido,
                transition: 'opacity 1.2s ease-out',
              }}
              aria-hidden="true"
            />

            <div
              className="absolute bottom-2 left-3 right-3 flex items-end gap-0.5 h-5 pointer-events-none z-[2]"
              aria-hidden="true"
            >
              {Array.from({ length: 18 }, (_, i) => {
                const fase = (i / 17) * Math.PI
                const alto =
                  0.12 +
                  (ruido / 100) * (0.4 + 0.4 * Math.abs(Math.sin(fase * 2))) +
                  (eco / 100) * (0.2 + 0.3 * Math.abs(Math.cos(fase * 1.5)))
                return (
                  <span
                    key={i}
                    className="flex-1 rounded-full bg-puente-800/45 origin-bottom"
                    style={{
                      height: '100%',
                      transform: `scaleY(${Math.min(1, alto)})`,
                      opacity: ruido + eco < 2 ? 0.08 : 0.3 + (ruido + eco) / 280,
                      transition: 'transform 1s ease-out, opacity 1s ease-out',
                    }}
                  />
                )
              })}
            </div>

            {enCalma && (
              <div className="absolute top-3 right-3 z-[4]">
                <span className="inline-block bg-white/95 text-puente-800 font-bold px-3 py-1.5 rounded-suave text-sm border border-puente-200">
                  Modo calma activo
                </span>
              </div>
            )}

            {!reduced && (
              <p
                className="absolute bottom-2 right-3 z-[3] text-[11px] sm:text-xs text-puente-800 bg-white/85 px-2 py-1 rounded-suave pointer-events-none"
                aria-hidden="true"
              >
                Arrastra para mirar
              </p>
            )}
          </div>

          <div
            className="flex flex-wrap gap-2 items-center"
            role="group"
            aria-label="Mirar hacia un punto de la sala"
          >
            {reduced && (
              <>
                <button
                  type="button"
                  className="btn-secondary text-sm min-h-[44px]"
                  onClick={() => mirarPaso(-35)}
                  aria-label="Mirar hacia la izquierda"
                >
                  Mirar izquierda
                </button>
                <button
                  type="button"
                  className="btn-secondary text-sm min-h-[44px]"
                  onClick={() => mirarPaso(35)}
                  aria-label="Mirar hacia la derecha"
                >
                  Mirar derecha
                </button>
              </>
            )}
            {MIRADAS.map((m) => (
              <button
                type="button"
                key={m.id}
                className="btn-ghost text-sm min-h-[44px] border border-puente-200"
                onClick={() => mirarHacia(m.yaw, m.pitch)}
                aria-label={`Mirar hacia ${m.etiqueta.toLowerCase()}`}
              >
                {m.etiqueta}
              </button>
            ))}
          </div>

          {reduced && (
            <p className="text-sm text-puente-700" role="note">
              Vista con menos movimiento: usa los botones para mirar la entrada, los abogados
              o el juez. Las barritas de estímulo siguen a la izquierda.
            </p>
          )}

          <p className="text-xs text-puente-600 leading-snug">
            Foto: Adam Jones — Old Courthouse, St. Louis (CC BY-SA 2.0). Adaptada a panorama
            360° para esta simulación.
          </p>
        </div>
      </div>
    </div>
  )
}
