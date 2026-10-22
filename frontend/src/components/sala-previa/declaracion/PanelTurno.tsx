'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { BotonDictar } from './BotonDictar'
import { HABLANTES, conNombre, type Respuesta, type Turno } from '@/lib/sala-previa/declaracion'

interface Props {
  turno: Turno
  numero: number
  total: number
  nombre: string
  onResponder: (r: Respuesta) => void
  onCallar: () => void
  /** Mientras la jueza responde a una petición (agua, etc.). */
  esperandoListo?: boolean
  onListo?: () => void
}

export function PanelTurno({
  turno,
  numero,
  total,
  nombre,
  onResponder,
  onCallar,
  esperandoListo = false,
  onListo,
}: Props) {
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const textareaId = useId()
  const [libre, setLibre] = useState('')
  const hablante = HABLANTES[turno.hablante]

  useEffect(() => {
    setLibre('')
    tituloRef.current?.focus()
  }, [turno.id])

  const responderLibre = () => {
    const texto = libre.trim()
    if (!texto) return
    onResponder({ texto, porQue: '', origen: 'libre' })
  }

  if (esperandoListo && onListo) {
    return (
      <section className="card space-y-4" aria-labelledby={`titulo-${turno.id}`}>
        <h2
          id={`titulo-${turno.id}`}
          ref={tituloRef}
          tabIndex={-1}
          className="text-xl font-bold text-court-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-court-400 rounded-suave"
        >
          Tómate un momento
        </h2>
        <p className="text-court-800">
          Puedes beber agua. No hay prisa. Cuando quieras, seguimos con la declaración.
        </p>
        <button type="button" className="btn-primary min-h-[44px]" onClick={onListo}>
          Ya estoy listo o lista
        </button>
      </section>
    )
  }

  return (
    <section className="card space-y-4" aria-labelledby={`titulo-${turno.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2
          id={`titulo-${turno.id}`}
          ref={tituloRef}
          tabIndex={-1}
          className="text-xl font-bold text-court-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-court-400 rounded-suave"
        >
          Habla: {hablante.nombre}
        </h2>
        <span className="text-sm font-bold text-court-700 bg-court-100 px-3 py-1 rounded-full">
          Momento {numero} de {total}
        </span>
      </div>

      <div
        className="h-2 w-full rounded-full bg-court-100 overflow-hidden"
        role="progressbar"
        aria-label="Avance de la simulación"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={numero}
      >
        <div className="h-full bg-accent-info" style={{ width: `${(numero / total) * 100}%` }} />
      </div>

      {turno.explicacion && (
        <div className="rounded-suave bg-calma-mist border border-court-100 p-3 text-court-800">
          <p className="font-bold text-sm text-court-900">Qué está pasando</p>
          <p>{turno.explicacion}</p>
          {turno.ley && <p className="mt-1 text-sm text-court-700">{turno.ley}.</p>}
        </div>
      )}

      {turno.respuestas.length === 0 ? (
        <button
          type="button"
          className="btn-primary min-h-[44px]"
          onClick={() => onResponder({ texto: '', porQue: '', origen: 'segura' })}
        >
          Seguir
        </button>
      ) : (
        <>
          <fieldset className="space-y-2">
            <legend className="font-bold text-court-900 mb-2">Respuestas seguras</legend>
            <div className="grid gap-2">
              {turno.respuestas.map((r) => {
                const texto = conNombre(r.texto, nombre)
                return (
                  <button
                    key={r.texto}
                    type="button"
                    className="btn-secondary justify-start text-left min-h-[44px] py-3 font-semibold"
                    onClick={() => onResponder({ ...r, texto, origen: 'segura' })}
                  >
                    «{texto}»
                  </button>
                )
              })}
            </div>
          </fieldset>

          <details className="rounded-suave border border-court-200 p-3">
            <summary className="cursor-pointer font-bold text-court-800 min-h-[44px] flex items-center">
              Responder con mis palabras
            </summary>
            <div className="space-y-2 pt-2">
              <label htmlFor={textareaId} className="block text-sm font-bold text-court-800">
                Tu respuesta
              </label>
              <textarea
                id={textareaId}
                value={libre}
                onChange={(e) => setLibre(e.target.value.slice(0, 400))}
                rows={2}
                maxLength={400}
                className="textarea-accesible w-full"
                placeholder="Por ejemplo: No lo recuerdo bien."
              />
              <div className="flex flex-wrap items-start gap-2">
                <button
                  type="button"
                  className="btn-primary min-h-[44px] py-2"
                  onClick={responderLibre}
                  disabled={!libre.trim()}
                >
                  Responder
                </button>
                <BotonDictar
                  onTexto={(t) => setLibre((prev) => (prev ? `${prev} ${t}` : t).slice(0, 400))}
                  onEmpezar={onCallar}
                />
              </div>
            </div>
          </details>
        </>
      )}
    </section>
  )
}
