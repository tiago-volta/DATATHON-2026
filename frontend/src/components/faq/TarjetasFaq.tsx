'use client'

import { useState, useId } from 'react'
import type { RolPerfil } from '@/lib/perfil/tipos'
import { obtenerFaqsPorRol, type FaqRol } from '@/lib/roles'

interface Props {
  rolInicial?: RolPerfil | null
  mostrarSelectorRol?: boolean
  onSeleccionarPregunta?: (pregunta: string) => void
}

const ROLES_ETIQUETAS: { id: RolPerfil; label: string }[] = [
  { id: 'testigo', label: 'Testigo' },
  { id: 'investigado', label: 'Investigado o acusado' },
  { id: 'victima', label: 'Víctima' },
  { id: 'parte_civil', label: 'Parte civil' },
]

export function TarjetasFaq({
  rolInicial,
  mostrarSelectorRol = true,
  onSeleccionarPregunta,
}: Props) {
  const baseId = useId()
  const [rolActivo, setRolActivo] = useState<RolPerfil>(rolInicial ?? 'testigo')
  const [faqAbierta, setFaqAbierta] = useState<number | null>(null)

  const faqs = obtenerFaqsPorRol(rolActivo)

  const alternarFaq = (index: number) => {
    setFaqAbierta(faqAbierta === index ? null : index)
  }

  return (
    <div className="space-y-4">
      {mostrarSelectorRol && (
        <div className="flex flex-wrap gap-2 items-center" role="group" aria-label="Filtrar preguntas por tu papel">
          <span className="text-xs font-bold text-court-700 uppercase tracking-wide mr-1">
            Tu papel:
          </span>
          {ROLES_ETIQUETAS.map((r) => {
            const activo = rolActivo === r.id
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => {
                  setRolActivo(r.id)
                  setFaqAbierta(null)
                }}
                className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors min-h-[36px] ${
                  activo
                    ? 'bg-court-900 text-white shadow-sm'
                    : 'bg-court-100 text-court-800 hover:bg-court-200'
                }`}
                aria-pressed={activo}
              >
                {r.label}
              </button>
            )
          })}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4" role="region" aria-label={`Preguntas frecuentes para ${rolActivo}`}>
        {faqs.map((faq: FaqRol, idx: number) => {
          const abierta = faqAbierta === idx
          const contenidoId = `${baseId}-faq-${idx}`
          const botonId = `${baseId}-btn-${idx}`

          return (
            <div
              key={idx}
              className="card border-2 border-court-200 hover:border-court-400 transition-colors p-4 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] bg-court-100 text-court-800 px-2.5 py-0.5 rounded-full font-bold">
                    {faq.articulo}
                  </span>
                  {faq.enlace_boe && (
                    <a
                      href={faq.enlace_boe}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-court-600 hover:text-court-900 underline font-medium inline-flex items-center gap-1"
                      aria-label={`Ver ${faq.articulo} en el Boletín Oficial del Estado (abre en ventana nueva)`}
                    >
                      BOE
                      <span aria-hidden="true">↗</span>
                    </a>
                  )}
                </div>

                <h3 className="font-bold text-court-900 text-base mb-2">
                  {faq.pregunta}
                </h3>
              </div>

              {abierta ? (
                <div
                  id={contenidoId}
                  role="region"
                  aria-labelledby={botonId}
                  className="space-y-3 pt-3 border-t border-court-100"
                >
                  <p className="text-sm text-court-800 leading-relaxed">
                    {faq.respuesta}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {onSeleccionarPregunta && (
                      <button
                        type="button"
                        onClick={() => onSeleccionarPregunta(faq.pregunta)}
                        className="btn-ghost text-xs py-1.5 px-3 min-h-[38px] text-court-700"
                      >
                        Preguntar al asistente
                      </button>
                    )}
                    <button
                      type="button"
                      id={botonId}
                      onClick={() => alternarFaq(idx)}
                      aria-expanded={true}
                      aria-controls={contenidoId}
                      className="btn-ghost text-xs py-1.5 px-3 min-h-[38px] text-court-600 ml-auto"
                    >
                      Cerrar ▲
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-court-100">
                  <button
                    type="button"
                    id={botonId}
                    onClick={() => alternarFaq(idx)}
                    aria-expanded={false}
                    aria-controls={contenidoId}
                    className="btn-secondary text-xs py-1.5 px-3 min-h-[38px]"
                  >
                    Ver respuesta ▼
                  </button>
                  {onSeleccionarPregunta && (
                    <button
                      type="button"
                      onClick={() => onSeleccionarPregunta(faq.pregunta)}
                      className="text-xs text-court-600 hover:text-court-900 underline font-medium min-h-[38px] inline-flex items-center"
                    >
                      Usar en mi pregunta
                    </button>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

