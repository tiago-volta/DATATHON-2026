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
        {idCitacionProxima
          ? 'Continúa preparando tu declaración en la sala 3D con tus ajustes de accesibilidad.'
          : 'Ensayar en la sala 3D te permite anticipar las preguntas y regular los estímulos.'}
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
        <Link
          href="/sala-previa?ensayo=1"
          className="btn-primary text-base min-h-[44px] inline-flex items-center justify-center font-bold"
        >
          Sigue tu ensayo
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
