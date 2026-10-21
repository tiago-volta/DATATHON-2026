'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Icono } from '@/components/Icono'
import { Pictograma } from '@/components/Pictograma'

function urlArasaac(id: number) {
  return `https://static.arasaac.org/pictograms/${id}/${id}_500.png`
}

export default function PaginaEnsaya() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/sala-previa?ensayo=1')
  }, [router])

  return (
    <main id="contenido-principal" className="page-shell">
      <nav aria-label="Volver">
        <Link href="/" className="link-atras">
          <Icono nombre="←" />
          Volver al inicio
        </Link>
      </nav>

      <section className="card-destacada text-center py-10 space-y-6 max-w-2xl mx-auto" aria-live="polite">
        <div
          className="flex flex-wrap gap-4 justify-center p-3 rounded-tarjeta bg-white border border-court-200 w-fit mx-auto"
          aria-hidden="true"
        >
          <Pictograma url={urlArasaac(6517)} keyword="hablar" size="md" />
          <Pictograma url={urlArasaac(9847)} keyword="preguntar" size="md" />
          <Pictograma url={urlArasaac(11291)} keyword="juez" size="md" />
        </div>

        <div>
          <h1 className="text-3xl font-bold text-court-800 mb-2">
            Ensayo integrado en la sala del juzgado
          </h1>
          <p className="text-lg text-court-700">
            Ahora las preguntas del juicio se ensayan directamente dentro del simulador de la sala de vistas, con el juez y los letrados.
          </p>
        </div>

        <div>
          <Link
            href="/sala-previa?ensayo=1"
            className="btn-primary inline-flex text-lg px-6 py-3 min-h-[44px]"
          >
            Entrar a la sala y ensayar declaración
          </Link>
        </div>

        <p className="text-sm text-court-600">
          Redirigiendo automáticamente a la sala…
        </p>
      </section>
    </main>
  )
}
