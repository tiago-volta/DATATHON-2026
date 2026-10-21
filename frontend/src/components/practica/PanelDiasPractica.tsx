'use client'

import { useId } from 'react'
import { Icono } from '@/components/Icono'
import type { DiaSemana } from '@/lib/practica'

interface Props {
  semana: DiaSemana[]
  total: number
  estaSemana: number
  bienvenida?: string | null
  onDescartarBienvenida?: () => void
  /** Título del bloque. */
  titulo?: string
}

/**
 * Vista amable de días practicados: semana L–D con texto (no solo color),
 * total acumulado y días de esta semana. Sin mensajes de pérdida.
 */
export function PanelDiasPractica({
  semana,
  total,
  estaSemana,
  bienvenida = null,
  onDescartarBienvenida,
  titulo = 'Días de práctica',
}: Props) {
  const tituloId = useId()
  const ayudaId = useId()
  const resumenId = useId()

  const resumenSemana =
    estaSemana === 0
      ? 'Esta semana aún no has practicado.'
      : estaSemana === 1
        ? 'Esta semana has practicado 1 día.'
        : `Esta semana has practicado ${estaSemana} días.`

  const resumenTotal =
    total === 0
      ? 'Todavía no hay días registrados. Cuando practiques, contarán aquí.'
      : total === 1
        ? 'En total has practicado 1 día.'
        : `En total has practicado ${total} días.`

  return (
    <section aria-labelledby={tituloId} className="card">
      <h2 id={tituloId} className="font-bold text-puente-800 mb-1">
        {titulo}
      </h2>
      <p id={ayudaId} className="text-sm text-puente-700 mb-4">
        Contamos los días en que practicas. Si paras unos días, al volver te
        damos la bienvenida. No pierdes nada.
      </p>

      {bienvenida && (
        <div
          className="mb-4 flex items-start gap-3 bg-calma-sage/80 border border-accent-success/40 rounded-suave p-3"
          role="status"
          aria-live="polite"
        >
          <p className="flex-1 text-puente-900 text-sm min-w-0">{bienvenida}</p>
          {onDescartarBienvenida && (
            <button
              type="button"
              className="btn-ghost shrink-0 min-h-[44px] min-w-[44px] px-3 py-2 text-sm"
              onClick={onDescartarBienvenida}
              aria-label="Cerrar mensaje de bienvenida"
            >
              Cerrar
            </button>
          )}
        </div>
      )}

      <p id={resumenId} className="text-puente-800 mb-3">
        <span className="font-bold">{resumenTotal}</span>{' '}
        <span className="text-puente-700">{resumenSemana}</span>
      </p>

      <ul
        className="grid grid-cols-7 gap-1.5"
        aria-labelledby={tituloId}
        aria-describedby={`${ayudaId} ${resumenId}`}
      >
        {semana.map((dia) => (
          <li key={dia.fecha} className="min-w-0">
            <div
              className={`flex flex-col items-center justify-center gap-1 rounded-suave border-2 px-1 py-2 min-h-[72px] ${
                dia.practicado
                  ? 'border-accent-success/50 bg-calma-sage/90'
                  : 'border-puente-100 bg-puente-50/80'
              }`}
            >
              <span
                className="text-xs font-bold text-puente-800 uppercase"
                aria-hidden="true"
              >
                {dia.etiqueta}
              </span>
              <Icono
                nombre={dia.practicado ? '✓' : '·'}
                className={`h-5 w-5 ${dia.practicado ? 'text-accent-success' : 'text-puente-300'}`}
              />
              <span className="sr-only">
                {dia.nombreLargo}:{' '}
                {dia.practicado ? 'practicaste' : 'sin práctica'}
              </span>
              <span
                className={`text-[10px] leading-tight text-center ${
                  dia.practicado ? 'text-puente-800' : 'text-puente-600'
                }`}
                aria-hidden="true"
              >
                {dia.practicado ? 'practicaste' : 'sin práctica'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
