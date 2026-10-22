'use client'

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const CLAVE = 'sala-previa-tutorial-mira-sala-v1'

export function tutorialMiraSalaYaVisto(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(CLAVE) === '1'
  } catch {
    return false
  }
}

export function marcarTutorialMiraSalaVisto() {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(CLAVE, '1')
  } catch {
    /* ignore */
  }
}

export type AnclaTutorial =
  | 'menu'
  | 'ajustes'
  | 'distracciones'
  | 'pantalla-completa'
  | 'arrastrar'
  | 'aviso'

export interface EstadoPasoTutorial {
  menuAbierto: boolean
  avisoDemo: string | null
}

interface PasoTutorial {
  titulo: string
  texto: string
  ancla: AnclaTutorial | null
  menuAbierto: boolean
  avisoDemo: string | null
  colocacion: 'abajo' | 'arriba' | 'izquierda' | 'derecha' | 'centro'
}

const AVISO_DEMO =
  'Ejemplo: alguien entra en la sala. Lee el aviso antes del ruido.'

const PASOS: PasoTutorial[] = [
  {
    titulo: 'Mira la sala',
    texto: 'Aquí ves cómo es una sala de vistas. Te enseño los controles, uno a uno.',
    ancla: null,
    menuAbierto: false,
    avisoDemo: null,
    colocacion: 'centro',
  },
  {
    titulo: 'Menú',
    texto: 'Arriba a la izquierda. Ahí están Mirar, Ajustes y Distracciones.',
    ancla: 'menu',
    menuAbierto: false,
    avisoDemo: null,
    colocacion: 'abajo',
  },
  {
    titulo: 'Ajustes',
    texto: 'Personas, ruido y luz. Tú eliges cómo se siente la sala.',
    ancla: 'ajustes',
    menuAbierto: true,
    avisoDemo: null,
    colocacion: 'derecha',
  },
  {
    titulo: 'Distracciones',
    texto: 'Puedes apagarlas o poner pocas o muchas. Son ruidos de la sala.',
    ancla: 'distracciones',
    menuAbierto: true,
    avisoDemo: null,
    colocacion: 'derecha',
  },
  {
    titulo: 'Pantalla completa',
    texto: 'Arriba a la derecha. La sala ocupa toda la pantalla.',
    ancla: 'pantalla-completa',
    menuAbierto: false,
    avisoDemo: null,
    colocacion: 'abajo',
  },
  {
    titulo: 'Mirar alrededor',
    texto: 'Arrastra en la imagen para mirar a los lados.',
    ancla: 'arrastrar',
    menuAbierto: false,
    avisoDemo: null,
    colocacion: 'centro',
  },
  {
    titulo: 'Avisos',
    texto: 'Si hay un aviso, sale en una barra negra abajo. Léelo antes del ruido.',
    ancla: 'aviso',
    menuAbierto: false,
    avisoDemo: AVISO_DEMO,
    colocacion: 'arriba',
  },
]

interface RectAncla {
  top: number
  left: number
  width: number
  height: number
}

interface Props {
  abierto: boolean
  onCerrar: () => void
  onPasoChange?: (estado: EstadoPasoTutorial) => void
}

function leerRect(ancla: AnclaTutorial | null): RectAncla | null {
  if (!ancla || typeof document === 'undefined') return null
  const el = document.querySelector(`[data-tutorial="${ancla}"]`)
  if (!el) return null
  const r = el.getBoundingClientRect()
  if (r.width < 1 && r.height < 1) return null
  return { top: r.top, left: r.left, width: r.width, height: r.height }
}

function posicionPop(
  rect: RectAncla | null,
  colocacion: PasoTutorial['colocacion'],
  popW: number,
  popH: number
): { top: number; left: number; flecha: 'arriba' | 'abajo' | 'izquierda' | 'derecha' | null } {
  const margen = 12
  const vw = typeof window !== 'undefined' ? window.innerWidth : 800
  const vh = typeof window !== 'undefined' ? window.innerHeight : 600

  if (!rect || colocacion === 'centro') {
    return {
      top: Math.max(margen, (vh - popH) / 2),
      left: Math.max(margen, (vw - popW) / 2),
      flecha: null,
    }
  }

  let top = rect.top
  let left = rect.left
  let flecha: 'arriba' | 'abajo' | 'izquierda' | 'derecha' | null = null

  if (colocacion === 'abajo') {
    top = rect.top + rect.height + 14
    left = rect.left + rect.width / 2 - popW / 2
    flecha = 'arriba'
  } else if (colocacion === 'arriba') {
    top = rect.top - popH - 14
    left = rect.left + rect.width / 2 - popW / 2
    flecha = 'abajo'
  } else if (colocacion === 'derecha') {
    top = rect.top + rect.height / 2 - popH / 2
    left = rect.left + rect.width + 14
    flecha = 'izquierda'
  } else {
    top = rect.top + rect.height / 2 - popH / 2
    left = rect.left - popW - 14
    flecha = 'derecha'
  }

  left = Math.min(Math.max(margen, left), vw - popW - margen)
  top = Math.min(Math.max(margen, top), vh - popH - margen)

  return { top, left, flecha }
}

export function TutorialMiraSala({ abierto, onCerrar, onPasoChange }: Props) {
  const tituloId = useId()
  const descId = useId()
  const liveId = useId()
  const reduced = useReducedMotion()
  const [indice, setIndice] = useState(0)
  const [rect, setRect] = useState<RectAncla | null>(null)
  const popRef = useRef<HTMLDivElement>(null)
  const siguienteRef = useRef<HTMLButtonElement>(null)
  const [popSize, setPopSize] = useState({ w: 300, h: 200 })

  const paso = PASOS[indice] ?? PASOS[0]
  const esUltimo = indice >= PASOS.length - 1
  const total = PASOS.length

  const emitirPaso = useCallback(
    (i: number) => {
      const p = PASOS[i] ?? PASOS[0]
      onPasoChange?.({ menuAbierto: p.menuAbierto, avisoDemo: p.avisoDemo })
    },
    [onPasoChange]
  )

  useEffect(() => {
    if (!abierto) return
    setIndice(0)
    emitirPaso(0)
  }, [abierto, emitirPaso])

  useEffect(() => {
    if (!abierto) {
      onPasoChange?.({ menuAbierto: false, avisoDemo: null })
    }
  }, [abierto, onPasoChange])

  const medir = useCallback(() => {
    setRect(leerRect(paso.ancla))
    const pop = popRef.current
    if (pop) {
      setPopSize({ w: pop.offsetWidth, h: pop.offsetHeight })
    }
  }, [paso.ancla])

  useLayoutEffect(() => {
    if (!abierto) return
    medir()
    const t = window.setTimeout(medir, 80)
    const t2 = window.setTimeout(medir, 220)
    window.addEventListener('resize', medir)
    window.addEventListener('scroll', medir, true)
    return () => {
      window.clearTimeout(t)
      window.clearTimeout(t2)
      window.removeEventListener('resize', medir)
      window.removeEventListener('scroll', medir, true)
    }
  }, [abierto, indice, paso.menuAbierto, paso.avisoDemo, medir])

  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        onCerrar()
      }
    }
    window.addEventListener('keydown', onKey, true)
    siguienteRef.current?.focus()
    return () => window.removeEventListener('keydown', onKey, true)
  }, [abierto, indice, onCerrar])

  const irSiguiente = () => {
    if (esUltimo) {
      onCerrar()
      return
    }
    const next = indice + 1
    setIndice(next)
    emitirPaso(next)
  }

  const irAnterior = () => {
    if (indice <= 0) return
    const prev = indice - 1
    setIndice(prev)
    emitirPaso(prev)
  }

  if (!abierto) return null

  const pos = posicionPop(rect, paso.colocacion, popSize.w, popSize.h)
  const highlightPad = 6
  const anillo =
    rect && paso.ancla
      ? {
          top: Math.max(0, rect.top - highlightPad),
          left: Math.max(0, rect.left - highlightPad),
          width: rect.width + highlightPad * 2,
          height: rect.height + highlightPad * 2,
        }
      : null

  return (
    <div className="fixed inset-0 z-[10000]" role="presentation">
      {anillo ? (
        <div
          className={`absolute pointer-events-none rounded-suave border-2 border-court-100 bg-transparent shadow-[0_0_0_9999px_rgba(26,35,50,0.45)] ${
            reduced ? '' : 'transition-[top,left,width,height] duration-200 ease-out'
          }`}
          style={{
            top: anillo.top,
            left: anillo.left,
            width: anillo.width,
            height: anillo.height,
          }}
          aria-hidden="true"
        />
      ) : (
        <div className="absolute inset-0 bg-court-900/45 pointer-events-none" aria-hidden="true" />
      )}

      <div
        ref={popRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={descId}
        className="absolute z-10 w-[min(100%-1.5rem,20rem)] rounded-tarjeta border-2 border-court-800 bg-calma-cream p-4 shadow-lg text-left"
        style={{ top: pos.top, left: pos.left }}
      >
        {pos.flecha === 'arriba' && (
          <span
            className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-l-transparent border-r-transparent border-b-court-800"
            aria-hidden="true"
          />
        )}
        {pos.flecha === 'abajo' && (
          <span
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-court-800"
            aria-hidden="true"
          />
        )}
        {pos.flecha === 'izquierda' && (
          <span
            className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-t-transparent border-b-transparent border-r-court-800"
            aria-hidden="true"
          />
        )}
        {pos.flecha === 'derecha' && (
          <span
            className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-l-8 border-t-transparent border-b-transparent border-l-court-800"
            aria-hidden="true"
          />
        )}

        <p id={liveId} className="sr-only" aria-live="polite" aria-atomic="true">
          Paso {indice + 1} de {total}. {paso.titulo}. {paso.texto}
        </p>

        <p className="text-xs font-bold tracking-wide text-court-700 mb-1">
          Paso {indice + 1} de {total}
        </p>
        <h2 id={tituloId} className="text-lg font-bold text-court-900 mb-1">
          {paso.titulo}
        </h2>
        <p id={descId} className="text-court-800 mb-4 leading-snug">
          {paso.texto}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {indice > 0 && (
            <button
              type="button"
              className="btn-ghost min-h-[44px] text-sm border border-court-200"
              onClick={irAnterior}
            >
              Anterior
            </button>
          )}
          <button
            ref={siguienteRef}
            type="button"
            className="btn-primary min-h-[44px] text-sm"
            onClick={irSiguiente}
          >
            {esUltimo ? 'Entendido' : 'Siguiente'}
          </button>
          <button
            type="button"
            className="btn-ghost min-h-[44px] text-sm text-court-700 underline-offset-2 hover:underline"
            onClick={onCerrar}
          >
            Saltar tutorial
          </button>
        </div>
      </div>
    </div>
  )
}
