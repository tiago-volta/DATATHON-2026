'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BotonesAuthCabecera } from '@/components/auth/BotonesAuthCabecera'
import { Marca } from '@/components/Marca'
import { useCabeceraFlotante } from '@/hooks/useCabeceraFlotante'

const ENLACES = [
  { href: '/citacion', etiqueta: 'Citación' },
  { href: '/pasaporte', etiqueta: 'Pasaporte' },
  { href: '/sala-previa', etiqueta: 'Sala' },
  { href: '/ayuda', etiqueta: 'Ayuda' },
] as const

function estaActivo(pathname: string, href: string) {
  if (href === '/sala-previa' && pathname.startsWith('/ensaya')) return true
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Cabecera() {
  const pathname = usePathname()
  const panelActivo = estaActivo(pathname, '/profesional')
  const flotante = useCabeceraFlotante()

  return (
    <div className="cabecera-capa">
      <header className={`cabecera ${flotante ? 'cabecera--flotante' : ''}`}>
        <div className="cabecera-interior">
          <Link
            href="/"
            className="cabecera-marca flex items-center gap-2 sm:gap-3 text-court-900 min-h-[44px] min-w-0 rounded-suave px-2 -mx-2 transition-colors duration-200 hover:bg-court-50"
          >
            <Marca />
            <span className="text-xl sm:text-2xl font-bold tracking-tight truncate" translate="no">
              InclusiveCourt
            </span>
          </Link>

          <nav className="cabecera-nav flex flex-wrap items-center gap-x-1 gap-y-1 lg:gap-x-2" aria-label="Principal">
            {ENLACES.map((enlace) => {
              const activo = estaActivo(pathname, enlace.href)
              return (
                <Link
                  key={enlace.href}
                  href={enlace.href}
                  aria-current={activo ? 'page' : undefined}
                  className={`inline-flex items-center min-h-[44px] px-3 lg:px-4 rounded-suave transition-colors duration-200 ${
                    activo
                      ? 'font-bold text-court-900 underline decoration-court-900 decoration-2 underline-offset-8'
                      : 'font-medium text-court-800 hover:bg-court-50'
                  }`}
                >
                  {enlace.etiqueta}
                </Link>
              )
            })}
            <Link
              href="/profesional"
              aria-current={panelActivo ? 'page' : undefined}
              className={`inline-flex items-center min-h-[44px] px-3 lg:px-4 rounded-suave transition-colors duration-200 ${
                panelActivo
                  ? 'font-bold text-court-900 underline decoration-court-900 decoration-2 underline-offset-8'
                  : 'text-court-700 hover:bg-court-50'
              }`}
            >
              Para el juzgado
            </Link>
          </nav>

          <div className="cabecera-cuenta">
            <BotonesAuthCabecera />
          </div>
        </div>
      </header>
    </div>
  )
}
