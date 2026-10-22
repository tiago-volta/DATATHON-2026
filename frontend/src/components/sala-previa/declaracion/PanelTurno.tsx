'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { BotonDictar } from './BotonDictar'
import { HABLANTES, conNombre, type Respuesta, type Turno } from '@/lib/sala-previa/declaracion'

interface Dialogo {
  quien: string
  texto: string
}

interface Props {
  turno: Turno
  numero: number
  total: number
  nombre: string
  dialogo?: Dialogo | null
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
  dialogo = null,
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
    const panel = tituloRef.current?.closest('[data-sala-ui]')
    if (panel instanceof HTMLElement) panel.scrollTo({ top: 0 })
    tituloRef.current?.focus({ preventScroll: true })
  }, [turno.id])

  const responderLibre = () => {
    const texto = libre.trim()
    if (!texto) return
    onResponder({ texto, porQue: '', origen: 'libre' })
  }

  if (esperandoListo && onListo) {
    return (
      <section className="space-y-2" aria-labelledby={`titulo-${turno.id}`}>
        <h2
          id={`titulo-${turno.id}`}
          ref={tituloRef}
          tabIndex={-1}
          className="text-base font-bold text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-court-400 rounded-suave"
        >
          Tómate un momento
        </h2>
        <p className="text-sm text-white">
          Puedes beber agua. No hay prisa. Cuando quieras, seguimos con la declaración.
        </p>
        <button type="button" className="btn-primary min-h-[44px]" onClick={onListo}>
          Ya estoy listo o lista
        </button>
      </section>
    )
  }

  return (
    <section className="space-y-1" aria-labelledby={`titulo-${turno.id}`}>
      <div className="flex items-baseline gap-2">
        <h2
          id={`titulo-${turno.id}`}
          ref={tituloRef}
          tabIndex={-1}
          className="shrink-0 text-xs font-bold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white rounded-suave"
        >
          {dialogo?.quien ?? hablante.nombre}
          <span className="sr-only">
            . Momento {numero} de {total}
          </span>
        </h2>
        {dialogo?.texto && (
          <p className="min-w-0 flex-1 text-xs leading-normal text-white">{dialogo.texto}</p>
        )}
        <span className="shrink-0 text-[11px] font-bold text-white/80">
          {numero}/{total}
        </span>
      </div>

      {turno.explicacion && (
        <p className="sr-only">
          Qué está pasando. {turno.explicacion}
          {turno.ley ? ` ${turno.ley}.` : ''}
        </p>
      )}

      {turno.respuestas.length === 0 ? (
        <button
          type="button"
          className="inline-flex items-center min-h-[36px] px-3 py-1 text-xs font-bold text-white bg-accent-navy rounded-suave"
          onClick={() => onResponder({ texto: '', porQue: '', origen: 'segura' })}
        >
          Seguir
        </button>
      ) : (
        <>
          <fieldset>
            <legend className="sr-only">Respuestas seguras</legend>
            <div className="flex flex-wrap gap-1">
              {turno.respuestas.map((r) => {
                const texto = conNombre(r.texto, nombre)
                return (
                  <button
                    key={r.texto}
                    type="button"
                    className="inline-flex items-center min-h-[36px] px-3 py-1.5 text-left text-xs font-semibold text-court-900 bg-white hover:bg-calma-mist focus-visible:ring-2 focus-visible:ring-white rounded-suave transition-colors"
                    onClick={() => onResponder({ ...r, texto, origen: 'segura' })}
                  >
                    <span>«{texto}»</span>
                  </button>
                )
              })}
            </div>
          </fieldset>

          <details className="text-white">
            <summary className="cursor-pointer font-bold min-h-[32px] flex items-center text-xs">
              Responder con mis palabras
            </summary>
            <div className="space-y-2 pt-2">
              <label htmlFor={textareaId} className="block text-sm font-bold text-white">
                Tu respuesta
              </label>
              <textarea
                id={textareaId}
                value={libre}
                onChange={(e) => setLibre(e.target.value.slice(0, 400))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                    e.preventDefault()
                    responderLibre()
                  }
                }}
                rows={2}
                maxLength={400}
                className="textarea-accesible w-full"
                placeholder="Por ejemplo: No lo recuerdo bien."
              />
              <p className="text-xs text-white/80">Pulsa Enter para enviar.</p>
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
