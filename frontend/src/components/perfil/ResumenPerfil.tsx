'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'
import { leerCitaciones, EVENTO_CITACIONES } from '@/lib/citaciones/almacen'
import { resumirCitaciones } from '@/lib/citaciones/resumen'
import {
  EVENTO_PERFIL,
  leerVistaPerfil,
  type PerfilVista,
} from '@/lib/perfil/perfil'
import {
  EVENTO_PREPARACION,
  cargarPreparacion,
  hechosPreparacion,
  textoPreparacion,
} from '@/lib/preparacion'
import { FraseTolerancia } from '@/components/perfil/FraseTolerancia'

export function ResumenPerfil() {
  const { sesion, cargando } = useAuth()
  const [vista, setVista] = useState<PerfilVista | null>(null)
  const [hechos, setHechos] = useState(0)
  const [textoPaso, setTextoPaso] = useState('Aún no has visto la sala ni simulado el juicio.')
  const [idCitacionProxima, setIdCitacionProxima] = useState<string | null>(null)

  useEffect(() => {
    const refrescar = () => {
      setVista(leerVistaPerfil())
      const proxima = resumirCitaciones(leerCitaciones())[0]
      setIdCitacionProxima(proxima?.id ?? null)
      const prep = cargarPreparacion()
      setHechos(hechosPreparacion(prep))
      setTextoPaso(textoPreparacion(prep))
    }

    refrescar()
    window.addEventListener(EVENTO_PERFIL, refrescar)
    window.addEventListener(EVENTO_CITACIONES, refrescar)
    window.addEventListener(EVENTO_PREPARACION, refrescar)
    window.addEventListener('storage', refrescar)
    return () => {
      window.removeEventListener(EVENTO_PERFIL, refrescar)
      window.removeEventListener(EVENTO_CITACIONES, refrescar)
      window.removeEventListener(EVENTO_PREPARACION, refrescar)
      window.removeEventListener('storage', refrescar)
    }
  }, [sesion])

  if (cargando) {
    return (
      <section className="card mb-8" aria-live="polite">
        <p className="text-court-700">Cargando tus datos…</p>
      </section>
    )
  }

  // 1. SIN PERFIL: Botón principal único "Empieza: ¿para qué vas al juzgado?"
  if (!vista?.tienePerfil) {
    return (
      <section
        className="card mb-8 border-2 border-accent-info/40 bg-white p-6 shadow-sm"
        aria-labelledby="titulo-empieza"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-suave bg-accent-info/15 text-accent-navy text-xs font-bold uppercase tracking-wider mb-3 border border-accent-info/25">
          <span aria-hidden="true">🧭</span>
          <span>Primer paso</span>
        </div>
        <h2 id="titulo-empieza" className="text-2xl font-bold text-court-900 mb-2">
          ¿Para qué vas al juzgado?
        </h2>
        <p className="text-court-700 max-w-[48ch] mb-5 leading-relaxed">
          Cada papel en un juicio tiene derechos y obligaciones distintos. Descubre qué implica acudir como testigo, investigado o víctima y prepara tus ajustes con calma.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Link
            href="/perfil"
            className="btn-primary text-base min-h-[44px] inline-flex items-center justify-center font-bold"
          >
            Empieza: ¿para qué vas al juzgado?
          </Link>
          <Link
            href="/citacion"
            className="btn-secondary text-base min-h-[44px] inline-flex items-center justify-center"
          >
            Tengo una citación
          </Link>
        </div>

        <div className="mt-5 pt-4 border-t border-court-200 flex flex-wrap items-center justify-between gap-3 text-xs text-court-600">
          <Link
            href="/demo/luis"
            className="text-accent-navy hover:text-accent-info underline decoration-accent-info/40 font-medium inline-flex items-center gap-1.5 min-h-[36px]"
          >
            <span aria-hidden="true">👤</span>
            Ver el ejemplo de Luis (testigo con TEA)
          </Link>
          {!sesion && (
            <span>Práctica libre sin registro. Puedes crear cuenta arriba si deseas sincronizarla.</span>
          )}
        </div>
      </section>
    )
  }

  // 2. CON PERFIL: Botón principal "Sigue tu ensayo"
  return (
    <section
      className="card mb-8 border-2 border-accent-info/40 bg-white p-6 shadow-sm"
      aria-labelledby="titulo-bienvenida"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="inline-flex text-xs font-bold uppercase tracking-wider text-accent-navy bg-accent-info/15 px-2.5 py-1 rounded-suave border border-accent-info/25">
          Tu preparación
        </span>
        {sesion?.email && (
          <span className="text-xs text-court-600 font-medium">
            {sesion.email}
          </span>
        )}
      </div>

      <h2 id="titulo-bienvenida" className="text-2xl font-bold text-court-900 mb-1">
        Hola{vista.nombre ? `, ${vista.nombre}` : ''}
      </h2>
      <p className="text-court-800 text-base mb-4 max-w-[48ch]">
        Primero ves la sala. Luego simulas el juicio.
      </p>

      {/* Progreso del simulador */}
      <div className="bg-calma-mist rounded-suave p-3.5 border border-accent-info/20 mb-5">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="font-semibold text-court-800">
            Preparación para el juicio
          </span>
          <span className="font-bold text-accent-navy numeros">
            {hechos} de 2
          </span>
        </div>
        <div
          className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-court-200"
          role="progressbar"
          aria-valuenow={hechos}
          aria-valuemin={0}
          aria-valuemax={2}
          aria-label={textoPaso}
        >
          <div
            className="bg-accent-info h-2.5 rounded-full transition-all duration-200"
            style={{ width: hechos === 0 ? '0%' : hechos === 1 ? '50%' : '100%' }}
          />
        </div>
        <p className="text-sm text-court-800 mt-2">{textoPaso}</p>
      </div>

      <FraseTolerancia nivel="h3" />

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <Link
          href="/sala-previa/declaracion"
          className="btn-primary text-base min-h-[44px] inline-flex items-center justify-center font-bold"
        >
          Simular el juicio
        </Link>
        <Link
          href="/sala-previa"
          className="btn-secondary text-base min-h-[44px] inline-flex items-center justify-center"
        >
          Ver la sala
        </Link>
        <Link
          href="/pasaporte"
          className="btn-secondary text-base min-h-[44px] inline-flex items-center justify-center"
        >
          Ver mi Pasaporte de ajustes
        </Link>
        {idCitacionProxima ? (
          <Link
            href={`/citacion?id=${encodeURIComponent(idCitacionProxima)}`}
            className="btn-ghost text-base min-h-[44px] inline-flex items-center justify-center text-court-800"
          >
            Consultar citación más próxima
          </Link>
        ) : (
          <Link
            href="/citacion"
            className="btn-ghost text-base min-h-[44px] inline-flex items-center justify-center text-court-800"
          >
            Subir citación
          </Link>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-court-200 flex flex-wrap items-center justify-between gap-3 text-xs text-court-600">
        <Link
          href="/demo/luis"
          className="text-accent-navy hover:text-accent-info underline decoration-accent-info/40 font-medium inline-flex items-center gap-1.5 min-h-[36px]"
        >
          <span aria-hidden="true">👤</span>
          Ver el ejemplo de Luis
        </Link>
        <Link
          href="/perfil"
          className="text-court-600 hover:text-court-900 underline font-medium min-h-[36px] inline-flex items-center"
        >
          Cambiar perfil o papel
        </Link>
      </div>
    </section>
  )
}
