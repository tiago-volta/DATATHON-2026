'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { EVENTO_CITACIONES, leerCitaciones } from '@/lib/citaciones/almacen'
import { resumirCitaciones, type ResumenCita } from '@/lib/citaciones/resumen'
import { EVENTO_PERFIL } from '@/lib/perfil/perfil'

export function ListaCitaciones() {
  const [citas, setCitas] = useState<ResumenCita[]>([])

  useEffect(() => {
    const refrescar = () => setCitas(resumirCitaciones(leerCitaciones()))
    refrescar()
    window.addEventListener(EVENTO_CITACIONES, refrescar)
    window.addEventListener(EVENTO_PERFIL, refrescar)
    window.addEventListener('storage', refrescar)
    return () => {
      window.removeEventListener(EVENTO_CITACIONES, refrescar)
      window.removeEventListener(EVENTO_PERFIL, refrescar)
      window.removeEventListener('storage', refrescar)
    }
  }, [])

  if (citas.length === 0) return null

  return (
    <section className="mb-8" aria-labelledby="titulo-citaciones">
      <h2 id="titulo-citaciones" className="text-xl font-bold text-court-900 mb-1">
        Tus citaciones
      </h2>
      <p className="text-court-700 mb-4">
        {citas.length === 1
          ? 'Esta es la citación que has guardado.'
          : 'La más cercana en fecha va la primera.'}
      </p>
      <ul className="space-y-3">
        {citas.map((cita) => (
          <li key={cita.id}>
            <article
              className={`card p-4 sm:p-5 ${
                cita.esLaMasProxima ? 'border-2 border-accent-info/50' : ''
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  {cita.esLaMasProxima && (
                    <p className="text-xs font-bold uppercase tracking-wider text-accent-navy mb-1">
                      La más próxima
                    </p>
                  )}
                  <h3 className="text-lg font-bold text-court-900">{cita.titulo}</h3>
                  <p className="text-court-800 mt-1">
                    Tu papel: <span className="font-bold">{cita.rol}</span>
                  </p>
                  <p className="text-court-700 mt-1">{cita.fechaTexto}</p>
                  {cita.lugar && <p className="text-court-700">{cita.lugar}</p>}
                </div>
                <p className="text-xl font-bold text-court-900 numeros shrink-0">{cita.diasTexto}</p>
              </div>
              <Link
                href={`/citacion?id=${encodeURIComponent(cita.id)}`}
                aria-label={`Consultar citación del ${cita.fechaTexto}`}
                className="btn-secondary mt-4 inline-flex items-center justify-center min-h-[44px]"
              >
                Consultar citación
              </Link>
            </article>
          </li>
        ))}
      </ul>
      <p className="mt-4">
        <Link href="/citacion" className="btn-ghost inline-flex items-center min-h-[44px]">
          Añadir otra citación
        </Link>
      </p>
    </section>
  )
}
