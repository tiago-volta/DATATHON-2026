'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { EscenaSensorial } from '@/components/sala-previa/EscenaSensorial'
import { DialogoEnsayoSala } from '@/components/sala-previa/DialogoEnsayoSala'
import type { MiradaSala } from '@/lib/sala-previa/salaVistasConfig'
import {
  ESCENAS_JUZGADO,
  TOTAL_ESCENAS,
  etiquetaNivelTipico,
  nivelVisualDesdeEscena,
} from '@/lib/sala-previa/escenas'
import type { IdEstimulo, ValoresEstimulo } from '@/lib/sala-previa/tipos'

interface Props {
  indice: number
  onCambiar: (indice: number) => void
  valores: ValoresEstimulo
  enCalma: boolean
  onChangeEstimulo?: (id: IdEstimulo, valor: number) => void
  onPedirPausa?: () => void
  onNivelCompletado?: (nivelId: number) => void
  onProgresoPreguntas?: (total: number) => void
}

export function RecorridoEscenas({
  indice,
  onCambiar,
  valores,
  enCalma,
  onChangeEstimulo,
  onPedirPausa,
  onNivelCompletado,
  onProgresoPreguntas,
}: Props) {
  const tituloId = useId()
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const prevIndice = useRef(indice)
  const [miradaEnsayo, setMiradaEnsayo] = useState<MiradaSala | null>(null)
  const [ensayoAbierto, setEnsayoAbierto] = useState(true)
  const [personaEntrando, setPersonaEntrando] = useState(false)

  const seguro = Math.min(TOTAL_ESCENAS - 1, Math.max(0, indice))
  const escena = ESCENAS_JUZGADO[seguro]
  const paso = seguro + 1
  const nivelVisual = nivelVisualDesdeEscena(escena, valores)
  const tipico = etiquetaNivelTipico(escena)

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
          className="text-sm font-bold text-court-800"
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
              {escena.roles.map((rol) => (
                <li key={rol.nombre} className="text-court-700">
                  <span className="font-bold text-court-800">{rol.nombre}.</span>{' '}
                  {rol.explicacion}
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
              Aquí ves y oyes solo lo que tú eliges. No subimos nada por ti.
            </p>
          )}
        </div>

        <EscenaSensorial
          nivel={nivelVisual}
          escenaId={escena.id}
          valores={valores}
          enCalma={enCalma}
          onChangeEstimulo={onChangeEstimulo}
          deshabilitadoEstimulos={enCalma}
          miradaExterna={escena.id === 'sala-vistas' ? miradaEnsayo : null}
          personaEntrando={escena.id === 'sala-vistas' ? personaEntrando : false}
        />

        {escena.id === 'sala-vistas' && (
          <div className="space-y-4 pt-2">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-suave border border-court-200">
              <div>
                <p className="font-bold text-court-800 text-sm">Ensayo de declaración en sala</p>
                <p className="text-xs text-court-600">Simulación interactiva con juez, letrados y estímulos</p>
              </div>
              <button
                type="button"
                onClick={() => setEnsayoAbierto(!ensayoAbierto)}
                aria-expanded={ensayoAbierto}
                className={`btn ${ensayoAbierto ? 'btn-secondary' : 'btn-primary'} text-xs py-1.5 px-3 min-h-[38px]`}
              >
                {ensayoAbierto ? 'Ocultar preguntas de ensayo' : 'Abrir preguntas de ensayo'}
              </button>
            </div>

            {ensayoAbierto && (
              <DialogoEnsayoSala
                enCalma={enCalma}
                aforoGente={valores.gente}
                onCambioMirada={(m) => setMiradaEnsayo(m)}
                onPedirPausa={() => onPedirPausa?.()}
                onNivelCompletado={(id) => onNivelCompletado?.(id)}
                onProgresoPreguntas={(n) => onProgresoPreguntas?.(n)}
                onPersonaEntrando={setPersonaEntrando}
                onSubirAforoEstimulo={() => {
                  onChangeEstimulo?.('gente', Math.min(100, Math.max(valores.gente + 20, 25)))
                  onChangeEstimulo?.('ruido', Math.min(100, Math.max(valores.ruido + 15, 20)))
                }}
              />
            )}
          </div>
        )}
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
        <span className="text-court-600 text-sm" aria-hidden="true">
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

      {seguro >= TOTAL_ESCENAS - 1 && (
        <div
          className="rounded-tarjeta border border-court-200 bg-court-50 p-4 space-y-2"
          aria-live="polite"
        >
          <p className="text-sm text-court-800 font-medium">
            ¿Has terminado de ensayar? Puedes registrar los ajustes que necesitas:
          </p>
          <Link
            href="/pasaporte?ajustes=preguntas-claras,mas-tiempo,pausas"
            className="btn-secondary inline-flex text-center text-sm"
          >
            Guardar ajustes para el juicio en mi Pasaporte
          </Link>
        </div>
      )}
    </section>
  )
}
