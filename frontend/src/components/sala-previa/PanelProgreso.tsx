'use client'

import { INSIGNIAS } from '@/lib/sala-previa/niveles'
import type { ProgresoSala } from '@/lib/sala-previa/tipos'

interface Props {
  progreso: ProgresoSala
  mensaje?: string | null
}

export function PanelProgreso({ progreso, mensaje }: Props) {
  return (
    <aside className="card space-y-5" aria-label="Tu progreso">
      <div>
        <h2 className="font-bold text-puente-800 mb-2">Confianza</h2>
        <div
          className="w-full h-3 rounded-full bg-puente-100 overflow-hidden"
          role="meter"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progreso.confianza}
          aria-label="Nivel de confianza"
        >
          <div
            className="h-full bg-puente-600 rounded-full"
            style={{
              width: `${progreso.confianza}%`,
              transition: 'width 1.2s ease-out',
            }}
          />
        </div>
        <p className="text-sm text-puente-600 mt-2">
          {progreso.confianza} de 100. Sube al practicar a tu ritmo.
        </p>
      </div>

      <div>
        <h2 className="font-bold text-puente-800 mb-2">Racha de práctica</h2>
        <p className="text-puente-700">
          {progreso.racha === 0
            ? 'Aún no hay racha. Hoy cuenta como el primer día.'
            : `${progreso.racha} día${progreso.racha === 1 ? '' : 's'} seguido${progreso.racha === 1 ? '' : 's'}.`}
        </p>
      </div>

      <div>
        <h2 className="font-bold text-puente-800 mb-3">Insignias</h2>
        <ul className="space-y-2">
          {INSIGNIAS.map((ins) => {
            const conseguida = progreso.insignias.includes(ins.id)
            return (
              <li
                key={ins.id}
                className={`flex items-start gap-3 p-3 rounded-lg ${
                  conseguida ? 'bg-calma-sage' : 'bg-puente-50 opacity-60'
                }`}
              >
                <span className="font-bold text-puente-700" aria-hidden="true">
                  {conseguida ? '★' : '○'}
                </span>
                <span>
                  <span className="font-bold text-puente-800 block">{ins.nombre}</span>
                  <span className="text-sm text-puente-600">{ins.descripcion}</span>
                  <span className="sr-only">
                    {conseguida ? 'Conseguida' : 'Aún no conseguida'}
                  </span>
                </span>
              </li>
            )
          })}
        </ul>
      </div>

      {mensaje && (
        <p className="bg-accent-success/15 border border-accent-success rounded-lg p-3 text-puente-800" role="status" aria-live="polite">
          {mensaje}
        </p>
      )}
    </aside>
  )
}
