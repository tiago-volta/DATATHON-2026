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
import { cargarProgreso } from '@/lib/sala-previa/progreso'

export function ResumenPerfil() {
  const { sesion, cargando } = useAuth()
  const [vista, setVista] = useState<PerfilVista | null>(null)
  const [nivelesHechos, setNivelesHechos] = useState<number>(0)
  const [idCitacionProxima, setIdCitacionProxima] = useState<string | null>(null)

  useEffect(() => {
    const refrescar = () => {
      setVista(leerVistaPerfil())
      const proxima = resumirCitaciones(leerCitaciones())[0]
      setIdCitacionProxima(proxima?.id ?? null)
      try {
        const prog = cargarProgreso()
        const n = prog.nivelMaximo === 0 && prog.sesionesCompletadas === 0 ? 0 : Math.min(5, prog.nivelMaximo + 1)
        setNivelesHechos(n)
      } catch {
        setNivelesHechos(0)
      }
    }

    refrescar()
    window.addEventListener(EVENTO_PERFIL, refrescar)
    window.addEventListener(EVENTO_CITACIONES, refrescar)
    window.addEventListener('storage', refrescar)
    return () => {
      window.removeEventListener(EVENTO_PERFIL, refrescar)
      window.removeEventListener(EVENTO_CITACIONES, refrescar)
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

  if (!vista?.tienePerfil) {
    return (
      <section
        className="card mb-8 border-2 border-accent-info/40 bg-white p-6"
        aria-labelledby="titulo-empieza"
      >
        <h2 id="titulo-empieza" className="text-2xl font-bold text-court-900 mb-2">
          Empieza por tu perfil
        </h2>
        <p className="text-court-700 max-w-[48ch] mb-5 leading-relaxed">
          Guarda cómo quieres que sea la sala.
          Tu papel sale de la citación.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Link
            href={sesion ? '/perfil' : '/registro'}
            className="btn-primary text-base min-h-[44px] inline-flex items-center justify-center font-bold"
          >
            Crear tu perfil
          </Link>
          <Link
            href="/citacion"
            className="btn-secondary text-base min-h-[44px] inline-flex items-center justify-center"
          >
            Tengo una citación
          </Link>
          <Link
            href="/sala-previa"
            className="btn-ghost text-base min-h-[44px] inline-flex items-center justify-center text-court-800"
          >
            Entrar en la sala
          </Link>
        </div>

        {!sesion && (
          <p className="text-xs text-court-600 mt-4 pt-3 border-t border-court-200">
            Puedes practicar sin registrarte. Si quieres conservar tu avance en otros dispositivos, puedes crear una cuenta arriba.
          </p>
        )}
      </section>
    )
  }

  return (
    <section
      className="card mb-8 border-2 border-accent-info/40 bg-white p-6"
      aria-labelledby="titulo-bienvenida"
    >
      <span className="inline-flex text-xs font-bold uppercase tracking-wider text-accent-navy bg-accent-info/15 px-2.5 py-1 rounded-suave border border-accent-info/25 mb-2">
        Tu preparación
      </span>

      <h2 id="titulo-bienvenida" className="text-2xl font-bold text-court-900 mb-1">
        Hola{vista.nombre ? `, ${vista.nombre}` : ''}
      </h2>
      <p className="text-court-800 text-base mb-4 max-w-[48ch]">
        {idCitacionProxima
          ? 'Puedes ensayar la sala, ver tu pasaporte o abrir la citación.'
          : 'Aún no tienes una citación. Créala para ver la fecha, el lugar y tu papel.'}
      </p>

      {/* Progreso del simulador */}
      <div className="bg-calma-mist rounded-suave p-3.5 border border-accent-info/20 mb-5">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="font-semibold text-court-800">
            Progreso en el simulador de sala
          </span>
          <span className="font-bold text-accent-navy numeros">
            {nivelesHechos} de 5 niveles
          </span>
        </div>
        <div
          className="w-full bg-white rounded-full h-2.5 overflow-hidden border border-court-200"
          role="progressbar"
          aria-valuenow={nivelesHechos}
          aria-valuemin={0}
          aria-valuemax={5}
          aria-label={`Progreso: ${nivelesHechos} de 5 niveles del simulador completados`}
        >
          <div
            className="bg-accent-info h-2.5 rounded-full transition-all duration-200"
            style={{ width: `${(nivelesHechos / 5) * 100}%` }}
          />
        </div>
        {vista.nivelSalaNombre && (
          <p className="text-xs text-court-600 mt-2">
            Nivel alcanzado: <strong>{vista.nivelSalaNombre}</strong>
            {vista.sesionesSala > 0 ? ` (${vista.sesionesSala} sesiones)` : ''}.
          </p>
        )}
      </div>

      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        {!idCitacionProxima && (
          <Link
            href="/citacion"
            className="btn-primary text-base min-h-[44px] inline-flex items-center justify-center font-bold"
          >
            Crear tu primera citación
          </Link>
        )}
        <Link
          href="/sala-previa?ensayo=1"
          className={!idCitacionProxima ? 'btn-secondary text-base min-h-[44px] inline-flex items-center justify-center' : 'btn-primary text-base min-h-[44px] inline-flex items-center justify-center font-bold'}
        >
          Sigue tu ensayo de sala
        </Link>
        <Link
          href="/pasaporte"
          className="btn-secondary text-base min-h-[44px] inline-flex items-center justify-center"
        >
          Ver mi Pasaporte de ajustes
        </Link>
        {idCitacionProxima && (
          <Link
            href={`/citacion?id=${encodeURIComponent(idCitacionProxima)}`}
            className="btn-ghost text-base min-h-[44px] inline-flex items-center justify-center text-court-800"
          >
            Consultar la citación más próxima
          </Link>
        )}
      </div>
    </section>
  )
}
