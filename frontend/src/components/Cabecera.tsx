'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Marca } from '@/components/Marca'
import { IndicadorModoVoz } from '@/components/voz/IndicadorModoVoz'

const ENLACES = [
  { href: '/', etiqueta: 'Inicio' },
  { href: '/citacion', etiqueta: 'Citación' },
  { href: '/pasaporte', etiqueta: 'Pasaporte' },
  { href: '/ensaya', etiqueta: 'Ensaya' },
  { href: '/sala-previa', etiqueta: 'Sala' },
] as const

function estaActivo(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Cabecera() {
  const pathname = usePathname()
  const panelActivo = estaActivo(pathname, '/profesional')

  return (
    <header className="border-b border-puente-200 bg-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col gap-1 md:flex-row md:items-center md:justify-between md:gap-6">
        <Link
          href="/"
          className="flex items-center gap-3 text-puente-900 min-h-[44px] min-w-0 shrink-0 rounded-suave px-2 -mx-2 transition-colors duration-200 hover:bg-puente-50"
        >
          <Marca />
          <span className="text-2xl font-bold tracking-tight" translate="no">
            PUENTE
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-x-1 gap-y-1" aria-label="Principal">
          {ENLACES.map((enlace) => {
            const activo = estaActivo(pathname, enlace.href)
            return (
              <Link
                key={enlace.href}
                href={enlace.href}
                aria-current={activo ? 'page' : undefined}
                className={`inline-flex items-center min-h-[44px] px-3 rounded-suave transition-colors duration-200 ${
                  activo
                    ? 'font-bold text-puente-900 underline decoration-puente-900 decoration-2 underline-offset-8'
                    : 'font-medium text-puente-800 hover:bg-puente-50'
                }`}
              >
                {enlace.etiqueta}
              </Link>
            )
          })}
          <div className="flex items-center gap-1 md:ml-2 md:border-l md:border-puente-200 md:pl-4">
            <IndicadorModoVoz />
            <Link
              href="/profesional"
              aria-current={panelActivo ? 'page' : undefined}
              className={`inline-flex items-center min-h-[44px] px-3 rounded-suave transition-colors duration-200 ${
                panelActivo
                  ? 'font-bold text-puente-900 underline decoration-puente-900 decoration-2 underline-offset-8'
                  : 'text-puente-800 hover:bg-puente-50'
              }`}
            >
              Para el juzgado
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
