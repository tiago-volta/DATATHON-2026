'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { AJUSTES_DISPONIBLES } from '@/lib/contenido'
import {
  ESTIMULOS_META,
  ajustesDesdeMolestias,
  molestiasDesdeValores,
} from '@/lib/sala-previa/niveles'
import type { ConfortCheckIn, IdEstimulo, ValoresEstimulo } from '@/lib/sala-previa/tipos'

/** IDs ARASAAC fijos (CC BY-NC-SA). */
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

const ESTIMULOS: IdEstimulo[] = ['ruido', 'luz', 'gente']

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

function nombreAjuste(id: string): string {
  return AJUSTES_DISPONIBLES.find((a) => a.id === id)?.nombre ?? id
}

interface Props {
  nivelNombre: string
  valores: ValoresEstimulo
  onContinuar: (confort: ConfortCheckIn, molestias: IdEstimulo[]) => void
  onQuedarse: (confort: ConfortCheckIn, molestias: IdEstimulo[]) => void
  onBajarNivel: (confort: ConfortCheckIn, molestias: IdEstimulo[]) => void
  onBajarEstimulos: (molestias: IdEstimulo[]) => void
  /** Cierra sin elegir (Escape / botón). Sin trampa de foco. */
  onCerrar: () => void
  puedeBajar: boolean
  puedeSubir: boolean
}

export function CheckInConfort({
  nivelNombre,
  valores,
  onContinuar,
  onQuedarse,
  onBajarNivel,
  onBajarEstimulos,
  onCerrar,
  puedeBajar,
  puedeSubir,
}: Props) {
  const sugeridas = useMemo(() => molestiasDesdeValores(valores), [valores])
  const [confort, setConfort] = useState<ConfortCheckIn | null>(null)
  const [molestias, setMolestias] = useState<IdEstimulo[]>([])
  const [estimulosBajados, setEstimulosBajados] = useState(false)
  const cerrarRef = useRef<HTMLButtonElement>(null)
  const tituloId = useId()
  const descId = useId()

  const necesitaApoyo = confort === 'regular' || confort === 'mal'

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null
    // Foco inicial en cerrar: Escape y Tab siguen el orden natural (sin atrapar).
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

  useEffect(() => {
    if (!necesitaApoyo) return
    setMolestias((prev) => {
      if (prev.length > 0) return prev
      return sugeridas
    })
  }, [necesitaApoyo, sugeridas])

  useEffect(() => {
    if (!necesitaApoyo || estimulosBajados) return
    const altas = sugeridas.length > 0 ? sugeridas : ESTIMULOS
    onBajarEstimulos(altas)
    setEstimulosBajados(true)
  }, [necesitaApoyo, estimulosBajados, sugeridas, onBajarEstimulos])

  const toggleMolestia = (id: IdEstimulo) => {
    setMolestias((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    )
  }

  const idsAjustes = ajustesDesdeMolestias(molestias)
  const enlacePasaporte =
    idsAjustes.length > 0
      ? `/pasaporte?ajustes=${idsAjustes.join(',')}`
      : '/pasaporte'

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
      <div className="bg-white rounded-tarjeta shadow-lg max-w-lg w-full p-6 max-h-[85vh] overflow-y-auto">
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
          Acabas de estar en: {nivelNombre}. No hay respuesta correcta. Pulsa Escape
          o Cerrar para volver.
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
                onClick={() => {
                  setConfort(item.valor)
                  if (item.valor === 'bien') {
                    setEstimulosBajados(false)
                  }
                }}
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
              {puedeSubir
                ? 'Bien. Vas a tu ritmo. Si quieres, puedes subir de nivel. Si no, quédate aquí.'
                : 'Bien. Ya has llegado al nivel más alto de la Sala Previa.'}
            </p>
            <div className="flex flex-col gap-3">
              {puedeSubir && (
                <button
                  type="button"
                  className="btn-primary w-full"
                  onClick={() => onContinuar(confort, molestias)}
                >
                  Subir de nivel
                </button>
              )}
              <button
                type="button"
                className={puedeSubir ? 'btn-secondary w-full' : 'btn-primary w-full'}
                onClick={() => onQuedarse(confort, molestias)}
              >
                Quedarme aquí
              </button>
            </div>
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
                ? 'Está bien parar. Bajamos los estímulos. Puedes pedir ajustes para el juzgado.'
                : 'Bajamos un poco los estímulos. Puedes pedir ajustes si algo te molesta.'}
            </p>

            <fieldset>
              <legend className="font-bold text-puente-800 mb-3">
                ¿Qué te ha molestado?
              </legend>
              <div className="flex flex-wrap gap-2">
                {ESTIMULOS.map((id) => {
                  const activo = molestias.includes(id)
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleMolestia(id)}
                      aria-pressed={activo}
                      className={`px-4 py-2 rounded-suave border-2 font-medium min-h-[44px] ${
                        activo
                          ? 'border-puente-500 bg-puente-50 text-puente-800'
                          : 'border-puente-200 text-puente-600'
                      }`}
                    >
                      {ESTIMULOS_META[id].etiqueta}
                    </button>
                  )
                })}
              </div>
            </fieldset>

            {idsAjustes.length > 0 && (
              <div className="rounded-tarjeta border-2 border-puente-200 bg-calma-mist/70 p-4">
                <h3 className="font-bold text-puente-800 mb-2">
                  Ajustes que puedes pedir
                </h3>
                <ul className="space-y-2 mb-4">
                  {idsAjustes.map((id) => (
                    <li key={id} className="flex gap-2 text-puente-700">
                      <span aria-hidden="true">✓</span>
                      <span>{nombreAjuste(id)}</span>
                    </li>
                  ))}
                </ul>
                <Link href={enlacePasaporte} className="btn-primary w-full">
                  Abrir Pasaporte con estos ajustes
                </Link>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                type="button"
                className="btn-primary w-full"
                onClick={() => onQuedarse(confort, molestias)}
              >
                Quedarme en este nivel
              </button>
              {puedeBajar && (
                <button
                  type="button"
                  className="btn-ghost w-full"
                  onClick={() => onBajarNivel(confort, molestias)}
                >
                  Volver al nivel anterior
                </button>
              )}
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
