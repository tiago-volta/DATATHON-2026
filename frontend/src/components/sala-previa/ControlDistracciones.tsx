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
  avisar: boolean
  enCalma: boolean
  aviso: string | null
  explicacion: string
  historial: EntradaHistorial[]
  onNivel: (nivel: NivelDistracciones) => void
  onAvisar: (avisar: boolean) => void
}

export function ControlDistracciones({
  nivel,
  avisar,
  enCalma,
  aviso,
  explicacion,
  historial,
  onNivel,
  onAvisar,
}: Props) {
  const tituloId = useId()
  const avisarId = useId()
  const ayuda = enCalma
    ? 'Con el modo calma no hay distracciones ni sonidos de interrupción.'
    : nivel === 'apagadas'
      ? 'Elige Pocas o Muchas para oír interrupciones de una sala real: móvil, tos, puerta, martillo del juez…'
      : nivel === 'pocas'
        ? 'De vez en cuando pasará algo pequeño: un timbre, una tos, pasos, el martillo… Nada de eso tiene que ver contigo.'
        : 'Habrá más interrupciones, como en una sala ajetreada. Nada de eso tiene que ver contigo.'
  const mensaje = aviso ? `Aviso: ${aviso}` : explicacion

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
        <label
          htmlFor={avisarId}
          className="inline-flex items-center gap-2 min-h-[44px] px-2 text-sm text-court-800 cursor-pointer"
        >
          <input
            id={avisarId}
            type="checkbox"
            className="w-5 h-5 accent-court-600"
            checked={avisar}
            onChange={(e) => onAvisar(e.target.checked)}
          />
          Avisarme antes
        </label>
      </div>

      <p className="text-sm text-court-700">{ayuda}</p>

      <p
        className={`text-sm rounded-suave px-3 py-2 min-h-[2.5rem] ${
          mensaje ? 'bg-calma-mist border border-court-100 text-court-800' : ''
        }`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {mensaje}
      </p>

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
