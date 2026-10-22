'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { PUNTOS_VISTA, type PuntoVista, type Respuesta, type Turno } from '@/lib/sala-previa/declaracion'
import { GUIONES } from '@/lib/sala-previa/declaracionGuiones'

export interface RegistroTurno {
  turno: Turno
  respuesta: Respuesta
}

export interface ContadoresAyuda {
  pausas: number
  repeticiones: number
  aclaraciones: number
}

interface Props {
  puntoVista: PuntoVista
  registro: RegistroTurno[]
  ayudas: ContadoresAyuda
  nombre: string
  onRepetir: () => void
}

function lineaAyuda({ pausas, repeticiones, aclaraciones }: ContadoresAyuda): string | null {
  const partes: string[] = []
  if (pausas > 0) partes.push('pediste una pausa')
  if (repeticiones > 0) partes.push('pediste que repitieran')
  if (aclaraciones > 0) partes.push('pediste que lo dijeran más claro')
  if (partes.length === 0) return null
  const texto = partes.length === 1 ? partes[0] : `${partes.slice(0, -1).join(', ')} y ${partes.at(-1)}`
  return `Durante el ensayo ${texto}. Eso te ayuda a seguir.`
}

function SelloExito() {
  return (
    <div className="mx-auto mb-5 h-28 w-28" aria-hidden="true">
      <svg viewBox="0 0 120 120" className="h-full w-full">
        <circle className="sello-exito-halo" cx="60" cy="60" r="54" />
        <circle className="sello-exito-disco" cx="60" cy="60" r="40" />
        <path className="sello-exito-check" d="M42 62 54 74 79 47" />
      </svg>
    </div>
  )
}

export function ResumenDeclaracion({ puntoVista, ayudas, nombre, onRepetir }: Props) {
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const claves = GUIONES[puntoVista].claves.slice(0, 3)
  const extra = lineaAyuda(ayudas)
  const quien = nombre.trim()
  const titulo = quien ? `${quien}, has terminado` : 'Has terminado'

  useEffect(() => {
    const titulo = tituloRef.current
    if (!titulo) return
    titulo.focus({ preventScroll: true })
    const seccion = titulo.closest('section')
    const main = seccion?.closest('main')
    if (!seccion || !main) return
    const arriba =
      seccion.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop
    main.scrollTo({ top: Math.max(0, arriba - 12), behavior: 'auto' })
  }, [])

  return (
    <section className="mx-auto my-auto w-full max-w-xl" aria-labelledby="titulo-resumen">
      <div className="overflow-hidden rounded-tarjeta border border-court-200 bg-white shadow-[0_8px_28px_rgb(13_31_26_/_0.06)]">
        <div className="bg-calma-sage px-6 pb-8 pt-9 text-center sm:px-10">
          <SelloExito />
          <p className="text-base font-bold text-accent-navy">Simulación terminada</p>
          <h2
            id="titulo-resumen"
            ref={tituloRef}
            tabIndex={-1}
            className="mt-1 text-3xl font-bold text-court-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-court-400 rounded-suave sm:text-4xl"
          >
            {titulo}
          </h2>
          <p className="mx-auto mt-3 max-w-md text-lg leading-relaxed text-court-800">
            Has acabado la simulación {PUNTOS_VISTA[puntoVista].titulo.toLowerCase()}.
          </p>
        </div>

        <div className="px-6 py-7 sm:px-8">
          <h3 className="text-xl font-bold text-court-900">Qué recordar</h3>
          <ol className="mt-4 space-y-4">
            {claves.map((clave, indice) => (
              <li key={clave} className="flex items-start gap-4 text-left text-lg leading-relaxed text-court-800">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-calma-sage text-lg font-bold text-accent-navy"
                  aria-hidden="true"
                >
                  {indice + 1}
                </span>
                <span className="pt-1.5">{clave}</span>
              </li>
            ))}
          </ol>
          {extra && (
            <p className="mt-6 rounded-suave bg-calma-mist px-4 py-3 text-left text-lg leading-relaxed text-court-800">
              {extra}
            </p>
          )}
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn-primary min-h-[44px] flex-1" onClick={onRepetir}>
          Repetir esta simulación
        </button>
        <Link href="/sala-previa" className="btn-ghost min-h-[44px] flex-1 border border-court-200 bg-white">
          Volver a la sala
        </Link>
      </div>
    </section>
  )
}
