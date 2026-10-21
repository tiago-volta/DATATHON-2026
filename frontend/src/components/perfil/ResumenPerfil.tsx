'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'
import {
  EVENTO_PERFIL,
  leerVistaPerfil,
  type PerfilVista,
} from '@/lib/perfil/perfil'
import { cargarProgreso } from '@/lib/sala-previa/progreso'
import type { RolPerfil } from '@/lib/perfil/tipos'

function etiquetaRol(rol?: RolPerfil): string {
  switch (rol) {
    case 'testigo':
      return 'Testigo'
    case 'investigado':
      return 'Investigado o acusado'
    case 'victima':
      return 'Víctima'
    case 'parte_civil':
      return 'Parte civil'
    default:
      return 'Testigo'
  }
}

export function ResumenPerfil() {
  const { sesion, cargando } = useAuth()
  const [vista, setVista] = useState<PerfilVista | null>(null)
  const [nivelesHechos, setNivelesHechos] = useState<number>(0)

  useEffect(() => {
    const refrescar = () => {
      setVista(leerVistaPerfil())
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
    window.addEventListener('storage', refrescar)
    return () => {
      window.removeEventListener(EVENTO_PERFIL, refrescar)
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

  // 1. Caso SIN perfil guardado: Hilo conductor para empezar
  if (!vista?.tienePerfil) {
    return (
      <section
        className="card mb-8 border-2 border-court-400 bg-gradient-to-br from-white to-court-50 p-6 shadow-sm"
        aria-labelledby="titulo-empieza"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-court-200 text-court-800 text-xs font-bold uppercase tracking-wider mb-3">
          <span>🧭</span>
          <span>Primer paso de preparación</span>
        </div>
        <h2 id="titulo-empieza" className="text-2xl font-bold text-court-900 mb-2">
          ¿Para qué vas al juzgado?
        </h2>
        <p className="text-court-700 max-w-[48ch] mb-5 leading-relaxed">
          Cada papel en un juicio tiene derechos y obligaciones distintos. Descubre qué implica acudir como testigo, investigado o víctima y prepara tus ajustes con calma.
        </p>

        <div className="flex flex-col sm:flex-row flex-wrap gap-3">
          <Link
            href="/sala-previa?rol=elegir"
            className="btn-primary text-base min-h-[44px] inline-flex items-center justify-center font-bold"
          >
            Empieza: ¿para qué vas al juzgado?
          </Link>
          <Link
            href="/citacion"
            className="btn-secondary text-base min-h-[44px] inline-flex items-center justify-center"
          >
            Tengo una citación judicial
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

  // 2. Caso CON perfil guardado: Bienvenida personalizada y seguimiento
  const rolTexto = etiquetaRol(vista.rol)

  return (
    <section
      className="card mb-8 border-2 border-court-600 bg-gradient-to-br from-white to-calma-sage/25 p-6 shadow-sm"
      aria-labelledby="titulo-bienvenida"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <span className="text-xs font-bold uppercase tracking-wider text-court-700 bg-court-100 px-2.5 py-1 rounded-full">
          Tu plan de juicio
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
      <p className="text-court-800 text-base mb-4">
        Tu papel en el juicio:{' '}
        <span className="font-bold text-court-950 underline decoration-court-400">
          {rolTexto}
        </span>
        .
      </p>

      {/* Progreso del simulador */}
      <div className="bg-white/90 rounded-lg p-3.5 border border-court-200 mb-5">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="font-semibold text-court-800">
            Progreso en el simulador de sala
          </span>
          <span className="font-bold text-court-900">
            {nivelesHechos} de 5 niveles
          </span>
        </div>
        <div
          className="w-full bg-court-100 rounded-full h-2.5 overflow-hidden"
          role="progressbar"
          aria-valuenow={nivelesHechos}
          aria-valuemin={0}
          aria-valuemax={5}
          aria-label={`Progreso: ${nivelesHechos} de 5 niveles del simulador completados`}
        >
          <div
            className="bg-court-700 h-2.5 rounded-full transition-all duration-500"
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

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-4">
        <Link
          href="/sala-previa?ensayo=1"
          className="btn-primary text-base min-h-[44px] inline-flex items-center justify-center font-bold"
        >
          Sigue tu ensayo de sala
        </Link>
        <Link
          href="/pasaporte"
          className="btn-secondary text-base min-h-[44px] inline-flex items-center justify-center"
        >
          Ver mi Pasaporte de ajustes
        </Link>
        <Link
          href="/citacion"
          className="btn-ghost text-base min-h-[44px] inline-flex items-center justify-center text-court-800"
        >
          Consultar citación
        </Link>
      </div>

      <div className="pt-3 border-t border-court-200 flex items-center justify-between">
        <Link
          href="/perfil"
          className="text-xs text-court-600 hover:text-court-900 underline font-medium min-h-[36px] inline-flex items-center"
        >
          Cambiar perfil o empezar de nuevo
        </Link>
      </div>
    </section>
  )
}
