'use client'

import { useId } from 'react'
import { INSIGNIAS_UTILES, type IdInsigniaUtil } from '@/lib/insignias'
import { IconoInsignia } from './IconoInsignia'

interface Props {
  conseguidas: IdInsigniaUtil[]
  /** Título opcional del panel. */
  titulo?: string
}

/**
 * Lista clara de insignias útiles (conseguidas y pendientes).
 * Pensado para ir junto al mapa de niveles u otras zonas tranquilas.
 */
export function PanelInsignias({
  conseguidas,
  titulo = 'Insignias útiles',
}: Props) {
  const tituloId = useId()
  const ayudaId = useId()

  return (
    <section aria-labelledby={tituloId} className="card">
      <h2 id={tituloId} className="font-bold text-puente-800 mb-1">
        {titulo}
      </h2>
      <p id={ayudaId} className="text-sm text-puente-700 mb-4">
        Premian cuidarte y practicar a tu ritmo. No hay ranking ni reloj.
      </p>

      <ul className="space-y-2" aria-describedby={ayudaId}>
        {INSIGNIAS_UTILES.map((ins) => {
          const conseguida = conseguidas.includes(ins.id)
          return (
            <li
              key={ins.id}
              className={`flex items-start gap-3 p-3 rounded-suave border ${
                conseguida
                  ? 'bg-calma-sage/80 border-accent-success/40'
                  : 'bg-puente-50/80 border-puente-100 opacity-70'
              }`}
            >
              <span
                className={`shrink-0 mt-0.5 ${
                  conseguida ? 'text-puente-800' : 'text-puente-500'
                }`}
                aria-hidden="true"
              >
                <IconoInsignia id={ins.id} className="w-8 h-8" />
              </span>
              <span className="min-w-0">
                <span className="font-bold text-puente-800 block">{ins.nombre}</span>
                <span className="text-sm text-puente-700">{ins.porQueImporta}</span>
                <span className="sr-only">
                  {conseguida ? 'Conseguida' : 'Aún no conseguida'}
                </span>
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
