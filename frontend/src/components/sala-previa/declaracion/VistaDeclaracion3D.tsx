'use client'

import dynamic from 'next/dynamic'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
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

function IconoPantallaCompleta({ salir }: { salir?: boolean }) {
  const d = salir ? 'M9 3v6H3M15 3v6h6M9 21v-6H3M15 21v-6h6' : 'M8 3H3v5M16 3h5v5M8 21H3v-5M16 21h5v-5'
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d={d} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

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

interface Props {
  puntoVista: PuntoVista
  objetivo: ObjetivoCamara
  reduced: boolean
  pausa: boolean
  distraccion: Distraccion | null
  /** Respuestas, diálogo y ayudas, dentro de la escena. */
  acciones?: ReactNode
  luz: number
  gente: number
}

export function VistaDeclaracion3D({
  puntoVista,
  objetivo,
  reduced,
  pausa,
  distraccion,
  acciones,
  luz,
  gente,
}: Props) {
  const labelId = useId()
  const fsRootRef = useRef<HTMLDivElement>(null)
  const [enPantallaCompleta, setEnPantallaCompleta] = useState(false)
  const [fsCss, setFsCss] = useState(false)
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

  useEffect(() => {
    const syncFs = () => {
      const el = fsRootRef.current
      const nativo = Boolean(document.fullscreenElement) && document.fullscreenElement === el
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

  const alternarPantallaCompleta = async () => {
    const el = fsRootRef.current
    if (!el) return
    const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> | void }
    const nodo = el as HTMLElement & { webkitRequestFullscreen?: () => Promise<void> | void }
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

  const enFs = enPantallaCompleta || fsCss

  const nombreObjetivo =
    objetivo.destino === 'entrada' ? 'la puerta' : HABLANTES[objetivo.destino].nombre.toLowerCase()

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2">
      <div
        ref={fsRootRef}
        className={`sala-juzgado-fs-root flex min-h-0 flex-1 flex-col ${enFs ? 'is-fullscreen' : ''} ${
          fsCss ? 'sala-juzgado-fs-fallback' : ''
        }`}
      >
      <div className="sala-fs-columna flex min-h-0 flex-1 flex-col gap-2">
      <div
        className={`sala-fs-viewer relative min-h-[280px] flex-1 w-full rounded-tarjeta overflow-hidden border-2 border-court-200 bg-court-100 select-none touch-none ${
          enFs ? 'h-full !rounded-none !border-0' : ''
        } ${reduced ? 'cursor-default' : arrastrando ? 'cursor-grabbing' : 'cursor-grab'}`}
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
          Encima de cada persona está su nombre: juez, letrado de la Administración de Justicia,
          abogada, fiscal, abogado, persona acusada y agente. Ahora miras hacia {nombreObjetivo}.
          {enFs ? ' Pantalla completa activa. Pulsa Escape o el botón para salir.' : ''}
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
        {acciones && (
          <div
            className="absolute bottom-16 inset-x-3 z-[5] max-h-[calc(100%-5.5rem)] overflow-y-auto pointer-events-auto touch-auto"
            data-sala-ui
          >
            {acciones}
          </div>
        )}
        <div className="absolute top-2 right-2 z-[7]" data-sala-ui>
          <button
            type="button"
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
        {!reduced && (
          <p
            className="absolute left-2 top-2 z-[3] text-sm text-court-800 bg-white px-2 py-1 rounded-suave border border-court-200 pointer-events-none"
            aria-hidden="true"
          >
            Arrastra para mirar
          </p>
        )}
      </div>

      {reduced && (
        <div className="sala-fs-miradas flex flex-wrap gap-2" role="group" aria-label="Mirar en la sala" data-sala-ui>
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
        </div>
      )}
      </div>
      </div>
    </div>
  )
}
