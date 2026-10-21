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

const HALF = 280 // mitad del cubo (px)
const FACE = HALF * 2

/** Ángulo inicial (yaw) por escena: 0 = mira al juez; 180 = mira a la entrada. */
const YAW_INICIAL: Record<IdEscenaJuzgado, number> = {
  entrada: 180,
  'control-seguridad': 140,
  'sala-espera': 90,
  'sala-vistas': 8,
}

interface Props {
  escenaId: IdEscenaJuzgado
  titulo: string
  valores: ValoresEstimulo
  enCalma: boolean
  onChangeEstimulo?: (id: IdEstimulo, valor: number) => void
  deshabilitadoEstimulos?: boolean
}

function Personita({
  x,
  z,
  scale,
  opacity,
  tono,
}: {
  x: number
  z: number
  scale: number
  opacity: number
  tono: string
}) {
  // De pie en el suelo del cubo: Y positivo baja; pies cerca de +HALF.
  const alto = 72 * scale
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: '50%',
        top: '50%',
        width: 36 * scale,
        height: alto,
        marginLeft: -18 * scale,
        marginTop: -alto / 2,
        transform: `translate3d(${x}px, ${HALF - alto / 2 - 4}px, ${z}px)`,
        opacity,
        transition: 'opacity 1.2s ease-out',
      }}
      aria-hidden="true"
    >
      <svg width="36" height="72" viewBox="0 0 36 72" fill="none" style={{ width: '100%', height: '100%' }}>
        <circle cx="18" cy="10" r="8" fill={tono} />
        <path
          d="M6 28c0-4 5-7 12-7s12 3 12 7v22H6V28Z"
          fill={tono}
        />
        <path d="M10 50h6v20H10V50Zm10 0h6v20h-6V50Z" fill={tono} />
      </svg>
    </div>
  )
}

function JuezFigura() {
  return (
    <div className="absolute left-1/2 bottom-8 -translate-x-1/2 pointer-events-none" aria-hidden="true">
      <svg width="70" height="110" viewBox="0 0 70 110" fill="none">
        {/* Estrado / mesa */}
        <rect x="4" y="78" width="62" height="14" rx="2" fill="hsl(195, 28%, 32%)" />
        <rect x="8" y="72" width="54" height="8" rx="1" fill="hsl(195, 22%, 40%)" />
        {/* Cuerpo con toga */}
        <path
          d="M20 38c0-8 7-14 15-14s15 6 15 14v34H20V38Z"
          fill="hsl(200, 18%, 22%)"
        />
        <path
          d="M22 42c4 8 10 12 13 12s9-4 13-12"
          stroke="hsl(45, 40%, 78%)"
          strokeWidth="2"
          fill="none"
        />
        {/* Cabeza */}
        <circle cx="35" cy="22" r="11" fill="hsl(30, 35%, 72%)" />
        {/* Cabello sobrio */}
        <path
          d="M24 18c1-8 22-8 23 0-2 4-6 6-11.5 6S26 22 24 18Z"
          fill="hsl(200, 12%, 28%)"
        />
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
  const viewportRef = useRef<HTMLDivElement>(null)
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

  useEffect(() => {
    setYaw(YAW_INICIAL[escenaId] ?? 0)
    setPitch(0)
  }, [escenaId])

  const luz = enCalma ? Math.min(valores.luz, 12) : valores.luz
  const gente = enCalma ? 0 : valores.gente
  const ruido = enCalma ? 0 : valores.ruido
  const eco = enCalma ? 0 : valores.eco

  const brillo = 0.55 + (luz / 100) * 0.55
  const veloOscuro = Math.min(0.42, (100 - luz) / 220)
  const veloRuido = Math.min(0.28, (ruido * 0.5 + eco * 0.5) / 200)
  const numGente = Math.round((gente / 100) * 10)

  const posicionesGente = [
    { x: -160, z: 40, s: 0.85 },
    { x: -90, z: 70, s: 0.95 },
    { x: -30, z: 50, s: 0.8 },
    { x: 40, z: 65, s: 1 },
    { x: 110, z: 45, s: 0.9 },
    { x: 170, z: 75, s: 0.85 },
    { x: -130, z: -20, s: 0.75 },
    { x: 20, z: -10, s: 0.8 },
    { x: 130, z: -30, s: 0.78 },
    { x: -50, z: 100, s: 1.05 },
  ]

  const onPointerDown = useCallback(
    (e: ReactPointerEvent) => {
      if (reduced) return
      // No girar la sala si el gesto empieza en un control (barritas).
      if ((e.target as HTMLElement).closest('[data-sala-controles]')) return
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
    setYaw(a.yaw - dx * 0.28)
    setPitch(Math.max(-18, Math.min(18, a.pitch + dy * 0.18)))
  }, [])

  const finArrastre = useCallback(() => {
    if (arrastre.current) arrastre.current.activo = false
    setArrastrando(false)
  }, [])

  const faceStyle = (extra: CSSProperties): CSSProperties => ({
    position: 'absolute',
    width: FACE,
    height: FACE,
    left: '50%',
    top: '50%',
    marginLeft: -HALF,
    marginTop: -HALF,
    backfaceVisibility: 'hidden',
    ...extra,
  })

  const tonoPersonas = 'hsl(195, 25%, 28%)'

  return (
    <div className="space-y-2">
      <div
        ref={viewportRef}
        className={`relative aspect-[16/10] sm:aspect-video rounded-tarjeta overflow-hidden border-2 border-puente-200 select-none touch-none ${
          reduced ? 'cursor-default' : arrastrando ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          perspective: '720px',
          background: 'hsl(198, 18%, 88%)',
        }}
        role="img"
        aria-labelledby={labelId}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finArrastre}
        onPointerCancel={finArrastre}
        onPointerLeave={finArrastre}
      >
        <p id={labelId} className="sr-only">
          Vista 360 de {titulo}. {reduced
            ? 'La rotación está desactivada porque pediste menos movimiento.'
            : 'Arrastra con el ratón o el dedo para mirar alrededor.'}{' '}
          Hay un juez en el estrado y personas según el estímulo gente.
          Ruido {Math.round(ruido)}, luz {Math.round(luz)}, gente {Math.round(gente)},
          eco {Math.round(eco)}.
        </p>

        {/* Escena 3D */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transformStyle: 'preserve-3d' }}
          aria-hidden="true"
        >
          <div
            style={{
              width: FACE,
              height: FACE,
              transformStyle: 'preserve-3d',
              transform: `rotateX(${pitch}deg) rotateY(${yaw}deg)`,
              transition: arrastrando || reduced ? 'none' : 'transform 0.35s ease-out',
              filter: `brightness(${brillo})`,
            }}
          >
            {/* Suelo */}
            <div
              style={faceStyle({
                transform: `rotateX(90deg) translateZ(-${HALF}px)`,
                background:
                  'linear-gradient(180deg, hsl(195, 14%, 62%) 0%, hsl(195, 16%, 48%) 100%)',
                boxShadow: 'inset 0 0 80px rgba(20,50,60,0.25)',
              })}
            >
              {/* Bancos del público */}
              {[0, 1, 2].map((fila) => (
                <div
                  key={fila}
                  className="absolute left-1/2 -translate-x-1/2 rounded-sm"
                  style={{
                    bottom: 40 + fila * 48,
                    width: '68%',
                    height: 14,
                    background: 'hsl(195, 22%, 34%)',
                    opacity: 0.85,
                  }}
                />
              ))}
            </div>

            {/* Techo */}
            <div
              style={faceStyle({
                transform: `rotateX(-90deg) translateZ(-${HALF}px)`,
                background:
                  'radial-gradient(ellipse at 50% 50%, hsl(45, 45%, 92%) 0%, hsl(198, 12%, 78%) 70%)',
              })}
            />

            {/* Pared juez (frente, yaw 0) */}
            <div
              style={faceStyle({
                transform: `translateZ(-${HALF}px)`,
                background:
                  'linear-gradient(180deg, hsl(198, 16%, 82%) 0%, hsl(195, 18%, 72%) 55%, hsl(195, 20%, 58%) 100%)',
                borderBottom: '3px solid hsl(195, 25%, 40%)',
              })}
            >
              {/* Escudo / panel del estrado */}
              <div
                className="absolute left-1/2 top-10 -translate-x-1/2 rounded-sm px-4 py-2 text-center"
                style={{
                  background: 'hsl(195, 30%, 28%)',
                  color: 'hsl(45, 35%, 88%)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                }}
              >
                SALA DE VISTAS
              </div>
              <div
                className="absolute left-1/2 top-[4.5rem] -translate-x-1/2 w-[55%] h-16 rounded-t-sm"
                style={{ background: 'hsl(195, 22%, 38%)' }}
              />
              <JuezFigura />
              {/* Letrado y fiscal a los lados */}
              <div className="absolute left-[18%] bottom-10 opacity-90">
                <svg width="40" height="78" viewBox="0 0 40 78" fill="none">
                  <circle cx="20" cy="12" r="8" fill="hsl(30, 35%, 70%)" />
                  <path d="M8 28c0-5 5-9 12-9s12 4 12 9v32H8V28Z" fill="hsl(200, 16%, 24%)" />
                </svg>
              </div>
              <div className="absolute right-[18%] bottom-10 opacity-90">
                <svg width="40" height="78" viewBox="0 0 40 78" fill="none">
                  <circle cx="20" cy="12" r="8" fill="hsl(30, 30%, 68%)" />
                  <path d="M8 28c0-5 5-9 12-9s12 4 12 9v32H8V28Z" fill="hsl(200, 16%, 24%)" />
                </svg>
              </div>
            </div>

            {/* Pared entrada (espalda, yaw 180) */}
            <div
              style={faceStyle({
                transform: `rotateY(180deg) translateZ(-${HALF}px)`,
                background:
                  'linear-gradient(180deg, hsl(198, 14%, 80%) 0%, hsl(195, 16%, 70%) 100%)',
              })}
            >
              {/* Puertas de cristal / entrada */}
              <div
                className="absolute left-1/2 top-[18%] -translate-x-1/2 flex gap-1"
                style={{ width: '42%', height: '58%' }}
              >
                <div
                  className="flex-1 rounded-t-sm border-2"
                  style={{
                    borderColor: 'hsl(195, 25%, 35%)',
                    background:
                      'linear-gradient(160deg, hsla(195,40%,70%,0.55) 0%, hsla(195,20%,55%,0.35) 100%)',
                    boxShadow: 'inset 0 0 20px hsla(195, 40%, 90%, 0.4)',
                  }}
                />
                <div
                  className="flex-1 rounded-t-sm border-2"
                  style={{
                    borderColor: 'hsl(195, 25%, 35%)',
                    background:
                      'linear-gradient(200deg, hsla(195,40%,70%,0.55) 0%, hsla(195,20%,55%,0.35) 100%)',
                    boxShadow: 'inset 0 0 20px hsla(195, 40%, 90%, 0.4)',
                  }}
                />
              </div>
              <p
                className="absolute left-1/2 bottom-[14%] -translate-x-1/2 text-center font-bold"
                style={{ color: 'hsl(195, 30%, 28%)', fontSize: 13 }}
              >
                Entrada
              </p>
              {/* Arco de seguridad sutil (escena control) */}
              {(escenaId === 'control-seguridad' || escenaId === 'entrada') && (
                <div
                  className="absolute left-1/2 top-[22%] -translate-x-1/2 rounded-t-full border-4 border-b-0"
                  style={{
                    width: '28%',
                    height: '48%',
                    borderColor: 'hsl(195, 28%, 42%)',
                    opacity: escenaId === 'control-seguridad' ? 0.95 : 0.35,
                  }}
                />
              )}
            </div>

            {/* Pared izquierda */}
            <div
              style={faceStyle({
                transform: `rotateY(-90deg) translateZ(-${HALF}px)`,
                background:
                  'linear-gradient(90deg, hsl(195, 12%, 68%) 0%, hsl(198, 14%, 76%) 100%)',
              })}
            >
              {/* Ventanas */}
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="absolute rounded-sm"
                  style={{
                    top: '18%',
                    left: 40 + i * 140,
                    width: 100,
                    height: 140,
                    background:
                      'linear-gradient(180deg, hsla(195, 45%, 85%, 0.9) 0%, hsla(195, 30%, 70%, 0.5) 100%)',
                    border: '3px solid hsl(195, 20%, 45%)',
                    boxShadow: `inset 0 0 ${20 + luz / 4}px hsla(45, 80%, 90%, ${0.2 + luz / 200})`,
                  }}
                />
              ))}
            </div>

            {/* Pared derecha */}
            <div
              style={faceStyle({
                transform: `rotateY(90deg) translateZ(-${HALF}px)`,
                background:
                  'linear-gradient(270deg, hsl(195, 12%, 66%) 0%, hsl(198, 14%, 74%) 100%)',
              })}
            >
              {[0, 1].map((i) => (
                <div
                  key={i}
                  className="absolute rounded-sm"
                  style={{
                    top: '18%',
                    left: 40 + i * 140,
                    width: 100,
                    height: 140,
                    background:
                      'linear-gradient(180deg, hsla(195, 45%, 85%, 0.9) 0%, hsla(195, 30%, 70%, 0.5) 100%)',
                    border: '3px solid hsl(195, 20%, 45%)',
                    boxShadow: `inset 0 0 ${20 + luz / 4}px hsla(45, 80%, 90%, ${0.2 + luz / 200})`,
                  }}
                />
              ))}
            </div>

            {/* Personas de pie en la sala */}
            {posicionesGente.map((p, i) => {
              const visible = i < numGente
              const fuerza =
                i < numGente - 1
                  ? 1
                  : i === numGente - 1
                    ? Math.max(0.25, (gente / 100) * 10 - (numGente - 1))
                    : 0
              return (
                <Personita
                  key={i}
                  x={p.x}
                  z={p.z}
                  scale={p.s}
                  opacity={visible ? 0.55 + fuerza * 0.4 : 0}
                  tono={tonoPersonas}
                />
              )
            })}
          </div>
        </div>

        {/* Velos de luz / ruido (pantalla fija) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'hsl(200, 14%, 20%)',
            opacity: veloOscuro,
            transition: 'opacity 1.2s ease-out',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at 50% 0%, hsla(45, 80%, 92%, 0.55) 0%, transparent 55%)',
            opacity: Math.min(0.85, 0.15 + (luz / 100) * 0.7),
            transition: 'opacity 1.2s ease-out',
          }}
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'hsla(195, 35%, 22%, 1)',
            opacity: veloRuido,
            transition: 'opacity 1.2s ease-out',
          }}
          aria-hidden="true"
        />

        {/* Ondas de sonido en el borde inferior */}
        <div
          className="absolute bottom-2 left-3 right-3 flex items-end gap-0.5 h-6 pointer-events-none z-[2]"
          aria-hidden="true"
        >
          {Array.from({ length: 20 }, (_, i) => {
            const fase = (i / 19) * Math.PI
            const h =
              0.15 +
              (ruido / 100) * (0.4 + 0.4 * Math.abs(Math.sin(fase * 2))) +
              (eco / 100) * (0.2 + 0.3 * Math.abs(Math.cos(fase * 1.5)))
            return (
              <span
                key={i}
                className="flex-1 rounded-full bg-puente-700/50 origin-bottom"
                style={{
                  height: '100%',
                  transform: `scaleY(${Math.min(1, h)})`,
                  opacity: ruido + eco < 2 ? 0.1 : 0.35 + (ruido + eco) / 280,
                  transition: 'transform 1s ease-out, opacity 1s ease-out',
                }}
              />
            )
          })}
        </div>

        {/* Barritas ancladas junto a la zona de entrada (overlay) */}
        <div
          className="absolute left-2 top-2 sm:left-3 sm:top-3 z-[3] pointer-events-auto"
          data-sala-controles
          onPointerDown={(e) => e.stopPropagation()}
        >
          <BarritasEstimulo
            valores={{
              ruido,
              luz,
              gente,
              eco,
            }}
            deshabilitado={deshabilitadoEstimulos || enCalma}
            onChange={onChangeEstimulo}
          />
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
            className="absolute bottom-2 right-3 z-[3] text-[11px] sm:text-xs text-puente-800 bg-white/80 px-2 py-1 rounded-suave pointer-events-none"
            aria-hidden="true"
          >
            Arrastra para girar
          </p>
        )}
      </div>

      {reduced && (
        <p className="text-sm text-puente-700" role="note">
          Vista fija: la rotación está desactivada porque pediste menos movimiento.
          Puedes seguir ajustando los estímulos con el teclado o las barritas.
        </p>
      )}
    </div>
  )
}
