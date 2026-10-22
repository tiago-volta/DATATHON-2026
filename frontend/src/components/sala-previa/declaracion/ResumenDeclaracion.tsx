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

export function ResumenDeclaracion({ puntoVista, ayudas, onRepetir }: Props) {
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const claves = GUIONES[puntoVista].claves.slice(0, 3)
  const extra = lineaAyuda(ayudas)

  useEffect(() => {
    tituloRef.current?.focus()
  }, [])

  return (
    <section className="mx-auto my-auto max-w-lg space-y-6 text-center" aria-labelledby="titulo-resumen">
      <div className="card bg-calma-sage border-2 border-accent-success space-y-2">
        <h2
          id="titulo-resumen"
          ref={tituloRef}
          tabIndex={-1}
          className="text-2xl font-bold text-court-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-court-400 rounded-suave"
        >
          Lo has hecho
        </h2>
        <p className="text-court-800">
          Has terminado la simulación {PUNTOS_VISTA[puntoVista].titulo.toLowerCase()}.
        </p>
      </div>

      <div className="card space-y-3">
        <h3 className="text-lg font-bold text-court-900">Para llevarte</h3>
        <ul className="space-y-2 text-court-800">
          {claves.map((c) => (
            <li key={c}>{c}</li>
          ))}
          {extra && <li>{extra}</li>}
        </ul>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" className="btn-primary min-h-[44px]" onClick={onRepetir}>
          Repetir esta simulación
        </button>
        <Link href="/sala-previa" className="btn-ghost min-h-[44px] border border-court-200">
          Volver a la sala
        </Link>
      </div>
    </section>
  )
}
