'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Icono } from '@/components/Icono'
import { Marca } from '@/components/Marca'
import {
  etiquetasAjustes,
  parsePasaporteSearchParams,
  type PasaportePayload,
} from '@/lib/pasaporte'

function ContenidoVerPasaporte() {
  const searchParams = useSearchParams()
  const [hashParams, setHashParams] = useState<string>('')
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      setHashParams(window.location.hash.replace(/^#/, ''))
    }
    setCargando(false)
  }, [])

  const pasaporte = useMemo<PasaportePayload | null>(() => {
    // 1. Privacidad por diseño (Art. 25 RGPD / RFC 3986): fragmento # (no transmitido en HTTP request line)
    if (hashParams) {
      const parsed = parsePasaporteSearchParams(new URLSearchParams(hashParams))
      if (parsed) return parsed
    }
    // 2. Retrocompatibilidad: query params (?id=...&n=...)
    if (searchParams && searchParams.toString().length > 0) {
      return parsePasaporteSearchParams(searchParams)
    }
    return null
  }, [hashParams, searchParams])

  const ajustes = pasaporte ? etiquetasAjustes(pasaporte.ajustes) : []

  if (cargando) {
    return (
      <main id="contenido-principal" className="page-shell">
        <section className="card text-center" aria-live="polite">
          <p className="entradilla">Cargando ficha del Pasaporte...</p>
        </section>
      </main>
    )
  }

  return (
    <main id="contenido-principal" className="page-shell">
      {!pasaporte ? (
        <section className="card text-center" aria-live="polite">
          <h1 className="titulo-pagina">Pasaporte no encontrado</h1>
          <p className="entradilla">
            Este enlace no incluye los datos del Pasaporte. Pide a la persona que te muestre de nuevo su código QR.
          </p>
          <Link href="/pasaporte" className="btn-primary">
            Crear un Pasaporte
          </Link>
        </section>
      ) : (
        <section aria-labelledby="titulo-pasaporte">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
            <p className="text-court-700 font-medium">
              Escaneado · Pasaporte de Ajustes
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs bg-calma-sage text-court-800 font-semibold px-2.5 py-1 rounded-full border border-court-200">
              <Icono nombre="🔒" className="h-3.5 w-3.5 text-court-800" />
              Privacidad blindada · RFC 3986 / Art. 25 RGPD
            </span>
          </div>

          <article className="hoja">
            <header className="border-b-2 border-court-800 pb-6 mb-6">
              <div className="flex items-center gap-3 mb-4 text-court-800">
                <Marca className="w-8 h-8" />
                <span className="text-xl font-bold" translate="no">
                  InclusiveCourt
                </span>
              </div>
              <h1 id="titulo-pasaporte" className="text-3xl font-bold text-court-900 mb-1">
                {pasaporte.nombre}
              </h1>
              <p className="text-court-700">
                Necesita estos ajustes en el juzgado
              </p>
              <p className="text-court-800 mt-3 numeros">
                Código: {pasaporte.id}
              </p>
            </header>

            <h2 className="font-bold text-court-800 mb-4 text-lg">
              Adaptaciones pedidas
            </h2>
            <ul className="space-y-3">
              {ajustes.map((ajuste) => (
                <li
                  key={ajuste.id}
                  className="flex items-start gap-3 p-3 rounded-suave bg-white border border-court-200"
                >
                  <Icono nombre="✓" className="mt-0.5 h-5 w-5 text-accent-success" />
                  <div>
                    <p className="font-bold text-court-800">{ajuste.nombre}</p>
                    <p className="text-court-700 text-base">{ajuste.descripcion}</p>
                  </div>
                </li>
              ))}
            </ul>

            {pasaporte.contacto && (
              <div className="mt-6 p-4 rounded-suave border-2 border-court-200 bg-white">
                <p className="text-court-800 mb-1">Contacto de emergencia</p>
                <p className="text-lg font-bold text-court-900">
                  <a href={`tel:${pasaporte.contacto.replace(/\s/g, '')}`} className="underline">
                    {pasaporte.contacto}
                  </a>
                </p>
              </div>
            )}

            <div className="mt-6 p-4 rounded-suave bg-calma-sage border border-court-200 text-sm text-court-800 space-y-1.5">
              <p className="font-semibold">
                Garantías legales y de privacidad
              </p>
              <p>
                Este Pasaporte no muestra ningún diagnóstico. Solo indica qué adaptaciones prácticas necesita la persona en sala.
              </p>
              <p className="text-xs text-court-700">
                Base legal: Art. 7 bis LEC · Art. 109 LECrim · RD 707/2026 · Ley 15/2022.
                <br />
                Privacidad por diseño (Art. 25 RGPD): Los datos viajan en el fragmento local del navegador sin quedar guardados en servidores web.
              </p>
            </div>
          </article>

          <div className="mt-8 flex flex-col gap-3">
            <Link href="/profesional" className="btn-secondary w-full text-center">
              Panel profesional
            </Link>
            <Link href="/pasaporte" className="btn-ghost w-full text-center">
              Crear otro Pasaporte
            </Link>
          </div>
        </section>
      )}
    </main>
  )
}

export default function PaginaVerPasaporte() {
  return (
    <Suspense
      fallback={
        <main id="contenido-principal" className="page-shell">
          <section className="card text-center" aria-live="polite">
            <p className="entradilla">Cargando...</p>
          </section>
        </main>
      }
    >
      <ContenidoVerPasaporte />
    </Suspense>
  )
}
