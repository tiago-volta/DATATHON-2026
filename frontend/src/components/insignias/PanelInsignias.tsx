'use client'

import { useId, useState } from 'react'
import {
  INSIGNIAS_UTILES,
  TITULO_INSIGNIAS_APARTADO,
  insigniasDeApartado,
  textoTooltipMedalla,
  type ApartadoInsignias,
  type IdInsigniaUtil,
} from '@/lib/insignias'
import { IconoInsignia } from './IconoInsignia'

interface Props {
  conseguidas: IdInsigniaUtil[]
  /** Título opcional del panel. */
  titulo?: string
  /** Si se indica, solo muestra las medallas de ese apartado. */
  apartado?: ApartadoInsignias
  /** Variante compacta para el menú de perfil (sin card exterior). */
  embebido?: boolean
}

/**
 * Galería de medallas: desbloqueadas a color; bloqueadas en gris.
 * Con `apartado`, solo las relacionadas con la sección actual (pie de página).
 */
export function PanelInsignias({
  conseguidas,
  titulo,
  apartado,
  embebido = false,
}: Props) {
  const tituloId = useId()
  const ayudaId = useId()
  const tipBaseId = useId()
  const [tipActivo, setTipActivo] = useState<IdInsigniaUtil | null>(null)

  const lista = apartado ? insigniasDeApartado(apartado) : INSIGNIAS_UTILES
  const tituloFinal =
    titulo ??
    (apartado ? TITULO_INSIGNIAS_APARTADO[apartado] : 'Insignias útiles')
  const ayuda = apartado
    ? 'Medallas que puedes conseguir en este apartado. El resto está en tu perfil (arriba a la derecha).'
    : 'Premian cuidarte y practicar a tu ritmo. No hay ranking ni reloj.'

  const cuerpo = (
    <>
      {!embebido && (
        <>
          <h2 id={tituloId} className="font-bold text-court-800 mb-1">
            {tituloFinal}
          </h2>
          <p id={ayudaId} className="text-sm text-court-700 mb-4">
            {ayuda}
          </p>
        </>
      )}
      {embebido && <p id={ayudaId} className="sr-only">{ayuda}</p>}

      <ul
        className={`grid gap-3 ${
          apartado
            ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'
            : 'grid-cols-3 sm:grid-cols-3 md:grid-cols-5'
        }`}
        aria-describedby={ayudaId}
        {...(embebido ? {} : { 'aria-labelledby': tituloId })}
      >
        {lista.map((ins) => {
          const conseguida = conseguidas.includes(ins.id)
          const tipId = `${tipBaseId}-${ins.id}`
          const visible = tipActivo === ins.id
          const tipTexto = textoTooltipMedalla(ins)

          return (
            <li key={ins.id} className="relative flex flex-col items-center">
              <button
                type="button"
                className={`group flex flex-col items-center gap-2 w-full p-2 rounded-suave border-2 transition-[border-color,background-color,transform] duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-court-400 ${
                  conseguida
                    ? 'bg-calma-sage/70 border-accent-success/50 hover:border-court-500'
                    : 'bg-court-50/90 border-court-100 hover:border-court-300'
                }`}
                aria-label={tipTexto}
                aria-describedby={visible ? tipId : undefined}
                onMouseEnter={() => setTipActivo(ins.id)}
                onMouseLeave={() => setTipActivo((v) => (v === ins.id ? null : v))}
                onFocus={() => setTipActivo(ins.id)}
                onBlur={() => setTipActivo((v) => (v === ins.id ? null : v))}
              >
                <IconoInsignia
                  id={ins.id}
                  desbloqueada={conseguida}
                  className={embebido ? 'w-12 h-12' : 'w-14 h-14 sm:w-16 sm:h-16'}
                />
                <span
                  className={`text-xs sm:text-sm font-bold text-center leading-tight ${
                    conseguida ? 'text-court-800' : 'text-court-600'
                  }`}
                >
                  {ins.nombre}
                </span>
                <span className="sr-only">
                  {conseguida ? 'Conseguida' : 'Aún no conseguida'}
                </span>
              </button>

              {visible && (
                <div
                  id={tipId}
                  role="tooltip"
                  className="absolute z-20 left-1/2 -translate-x-1/2 top-full mt-2 w-[min(16rem,70vw)] rounded-suave border border-court-200 bg-white shadow-sm p-3 text-sm text-court-800 pointer-events-none"
                >
                  <p className="font-bold text-court-800 mb-1">
                    Medalla: {ins.nombre}
                  </p>
                  <p className="text-court-700 leading-snug">
                    {ins.comoConseguirla}
                  </p>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </>
  )

  if (embebido) {
    return <div>{cuerpo}</div>
  }

  return (
    <section aria-labelledby={tituloId} className="card">
      {cuerpo}
    </section>
  )
}
