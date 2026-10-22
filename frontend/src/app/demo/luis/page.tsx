'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { cargarPerfilDemoLuis } from '@/lib/perfil/demoLuis'

export default function PaginaDemoLuis() {
  const [listo, setListo] = useState(false)

  useEffect(() => {
    cargarPerfilDemoLuis()
    setListo(true)
  }, [])

  return (
    <main id="contenido-principal" className="page-shell">
      <div className="card max-w-2xl mx-auto p-6 space-y-4 border-2 border-accent-info/30">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-suave bg-accent-info/15 text-accent-navy text-xs font-bold uppercase tracking-wider border border-accent-info/25">
          <span>Ejemplo de referencia</span>
        </div>
        <h1 className="text-2xl font-bold text-court-900">
          Perfil de ejemplo: Luis (Testigo)
        </h1>
        <p className="text-court-700 leading-relaxed">
          Se ha cargado en tu navegador el perfil de <strong>Luis</strong> como <strong>testigo</strong> en un proceso penal, junto con sus ajustes de partida (tolerancia media-baja a ruido y luz, descanso cada 20 minutos, acompañante y preguntas cortas) y su citación judicial activa para el 14 de noviembre en A Coruña.
        </p>
        <p className="text-sm text-court-600">
          Tanto la Sala Previa 3D como el Ensayo de preguntas mostrarán ahora su papel de testigo de forma coherente.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 pt-3">
          <Link href="/sala-previa?ensayo=1" className="btn-primary text-center">
            Sigue tu ensayo de sala
          </Link>
          <Link href="/pasaporte" className="btn-secondary text-center">
            Ver Pasaporte de ajustes
          </Link>
          <Link href="/" className="btn-ghost text-center text-court-800">
            Volver al inicio
          </Link>
        </div>
      </div>
    </main>
  )
}

