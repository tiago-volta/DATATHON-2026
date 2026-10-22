'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { EscenaSensorial } from '@/components/sala-previa/EscenaSensorial'
import {
  TutorialMiraSala,
  marcarTutorialMiraSalaVisto,
  tutorialMiraSalaYaVisto,
  type EstadoPasoTutorial,
} from '@/components/sala-previa/TutorialMiraSala'
import {
  ESCENAS_JUZGADO,
  nivelVisualDesdeEscena,
} from '@/lib/sala-previa/escenas'
import type { RolPerfil } from '@/lib/perfil/tipos'
import type { ValoresEstimulo } from '@/lib/sala-previa/tipos'
import { papelDesdeRol } from '@/lib/sala-previa/salaVistasConfig'

export type IdPasoSala = 'intro' | 'quien' | 'sala'

const PASOS: { id: IdPasoSala; titulo: string }[] = [
  { id: 'intro', titulo: 'Qué vas a hacer' },
  { id: 'quien', titulo: 'Quién hay en la sala' },
  { id: 'sala', titulo: 'Mira la sala' },
]

const ESCENA_SALA = ESCENAS_JUZGADO.find((e) => e.id === 'sala-vistas') ?? ESCENAS_JUZGADO[0]

function normalizarPaso(paso: string | undefined): IdPasoSala {
  if (paso === 'quien' || paso === 'sala' || paso === 'intro') return paso
  // Antiguo paso «ajustes» → sala (ajustes van al lado de la vista)
  if (paso === 'ajustes') return 'sala'
  return 'intro'
}

interface Props {
  valores: ValoresEstimulo
  onValores: (valores: ValoresEstimulo) => void
  rol: RolPerfil
  enCalma: boolean
  pasoInicial?: IdPasoSala | 'ajustes'
}

export function PasosSalaPrevia({
  valores,
  onValores,
  rol,
  enCalma,
  pasoInicial = 'intro',
}: Props) {
  const tituloId = useId()
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const [paso, setPaso] = useState<IdPasoSala>(() => normalizarPaso(pasoInicial))
  const [tutorialAbierto, setTutorialAbierto] = useState(false)
  const [tutorialPaso, setTutorialPaso] = useState<EstadoPasoTutorial>({
    menuAbierto: false,
    avisoDemo: null,
  })
  const indice = PASOS.findIndex((p) => p.id === paso)
  const actual = PASOS[indice] ?? PASOS[0]
  const esUltimo = indice >= PASOS.length - 1
  const papel = papelDesdeRol(rol === 'desconocido' ? 'testigo' : rol, 'sala-vistas')
  const nivelVisual = nivelVisualDesdeEscena(ESCENA_SALA, valores)

  useEffect(() => {
    tituloRef.current?.focus()
  }, [paso])

  useEffect(() => {
    if (paso !== 'sala') return
    if (tutorialMiraSalaYaVisto()) return
    setTutorialAbierto(true)
  }, [paso])

  const cerrarTutorial = useCallback(() => {
    marcarTutorialMiraSalaVisto()
    setTutorialAbierto(false)
    setTutorialPaso({ menuAbierto: false, avisoDemo: null })
  }, [])

  const onTutorialPaso = useCallback((estado: EstadoPasoTutorial) => {
    setTutorialPaso(estado)
  }, [])

  const irAnterior = () => {
    if (indice <= 0) return
    setPaso(PASOS[indice - 1].id)
  }

  const irSiguiente = () => {
    if (esUltimo) return
    setPaso(PASOS[indice + 1].id)
  }

  return (
    <div className="space-y-6 w-full flex flex-col items-center text-center">
      <p className="text-sm font-bold text-court-800" aria-live="polite" aria-atomic="true">
        Paso {indice + 1} de {PASOS.length}: {actual.titulo}
      </p>

      <ol
        className="flex gap-2 justify-center"
        aria-label={`Progreso: paso ${indice + 1} de ${PASOS.length}`}
      >
        {PASOS.map((p, i) => (
          <li key={p.id}>
            <button
              type="button"
              className="inline-flex items-center justify-center min-w-[44px] min-h-[44px] p-2 -m-1 rounded-suave"
              aria-label={`Ir al paso ${i + 1}: ${p.titulo}`}
              aria-current={i === indice ? 'step' : undefined}
              onClick={() => setPaso(p.id)}
            >
              <span
                className={`block w-3 h-3 rounded-full border-2 ${
                  i === indice
                    ? 'bg-court-600 border-court-600'
                    : i < indice
                      ? 'bg-accent-success/60 border-accent-success'
                      : 'bg-court-100 border-court-300'
                }`}
                aria-hidden="true"
              />
            </button>
          </li>
        ))}
      </ol>

      <div className="space-y-4 w-full">
        <h2
          id={tituloId}
          ref={tituloRef}
          tabIndex={-1}
          className="text-2xl font-bold text-court-800 outline-none focus-visible:ring-4 focus-visible:ring-court-400 focus-visible:ring-offset-2 rounded-suave"
        >
          {actual.titulo}
        </h2>

        {paso === 'intro' && (
          <div className="card border-2 border-court-200 space-y-3 text-left sm:text-center">
            <p className="text-lg text-court-800">
              Vas a conocer la sala de vistas, poco a poco.
            </p>
            <p className="text-court-700">
              Primero verás quién hay. Luego miras la sala y ajustas el ambiente.
              Al final pasas a la simulación para ensayar las preguntas.
            </p>
            <p className="text-court-700">Tú mandas el ritmo. Puedes parar cuando quieras.</p>
          </div>
        )}

        {paso === 'quien' && (
          <div className="card border-2 border-court-200 space-y-4 text-left sm:text-center">
            <p className="text-court-700">{ESCENA_SALA.frase}</p>

            <div>
              <h3 className="font-bold text-court-800 mb-2">Quién está aquí</h3>
              <ul className="space-y-3 text-left max-w-prose mx-auto">
                {ESCENA_SALA.roles.map((r) => (
                  <li key={r.nombre} className="text-court-700">
                    <span className="font-bold text-court-800">{r.nombre}.</span>{' '}
                    {r.explicacion}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {paso === 'sala' && (
          <div className="space-y-3 w-full text-left">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <p className="text-court-700 text-center">
                Arrastra para mirar. Usa el Menú de arriba a la izquierda.
              </p>
              <button
                type="button"
                className="btn-ghost text-sm min-h-[44px] border border-court-200"
                onClick={() => setTutorialAbierto(true)}
              >
                Ver ayuda
              </button>
            </div>
            <EscenaSensorial
              nivel={nivelVisual}
              escenaId="sala-vistas"
              valores={valores}
              enCalma={enCalma}
              papel={papel}
              ocultarFicha
              vistaAmplia
              onCambiarValores={onValores}
              tutorialMenuAbierto={tutorialAbierto ? tutorialPaso.menuAbierto : undefined}
              tutorialAvisoDemo={tutorialAbierto ? tutorialPaso.avisoDemo : null}
            />
            <TutorialMiraSala
              abierto={tutorialAbierto}
              onCerrar={cerrarTutorial}
              onPasoChange={onTutorialPaso}
            />
          </div>
        )}
      </div>

      <nav
        className="flex flex-wrap gap-3 pt-2 justify-center"
        aria-label="Pasos de la sala previa"
      >
        <button
          type="button"
          className="btn-ghost min-h-[44px]"
          onClick={irAnterior}
          disabled={indice <= 0}
        >
          Atrás
        </button>
        {!esUltimo ? (
          <button type="button" className="btn-primary min-h-[44px]" onClick={irSiguiente}>
            Siguiente
          </button>
        ) : (
          <Link
            href="/sala-previa/declaracion"
            className="btn-primary inline-flex items-center min-h-[44px]"
            onClick={() => onValores(valores)}
          >
            Ir a la simulación
          </Link>
        )}
      </nav>
      {esUltimo && (
        <p className="text-sm text-court-700 max-w-prose">
          Siguiente paso: ensayar las preguntas. Personas, ruido y luz se guardan para
          esa pantalla.
        </p>
      )}
    </div>
  )
}
