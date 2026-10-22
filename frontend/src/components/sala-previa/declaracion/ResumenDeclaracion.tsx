'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { HABLANTES, PUNTOS_VISTA, conNombre, type PuntoVista, type Respuesta, type Turno } from '@/lib/sala-previa/declaracion'
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

function frasesAyuda({ pausas, repeticiones, aclaraciones }: ContadoresAyuda): string[] {
  const frases: string[] = []
  if (pausas > 0) frases.push('Pediste una pausa. Pedir pausas es un derecho y te ayuda a seguir.')
  if (repeticiones > 0) frases.push('Pediste que repitieran. Así te aseguras de entender la pregunta.')
  if (aclaraciones > 0) frases.push('Pediste que lo dijeran más claro. Tienes derecho a entender lo que te preguntan.')
  return frases
}

export function ResumenDeclaracion({ puntoVista, registro, ayudas, nombre, onRepetir }: Props) {
  const tituloRef = useRef<HTMLHeadingElement>(null)
  const guion = GUIONES[puntoVista]
  const respondidas = registro.filter((r) => r.respuesta.texto)
  const extras = frasesAyuda(ayudas)

  useEffect(() => {
    tituloRef.current?.focus()
  }, [])

  return (
    <section className="space-y-6 max-w-3xl" aria-labelledby="titulo-resumen">
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
        <p className="text-court-800">
          <strong>{HABLANTES[guion.cierre.hablante].nombre}:</strong> «{guion.cierre.texto}»
        </p>
        <p className="text-court-700">{guion.cierre.explicacion}</p>
      </div>

      <div className="card space-y-2">
        <h3 className="text-lg font-bold text-court-900">Para llevarte</h3>
        <ul className="list-disc pl-5 space-y-1 text-court-800">
          {guion.claves.map((c) => (
            <li key={c}>{c}</li>
          ))}
          {extras.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      {respondidas.length > 0 && (
        <div className="card space-y-3">
          <h3 className="text-lg font-bold text-court-900">Tus respuestas y por qué valen</h3>
          <ol className="space-y-4">
            {respondidas.map(({ turno, respuesta }) => (
              <li key={turno.id} className="border-l-4 border-accent-success pl-3 space-y-1">
                <p className="text-sm text-court-700">
                  <strong>{HABLANTES[turno.hablante].nombre}:</strong> «{conNombre(turno.texto, nombre)}»
                </p>
                <p className="font-semibold text-court-900">Tú: «{respuesta.texto}»</p>
                <p className="text-court-800">
                  <span className="font-bold text-accent-success">Respuesta válida.</span>{' '}
                  {respuesta.porQue}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
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
