'use client'

import { useId } from 'react'
import {
  INSIGNIAS_UTILES,
  TOTAL_INSIGNIAS,
  type IdInsigniaUtil,
} from '@/lib/insignias'
import { IconoInsignia } from './IconoInsignia'

interface Props {
  conseguidas: IdInsigniaUtil[]
  className?: string
}

/**
 * Barra calmada: insignias conseguidas / total.
 * Sin ranking ni presión; solo orienta el progreso suave.
 */
export function BarraProgresoInsignias({
  conseguidas,
  className = '',
}: Props) {
  const tituloId = useId()
  const descId = useId()
  const total = TOTAL_INSIGNIAS
  const hechas = conseguidas.length
  const pct = total === 0 ? 0 : Math.round((hechas / total) * 100)

  return (
    <section
      aria-labelledby={tituloId}
      aria-describedby={descId}
      className={`rounded-suave border border-puente-200 bg-white/85 backdrop-blur-sm p-4 shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <h2 id={tituloId} className="font-bold text-puente-800 text-base m-0">
          Tus medallas
        </h2>
        <p
          id={descId}
          className="text-sm text-puente-700 tabular-nums m-0"
          aria-live="polite"
        >
          {hechas} de {total}
          {hechas === total && total > 0 ? ' · Todas conseguidas' : ''}
        </p>
      </div>

      <div
        className="h-3 rounded-full bg-puente-100 overflow-hidden mb-3"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={hechas}
        aria-valuetext={`${hechas} de ${total} medallas`}
        aria-labelledby={tituloId}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-puente-500 to-accent-success origin-left transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="flex items-center gap-2 sm:gap-3" aria-hidden="true">
        {INSIGNIAS_UTILES.map((ins) => {
          const ok = conseguidas.includes(ins.id)
          return (
            <li key={ins.id} className="flex-1 flex justify-center">
              <IconoInsignia
                id={ins.id}
                desbloqueada={ok}
                className="w-9 h-9 sm:w-10 sm:h-10"
              />
            </li>
          )
        })}
      </ul>
    </section>
  )
}
