'use client'

import { useId, useState } from 'react'
import {
  INSIGNIAS_UTILES,
  TOTAL_INSIGNIAS,
  textoTooltipMedalla,
  type IdInsigniaUtil,
} from '@/lib/insignias'
import { IconoInsignia } from './IconoInsignia'

interface Props {
  conseguidas: IdInsigniaUtil[]
  className?: string
}

/**
 * Barra calmada: insignias conseguidas / total.
 * Con tooltips reales en hover/focus (no solo title).
 */
export function BarraProgresoInsignias({
  conseguidas,
  className = '',
}: Props) {
  const tituloId = useId()
  const descId = useId()
  const tipBaseId = useId()
  const [tipActivo, setTipActivo] = useState<IdInsigniaUtil | null>(null)
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

      <ul className="flex items-center gap-2 sm:gap-3 list-none p-0 m-0">
        {INSIGNIAS_UTILES.map((ins) => {
          const ok = conseguidas.includes(ins.id)
          const tipId = `${tipBaseId}-${ins.id}`
          const visible = tipActivo === ins.id
          const tipTexto = textoTooltipMedalla(ins)

          return (
            <li key={ins.id} className="flex-1 flex justify-center relative">
              <button
                type="button"
                className="rounded-full p-0.5 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-puente-400"
                aria-label={tipTexto}
                aria-describedby={visible ? tipId : undefined}
                onMouseEnter={() => setTipActivo(ins.id)}
                onMouseLeave={() =>
                  setTipActivo((v) => (v === ins.id ? null : v))
                }
                onFocus={() => setTipActivo(ins.id)}
                onBlur={() => setTipActivo((v) => (v === ins.id ? null : v))}
              >
                <IconoInsignia
                  id={ins.id}
                  desbloqueada={ok}
                  className="w-9 h-9 sm:w-10 sm:h-10"
                />
              </button>
              {visible && (
                <div
                  id={tipId}
                  role="tooltip"
                  className="absolute z-20 left-1/2 -translate-x-1/2 top-full mt-2 w-[min(14rem,70vw)] rounded-suave border border-puente-200 bg-white shadow-md p-2.5 text-xs text-puente-800 pointer-events-none"
                >
                  <p className="font-bold mb-0.5">Medalla: {ins.nombre}</p>
                  <p className="text-puente-700 leading-snug">
                    {ins.comoConseguirla}
                  </p>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
