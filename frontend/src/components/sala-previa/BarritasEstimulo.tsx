'use client'

import { useState } from 'react'
import { ESTIMULOS_META } from '@/lib/sala-previa/niveles'
import type { IdEstimulo, ValoresEstimulo } from '@/lib/sala-previa/tipos'

const ORDEN: IdEstimulo[] = ['ruido', 'luz', 'gente']

/** IDs ARASAAC fijos (CC BY-NC-SA). Antes en ControlesEstimulo. */
const PICTO_ID: Partial<Record<IdEstimulo, number>> = {
  ruido: 37857,
  luz: 8619,
  gente: 7117,
}

function urlArasaac(id: number) {
  return `https://static.arasaac.org/pictograms/${id}/${id}_300.png`
}

function nivelPalabra(valor: number): 'Bajo' | 'Medio' | 'Alto' {
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
        className="flex items-center justify-center w-9 h-9 rounded-suave bg-court-100 text-court-700 text-sm font-bold shrink-0"
        role="img"
        aria-label={alt}
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
      width={36}
      height={36}
      className="w-9 h-9 rounded-suave bg-white border border-court-100 object-contain shrink-0"
      loading="lazy"
      decoding="async"
      onError={() => setFallo(true)}
    />
  )
}

interface Props {
  valores: ValoresEstimulo
  deshabilitado?: boolean
  /** Si se pasa, las barritas también ajustan el estímulo (teclado incluido). */
  onChange?: (id: IdEstimulo, valor: number) => void
  className?: string
  /** Prefijo único para ids de inputs (p. ej. instancia en pantalla completa). */
  idPrefix?: string
  /** Título corto del panel. */
  titulo?: string
}

/**
 * Panel compacto de los 3 estímulos junto al viewer 3D / 360.
 * Incluye pictogramas ARASAAC (ruido, luz, gente). Único control de estímulos
 * tras eliminar el bloque grande «Ajusta cada estímulo».
 */
export function BarritasEstimulo({
  valores,
  deshabilitado,
  onChange,
  className = '',
  idPrefix = 'barra-entrada',
  titulo = 'En la entrada',
}: Props) {
  return (
    <div
      className={`rounded-suave border-2 border-court-200 bg-white shadow-sm p-3 w-[12.5rem] sm:w-[13.5rem] ${className}`}
      role="group"
      aria-label="Niveles de estímulo de la escena"
    >
      <p className="text-xs font-bold text-court-800 mb-2 leading-tight">
        {titulo}
      </p>
      <ul className="space-y-2.5 list-none p-0 m-0">
        {ORDEN.map((id) => {
          const meta = ESTIMULOS_META[id]
          const valor = Math.min(100, Math.max(0, Math.round(valores[id] || 0)))
          const palabras = nivelPalabra(valor)
          const inputId = `${idPrefix}-${id}`
          const editable = Boolean(onChange) && !deshabilitado

          return (
            <li key={id}>
              <div className="flex items-center gap-2 mb-0.5">
                <PictoEstimulo id={PICTO_ID[id] ?? 37857} etiqueta={meta.etiqueta} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-1">
                    <label
                      htmlFor={inputId}
                      className="text-xs font-bold text-court-800 cursor-pointer"
                    >
                      {meta.etiqueta}
                    </label>
                    <span className="text-[11px] font-bold text-court-700 tabular-nums">
                      {palabras}
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-2 rounded-full bg-court-100 overflow-hidden mb-1">
                <div
                  className="h-full rounded-full bg-court-600 origin-left"
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
      <p className="text-[10px] text-court-600 mt-2 leading-snug">
        Pictogramas{' '}
        <a
          href="https://arasaac.org"
          className="underline underline-offset-2 hover:text-court-800"
          target="_blank"
          rel="noopener noreferrer"
        >
          ARASAAC
        </a>
        , CC BY-NC-SA.
      </p>
    </div>
  )
}
