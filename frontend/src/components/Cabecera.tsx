'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BotonesAuthCabecera } from '@/components/auth/BotonesAuthCabecera'
import { Marca } from '@/components/Marca'
import { useCabeceraFlotante } from '@/hooks/useCabeceraFlotante'

const ENLACES = [
  { href: '/citacion', etiqueta: 'Citación' },
  { href: '/pasaporte', etiqueta: 'Pasaporte' },
  { href: '/sala-previa', etiqueta: 'La sala' },
  { href: '/sala-previa/declaracion', etiqueta: 'Simulación' },
  { href: '/ayuda', etiqueta: 'Ayuda' },
] as const

function estaActivo(pathname: string, href: string) {
  if (href === '/citacion') {
    return pathname === '/citacion' || pathname.startsWith('/citacion/') || pathname.startsWith('/demo/luis')
  }
  if (href === '/sala-previa') return pathname === '/sala-previa'
  if (href === '/sala-previa/declaracion') {
    return pathname.startsWith('/sala-previa/declaracion') || pathname.startsWith('/ensaya')
  }
  return pathname === href || pathname.startsWith(`${href}/`)
}

export function Cabecera() {
  const pathname = usePathname()
  const flotante = useCabeceraFlotante()

  return (
    <div className="cabecera-capa">
      <header className={`cabecera ${flotante ? 'cabecera--flotante' : ''}`}>
        <div className="cabecera-interior">
          <Link
            href="/"
            className="cabecera-marca flex items-center gap-2.5 sm:gap-3 text-accent-navy min-h-[44px] min-w-0 rounded-suave px-2 -mx-2 transition-colors duration-200 hover:bg-calma-mist"
          >
            <Marca className="w-9 h-9 sm:w-10 sm:h-10 shrink-0" />
            <span className="text-xl sm:text-2xl font-bold tracking-tight truncate" translate="no">
              <span className="text-slate-800">Tribunal</span>
              <span className="text-[#0f766e]">Inclusivo</span>
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
                      ? 'font-bold text-accent-navy underline decoration-accent-info decoration-2 underline-offset-8 bg-calma-mist'
                      : 'font-medium text-court-800 hover:bg-calma-mist hover:text-accent-navy'
                  }`}
                >
                  {enlace.etiqueta}
                </Link>
              )
            })}
          </nav>

          <div className="cabecera-cuenta">
            <BotonesAuthCabecera />
          </div>
        </div>
      </header>
    </div>
  )
}
