'use client'

import { ESTIMULOS_META } from '@/lib/sala-previa/niveles'
import type { IdEstimulo, ValoresEstimulo } from '@/lib/sala-previa/tipos'

const ORDEN: IdEstimulo[] = ['ruido', 'luz', 'gente', 'eco']

function nivelPalabra(valor: number): 'Bajo' | 'Medio' | 'Alto' {
  if (valor < 34) return 'Bajo'
  if (valor < 67) return 'Medio'
  return 'Alto'
}

interface Props {
  valores: ValoresEstimulo
  deshabilitado?: boolean
  /** Si se pasa, las barritas también ajustan el estímulo (teclado incluido). */
  onChange?: (id: IdEstimulo, valor: number) => void
  className?: string
}

/**
 * Panel compacto de los 4 estímulos, a la izquierda del viewer 360
 * (fuera del canvas). Los controles largos de ControlesEstimulo siguen abajo.
 */
export function BarritasEstimulo({
  valores,
  deshabilitado,
  onChange,
  className = '',
}: Props) {
  return (
    <div
      className={`rounded-suave border-2 border-puente-200 bg-white shadow-sm p-3 w-[11.5rem] sm:w-[12.5rem] ${className}`}
      role="group"
      aria-label="Niveles de estímulo de la escena"
    >
      <p className="text-xs font-bold text-puente-800 mb-2 leading-tight">
        En la entrada
      </p>
      <ul className="space-y-2.5 list-none p-0 m-0">
        {ORDEN.map((id) => {
          const meta = ESTIMULOS_META[id]
          const valor = Math.min(100, Math.max(0, Math.round(valores[id] || 0)))
          const palabras = nivelPalabra(valor)
          const inputId = `barra-entrada-${id}`
          const editable = Boolean(onChange) && !deshabilitado

          return (
            <li key={id}>
              <div className="flex items-baseline justify-between gap-1 mb-0.5">
                <label
                  htmlFor={inputId}
                  className="text-xs font-bold text-puente-800 cursor-pointer"
                >
                  {meta.etiqueta}
                </label>
                <span className="text-[11px] font-bold text-puente-700 tabular-nums">
                  {palabras}
                </span>
              </div>
              <div className="h-2 rounded-full bg-puente-100 overflow-hidden mb-1">
                <div
                  className="h-full rounded-full bg-puente-600 origin-left"
                  style={{
                    transform: `scaleX(${valor / 100})`,
                    transition: 'transform 0.45s ease-out',
                  }}
                  aria-hidden="true"
                />
              </div>
              <input
                type="range"
                id={inputId}
                min={0}
                max={100}
                step={1}
                value={valor}
                disabled={!editable}
                onChange={(e) => {
                  if (!onChange) return
                  const limpio = Math.min(
                    100,
                    Math.max(0, Math.round(Number(e.target.value) || 0))
                  )
                  onChange(id, limpio)
                }}
                className="sala-slider w-full h-5 cursor-pointer disabled:cursor-default disabled:opacity-70"
                aria-label={`${meta.etiqueta}: ${palabras}. ${meta.descripcion}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={valor}
                aria-valuetext={palabras}
              />
            </li>
          )
        })}
      </ul>
    </div>
  )
}
