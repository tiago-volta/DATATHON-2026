'use client'

import { useEffect, useId, useRef } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { EscenaSensorial } from '@/components/sala-previa/EscenaSensorial'
import {
  ESCENAS_JUZGADO,
  TOTAL_ESCENAS,
  etiquetaNivelTipico,
  nivelVisualDesdeEscena,
} from '@/lib/sala-previa/escenas'
import type { ValoresEstimulo } from '@/lib/sala-previa/tipos'

interface Props {
  indice: number
  onCambiar: (indice: number) => void
  valores: ValoresEstimulo
  enCalma: boolean
}

export function RecorridoEscenas({ indice, onCambiar, valores, enCalma }: Props) {
  const reduced = useReducedMotion()
  const tituloId = useId()
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const prevIndice = useRef(indice)

  const seguro = Math.min(TOTAL_ESCENAS - 1, Math.max(0, indice))
  const escena = ESCENAS_JUZGADO[seguro]
  const paso = seguro + 1
  const nivelVisual = nivelVisualDesdeEscena(escena, valores)
  const tipico = etiquetaNivelTipico(escena)

  useEffect(() => {
    if (prevIndice.current === seguro) return
    prevIndice.current = seguro
    // Al cambiar de escena, lleva el foco al título para lector de pantalla y teclado.
    tituloRef.current?.focus()
  }, [seguro])

  const irAnterior = () => {
    if (seguro <= 0) return
    onCambiar(seguro - 1)
  }

  const irSiguiente = () => {
    if (seguro >= TOTAL_ESCENAS - 1) return
    onCambiar(seguro + 1)
  }

  return (
    <section
      className="space-y-4"
      aria-labelledby={tituloId}
      aria-roledescription="recorrido por escenas del juzgado"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className="text-sm font-bold text-puente-700"
          aria-live="polite"
          aria-atomic="true"
        >
          Paso {paso} de {TOTAL_ESCENAS}
        </p>
        <ol
          className="flex gap-2"
          aria-label={`Progreso del recorrido: paso ${paso} de ${TOTAL_ESCENAS}`}
        >
          {ESCENAS_JUZGADO.map((e, i) => {
            const actual = i === seguro
            const pasado = i < seguro
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onCambiar(i)}
                  className={`block w-3 h-3 rounded-full border-2 ${
                    actual
                      ? 'bg-puente-600 border-puente-600'
                      : pasado
                        ? 'bg-accent-success/60 border-accent-success'
                        : 'bg-puente-100 border-puente-300'
                  }`}
                  aria-label={`Ir al paso ${i + 1}: ${e.titulo}`}
                  aria-current={actual ? 'step' : undefined}
                />
              </li>
            )
          })}
        </ol>
      </div>

      <div
        key={escena.id}
        className="space-y-4"
        style={{
          animation: reduced ? 'none' : 'puente-escena-entrar 420ms ease-out',
        }}
      >
        <div className="card border-2 border-puente-200">
          <h2
            id={tituloId}
            ref={tituloRef}
            tabIndex={-1}
            className="text-2xl font-bold text-puente-800 mb-2 outline-none focus-visible:ring-4 focus-visible:ring-puente-400 focus-visible:ring-offset-2 rounded-suave"
          >
            {escena.titulo}
          </h2>
          <p className="text-lg text-puente-700 mb-4">{escena.frase}</p>

          <div className="mb-4">
            <h3 className="font-bold text-puente-800 mb-2">Quién está aquí</h3>
            <ul className="space-y-3">
              {escena.roles.map((rol) => (
                <li key={rol.nombre} className="text-puente-700">
                  <span className="font-bold text-puente-800">{rol.nombre}.</span>{' '}
                  {rol.explicacion}
                </li>
              ))}
            </ul>
          </div>

          {tipico && (
            <p
              className="text-sm text-puente-600 rounded-suave bg-puente-50 border border-puente-100 px-3 py-2"
              role="note"
            >
              En un día real, esta zona suele parecerse al nivel «{tipico}».
              Aquí ves y oyes solo lo que tú eliges. No subimos nada por ti.
            </p>
          )}
        </div>

        <EscenaSensorial nivel={nivelVisual} valores={valores} enCalma={enCalma} />
      </div>

      <nav
        className="flex flex-wrap gap-3 items-center justify-between"
        aria-label="Navegación entre escenas del juzgado"
      >
        <button
          type="button"
          className="btn-secondary"
          onClick={irAnterior}
          disabled={seguro <= 0}
          aria-label={`Escena anterior. Paso ${Math.max(1, paso - 1)} de ${TOTAL_ESCENAS}`}
        >
          Anterior
        </button>
        <span className="text-puente-600 text-sm" aria-hidden="true">
          {paso} / {TOTAL_ESCENAS}
        </span>
        <button
          type="button"
          className="btn-primary"
          onClick={irSiguiente}
          disabled={seguro >= TOTAL_ESCENAS - 1}
          aria-label={`Escena siguiente. Paso ${Math.min(TOTAL_ESCENAS, paso + 1)} de ${TOTAL_ESCENAS}`}
        >
          Siguiente
        </button>
      </nav>
    </section>
  )
}
