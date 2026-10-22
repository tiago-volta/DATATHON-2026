'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { EscenaSensorial } from '@/components/sala-previa/EscenaSensorial'
import { DialogoEnsayoSala } from '@/components/sala-previa/DialogoEnsayoSala'
import { papelDesdeRol, type MiradaSala } from '@/lib/sala-previa/salaVistasConfig'
import type { TipoDistraccion } from '@/lib/sala-previa/distracciones'
import type { RolPerfil } from '@/lib/perfil/tipos'
import {
  escenasPorRol,
  etiquetaNivelTipico,
  nivelVisualDesdeEscena,
} from '@/lib/sala-previa/escenas'
import type { ValoresEstimulo } from '@/lib/sala-previa/tipos'

interface Props {
  indice: number
  onCambiar: (indice: number) => void
  valores: ValoresEstimulo
  enCalma: boolean
  rol?: RolPerfil
  onPedirPausa?: () => void
  onNivelCompletado?: (nivelId: number) => void
  onProgresoPreguntas?: (total: number) => void
  eventoSala?: { id: number; tipo: TipoDistraccion } | null
}

export function RecorridoEscenas({
  indice,
  onCambiar,
  valores,
  enCalma,
  rol = 'testigo',
  onPedirPausa,
  onNivelCompletado,
  onProgresoPreguntas,
  eventoSala,
}: Props) {
  const tituloId = useId()
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const prevIndice = useRef(indice)
  const [miradaEnsayo, setMiradaEnsayo] = useState<MiradaSala | null>(null)
  const [ensayoAbierto, setEnsayoAbierto] = useState(true)
  const [personaEntrando, setPersonaEntrando] = useState(false)

  const escenas = escenasPorRol(rol)
  const total = escenas.length
  const seguro = Math.min(total - 1, Math.max(0, indice))
  const escena = escenas[seguro]
  const paso = seguro + 1
  const nivelVisual = nivelVisualDesdeEscena(escena, valores)
  const tipico = etiquetaNivelTipico(escena)
  const papel = papelDesdeRol(rol, escena.id)

  useEffect(() => {
    if (prevIndice.current === seguro) return
    prevIndice.current = seguro
    tituloRef.current?.focus()
  }, [seguro])

  const irAnterior = () => {
    if (seguro <= 0) return
    onCambiar(seguro - 1)
  }

  const irSiguiente = () => {
    if (seguro >= total - 1) return
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
          className="text-sm font-bold text-court-800"
          aria-live="polite"
          aria-atomic="true"
        >
          Paso {paso} de {total}: {escena.titulo}
        </p>
        <ol
          className="flex gap-2"
          aria-label={`Progreso del recorrido: paso ${paso} de ${total}`}
        >
          {escenas.map((e, i) => {
            const actual = i === seguro
            const pasado = i < seguro
            return (
              <li key={e.id}>
                <button
                  type="button"
                  onClick={() => onCambiar(i)}
                  className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2 -m-1 rounded-suave"
                  aria-label={`Ir al paso ${i + 1}: ${e.titulo}`}
                  aria-current={actual ? 'step' : undefined}
                >
                  <span
                    className={`block w-3 h-3 rounded-full border-2 ${
                      actual
                        ? 'bg-court-600 border-court-600'
                        : pasado
                          ? 'bg-accent-success/60 border-accent-success'
                          : 'bg-court-100 border-court-300'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </li>
            )
          })}
        </ol>
      </div>

      <div key={escena.id} className="space-y-4">
        <div className="card border-2 border-court-200">
          <h2
            id={tituloId}
            ref={tituloRef}
            tabIndex={-1}
            className="text-2xl font-bold text-court-800 mb-2 outline-none focus-visible:ring-4 focus-visible:ring-court-400 focus-visible:ring-offset-2 rounded-suave"
          >
            {escena.titulo}
          </h2>
          <p className="text-lg text-court-700 mb-4">{escena.frase}</p>

          <div className="mb-4">
            <h3 className="font-bold text-court-800 mb-2">Quién está aquí</h3>
            <ul className="space-y-3">
              {escena.roles.map((r) => (
                <li key={r.nombre} className="text-court-700">
                  <span className="font-bold text-court-800">{r.nombre}.</span>{' '}
                  {r.explicacion}
                </li>
              ))}
            </ul>
          </div>

          {tipico && (
            <p
              className="text-sm text-court-700 rounded-suave bg-court-50 border border-court-100 px-3 py-2"
              role="note"
            >
              En un día real, esta zona suele parecerse al nivel «{tipico}».
              Aquí el ambiente es estable; el realismo viene de interrupciones
              (móvil, tos, puerta, murmullos…). Puedes apagarlas o poner pocas o muchas.
            </p>
          )}
        </div>

        <EscenaSensorial
          nivel={nivelVisual}
          escenaId={escena.id}
          valores={valores}
          enCalma={enCalma}
          personaEntrando={personaEntrando}
          papel={papel}
          eventoExterno={eventoSala}
          miradaExterna={miradaEnsayo}
        />

        {/* Solo en la sala de vistas abrimos el diálogo de ensayo interactivo */}
        {(escena.id === 'sala-vistas' ||
          escena.id === 'sala-investigado' ||
          escena.id === 'sala-protegida' ||
          escena.id === 'vista-civil') && (
          <div className="space-y-3 pt-2">
            <button
              type="button"
              onClick={() => setEnsayoAbierto((v) => !v)}
              className="btn-secondary w-full text-base py-3 flex items-center justify-between"
              aria-expanded={ensayoAbierto}
              aria-controls="bloque-ensayo-declaracion"
            >
              <span className="font-bold">
                {ensayoAbierto
                  ? '▼ Ocultar ensayo de preguntas'
                  : '▶ Ensayar preguntas con el juez y el abogado'}
              </span>
              <span className="text-sm text-court-700">
                Paso 3 de 3 · Ensayo
              </span>
            </button>

            {ensayoAbierto && (
              <div id="bloque-ensayo-declaracion" className="space-y-3">
                <p className="text-xs text-court-700 text-center">
                  El juez y el abogado te hacen preguntas. Al responder, la cámara se orienta hacia quien habla.
                </p>
                <DialogoEnsayoSala
                  enCalma={enCalma}
                  onCambioMirada={setMiradaEnsayo}
                  onPedirPausa={onPedirPausa ?? (() => {})}
                  onPersonaEntrando={setPersonaEntrando}
                  onNivelCompletado={onNivelCompletado}
                  onProgresoPreguntas={onProgresoPreguntas}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={irAnterior}
            disabled={seguro <= 0}
            className="btn-secondary disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Ir a la escena anterior"
          >
            ← Anterior
          </button>
          <span className="text-sm text-court-700">
            Escena {paso} de {total}
          </span>
          {seguro < total - 1 ? (
            <button
              type="button"
              onClick={irSiguiente}
              className="btn-primary"
              aria-label="Ir a la siguiente escena"
            >
              Siguiente →
            </button>
          ) : (
            <Link
              href="/pasaporte"
              className="btn-primary inline-flex items-center gap-2"
            >
              Crear Pasaporte con tus ajustes →
            </Link>
          )}
        </div>
      </div>
    </section>
  )
}
