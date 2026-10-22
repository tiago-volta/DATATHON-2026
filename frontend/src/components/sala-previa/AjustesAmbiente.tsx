'use client'

import { useId, useState } from 'react'
import type { ValoresEstimulo } from '@/lib/sala-previa/tipos'

/** IDs ARASAAC (CC BY-NC-SA), mismos que en el check-in / lo que te ayuda. */
const CONTROLES: {
  id: keyof Pick<ValoresEstimulo, 'gente' | 'ruido' | 'luz'>
  etiqueta: string
  ayuda: string
  bajo: string
  alto: string
  pictoId: number
  pictoAlt: string
}[] = [
  {
    id: 'gente',
    etiqueta: 'Personas',
    ayuda: 'Cuánta gente hay en el público.',
    bajo: 'Pocas',
    alto: 'Muchas',
    pictoId: 7117,
    pictoAlt: 'Pictograma: personas',
  },
  {
    id: 'ruido',
    etiqueta: 'Ruido',
    ayuda: 'Murmullos y sonidos de fondo.',
    bajo: 'Bajo',
    alto: 'Alto',
    pictoId: 37857,
    pictoAlt: 'Pictograma: ruido',
  },
  {
    id: 'luz',
    etiqueta: 'Luz',
    ayuda: 'Qué tan clara se ve la sala.',
    bajo: 'Tenue',
    alto: 'Fuerte',
    pictoId: 8619,
    pictoAlt: 'Pictograma: luz',
  },
]

function PictoAjuste({ id, alt }: { id: number; alt: string }) {
  const [fallo, setFallo] = useState(false)
  if (fallo) {
    return (
      <span
        className="flex items-center justify-center w-9 h-9 rounded-suave bg-court-100 text-court-700 text-sm font-bold shrink-0"
        role="img"
        aria-label={alt}
      >
        ·
      </span>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://static.arasaac.org/pictograms/${id}/${id}_300.png`}
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
  onCambiar: (valores: ValoresEstimulo) => void
  /**
   * Mini menú arriba a la izquierda, plegable.
   * Por defecto cerrado para no tapar la sala.
   */
  miniMenu?: boolean
  /** Panel denso sin tarjeta (para meter dentro de otro menú). */
  embebido?: boolean
}

export function AjustesAmbiente({
  valores,
  onCambiar,
  miniMenu = false,
  embebido = false,
}: Props) {
  const tituloId = useId()
  const [abierto, setAbierto] = useState(false)

  if (embebido) {
    return (
      <AjustesPanel
        tituloId={tituloId}
        valores={valores}
        onCambiar={onCambiar}
        className="space-y-1.5"
        compacto
      />
    )
  }

  if (!miniMenu) {
    return (
      <AjustesPanel
        tituloId={tituloId}
        valores={valores}
        onCambiar={onCambiar}
        className="card border-2 border-court-200 space-y-4 p-4"
      />
    )
  }

  return (
    <div
      className="pointer-events-auto max-w-[min(100%,18rem)]"
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        className="inline-flex items-center gap-2 min-h-[44px] px-3 rounded-suave bg-white text-court-800 border-2 border-court-200 font-bold text-sm shadow-sm hover:bg-calma-mist focus-visible:ring-4 focus-visible:ring-court-400"
        aria-expanded={abierto}
        aria-controls={tituloId}
        onClick={() => setAbierto((v) => !v)}
      >
        Ajustes
        <span className="text-court-600 font-normal text-xs" aria-hidden="true">
          {abierto ? '(cerrar)' : '(abrir)'}
        </span>
      </button>

      {abierto && (
        <div
          id={tituloId}
          className="mt-2 rounded-suave border-2 border-court-200 bg-white/95 backdrop-blur-sm p-3 shadow-md max-h-[min(50vh,22rem)] overflow-y-auto"
          role="region"
          aria-label="Ajustes de la sala"
        >
          <AjustesPanel
            tituloId={`${tituloId}-contenido`}
            valores={valores}
            onCambiar={onCambiar}
            className="space-y-3"
            compacto
          />
        </div>
      )}
    </div>
  )
}

function AjustesPanel({
  tituloId,
  valores,
  onCambiar,
  className,
  compacto = false,
}: {
  tituloId: string
  valores: ValoresEstimulo
  onCambiar: (valores: ValoresEstimulo) => void
  className?: string
  compacto?: boolean
}) {
  return (
    <section className={className} aria-labelledby={tituloId}>
      {!compacto && (
        <>
          <h2 id={tituloId} className="font-bold text-court-800 text-xl">
            Ajusta la sala
          </h2>
          <p className="text-sm text-court-700">
            Personas, ruido y luz. Puedes cambiarlos cuando quieras.
          </p>
        </>
      )}
      {compacto && (
        <h2 id={tituloId} className="sr-only">
          Ajusta la sala: personas, ruido y luz
        </h2>
      )}

      <ul className={`text-left ${compacto ? 'space-y-2' : 'space-y-3'}`}>
        {CONTROLES.map((c) => {
          const id = `${tituloId}-${c.id}`
          const valor = valores[c.id] ?? 0
          return (
            <li key={c.id}>
              <div className="flex items-center gap-2 mb-0.5">
                <PictoAjuste id={c.pictoId} alt={c.pictoAlt} />
                <label htmlFor={id} className="font-bold text-court-800 text-sm">
                  {c.etiqueta}
                </label>
                <span id={`${id}-valor`} className="ml-auto text-xs font-bold text-court-800">
                  {valor}
                </span>
              </div>
              <p id={`${id}-ayuda`} className="sr-only">
                {c.ayuda}
              </p>
              <input
                id={id}
                type="range"
                min={0}
                max={100}
                step={5}
                value={valor}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={valor}
                aria-describedby={`${id}-ayuda ${id}-valor`}
                className={`w-full accent-court-600 ${compacto ? 'min-h-[36px]' : 'min-h-[40px]'}`}
                onChange={(e) =>
                  onCambiar({ ...valores, [c.id]: Number(e.target.value) })
                }
              />
              <div className="flex justify-between text-[11px] text-court-600">
                <span>{c.bajo}</span>
                <span>{c.alto}</span>
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
