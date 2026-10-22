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
import type { Distraccion } from '@/lib/sala-previa/distracciones'
import {
  HABLANTES,
  PUNTOS_VISTA,
  enfoqueDe,
  miradaTurno,
  papelDePuntoVista,
  type Hablante,
  type PuntoVista,
} from '@/lib/sala-previa/declaracion'
import { PITCH_MAX, wrapDeg, type MiradaSala, type MiradaTarget } from '@/lib/sala-previa/salaVistasConfig'

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

export interface ObjetivoCamara {
  id: number
  destino: Hablante | 'entrada'
}

export interface RotuloEnfoque {
  quien: string
  texto: string
}

interface Props {
  puntoVista: PuntoVista
  objetivo: ObjetivoCamara
  reduced: boolean
  pausa: boolean
  distraccion: Distraccion | null
  /** Quién habla y la frase actual, encima de la sala enfocada. */
  rotulo: RotuloEnfoque | null
  luz: number
  gente: number
}

export function VistaDeclaracion3D({
  puntoVista,
  objetivo,
  reduced,
  pausa,
  distraccion,
  rotulo,
  luz,
  gente,
}: Props) {
  const labelId = useId()
  const inicial = miradaTurno(puntoVista, 'jueza')
  const [yaw, setYaw] = useState(inicial.yaw)
  const [pitch, setPitch] = useState(inicial.pitch)
  const [destino, setDestino] = useState<MiradaTarget | null>(null)
  const [animando, setAnimando] = useState(false)
  const [enfoque, setEnfoque] = useState<MiradaSala | null>('juez')
  const [arrastrando, setArrastrando] = useState(false)
  const arrastre = useRef<{ x: number; y: number; yaw: number; pitch: number } | null>(null)

  const mirar = useCallback(
    (hacia: Hablante | 'entrada') => {
      const t = miradaTurno(puntoVista, hacia)
      setEnfoque(enfoqueDe(hacia))
      if (reduced) {
        setYaw(t.yaw)
        setPitch(t.pitch)
        setAnimando(false)
        setDestino(null)
        return
      }
      setDestino(t)
      setAnimando(true)
    },
    [puntoVista, reduced]
  )

  useEffect(() => {
    mirar(objetivo.destino)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- un giro por objetivo nuevo
  }, [objetivo.id])

  const onAnimFin = useCallback((y: number, p: number) => {
    setYaw(y)
    setPitch(p)
    setAnimando(false)
    setDestino(null)
  }, [])

  const onPointerDown = (e: ReactPointerEvent) => {
    if (reduced || animando) return
    if ((e.target as HTMLElement).closest('[data-sala-ui]')) return
    ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    arrastre.current = { x: e.clientX, y: e.clientY, yaw, pitch }
    setArrastrando(true)
    setEnfoque(null)
  }

  const onPointerMove = (e: ReactPointerEvent) => {
    const a = arrastre.current
    if (!a) return
    setYaw(wrapDeg(a.yaw - (e.clientX - a.x) * 0.28))
    setPitch(Math.max(-PITCH_MAX, Math.min(PITCH_MAX, a.pitch + (e.clientY - a.y) * 0.18)))
  }

  const finArrastre = () => {
    arrastre.current = null
    setArrastrando(false)
  }

  const nombreObjetivo =
    objetivo.destino === 'entrada' ? 'la puerta' : HABLANTES[objetivo.destino].nombre.toLowerCase()

  return (
    <div className="space-y-2">
      <div
        className={`relative h-[calc(100dvh-9rem)] min-h-[320px] w-full rounded-tarjeta overflow-hidden border-2 border-court-200 bg-court-100 select-none touch-none ${
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
          Sala de vistas en 3D, en primera persona. {PUNTOS_VISTA[puntoVista].dondeEstas}{' '}
          Encima de cada persona está su nombre: juez, abogada, fiscal, abogado, persona acusada
          y agente. Ahora miras hacia {nombreObjetivo}.
        </p>
        <SalaVistas3D
          yaw={yaw}
          pitch={pitch}
          luz={pausa ? 12 : luz}
          gente={pausa ? 0 : gente}
          enfoque={enfoque}
          animando={animando}
          destino={destino}
          onAnimFin={onAnimFin}
          reduced={reduced}
          arrastrando={arrastrando}
          papel={papelDePuntoVista(puntoVista)}
          distraccion={pausa ? null : distraccion}
          enCalma={pausa}
        />
        {rotulo && (
          <div
            className="absolute bottom-0 inset-x-0 z-[4] px-4 py-3 bg-court-900/95 text-white pointer-events-none"
            aria-hidden="true"
          >
            <p className="text-sm font-bold text-court-100">Miras a {rotulo.quien}</p>
            <p className="text-base sm:text-lg leading-snug line-clamp-4">{rotulo.texto}</p>
          </div>
        )}
        {!reduced && (
          <p
            className={`absolute right-2 z-[3] text-sm text-court-800 bg-white px-2 py-1 rounded-suave border border-court-200 pointer-events-none ${
              rotulo ? 'top-2' : 'bottom-2'
            }`}
            aria-hidden="true"
          >
            Arrastra para mirar
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Mirar en la sala" data-sala-ui>
        <button
          type="button"
          className="btn-secondary text-sm min-h-[44px] py-2"
          onClick={() => mirar(objetivo.destino)}
        >
          Mirar a quien habla
        </button>
        <button
          type="button"
          className="btn-ghost text-sm min-h-[44px] py-2 border border-court-200"
          onClick={() => mirar('jueza')}
        >
          Mirar a la jueza
        </button>
        {reduced && (
          <>
            <button
              type="button"
              className="btn-ghost text-sm min-h-[44px] py-2 border border-court-200"
              onClick={() => {
                setEnfoque(null)
                setYaw((y) => wrapDeg(y + 35))
              }}
            >
              Mirar izquierda
            </button>
            <button
              type="button"
              className="btn-ghost text-sm min-h-[44px] py-2 border border-court-200"
              onClick={() => {
                setEnfoque(null)
                setYaw((y) => wrapDeg(y - 35))
              }}
            >
              Mirar derecha
            </button>
          </>
        )}
      </div>
    </div>
  )
}
