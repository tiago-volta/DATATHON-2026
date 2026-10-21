'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BotonesAuthCabecera } from '@/components/auth/BotonesAuthCabecera'
import { Marca } from '@/components/Marca'
import { BotonPerfilInsignias } from '@/components/insignias/BotonPerfilInsignias'
import { useCabeceraFlotante } from '@/hooks/useCabeceraFlotante'

const ENLACES = [
  { href: '/', etiqueta: 'Inicio' },
  { href: '/perfil', etiqueta: 'Perfil' },
  { href: '/citacion', etiqueta: 'Citación' },
  { href: '/pasaporte', etiqueta: 'Pasaporte' },
  { href: '/sala-previa', etiqueta: 'Sala' },
  { href: '/ayuda', etiqueta: 'Ayuda' },
] as const

function estaActivo(pathname: string, href: string) {
  if (href === '/') return pathname === '/'
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
          className="flex items-center gap-3 text-court-900 min-h-[44px] min-w-0 shrink-0 rounded-suave px-2 -mx-2 transition-colors duration-200 hover:bg-court-50"
        >
          <Marca />
          <span className="text-2xl font-bold tracking-tight" translate="no">
            InclusiveCourt
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
                    ? 'font-bold text-court-900 underline decoration-court-900 decoration-2 underline-offset-8'
                    : 'font-medium text-court-800 hover:bg-court-50'
                }`}
              >
                {enlace.etiqueta}
              </Link>
            )
          })}
          <div className="flex items-center gap-1 md:ml-2 md:border-l md:border-court-200 md:pl-4">
            <Link
              href="/profesional"
              aria-current={panelActivo ? 'page' : undefined}
              className={`inline-flex items-center min-h-[44px] px-3 rounded-suave transition-colors duration-200 ${
                panelActivo
                  ? 'font-bold text-court-900 underline decoration-court-900 decoration-2 underline-offset-8'
                  : 'text-court-800 hover:bg-court-50'
              }`}
            >
              Para el juzgado
            </Link>
            <BotonesAuthCabecera />
            <BotonPerfilInsignias />
          </div>
        </nav>
        </div>
      </header>
    </div>
  )
}
