'use client'

import { useId, useState } from 'react'
import {
  INSIGNIAS_UTILES,
  textoTooltipMedalla,
  type IdInsigniaUtil,
} from '@/lib/insignias'
import { IconoInsignia } from './IconoInsignia'

interface Props {
  conseguidas: IdInsigniaUtil[]
  /** Título opcional del panel. */
  titulo?: string
}

/**
 * Galería de medallas: desbloqueadas a color; bloqueadas en gris.
 * Hover y focus muestran «Medalla: {nombre}. {comoConseguirla}».
 */
export function PanelInsignias({
  conseguidas,
  titulo = 'Insignias útiles',
}: Props) {
  const tituloId = useId()
  const ayudaId = useId()
  const tipBaseId = useId()
  const [tipActivo, setTipActivo] = useState<IdInsigniaUtil | null>(null)

  return (
    <section aria-labelledby={tituloId} className="card">
      <h2 id={tituloId} className="font-bold text-puente-800 mb-1">
        {titulo}
      </h2>
      <p id={ayudaId} className="text-sm text-puente-700 mb-4">
        Premian cuidarte y practicar a tu ritmo. No hay ranking ni reloj.
      </p>

      <ul className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-3" aria-describedby={ayudaId}>
        {INSIGNIAS_UTILES.map((ins) => {
          const conseguida = conseguidas.includes(ins.id)
          const tipId = `${tipBaseId}-${ins.id}`
          const visible = tipActivo === ins.id
          const tipTexto = textoTooltipMedalla(ins)

          return (
            <li key={ins.id} className="relative flex flex-col items-center">
              <button
                type="button"
                className={`group flex flex-col items-center gap-2 w-full p-2 rounded-suave border-2 transition-[border-color,background-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-puente-400 ${
                  conseguida
                    ? 'bg-calma-sage/70 border-accent-success/50 hover:border-puente-500'
                    : 'bg-puente-50/90 border-puente-100 hover:border-puente-300'
                }`}
                aria-label={tipTexto}
                aria-describedby={visible ? tipId : undefined}
                onMouseEnter={() => setTipActivo(ins.id)}
                onMouseLeave={() => setTipActivo((v) => (v === ins.id ? null : v))}
                onFocus={() => setTipActivo(ins.id)}
                onBlur={() => setTipActivo((v) => (v === ins.id ? null : v))}
              >
                <IconoInsignia
                  id={ins.id}
                  desbloqueada={conseguida}
                  className="w-14 h-14 sm:w-16 sm:h-16"
                />
                <span
                  className={`text-xs sm:text-sm font-bold text-center leading-tight ${
                    conseguida ? 'text-puente-800' : 'text-puente-600'
                  }`}
                >
                  {ins.nombre}
                </span>
                <span className="sr-only">
                  {conseguida ? 'Conseguida' : 'Aún no conseguida'}
                </span>
              </button>

              {visible && (
                <div
                  id={tipId}
                  role="tooltip"
                  className="absolute z-20 left-1/2 -translate-x-1/2 top-full mt-2 w-[min(16rem,70vw)] rounded-suave border border-puente-200 bg-white shadow-sm p-3 text-sm text-puente-800 pointer-events-none"
                >
                  <p className="font-bold text-puente-800 mb-1">
                    Medalla: {ins.nombre}
                  </p>
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
