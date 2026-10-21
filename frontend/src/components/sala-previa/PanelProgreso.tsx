'use client'

import { Icono } from '@/components/Icono'
import { INSIGNIAS } from '@/lib/sala-previa/niveles'
import type { ProgresoSala } from '@/lib/sala-previa/tipos'
import { PanelDiasPractica } from '@/components/practica/PanelDiasPractica'
import type { DiaSemana } from '@/lib/practica'

interface Props {
  progreso: ProgresoSala
  mensaje?: string | null
  /** Vista amable de días (compartida con Ensaya). */
  semana?: DiaSemana[]
  totalDias?: number
  diasEstaSemana?: number
  bienvenida?: string | null
  onDescartarBienvenida?: () => void
}

/**
 * Progreso de Sala Previa: días de práctica (sin castigo) + insignias locales.
 * La racha antigua de días seguidos se sustituyó por el conteo amable.
 */
export function PanelProgreso({
  progreso,
  mensaje,
  semana = [],
  totalDias = 0,
  diasEstaSemana = 0,
  bienvenida = null,
  onDescartarBienvenida,
}: Props) {
  return (
    <aside className="space-y-5" aria-label="Tu progreso">
      <PanelDiasPractica
        semana={semana}
        total={totalDias}
        estaSemana={diasEstaSemana}
        bienvenida={bienvenida}
        onDescartarBienvenida={onDescartarBienvenida}
      />

      <div className="card space-y-3">
        <h2 className="font-bold text-puente-800">Insignias de la sala</h2>
        <ul className="space-y-2">
          {INSIGNIAS.map((ins) => {
            const conseguida = progreso.insignias.includes(ins.id)
            return (
              <li
                key={ins.id}
                className={`flex items-start gap-3 p-3 rounded-suave ${
                  conseguida ? 'bg-calma-sage' : 'bg-white border border-puente-200'
                }`}
              >
                <Icono
                  nombre={conseguida ? '★' : '○'}
                  className={`mt-0.5 h-5 w-5 ${conseguida ? 'text-puente-900' : 'text-puente-400'}`}
                />
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
        <p
          className="bg-accent-success/15 border border-accent-success rounded-lg p-3 text-puente-800"
          role="status"
          aria-live="polite"
        >
          {mensaje}
        </p>
      )}
    </aside>
  )
}
