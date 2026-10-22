'use client'

import {
  CASO_INVENTADO,
  ORDEN_PUNTOS_VISTA,
  PUNTOS_VISTA,
  type PuntoVista,
} from '@/lib/sala-previa/declaracion'
import { GUIONES } from '@/lib/sala-previa/declaracionGuiones'

interface Props {
  sugerido: PuntoVista | null
  onElegir: (pv: PuntoVista) => void
}

export function ElegirPuntoVista({ sugerido, onElegir }: Props) {
  return (
    <div className="space-y-6">
      <section aria-labelledby="titulo-caso" className="card bg-calma-mist/60 max-w-2xl">
        <h2 id="titulo-caso" className="text-lg font-bold text-court-900 mb-2">
          El caso de la simulación
        </h2>
        <ul className="space-y-1 text-court-800">
          {CASO_INVENTADO.map((linea) => (
            <li key={linea}>{linea}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-elegir">
        <h2 id="titulo-elegir" className="text-2xl font-bold text-court-900 mb-1">
          ¿Desde dónde quieres verlo?
        </h2>
        <p className="text-court-700 mb-4">
          Elige un punto de vista. Puedes cambiarlo cuando quieras.
        </p>
        <ul className="grid gap-4 md:grid-cols-3">
          {ORDEN_PUNTOS_VISTA.map((pv) => {
            const datos = PUNTOS_VISTA[pv]
            const total = GUIONES[pv].turnos.length
            return (
              <li key={pv}>
                <button
                  type="button"
                  className={`card h-full min-h-[44px] space-y-2 ${
                    sugerido === pv ? 'border-2 border-accent-info' : ''
                  }`}
                  onClick={() => onElegir(pv)}
                >
                  {sugerido === pv && (
                    <span className="inline-block text-xs font-bold uppercase tracking-wide text-accent-navy bg-calma-mist px-2 py-0.5 rounded-full">
                      Tu papel en el perfil
                    </span>
                  )}
                  <span className="block text-xl font-bold text-court-900">{datos.titulo}</span>
                  <span className="block text-court-800">{datos.resumen}</span>
                  <span className="block text-sm text-court-700">{datos.dondeEstas}</span>
                  <span className="block text-sm font-bold text-court-700">
                    {total} momentos. Sin prisa.
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="titulo-como" className="max-w-2xl space-y-2 text-court-800">
        <h2 id="titulo-como" className="text-lg font-bold text-court-900">
          Cómo funciona
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Las personas de la sala te hablan en voz alta. Siempre ves el texto debajo.</li>
          <li>La cámara mira a quien te habla.</li>
          <li>Eliges una respuesta segura o escribes la tuya.</li>
          <li>Puedes pedir una pausa, que repitan o que lo digan más claro.</li>
          <li>Las respuestas son ejemplos. En tu juicio, di siempre lo que pasó de verdad.</li>
        </ul>
      </section>
    </div>
  )
}
