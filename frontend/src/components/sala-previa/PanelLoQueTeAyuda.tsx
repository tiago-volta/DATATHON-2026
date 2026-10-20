'use client'

import { useEffect, useId, useMemo, useState } from 'react'
import Link from 'next/link'
import { AJUSTES_DISPONIBLES } from '@/lib/contenido'
import { ESTIMULOS_META } from '@/lib/sala-previa/niveles'
import {
  fraseAyuda,
  fraseMolestia,
  etiquetaNivelMolestia,
  tienePractica,
  type LoQueTeAyuda,
} from '@/lib/sala-previa/loQueTeAyuda'
import type { IdEstimulo } from '@/lib/sala-previa/tipos'

/** IDs ARASAAC fijos (CC BY-NC-SA), alineados con ControlesEstimulo. */
const PICTO_ESTIMULO: Record<IdEstimulo, number> = {
  ruido: 37857,
  luz: 8619,
  gente: 7117,
  eco: 36989,
}

/** Pictogramas calmados para ajustes frecuentes del Pasaporte. */
const PICTO_AYUDA: Record<string, number> = {
  'sala-tranquila': 6531,
  'luz-tenue': 8619,
  pausas: 5505,
  'mas-tiempo': 7024,
  'preguntas-claras': 6070,
  facilitador: 6462,
  acompanante: 6462,
  'documentos-voz': 37857,
  'descripcion-pruebas': 6070,
}

function urlArasaac(id: number) {
  return `https://static.arasaac.org/pictograms/${id}/${id}_300.png`
}

function PictoCalmado({
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
        className="flex items-center justify-center w-12 h-12 rounded-suave bg-puente-100 text-puente-700 text-lg font-bold shrink-0"
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
      width={48}
      height={48}
      className="w-12 h-12 rounded-suave bg-white border border-puente-100 object-contain shrink-0"
      loading="lazy"
      decoding="async"
      onError={() => setFallo(true)}
    />
  )
}

interface Props {
  dato: LoQueTeAyuda
}

/**
 * Panel resumen en lectura fácil: lo que molesta y lo que ayuda.
 * La persona elige qué ajustes pasan al Pasaporte (nunca diagnóstico).
 */
export function PanelLoQueTeAyuda({ dato }: Props) {
  const tituloId = useId()
  const descId = useId()
  const vacio = !tienePractica(dato)

  const ayudasDisponibles = useMemo(() => {
    return dato.ayudas
      .map((id) => AJUSTES_DISPONIBLES.find((a) => a.id === id))
      .filter((a): a is (typeof AJUSTES_DISPONIBLES)[number] => Boolean(a))
  }, [dato.ayudas])

  const [seleccionados, setSeleccionados] = useState<string[]>(() =>
    ayudasDisponibles.map((a) => a.id)
  )

  // Nuevas ayudas entran marcadas; las que la persona quitó a mano siguen fuera.
  useEffect(() => {
    const ids = dato.ayudas.filter((id) =>
      AJUSTES_DISPONIBLES.some((a) => a.id === id)
    )
    setSeleccionados((prev) => {
      const vigentes = prev.filter((id) => ids.includes(id))
      const nuevas = ids.filter((id) => !prev.includes(id))
      return Array.from(new Set([...vigentes, ...nuevas]))
    })
  }, [dato.ayudas])

  const toggle = (id: string) => {
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const enlacePasaporte =
    seleccionados.length > 0
      ? `/pasaporte?ajustes=${seleccionados.join(',')}`
      : '/pasaporte'

  if (vacio) {
    return (
      <section
        className="card border-2 border-puente-200 bg-calma-mist/50"
        aria-labelledby={tituloId}
        aria-describedby={descId}
      >
        <h2 id={tituloId} className="font-bold text-puente-800 mb-2">
          Lo que te ayuda
        </h2>
        <p id={descId} className="text-puente-700">
          Cuando practiques un poco, aquí verás lo que te ayuda. No hay prisa.
        </p>
      </section>
    )
  }

  return (
    <section
      className="card border-2 border-accent-success bg-white space-y-5"
      aria-labelledby={tituloId}
      aria-describedby={descId}
    >
      <div>
        <h2 id={tituloId} className="font-bold text-puente-800 mb-1">
          Lo que te ayuda
        </h2>
        <p id={descId} className="text-sm text-puente-700">
          Resumen de tu práctica. Tú decides qué va al Pasaporte. Solo ajustes,
          nunca un diagnóstico.
        </p>
      </div>

      {dato.molestias.length > 0 && (
        <div>
          <h3 className="font-bold text-puente-800 mb-3">Me molesta…</h3>
          <ul className="space-y-2 list-none p-0 m-0" aria-label="Estímulos que me molestan">
            {dato.molestias.map((m) => {
              const meta = ESTIMULOS_META[m.id]
              const frase = fraseMolestia(m.id, m.nivel)
              return (
                <li
                  key={m.id}
                  className="flex items-center gap-3 p-3 rounded-suave bg-calma-mist/70 border border-puente-100"
                >
                  <PictoCalmado
                    id={PICTO_ESTIMULO[m.id]}
                    alt={`Pictograma: ${meta.etiqueta}`}
                    etiqueta={meta.etiqueta}
                  />
                  <span className="text-puente-800">
                    <span className="font-bold block">{frase}</span>
                    <span className="text-sm text-puente-700">
                      {etiquetaNivelMolestia(m.nivel)}
                    </span>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <fieldset className="m-0 p-0 border-0">
        <legend className="font-bold text-puente-800 mb-3 px-0">
          Me ayuda…{' '}
          <span className="font-normal text-sm text-puente-700">
            (marca lo que quieras pasar al Pasaporte)
          </span>
        </legend>

        {ayudasDisponibles.length === 0 && dato.usoCalma && (
          <p className="text-puente-700 mb-3">
            Me ayuda volver a la calma cuando lo necesito.
          </p>
        )}

        {ayudasDisponibles.length === 0 && !dato.usoCalma ? (
          <p className="text-puente-700">
            Aún no hay ajustes sugeridos. Si algo te molesta en el check-in,
            aparecerán aquí.
          </p>
        ) : (
          <ul className="space-y-2 list-none p-0 m-0">
            {ayudasDisponibles.map((ajuste) => {
              const checked = seleccionados.includes(ajuste.id)
              const inputId = `ayuda-export-${ajuste.id}`
              const pictoId = PICTO_AYUDA[ajuste.id] ?? 5505
              return (
                <li key={ajuste.id}>
                  <label
                    htmlFor={inputId}
                    className={`flex items-start gap-3 p-3 rounded-suave border-2 min-h-[48px] cursor-pointer transition-colors ${
                      checked
                        ? 'border-puente-500 bg-puente-50'
                        : 'border-puente-100 bg-white hover:border-puente-300'
                    }`}
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      className="mt-1 w-5 h-5 shrink-0 rounded border-puente-400 text-puente-600 focus:ring-puente-400"
                      checked={checked}
                      onChange={() => toggle(ajuste.id)}
                    />
                    <PictoCalmado
                      id={pictoId}
                      alt={`Pictograma: ${ajuste.nombre}`}
                      etiqueta={ajuste.nombre}
                    />
                    <span className="text-puente-800 min-w-0">
                      <span className="font-bold block">
                        {fraseAyuda(ajuste.id)}
                      </span>
                      <span className="text-sm text-puente-700">
                        {ajuste.descripcion}
                      </span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        )}
      </fieldset>

      {dato.usoCalma && (
        <p className="text-sm text-puente-700 rounded-suave bg-calma-sage/50 border border-puente-100 px-3 py-2">
          Me ayuda hacer pausas y volver a la calma.
        </p>
      )}

      <div className="space-y-2">
        <Link
          href={enlacePasaporte}
          className={`btn-primary w-full text-center ${
            seleccionados.length === 0 ? 'opacity-80' : ''
          }`}
          aria-describedby={`${tituloId}-export-hint`}
        >
          Pasar a mi Pasaporte
        </Link>
        <p id={`${tituloId}-export-hint`} className="text-xs text-puente-700">
          {seleccionados.length === 0
            ? 'Abre el Pasaporte sin ajustes premarcados. Puedes marcarlos allí.'
            : `Llevará ${seleccionados.length} ajuste${
                seleccionados.length === 1 ? '' : 's'
              } al Pasaporte.`}
        </p>
      </div>

      <p className="text-xs text-puente-700">
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
    </section>
  )
}
