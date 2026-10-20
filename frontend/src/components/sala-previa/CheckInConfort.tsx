'use client'

import { useState } from 'react'
import { ESTIMULOS_META } from '@/lib/sala-previa/niveles'
import type { EscalaConfort, IdEstimulo } from '@/lib/sala-previa/tipos'

const ESCALA: { valor: EscalaConfort; etiqueta: string; simbolo: string }[] = [
  { valor: 1, etiqueta: 'Muy mal', simbolo: '☹' },
  { valor: 2, etiqueta: 'Mal', simbolo: '😕' },
  { valor: 3, etiqueta: 'Regular', simbolo: '😐' },
  { valor: 4, etiqueta: 'Bien', simbolo: '🙂' },
  { valor: 5, etiqueta: 'Muy bien', simbolo: '☺' },
]

const ESTIMULOS: IdEstimulo[] = ['ruido', 'luz', 'gente', 'eco']

interface Props {
  nivelNombre: string
  onContinuar: (confort: EscalaConfort, molestias: IdEstimulo[]) => void
  onQuedarse: (confort: EscalaConfort, molestias: IdEstimulo[]) => void
  onBajarNivel: (confort: EscalaConfort, molestias: IdEstimulo[]) => void
  puedeBajar: boolean
  puedeSubir: boolean
}

export function CheckInConfort({
  nivelNombre,
  onContinuar,
  onQuedarse,
  onBajarNivel,
  puedeBajar,
  puedeSubir,
}: Props) {
  const [confort, setConfort] = useState<EscalaConfort | null>(null)
  const [molestias, setMolestias] = useState<IdEstimulo[]>([])

  const incomodo = confort !== null && confort <= 2
  const regular = confort === 3

  const toggleMolestia = (id: IdEstimulo) => {
    setMolestias((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkin-titulo"
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 bg-puente-900/40"
    >
      <div className="bg-white rounded-tarjeta shadow-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <h2 id="checkin-titulo" className="text-2xl font-bold text-puente-800 mb-2">
          ¿Cómo te sientes?
        </h2>
        <p className="text-puente-600 mb-6">
          Acabas de estar en: {nivelNombre}. No hay respuesta correcta.
        </p>

        <div
          role="radiogroup"
          aria-label="Escala de confort"
          className="grid grid-cols-5 gap-2 mb-6"
        >
          {ESCALA.map((item) => (
            <button
              key={item.valor}
              type="button"
              role="radio"
              aria-checked={confort === item.valor}
              onClick={() => setConfort(item.valor)}
              className={`flex flex-col items-center gap-1 p-3 rounded-suave border-2 min-h-[72px] ${
                confort === item.valor
                  ? 'border-puente-500 bg-puente-50'
                  : 'border-puente-100 hover:border-puente-300'
              }`}
            >
              <span className="text-2xl" aria-hidden="true">{item.simbolo}</span>
              <span className="text-xs text-puente-700 font-medium">{item.etiqueta}</span>
            </button>
          ))}
        </div>

        {confort !== null && (
          <>
            <fieldset className="mb-6">
              <legend className="font-bold text-puente-800 mb-3">
                ¿Qué te ha molestado? (opcional)
              </legend>
              <div className="flex flex-wrap gap-2">
                {ESTIMULOS.map((id) => {
                  const activo = molestias.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleMolestia(id)}
                      aria-pressed={activo}
                      className={`px-4 py-2 rounded-suave border-2 font-medium ${
                        activo
                          ? 'border-puente-500 bg-puente-50 text-puente-800'
                          : 'border-puente-200 text-puente-600'
                      }`}
                    >
                      {ESTIMULOS_META[id].etiqueta}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {incomodo && (
              <p className="bg-accent-alert/15 border border-accent-alert rounded-lg p-4 mb-4 text-puente-800" role="status">
                Está bien parar. Quédate en este nivel o baja uno. No hace falta avanzar hoy.
              </p>
            )}
            {regular && (
              <p className="bg-calma-sage rounded-lg p-4 mb-4 text-puente-800" role="status">
                {puedeSubir
                  ? 'Puedes quedarte un poco más o probar el siguiente cuando quieras.'
                  : 'Estás en el nivel más alto. Puedes quedarte aquí o bajar un nivel.'}
              </p>
            )}
            {!incomodo && !regular && (
              <p className="bg-accent-success/15 border border-accent-success rounded-lg p-4 mb-4 text-puente-800" role="status">
                {puedeSubir
                  ? 'Bien. Si quieres, prueba el siguiente nivel. Si no, quédate aquí.'
                  : 'Bien. Ya has llegado al nivel más alto de la Sala Previa.'}
              </p>
            )}

            <div className="flex flex-col gap-3">
              {!incomodo && puedeSubir && (
                <button
                  type="button"
                  className="btn-primary w-full"
                  onClick={() => onContinuar(confort, molestias)}
                >
                  Probar siguiente nivel
                </button>
              )}
              <button
                type="button"
                className={!incomodo && puedeSubir ? 'btn-secondary w-full' : 'btn-primary w-full'}
                onClick={() => onQuedarse(confort, molestias)}
              >
                Quedarme aquí
              </button>
              {puedeBajar && (
                <button
                  type="button"
                  className="btn-ghost w-full"
                  onClick={() => onBajarNivel(confort, molestias)}
                >
                  Volver al nivel anterior
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
