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
 * Perfil de medallas tipo videojuego: columna sticky que acompaña el scroll.
 * Tooltip real (panel visible) en hover y focus: «Medalla: {nombre}. {como…}».
 */
export function PerfilMedallasSticky({ conseguidas, className = '' }: Props) {
  const tituloId = useId()
  const descId = useId()
  const tipBaseId = useId()
  const [tipActivo, setTipActivo] = useState<IdInsigniaUtil | null>(null)

  const total = TOTAL_INSIGNIAS
  const hechas = conseguidas.length
  const pct = total === 0 ? 0 : Math.round((hechas / total) * 100)

  return (
    <aside
      aria-labelledby={tituloId}
      className={`lg:sticky lg:top-4 self-start z-10 ${className}`}
    >
      <section className="rounded-suave border-2 border-puente-200 bg-white/95 backdrop-blur-sm p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <h2 id={tituloId} className="font-bold text-puente-800 text-base m-0">
            Tus medallas
          </h2>
          <p
            id={descId}
            className="text-sm text-puente-700 tabular-nums m-0"
            aria-live="polite"
          >
            {hechas} de {total}
          </p>
        </div>

        <div
          className="h-2.5 rounded-full bg-puente-100 overflow-hidden mb-4"
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

        <p className="text-xs text-puente-700 mb-3 leading-snug">
          Premian cuidarte y practicar a tu ritmo. Pasa el ratón o el foco para
          ver cómo conseguir cada una.
        </p>

        <ul className="grid grid-cols-1 gap-2 list-none p-0 m-0">
          {INSIGNIAS_UTILES.map((ins) => {
            const ok = conseguidas.includes(ins.id)
            const tipId = `${tipBaseId}-${ins.id}`
            const visible = tipActivo === ins.id
            const tipTexto = textoTooltipMedalla(ins)

            return (
              <li key={ins.id} className="relative">
                <button
                  type="button"
                  className={`group flex items-center gap-3 w-full p-2 rounded-suave border-2 text-left transition-[border-color,background-color] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-puente-400 ${
                    ok
                      ? 'bg-calma-sage/70 border-accent-success/50 hover:border-puente-500'
                      : 'bg-puente-50/90 border-puente-100 hover:border-puente-300'
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
                    className="w-11 h-11 shrink-0"
                  />
                  <span className="min-w-0 flex-1">
                    <span
                      className={`block text-sm font-bold leading-tight ${
                        ok ? 'text-puente-800' : 'text-puente-600'
                      }`}
                    >
                      {ins.nombre}
                    </span>
                    <span className="block text-[11px] text-puente-700 mt-0.5">
                      {ok ? 'Conseguida' : 'Por conseguir'}
                    </span>
                  </span>
                </button>

                {visible && (
                  <div
                    id={tipId}
                    role="tooltip"
                    className="absolute z-30 left-0 right-0 top-full mt-1 rounded-suave border border-puente-200 bg-white shadow-md p-3 text-sm text-puente-800 pointer-events-none"
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
      </section>
    </aside>
  )
}
