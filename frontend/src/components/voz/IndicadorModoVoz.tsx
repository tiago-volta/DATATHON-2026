'use client'

import { useModoVoz } from '@/hooks/useModoVoz'

/**
 * Indicador discreto en cabecera: «Modo con voz activo» + desactivar.
 */
export function IndicadorModoVoz() {
  const { listo, activo, desactivar, activar } = useModoVoz()

  if (!listo) return null

  if (!activo) {
    return (
      <button
        type="button"
        onClick={activar}
        className="text-sm font-bold text-puente-700 underline underline-offset-4 hover:text-puente-600 shrink-0"
        title="Activa el Modo con voz para pedir cosas en voz alta"
      >
        Modo con voz
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <span
        className="inline-flex items-center gap-2 text-sm font-bold text-puente-800 bg-puente-100 border border-puente-300 rounded-suave px-3 py-1"
        role="status"
        aria-live="polite"
      >
        <span
          className="w-2 h-2 rounded-full bg-puente-600"
          aria-hidden="true"
        />
        Modo con voz activo
      </span>
      <button
        type="button"
        onClick={desactivar}
        className="text-sm font-bold text-puente-700 underline underline-offset-4 hover:text-puente-600"
      >
        Desactivar
      </button>
    </div>
  )
}
