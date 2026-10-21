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
 * Fila compacta de medallas (cuadraditos) arriba a la izquierda.
 * Desbloqueadas a color; bloqueadas en gris. Tooltip en hover/focus.
 */
export function PerfilMedallasSticky({ conseguidas, className = '' }: Props) {
  const tituloId = useId()
  const tipBaseId = useId()
  const [tipActivo, setTipActivo] = useState<IdInsigniaUtil | null>(null)

  const total = TOTAL_INSIGNIAS
  const hechas = conseguidas.length
  const pct = total === 0 ? 0 : Math.round((hechas / total) * 100)

  return (
    <section
      aria-labelledby={tituloId}
      className={`rounded-suave border border-puente-200 bg-white/95 backdrop-blur-sm px-3 py-2.5 shadow-sm ${className}`}
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <div className="flex items-center gap-2 min-w-0">
          <h2
            id={tituloId}
            className="font-bold text-puente-800 text-sm m-0 whitespace-nowrap"
          >
            Tus medallas
          </h2>
          <p
            className="text-xs text-puente-700 tabular-nums m-0 whitespace-nowrap"
            aria-live="polite"
          >
            {hechas} de {total}
          </p>
          <div
            className="hidden sm:block w-16 h-1.5 rounded-full bg-puente-100 overflow-hidden"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={total}
            aria-valuenow={hechas}
            aria-valuetext={`${hechas} de ${total} medallas`}
            aria-labelledby={tituloId}
          >
            <div
              className="h-full rounded-full bg-puente-600 origin-left transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <ul className="flex flex-wrap gap-1.5 list-none p-0 m-0">
          {INSIGNIAS_UTILES.map((ins) => {
            const ok = conseguidas.includes(ins.id)
            const tipId = `${tipBaseId}-${ins.id}`
            const visible = tipActivo === ins.id
            const tipTexto = textoTooltipMedalla(ins)

            return (
              <li key={ins.id} className="relative">
                <button
                  type="button"
                  className={`flex items-center justify-center w-11 h-11 sm:w-10 sm:h-10 rounded-suave border-2 transition-[border-color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-puente-400 ${
                    ok
                      ? 'bg-calma-sage/80 border-accent-success/55 hover:border-puente-500'
                      : 'bg-puente-50 border-puente-100 hover:border-puente-300'
                  }`}
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
                    className="w-7 h-7"
                  />
                  <span className="sr-only">
                    {ok ? 'Conseguida' : 'Por conseguir'}
                  </span>
                </button>

                {visible && (
                  <div
                    id={tipId}
                    role="tooltip"
                    className="absolute z-30 left-0 top-full mt-1.5 w-[min(16rem,70vw)] rounded-suave border border-puente-200 bg-white shadow-md p-3 text-sm text-puente-800 pointer-events-none"
                  >
                    <p className="font-bold text-puente-800 mb-1 leading-snug">
                      Medalla: {ins.nombre}
                    </p>
                    <p className="text-puente-700 leading-snug">
                      {ins.comoConseguirla}
                    </p>
                    {ok && (
                      <p className="text-puente-700 leading-snug mt-1.5 text-xs">
                        {ins.porQueImporta}
                      </p>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
