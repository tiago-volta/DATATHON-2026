'use client'

import { useId } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { NIVELES } from '@/lib/sala-previa/niveles'

interface Props {
  nivelActual: number
  nivelMaximo: number
  onSeleccionar: (nivel: number) => void
}

type EstadoNivel = 'actual' | 'desbloqueado' | 'bloqueado'

function estadoDeNivel(id: number, nivelActual: number, nivelMaximo: number): EstadoNivel {
  if (id === nivelActual) return 'actual'
  if (id <= nivelMaximo) return 'desbloqueado'
  return 'bloqueado'
}

function IconoHecho() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4.5 10.5 8 14l7.5-8"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconoAqui() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="2" />
      <circle cx="10" cy="10" r="2.75" fill="currentColor" />
    </svg>
  )
}

function IconoTodaviaNo() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M7.5 10h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

const META_ESTADO: Record<
  EstadoNivel,
  {
    etiqueta: string
    explicacion: string
    Icono: () => JSX.Element
  }
> = {
  actual: {
    etiqueta: 'Estás aquí',
    explicacion: 'Nivel en el que estás ahora.',
    Icono: IconoAqui,
  },
  desbloqueado: {
    etiqueta: 'Hecho',
    explicacion: 'Ya lo practicaste. Puedes volver cuando quieras.',
    Icono: IconoHecho,
  },
  bloqueado: {
    etiqueta: 'Todavía no',
    explicacion: 'Este nivel se abre cuando subas a tu ritmo.',
    Icono: IconoTodaviaNo,
  },
}

export function MapaNiveles({ nivelActual, nivelMaximo, onSeleccionar }: Props) {
  const reduced = useReducedMotion()
  const tituloId = useId()
  const ayudaId = useId()

  return (
    <nav aria-labelledby={tituloId} className="card">
      <h2 id={tituloId} className="font-bold text-court-800 mb-1">
        Tu mapa de niveles
      </h2>
      <p id={ayudaId} className="text-sm text-court-700 mb-4">
        Seis pasos, del silencio a la sala llena. Solo avanzas si tú quieres.
      </p>

      <ol className="flex flex-col gap-2" aria-describedby={ayudaId}>
        {NIVELES.map((nivel) => {
          const estado = estadoDeNivel(nivel.id, nivelActual, nivelMaximo)
          const meta = META_ESTADO[estado]
          const { Icono } = meta
          const desbloqueado = estado !== 'bloqueado'
          const estadoId = `mapa-nivel-${nivel.id}-estado`

          return (
            <li key={nivel.id}>
              <button
                type="button"
                onClick={() => {
                  if (desbloqueado) onSeleccionar(nivel.id)
                }}
                disabled={!desbloqueado}
                aria-disabled={!desbloqueado}
                aria-current={estado === 'actual' ? 'step' : undefined}
                aria-describedby={estadoId}
                className={`w-full text-left flex items-center gap-3 px-3 py-3 min-h-[48px] rounded-suave border-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-court-400 focus-visible:ring-offset-2 ${
                  estado === 'actual'
                    ? 'border-court-600 bg-court-50 shadow-sm'
                    : estado === 'desbloqueado'
                      ? 'border-court-200 bg-white hover:border-court-400 hover:bg-calma-mist/40'
                      : 'border-court-100 bg-calma-mist/50 text-court-700 cursor-not-allowed'
                }`}
                style={{
                  transition: reduced
                    ? 'none'
                    : 'border-color 180ms ease-out, background-color 180ms ease-out',
                }}
              >
                <span
                  className={`shrink-0 flex items-center justify-center w-11 h-11 min-w-[44px] min-h-[44px] rounded-suave border-2 ${
                    estado === 'actual'
                      ? 'border-court-600 bg-court-600 text-white'
                      : estado === 'desbloqueado'
                        ? 'border-accent-success/60 bg-accent-success/20 text-court-800'
                        : 'border-court-200 bg-white text-court-600'
                  }`}
                  aria-hidden="true"
                >
                  <Icono />
                </span>

                <span className="flex-1 min-w-0">
                  <span className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className="font-bold text-court-800">
                      Nivel {nivel.id}. {nivel.nombre}
                    </span>
                    <span
                      id={estadoId}
                      className={`text-sm font-medium ${
                        estado === 'actual'
                          ? 'text-court-800'
                          : estado === 'desbloqueado'
                            ? 'text-court-700'
                            : 'text-court-600'
                      }`}
                    >
                      {meta.etiqueta}
                      <span className="sr-only">. {meta.explicacion}</span>
                    </span>
                  </span>
                  <span className="block text-sm text-court-700 mt-0.5">
                    {nivel.descripcion}
                  </span>
                </span>

                {desbloqueado && estado !== 'actual' && (
                  <span className="shrink-0 text-sm text-court-700 font-medium hidden sm:inline">
                    Volver
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ol>

      <p className="text-sm text-court-700 mt-4">
        No hay puntos ni ranking. Puedes repetir un nivel hecho cuando quieras.
      </p>
    </nav>
  )
}
