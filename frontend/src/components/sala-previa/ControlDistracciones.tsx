'use client'

import { useId } from 'react'
import type { EntradaHistorial } from '@/hooks/useDistracciones'
import type { NivelDistracciones } from '@/lib/sala-previa/distracciones'

const NIVELES: { id: NivelDistracciones; etiqueta: string }[] = [
  { id: 'apagadas', etiqueta: 'Apagadas' },
  { id: 'pocas', etiqueta: 'Pocas' },
  { id: 'muchas', etiqueta: 'Muchas' },
]

interface Props {
  nivel: NivelDistracciones
  enCalma: boolean
  aviso: string | null
  explicacion: string
  historial: EntradaHistorial[]
  onNivel: (nivel: NivelDistracciones) => void
  modo?: 'preparacion' | 'simulacion'
  /** Compacto para el mini menú de la sala. */
  mini?: boolean
}

export function ControlDistracciones({
  nivel,
  enCalma,
  aviso,
  explicacion,
  historial,
  onNivel,
  modo = 'preparacion',
  mini = false,
}: Props) {
  const tituloId = useId()
  const apagarId = useId()
  const enPreparacion = modo === 'preparacion'

  if (mini) {
    return (
      <div className="space-y-2 text-left" aria-labelledby={tituloId}>
        <p id={tituloId} className="text-xs font-bold uppercase tracking-wide text-court-600">
          Distracciones
        </p>
        <label
          htmlFor={apagarId}
          className="inline-flex items-center gap-2 min-h-[40px] text-sm text-court-800 cursor-pointer"
        >
          <input
            id={apagarId}
            type="checkbox"
            className="w-5 h-5 accent-court-600"
            checked={nivel === 'apagadas'}
            disabled={enCalma}
            onChange={(e) => onNivel(e.target.checked ? 'apagadas' : 'pocas')}
          />
          Apagar
        </label>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Nivel de distracciones">
          {NIVELES.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`btn-ghost text-xs min-h-[40px] px-2 border border-court-200 ${
                nivel === n.id ? 'bg-court-100 font-bold' : ''
              }`}
              aria-pressed={nivel === n.id}
              disabled={enCalma}
              onClick={() => onNivel(n.id)}
            >
              {n.etiqueta}
            </button>
          ))}
        </div>
      </div>
    )
  }

  const ayuda = enCalma
    ? 'Con el modo calma no hay distracciones ni sonidos de interrupción.'
    : nivel === 'apagadas'
      ? 'Distracciones apagadas. Actívalas con Pocas o Muchas para oír tos, móvil, puerta…'
      : enPreparacion
        ? nivel === 'pocas'
          ? 'Antes de cada ruido verás un aviso en la sala. Luego suena. Nada de eso tiene que ver contigo.'
          : 'Habrá ruidos casi seguidos. Antes de cada uno verás un aviso. Nada de eso tiene que ver contigo.'
        : nivel === 'pocas'
          ? 'Pasarán ruidos de vez en cuando (tos, móvil, puerta…). Sin aviso previo. Nada de eso tiene que ver contigo.'
          : 'Habrá ruidos casi seguidos, a veces dos a la vez. Sin aviso previo. Nada de eso tiene que ver contigo.'

  const mensaje =
    enPreparacion && aviso
      ? `Aviso: ${aviso}`
      : explicacion

  return (
    <section
      className="sala-fs-distracciones rounded-suave border border-court-200 bg-white px-3 py-3 space-y-2"
      aria-labelledby={tituloId}
      data-sala-ui
    >
      <div className="flex flex-wrap items-center gap-2">
        <h3 id={tituloId} className="font-bold text-court-800 text-base mr-1">
          Distracciones
        </h3>
        {enPreparacion && (
          <label
            htmlFor={apagarId}
            className="inline-flex items-center gap-2 min-h-[44px] px-2 text-sm text-court-800 cursor-pointer border border-court-200 rounded-suave"
          >
            <input
              id={apagarId}
              type="checkbox"
              className="w-5 h-5 accent-court-600"
              checked={nivel === 'apagadas'}
              disabled={enCalma}
              onChange={(e) => onNivel(e.target.checked ? 'apagadas' : 'pocas')}
            />
            Apagar distracciones
          </label>
        )}
        <div className="flex flex-wrap gap-2" role="group" aria-labelledby={tituloId}>
          {NIVELES.map((n) => (
            <button
              key={n.id}
              type="button"
              className={`btn-ghost text-sm min-h-[44px] border border-court-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                nivel === n.id ? 'bg-court-100 font-bold' : ''
              }`}
              aria-pressed={nivel === n.id}
              disabled={enCalma}
              onClick={() => onNivel(n.id)}
            >
              {n.etiqueta}
            </button>
          ))}
        </div>
      </div>

      <p className="text-sm text-court-700">{ayuda}</p>

      {mensaje ? (
        <p
          className="text-sm rounded-suave px-3 py-2 min-h-[2.5rem] bg-calma-mist border border-court-100 text-court-800"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {mensaje}
        </p>
      ) : null}

      {historial.length > 0 && (
        <div>
          <h4 className="text-sm font-bold text-court-800">Lo que ha pasado</h4>
          <ul className="mt-1 space-y-0.5 text-sm text-court-700 list-disc pl-5">
            {historial.map((h) => (
              <li key={h.id}>{h.texto}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  )
}
