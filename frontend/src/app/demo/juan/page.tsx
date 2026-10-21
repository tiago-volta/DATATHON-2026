'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icono } from '@/components/Icono'

export default function DemoJuan() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/demo/luis')
  }, [router])

  return (
    <main id="contenido-principal" className="page-shell">
      <nav aria-label="Volver">
        <Link href="/" className="link-atras">
          <Icono nombre="←" />
          Volver al inicio
        </Link>
      </nav>

      <section className="card-destacada text-center py-10 space-y-4 max-w-xl mx-auto" aria-live="polite">
        <h1 className="text-2xl font-bold text-court-800">
          Caso de referencia: Luis (Testigo)
        </h1>
        <p className="text-court-700">
          Redirigiendo a la preparación y ensayo de declaración para el caso de Luis…
        </p>
        <div>
          <Link href="/demo/luis" className="btn-primary">
            Ir al caso de Luis
          </Link>
        </div>
      </section>
    </main>
  )
}
