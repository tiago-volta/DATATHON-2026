'use client'

import { useState } from 'react'
import { useModoVoz } from '@/hooks/useModoVoz'
import {
  MENSAJE_MIC_DENEGADO,
  pedirPermisoMicrofono,
} from '@/lib/voz/reconocimiento'

/**
 * Indicador discreto en cabecera: «Modo con voz activo» + desactivar.
 * Al activar, pide permiso de micrófono de forma clara.
 */
export function IndicadorModoVoz() {
  const { listo, activo, desactivar, activar } = useModoVoz()
  const [aviso, setAviso] = useState('')

  if (!listo) return null

  if (!activo) {
    return (
      <span className="inline-flex flex-col items-end gap-1 shrink-0">
        <button
          type="button"
          onClick={() => {
            void (async () => {
              const perm = await pedirPermisoMicrofono()
              if (perm === 'denegado') {
                setAviso(MENSAJE_MIC_DENEGADO)
                // Sigue usable con botones / teclado / lector.
                activar()
                return
              }
              setAviso('')
              activar()
            })()
          }}
          className="text-sm font-bold text-puente-700 underline underline-offset-4 hover:text-puente-600"
          title="Activa el Modo con voz para pedir cosas en voz alta"
        >
          Modo con voz
        </button>
        {aviso && (
          <span className="text-xs text-puente-700 max-w-[14rem] text-right" role="status">
            {aviso}
          </span>
        )}
      </span>
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
