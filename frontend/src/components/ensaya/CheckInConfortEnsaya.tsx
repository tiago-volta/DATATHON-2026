'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import type { ConfortCheckIn } from '@/lib/sala-previa/tipos'

/** IDs ARASAAC fijos (CC BY-NC-SA), mismo patrón que Sala Previa. */
const OPCIONES: {
  valor: ConfortCheckIn
  etiqueta: string
  pictoId: number
  alt: string
}[] = [
  {
    valor: 'bien',
    etiqueta: 'Bien',
    pictoId: 5397,
    alt: 'Pictograma: bien',
  },
  {
    valor: 'regular',
    etiqueta: 'Regular',
    pictoId: 37183,
    alt: 'Pictograma: estoy regular',
  },
  {
    valor: 'mal',
    etiqueta: 'Mal',
    pictoId: 5504,
    alt: 'Pictograma: mal',
  },
]

function urlArasaac(id: number) {
  return `https://static.arasaac.org/pictograms/${id}/${id}_300.png`
}

function PictoConfort({
  id,
  alt,
  etiqueta,
}: {
  id: number
  alt: string
  etiqueta: string
}) {
  const [fallo, setFallo] = useState(false)

  if (fallo) {
    return (
      <span
        className="flex items-center justify-center w-20 h-20 rounded-suave bg-puente-100 text-puente-700 text-3xl font-bold"
        role="img"
        aria-label={alt}
        title={etiqueta}
      >
        {etiqueta.slice(0, 1)}
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={urlArasaac(id)}
      alt={alt}
      width={80}
      height={80}
      className="w-20 h-20 rounded-suave bg-white border border-puente-100 object-contain"
      loading="lazy"
      decoding="async"
      onError={() => setFallo(true)}
    />
  )
}

interface Props {
  /** Nombre del bloque de Ensaya acabado. */
  nivelNombre: string
  onContinuar: (confort: ConfortCheckIn) => void
  /** Cierra sin elegir (Escape / Cerrar). No castiga. */
  onCerrar: () => void
}

/**
 * Check-in de confort tras un bloque de Ensaya.
 * Sin diagnóstico: bien / regular / mal + sugerencias suaves si hace falta.
 */
export function CheckInConfortEnsaya({
  nivelNombre,
  onContinuar,
  onCerrar,
}: Props) {
  const [confort, setConfort] = useState<ConfortCheckIn | null>(null)
  const cerrarRef = useRef<HTMLButtonElement>(null)
  const tituloId = useId()
  const descId = useId()

  const necesitaApoyo = confort === 'regular' || confort === 'mal'

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null
    cerrarRef.current?.focus()
    return () => {
      previo?.focus?.()
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onCerrar()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCerrar])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={tituloId}
      aria-describedby={descId}
      className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-4 pb-28 bg-puente-900/40"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCerrar()
      }}
    >
      <div className="bg-white rounded-tarjeta border-2 border-puente-800 max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 id={tituloId} className="text-2xl font-bold text-puente-800">
            ¿Cómo te sientes?
          </h2>
          <button
            ref={cerrarRef}
            type="button"
            className="btn-ghost min-h-[44px] min-w-[44px] px-3 py-2 shrink-0"
            onClick={onCerrar}
            aria-label="Cerrar check-in"
          >
            Cerrar
          </button>
        </div>
        <p id={descId} className="text-puente-700 mb-6">
          Acabas de practicar: {nivelNombre}. No hay respuesta correcta. Pulsa
          Escape o Cerrar para seguir.
        </p>

        <div
          role="radiogroup"
          aria-label="Cómo te sientes"
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"
        >
          {OPCIONES.map((item) => {
            const activo = confort === item.valor
            return (
              <button
                key={item.valor}
                type="button"
                role="radio"
                aria-checked={activo}
                onClick={() => setConfort(item.valor)}
                className={`flex flex-col items-center gap-3 p-4 rounded-tarjeta border-2 min-h-[140px] transition-colors ${
                  activo
                    ? 'border-puente-500 bg-puente-50'
                    : 'border-puente-100 hover:border-puente-300'
                }`}
              >
                <PictoConfort
                  id={item.pictoId}
                  alt={item.alt}
                  etiqueta={item.etiqueta}
                />
                <span className="text-lg font-bold text-puente-800">
                  {item.etiqueta}
                </span>
              </button>
            )
          })}
        </div>

        {confort === 'bien' && (
          <div className="space-y-4">
            <p
              className="bg-accent-success/15 border border-accent-success rounded-lg p-4 text-puente-900"
              role="status"
              aria-live="polite"
            >
              Bien. Has practicado a tu ritmo. Puedes seguir o parar cuando
              quieras.
            </p>
            <button
              type="button"
              className="btn-primary w-full min-h-[44px]"
              onClick={() => onContinuar(confort)}
            >
              Seguir
            </button>
          </div>
        )}

        {necesitaApoyo && (
          <div className="space-y-4">
            <p
              className={`rounded-lg p-4 text-puente-900 ${
                confort === 'mal'
                  ? 'bg-accent-alert/15 border border-accent-alert'
                  : 'bg-calma-sage border border-puente-200'
              }`}
              role="status"
              aria-live="polite"
            >
              {confort === 'mal'
                ? 'Está bien parar. Puedes hacer una pausa, ir a Sala Previa o anotar ajustes en tu Pasaporte. No hay prisa.'
                : 'Si quieres, baja el ritmo: una pausa, Sala Previa o tu Pasaporte. Practica solo lo que te ayude.'}
            </p>

            <div className="flex flex-col gap-3">
              <Link
                href="/sala-previa?desde=ensaya"
                className="btn-primary w-full text-center min-h-[44px]"
              >
                Ir a Sala Previa
              </Link>
              <Link
                href="/pasaporte?ajustes=preguntas-claras,mas-tiempo,pausas"
                className="btn-secondary w-full text-center min-h-[44px]"
              >
                Abrir mi Pasaporte
              </Link>
              <button
                type="button"
                className="btn-ghost w-full min-h-[44px]"
                onClick={() => onContinuar(confort)}
              >
                Seguir con calma
              </button>
            </div>
          </div>
        )}

        <p className="text-xs text-puente-700 mt-6">
          Pictogramas:{' '}
          <a
            href="https://arasaac.org"
            className="underline underline-offset-2 hover:text-puente-800 min-h-[44px] inline-flex items-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            ARASAAC
          </a>
          , Sergio Palao, Gobierno de Aragón. CC BY-NC-SA.
        </p>
      </div>
    </div>
  )
}
