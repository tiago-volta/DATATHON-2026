'use client'

import type { InsigniaUtil } from '@/lib/insignias'
import { Icono } from '@/components/Icono'
import { IconoInsignia } from './IconoInsignia'

interface Props {
  insignia: InsigniaUtil | null
  onDescartar: () => void
}

/**
 * Toast en forma de medalla al ganar una insignia.
 * Sin confeti ni sonido. Anunciado con aria-live polite; descartable.
 */
export function AvisoInsignia({ insignia, onDescartar }: Props) {
  if (!insignia) return null

  return (
    <div
      className="fixed bottom-24 left-4 right-4 z-[70] flex justify-center pointer-events-none px-2"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="pointer-events-auto max-w-md w-full flex items-center gap-4 rounded-tarjeta border-2 border-puente-900 bg-white p-4 text-puente-900 shadow-sm">
        <span
          className="shrink-0 relative flex items-center justify-center"
          aria-hidden="true"
        >
          <IconoInsignia
            id={insignia.id}
            desbloqueada
            className="w-14 h-14 relative"
          />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-puente-600 mb-0.5">
            Nueva medalla
          </p>
          <p className="font-bold text-puente-800 text-lg leading-tight">
            {insignia.nombre}
          </p>
          <p className="text-sm text-puente-700 mt-1">{insignia.porQueImporta}</p>
        </div>
        <button
          type="button"
          onClick={onDescartar}
          className="shrink-0 min-h-[44px] min-w-[44px] rounded-suave text-puente-700 hover:bg-puente-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-puente-400"
          aria-label="Cerrar aviso de insignia"
        >
          <Icono nombre="✕" />
        </button>
      </div>
    </div>
  )
}
