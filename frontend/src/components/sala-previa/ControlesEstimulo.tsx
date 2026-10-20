'use client'

import { ESTIMULOS_META, etiquetaNivelEstimulo } from '@/lib/sala-previa/niveles'
import type { IdEstimulo, ValoresEstimulo } from '@/lib/sala-previa/tipos'

const ORDEN: IdEstimulo[] = ['ruido', 'luz', 'gente', 'eco']

interface Props {
  valores: ValoresEstimulo
  deshabilitado?: boolean
  onChange: (id: IdEstimulo, valor: number) => void
}

export function ControlesEstimulo({ valores, deshabilitado, onChange }: Props) {
  return (
    <fieldset className="card space-y-6" disabled={deshabilitado}>
      <legend className="font-bold text-puente-800 text-lg mb-2 px-1">
        Ajusta cada estímulo
      </legend>
      <p className="text-sm text-puente-600 -mt-2">
        Los cambios llegan despacio. Baja lo que te moleste.
      </p>

      {ORDEN.map((id) => {
        const meta = ESTIMULOS_META[id]
        const valor = Math.min(100, Math.max(0, Math.round(valores[id] || 0)))
        const etiqueta = etiquetaNivelEstimulo(valor, id)
        return (
          <div key={id}>
            <label htmlFor={`estimulo-${id}`} className="flex justify-between gap-3 text-puente-700 mb-2">
              <span>
                <span className="font-bold block">{meta.etiqueta}</span>
                <span className="text-sm text-puente-500">{meta.descripcion}</span>
              </span>
              <span className="text-sm font-medium shrink-0" aria-hidden="true">
                {etiqueta}
              </span>
            </label>
            <input
              type="range"
              id={`estimulo-${id}`}
              min={0}
              max={100}
              step={1}
              value={valor}
              onChange={(e) => {
                const limpio = Math.min(100, Math.max(0, Math.round(Number(e.target.value) || 0)))
                onChange(id, limpio)
              }}
              className="w-full accent-puente-600 h-3"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={valor}
              aria-valuetext={`${meta.etiqueta}: ${etiqueta}, ${valor} de 100`}
              aria-describedby={`estimulo-${id}-ayuda`}
            />
            <p id={`estimulo-${id}-ayuda`} className="sr-only">
              Controla {meta.descripcion}. Valor actual {valor}.
            </p>
          </div>
        )
      })}
    </fieldset>
  )
}
