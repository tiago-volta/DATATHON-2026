'use client'

import type { InsigniaUtil } from '@/lib/insignias'
import { Icono } from '@/components/Icono'
import { IconoInsignia } from './IconoInsignia'

interface Props {
  insignia: InsigniaUtil | null
  onDescartar: () => void
}

/**
 * Toast fijo arriba a la derecha al ganar una insignia.
 * Sin confeti. aria-live polite; descartable.
 * El sonido lo dispara useInsigniasUtiles al desbloquear.
 */
export function AvisoInsignia({ insignia, onDescartar }: Props) {
  if (!insignia) return null

  return (
    <div
      className="fixed top-4 right-4 z-[70] w-[min(22rem,calc(100vw-2rem))] pointer-events-none"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="pointer-events-auto flex items-start gap-3 rounded-tarjeta border-2 border-court-900 bg-white p-3.5 text-court-900 shadow-sm">
        <span
          className="shrink-0 relative flex items-center justify-center mt-0.5"
          aria-hidden="true"
        >
          <IconoInsignia
            id={insignia.id}
            desbloqueada
            className="w-12 h-12 relative"
          />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wide text-court-600 mb-0.5">
            Nueva medalla
          </p>
          <p className="font-bold text-court-800 text-base leading-tight">
            {insignia.nombre}
          </p>
          <p className="text-sm text-court-700 mt-1 leading-snug">
            {insignia.porQueImporta}
          </p>
        </div>
        <button
          type="button"
          onClick={onDescartar}
          className="shrink-0 min-h-[44px] min-w-[44px] -mt-1 -mr-1 rounded-suave text-court-700 hover:bg-court-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-court-400"
          aria-label="Cerrar aviso de insignia"
        >
          <Icono nombre="✕" />
        </button>
      </div>
    </div>
  )
}
