'use client'

import { NIVELES } from '@/lib/sala-previa/niveles'

interface Props {
  nivelActual: number
  nivelMaximo: number
  onSeleccionar: (nivel: number) => void
}

export function MapaNiveles({ nivelActual, nivelMaximo, onSeleccionar }: Props) {
  return (
    <nav aria-label="Mapa de niveles de la sala" className="card">
      <h2 className="font-bold text-puente-800 mb-4">Niveles de estímulo</h2>
      <ol className="flex flex-col gap-3">
        {NIVELES.map((nivel) => {
          const alcanzable = nivel.id <= nivelMaximo + 1
          const visitado = nivel.id <= nivelMaximo
          const actual = nivel.id === nivelActual

          return (
            <li key={nivel.id}>
              <button
                type="button"
                onClick={() => onSeleccionar(nivel.id)}
                disabled={!alcanzable}
                className={`w-full text-left flex items-center gap-3 p-3 min-h-[56px] rounded-suave border-2 ${
                  actual
                    ? 'border-puente-500 bg-puente-50'
                    : visitado
                      ? 'border-puente-200 bg-white hover:border-puente-300'
                      : 'border-puente-100 bg-calma-cream text-puente-600'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                style={{ transition: 'border-color 200ms ease-out, background-color 200ms ease-out' }}
                aria-current={actual ? 'step' : undefined}
              >
                <span
                  className={`paso-indicador shrink-0 w-10 h-10 text-base ${
                    actual ? 'bg-puente-600 text-white' : visitado ? 'bg-accent-success/30 text-puente-800' : ''
                  }`}
                  aria-hidden="true"
                >
                  {visitado && !actual ? '✓' : nivel.id}
                </span>
                <span>
                  <span className="font-bold block text-puente-800">{nivel.nombre}</span>
                  <span className="text-sm text-puente-600">{nivel.descripcion}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
      <p className="text-sm text-puente-700 mt-4">
        Solo avanzas cuando tú quieras. No hay límite de tiempo.
      </p>
    </nav>
  )
}
