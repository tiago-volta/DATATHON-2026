'use client'

import Image from 'next/image'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import {
  EVENTO_TUTORIAL,
  PASOS_TUTORIAL,
  marcarTutorialVisto,
  tutorialVisto,
  urlPictograma,
} from '@/lib/tutorial'

/**
 * Tutorial general al abrir la app la primera vez.
 * Escape / Saltar cierran sin atrapar el foco.
 */
export function TutorialInicio() {
  const tituloId = useId()
  const descId = useId()
  const [listo, setListo] = useState(false)
  const [abierto, setAbierto] = useState(false)
  const [indice, setIndice] = useState(0)
  const botonSiguienteRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const sync = () => {
      const pendiente = !tutorialVisto()
      setAbierto(pendiente)
      setListo(true)
    }
    sync()
    window.addEventListener(EVENTO_TUTORIAL, sync)
    return () => window.removeEventListener(EVENTO_TUTORIAL, sync)
  }, [])

  const cerrar = useCallback(() => {
    marcarTutorialVisto()
    setAbierto(false)
  }, [])

  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        cerrar()
      }
    }
    window.addEventListener('keydown', onKey)
    botonSiguienteRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey)
  }, [abierto, cerrar])

  if (!listo || !abierto) return null

  const paso = PASOS_TUTORIAL[indice]
  const esUltimo = indice >= PASOS_TUTORIAL.length - 1

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-4 bg-court-900/40"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={descId}
        className="w-full max-w-lg bg-calma-cream border-2 border-court-800 rounded-tarjeta shadow-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto"
      >
        <p className="text-sm font-bold tracking-wide text-court-700 mb-2">
          Tutorial · paso {indice + 1} de {PASOS_TUTORIAL.length}
        </p>

        {paso.pictoId != null && (
          <div className="mb-4 flex justify-center">
            <Image
              src={urlPictograma(paso.pictoId)}
              alt=""
              width={96}
              height={96}
              className="rounded-suave"
              unoptimized
            />
          </div>
        )}

        <h2 id={tituloId} className="text-2xl text-court-900 mb-3">
          {paso.titulo}
        </h2>
        <p id={descId} className="text-lg text-court-800 mb-6 leading-relaxed">
          {paso.texto}
        </p>

        <div
          className="mb-4 h-2 rounded-full bg-court-100"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={PASOS_TUTORIAL.length}
          aria-valuenow={indice + 1}
          aria-label={`Paso ${indice + 1} de ${PASOS_TUTORIAL.length}`}
        >
          <div
            className="h-full rounded-full bg-court-600 transition-[width] duration-300"
            style={{
              width: `${((indice + 1) / PASOS_TUTORIAL.length) * 100}%`,
            }}
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-3">
          <button
            ref={botonSiguienteRef}
            type="button"
            className="btn-primary min-h-[44px]"
            onClick={() => {
              if (esUltimo) {
                cerrar()
                return
              }
              setIndice((i) => i + 1)
            }}
          >
            {esUltimo ? 'Empezar' : 'Siguiente'}
          </button>
          <button
            type="button"
            className="btn-ghost min-h-[44px]"
            onClick={cerrar}
          >
            Saltar
          </button>
        </div>

        <p className="text-sm text-court-700" role="status" aria-live="polite">
          Pulsa Escape o Saltar si quieres cerrar. No hace falta terminar.
        </p>
      </div>
    </div>
  )
}
