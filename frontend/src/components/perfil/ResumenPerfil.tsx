'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'
import {
  EVENTO_PERFIL,
  leerVistaPerfil,
  type PerfilVista,
} from '@/lib/perfil/perfil'

export function ResumenPerfil() {
  const { sesion, cargando } = useAuth()
  const [vista, setVista] = useState<PerfilVista | null>(null)

  useEffect(() => {
    const refrescar = () => setVista(leerVistaPerfil())
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
      <section className="card mb-10" aria-live="polite">
        <p className="text-court-700">Cargando tu cuenta…</p>
      </section>
    )
  }

  if (!sesion) {
    return (
      <section className="card mb-10" aria-labelledby="titulo-cuenta">
        <h2 id="titulo-cuenta" className="text-2xl text-court-900 mb-2">
          Empieza con tu cuenta
        </h2>
        <p className="text-court-700 max-w-[40ch]">
          Crea una cuenta con tu email. Así guardamos tu perfil y tu progreso
          aunque cambies de dispositivo.
        </p>
        <p className="text-court-700 max-w-[40ch] mt-4">
          Pulsa Crear cuenta o Entrar, arriba a la derecha.
        </p>
      </section>
    )
  }

  if (!vista?.tienePerfil) {
    return (
      <section className="card mb-10" aria-labelledby="titulo-sin-perfil">
        <h2 id="titulo-sin-perfil" className="text-2xl text-court-900 mb-2">
          Completa tu perfil
        </h2>
        <p className="text-court-700 max-w-[40ch]">
          Indica tu nombre, tu tolerancia y lo que te molesta.
        </p>
        <div className="mt-6">
          <Link href="/perfil" className="btn-primary">
            Ir a mi perfil
          </Link>
        </div>
      </section>
    )
  }

  const dias = vista.diasPracticados

  return (
    <section className="card mb-10" aria-labelledby="titulo-preparacion">
      <h2 id="titulo-preparacion" className="text-2xl text-court-900 mb-2">
        {vista.nombre}
      </h2>
      <p className="text-court-700">Vas como testigo.</p>
      <p className="text-court-700 mt-1 text-sm">{sesion.email}</p>
      {vista.toleranciaEtiqueta && (
        <p className="text-court-700 mt-2">
          Tu tolerancia ahora: {vista.toleranciaEtiqueta}.
        </p>
      )}
      {vista.estimulosEtiquetas.length > 0 && (
        <p className="text-court-700 mt-2">
          Te molesta: {vista.estimulosEtiquetas.join(', ')}.
        </p>
      )}
      {vista.nivelSalaNombre && (
        <p className="text-court-700 mt-2">
          En la sala has llegado a: {vista.nivelSalaNombre}.
        </p>
      )}
      {dias > 0 && (
        <p className="text-court-700 mt-2">
          Has practicado {dias} {dias === 1 ? 'día' : 'días'}
          {vista.sesionesSala > 0
            ? ` y ${vista.sesionesSala} ${vista.sesionesSala === 1 ? 'sesión' : 'sesiones'} en la sala`
            : ''}
          .
        </p>
      )}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mt-6">
        <Link href="/citacion" className="btn-primary">
          Seguir con la citación
        </Link>
        <Link href="/sala-previa" className="btn-secondary">
          Entrar en la sala
        </Link>
        <Link href="/pasaporte" className="btn-secondary">
          Ver mi ficha
        </Link>
        <Link href="/perfil" className="btn-ghost">
          Cambiar mi perfil
        </Link>
      </div>
    </section>
  )
}
