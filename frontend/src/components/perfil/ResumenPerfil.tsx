'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { leerPerfil, type PerfilLectura } from '@/lib/perfil/perfil'

export function ResumenPerfil() {
  const [perfil, setPerfil] = useState<PerfilLectura | null>(null)

  useEffect(() => {
    setPerfil(leerPerfil())
  }, [])

  if (!perfil?.visible) return null

  const dias = perfil.diasPracticados

  return (
    <section className="card mb-10" aria-labelledby="titulo-preparacion">
      <h2 id="titulo-preparacion" className="text-2xl text-court-900 mb-2">
        {perfil.nombre ?? 'Tu preparación'}
      </h2>
      <p className="text-court-700">Vas como testigo.</p>
      {perfil.nivelNombre && (
        <p className="text-court-700 mt-2">
          Tu punto en la sala: {perfil.nivelNombre}.
        </p>
      )}
      {dias > 0 && (
        <p className="text-court-700 mt-2">
          Has practicado {dias} {dias === 1 ? 'día' : 'días'}.
        </p>
      )}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Link href="/sala-previa" className="btn-primary">
          Seguir en la sala
        </Link>
        <Link href="/pasaporte" className="btn-secondary">
          Ver mi ficha
        </Link>
      </div>
    </section>
  )
}
