'use client'

import { useEffect, useId, useRef, useState } from 'react'
import {
  EVENTO_INSIGNIAS,
  TOTAL_INSIGNIAS,
  cargarInsigniasUtiles,
  type IdInsigniaUtil,
} from '@/lib/insignias'
import { PanelInsignias } from './PanelInsignias'

/**
 * Acceso estándar al perfil de medallas: arriba a la derecha en la cabecera.
 * Abre el listado completo de insignias útiles (sin diagnóstico).
 */
export function BotonPerfilInsignias() {
  const [abierto, setAbierto] = useState(false)
  const [conseguidas, setConseguidas] = useState<IdInsigniaUtil[]>([])
  const panelId = useId()
  const tituloId = useId()
  const raizRef = useRef<HTMLDivElement>(null)
  const botonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const sync = () => setConseguidas(cargarInsigniasUtiles())
    sync()
    const onCustom = () => sync()
    const onStorage = (e: StorageEvent) => {
      if (e.key === null || e.key === 'court-insignias-utiles') sync()
    }
    window.addEventListener(EVENTO_INSIGNIAS, onCustom)
    window.addEventListener('storage', onStorage)
    return () => {
      window.removeEventListener(EVENTO_INSIGNIAS, onCustom)
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAbierto(false)
        botonRef.current?.focus()
      }
    }
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const nodo = raizRef.current
      if (!nodo) return
      if (e.target instanceof Node && !nodo.contains(e.target)) {
        setAbierto(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
    }
  }, [abierto])

  const hechas = conseguidas.length

  return (
    <div ref={raizRef} className="relative shrink-0">
      <button
        ref={botonRef}
        type="button"
        className="relative inline-flex items-center justify-center min-h-[44px] min-w-[44px] w-11 h-11 rounded-full border border-court-300 bg-white text-court-900 transition-colors duration-200 hover:bg-court-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-court-400"
        aria-label={`Perfil de medallas: ${hechas} de ${TOTAL_INSIGNIAS} conseguidas`}
        aria-expanded={abierto}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setAbierto((v) => !v)}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-6 h-6"
          fill="none"
          aria-hidden="true"
        >
          <circle
            cx="12"
            cy="8"
            r="3.25"
            stroke="currentColor"
            strokeWidth="1.75"
          />
          <path
            d="M5.5 19.25c1.4-3.1 3.7-4.5 6.5-4.5s5.1 1.4 6.5 4.5"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
        <span
          className="absolute -top-0.5 -right-0.5 min-w-[1.15rem] h-[1.15rem] px-1 rounded-full bg-court-800 text-white text-[10px] font-bold leading-none inline-flex items-center justify-center tabular-nums"
          aria-hidden="true"
        >
          {hechas}
        </span>
      </button>

      {abierto && (
        <div
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={tituloId}
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[60] w-[min(22rem,calc(100vw-1.5rem))] max-h-[min(70vh,32rem)] overflow-y-auto rounded-suave border border-court-200 bg-white shadow-lg p-3"
        >
          <div className="flex items-start justify-between gap-3 mb-2 px-1">
            <div>
              <h2 id={tituloId} className="font-bold text-court-800 text-base m-0">
                Tus medallas
              </h2>
              <p className="text-sm text-court-700 m-0 mt-0.5">
                {hechas} de {TOTAL_INSIGNIAS} · sin ranking ni reloj
              </p>
            </div>
            <button
              type="button"
              className="btn-ghost text-sm px-3 py-2 min-h-[44px]"
              onClick={() => {
                setAbierto(false)
                botonRef.current?.focus()
              }}
            >
              Cerrar
            </button>
          </div>
          <PanelInsignias
            conseguidas={conseguidas}
            titulo="Insignias útiles"
            embebido
          />
        </div>
      )}
    </div>
  )
}
