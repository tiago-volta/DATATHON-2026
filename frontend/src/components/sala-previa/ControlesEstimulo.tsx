'use client'

import { useState } from 'react'
import { ESTIMULOS_META, etiquetaNivelEstimulo } from '@/lib/sala-previa/niveles'
import type { IdEstimulo, ValoresEstimulo } from '@/lib/sala-previa/tipos'

const ORDEN: IdEstimulo[] = ['ruido', 'luz', 'gente', 'eco']

/** IDs ARASAAC fijos (CC BY-NC-SA). */
const PICTO_ID: Record<IdEstimulo, number> = {
  ruido: 37857,
  luz: 8619,
  gente: 7117,
  eco: 36989,
}

function urlArasaac(id: number) {
  return `https://static.arasaac.org/pictograms/${id}/${id}_300.png`
}

function nivelEnPalabras(valor: number): 'Bajo' | 'Medio' | 'Alto' {
  if (valor < 34) return 'Bajo'
  if (valor < 67) return 'Medio'
  return 'Alto'
}

function PictoEstimulo({ id, etiqueta }: { id: number; etiqueta: string }) {
  const [fallo, setFallo] = useState(false)
  const alt = `Pictograma: ${etiqueta}`

  if (fallo) {
    return (
      <span
        className="flex items-center justify-center w-14 h-14 rounded-suave bg-puente-100 text-puente-700 text-xl font-bold shrink-0"
        role="img"
        aria-label={alt}
        title={etiqueta}
      >
        {etiqueta.slice(0, 1)}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={urlArasaac(id)}
      alt={alt}
      width={56}
      height={56}
      className="w-14 h-14 rounded-suave bg-white border border-puente-100 object-contain shrink-0"
      loading="lazy"
      decoding="async"
      onError={() => setFallo(true)}
    />
  )
}

interface Props {
  valores: ValoresEstimulo
  deshabilitado?: boolean
  onChange: (id: IdEstimulo, valor: number) => void
}

export function ControlesEstimulo({ valores, deshabilitado, onChange }: Props) {
  return (
    <fieldset className="card space-y-4" disabled={deshabilitado}>
      <legend className="font-bold text-puente-800 text-lg mb-2 px-1">
        Ajusta cada estímulo
      </legend>
      <p className="text-sm text-puente-600 -mt-1 mb-2">
        Los cambios llegan despacio. Baja lo que te moleste.
      </p>

      <ul className="space-y-4 list-none p-0 m-0">
        {ORDEN.map((id) => {
          const meta = ESTIMULOS_META[id]
          const valor = Math.min(100, Math.max(0, Math.round(valores[id] || 0)))
          const palabras = nivelEnPalabras(valor)
          const detalle = etiquetaNivelEstimulo(valor, id)
          const inputId = `estimulo-${id}`

          return (
            <li
              key={id}
              className="rounded-tarjeta border-2 border-puente-100 bg-calma-mist/60 p-4"
            >
              <div className="flex items-start gap-4 mb-3">
                <PictoEstimulo id={PICTO_ID[id]} etiqueta={meta.etiqueta} />
                <label htmlFor={inputId} className="flex-1 min-w-0 cursor-pointer">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className="font-bold text-lg text-puente-800">
                      {meta.etiqueta}
                    </span>
                    <span className="inline-flex items-center gap-2 shrink-0">
                      <span className="font-bold text-puente-700 text-base">
                        {palabras}
                      </span>
                      <span className="text-sm text-puente-500">({detalle})</span>
                    </span>
                  </span>
                  <span className="block text-sm text-puente-600 mt-0.5">
                    {meta.descripcion}
                  </span>
                </label>
              </div>

              <input
                type="range"
                id={inputId}
                min={0}
                max={100}
                step={1}
                value={valor}
                onChange={(e) => {
                  const limpio = Math.min(
                    100,
                    Math.max(0, Math.round(Number(e.target.value) || 0))
                  )
                  onChange(id, limpio)
                }}
                className="w-full accent-puente-600 h-4 min-h-[44px] cursor-pointer"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={valor}
                aria-valuetext={`${meta.etiqueta}: ${palabras}, ${detalle}, ${valor} de 100`}
                aria-describedby={`${inputId}-ayuda`}
              />
              <p id={`${inputId}-ayuda`} className="sr-only">
                Pictograma de {meta.etiqueta}. {meta.descripcion}. Nivel {palabras}.
              </p>
            </li>
          )
        })}
      </ul>

      <p className="text-xs text-puente-500 pt-1">
        Pictogramas:{' '}
        <a
          href="https://arasaac.org"
          className="underline underline-offset-2 hover:text-puente-700"
          target="_blank"
          rel="noopener noreferrer"
        >
          ARASAAC
        </a>
        , Sergio Palao, Gobierno de Aragón. CC BY-NC-SA.
      </p>
    </fieldset>
  )
}
