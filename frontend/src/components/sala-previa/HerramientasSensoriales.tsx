'use client'

import type { IdHerramienta } from '@/lib/perfil/tipos'

interface Props {
  herramientasActivas: IdHerramienta[]
  onToggleHerramienta: (id: IdHerramienta) => void
}

const HERRAMIENTAS: {
  id: IdHerramienta
  icono: string
  nombre: string
  efecto: string
}[] = [
  {
    id: 'cascos',
    icono: '🎧',
    nombre: 'Ponerte cascos',
    efecto: 'Baja el ruido y los murmullos al 50%',
  },
  {
    id: 'gafas-sol',
    icono: '🕶️',
    nombre: 'Gafas de sol',
    efecto: 'Atenúa la intensidad de la luz',
  },
  {
    id: 'objeto-mano',
    icono: '🧸',
    nombre: 'Objeto en la mano',
    efecto: 'Apoyo táctil para regular la tensión',
  },
]

export function HerramientasSensoriales({
  herramientasActivas,
  onToggleHerramienta,
}: Props) {
  return (
    <section
      className="card border-2 border-court-200 bg-white p-3 sm:p-4 space-y-2 shadow-sm"
      aria-label="Herramientas sensoriales de apoyo"
    >
      <div className="flex items-center justify-between gap-2 border-b border-court-100 pb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-court-800">
          Herramientas sensoriales en sala
        </h3>
        <span className="text-[11px] text-court-600">
          Pruébalas en cualquier momento
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {HERRAMIENTAS.map((h) => {
          const activa = herramientasActivas.includes(h.id)
          return (
            <button
              key={h.id}
              type="button"
              onClick={() => onToggleHerramienta(h.id)}
              aria-pressed={activa}
              className={`p-2.5 rounded-suave border-2 text-left transition-colors min-h-[44px] flex items-start gap-2.5 ${
                activa
                  ? 'border-court-600 bg-calma-sage text-court-900 font-semibold ring-2 ring-court-300'
                  : 'border-court-200 hover:border-court-400 bg-white text-court-800'
              }`}
            >
              <span className="text-xl" aria-hidden="true">
                {h.icono}
              </span>
              <div className="min-w-0 flex-1">
                <span className="text-xs font-bold block leading-tight">
                  {activa ? `✓ Quitar ${h.nombre.toLowerCase()}` : h.nombre}
                </span>
                <span className="text-[11px] text-court-600 block mt-0.5 leading-snug">
                  {h.efecto}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </section>
  )
}
