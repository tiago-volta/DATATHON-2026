'use client'

import type { InsigniaUtil } from '@/lib/insignias'
import { IconoInsignia } from './IconoInsignia'

interface Props {
  insignia: InsigniaUtil | null
  onDescartar: () => void
}

/**
 * Toast discreto al ganar una insignia. Sin confeti ni sonido.
 * Anunciado con aria-live polite; descartable.
 */
export function AvisoInsignia({ insignia, onDescartar }: Props) {
  if (!insignia) return null

  return (
    <div
      className="fixed top-4 left-4 right-4 z-[70] flex justify-center pointer-events-none px-2"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="pointer-events-auto max-w-md w-full flex items-start gap-3 rounded-suave border-2 border-puente-300 bg-white shadow-md p-4 text-puente-900">
        <span className="shrink-0 text-puente-700 mt-0.5" aria-hidden="true">
          <IconoInsignia id={insignia.id} className="w-9 h-9" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-puente-800">
            Nueva insignia: {insignia.nombre}
          </p>
          <p className="text-sm text-puente-700 mt-1">{insignia.porQueImporta}</p>
        </div>
        <button
          type="button"
          onClick={onDescartar}
          className="shrink-0 min-h-[44px] min-w-[44px] rounded-suave text-puente-700 hover:bg-puente-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-puente-400"
          aria-label="Cerrar aviso de insignia"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
