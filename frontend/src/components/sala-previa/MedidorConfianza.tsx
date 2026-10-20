'use client'

import { useId } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { EtiquetaConfianza } from '@/lib/confianza'

interface Props {
  score: number
  etiqueta: EtiquetaConfianza
  /** Mensaje positivo breve tras un logro (p. ej. check-in bien). */
  mensaje?: string | null
  onDescartarMensaje?: () => void
  /** Título del bloque. */
  titulo?: string
}

/**
 * Medidor visual de confianza: barra + palabra ("Empezando", "Te ves preparado"…).
 * Accesible con role="meter" y aria-valuetext con la etiqueta en palabras.
 */
export function MedidorConfianza({
  score,
  etiqueta,
  mensaje = null,
  onDescartarMensaje,
  titulo = '¿Cuánto te ves preparado?',
}: Props) {
  const reduced = useReducedMotion()
  const tituloId = useId()
  const ayudaId = useId()
  const valorSeguro = Math.min(100, Math.max(0, Math.round(score)))

  return (
    <section aria-labelledby={tituloId} className="card">
      <h2 id={tituloId} className="font-bold text-puente-800 mb-1">
        {titulo}
      </h2>
      <p id={ayudaId} className="text-sm text-puente-700 mb-4">
        Para el día del juicio. Solo sube con lo que vas haciendo. No baja si
        paras, usas calma o un check-in sale regular o mal.
      </p>

      <div className="space-y-3" aria-describedby={ayudaId}>
        <p className="text-xl font-bold text-puente-800" aria-hidden="true">
          {etiqueta.palabra}
        </p>

        <div
          className="w-full h-3 rounded-full bg-puente-100 overflow-hidden"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={valorSeguro}
          aria-valuetext={etiqueta.palabra}
          aria-label="Confianza para el día del juicio"
        >
          <div
            className="h-full bg-puente-600 rounded-full"
            style={{
              width: `${valorSeguro}%`,
              transition: reduced ? 'none' : 'width 1s ease-out',
            }}
          />
        </div>

        <p className="text-sm text-puente-700">{etiqueta.detalle}</p>
      </div>

      {mensaje && (
        <div
          className="mt-4 flex items-start gap-3 bg-calma-sage/80 border border-accent-success/40 rounded-suave p-3"
          role="status"
          aria-live="polite"
        >
          <p className="flex-1 text-puente-900 text-sm min-w-0">{mensaje}</p>
          {onDescartarMensaje && (
            <button
              type="button"
              className="btn-ghost shrink-0 min-h-[44px] min-w-[44px] px-3 py-2 text-sm"
              onClick={onDescartarMensaje}
              aria-label="Cerrar mensaje"
            >
              Cerrar
            </button>
          )}
        </div>
      )}
    </section>
  )
}
