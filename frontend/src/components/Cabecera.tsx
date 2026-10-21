import Link from 'next/link'
import { IndicadorModoVoz } from '@/components/voz/IndicadorModoVoz'

export function Cabecera() {
  return (
    <header className="border-b-2 border-puente-900 bg-calma-cream">
      <nav className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between gap-4" aria-label="Principal">
        <Link href="/" className="flex items-center gap-3 text-puente-900 hover:text-puente-700 min-w-0">
          <svg className="w-9 h-9 shrink-0" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <path d="M7 27V18" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
            <path d="M33 27V18" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
            <path d="M7 18c4.2-7 21.8-7 26 0" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
            <path d="M6 27h28" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" />
          </svg>
          <span className="text-2xl font-bold tracking-tight" translate="no">PUENTE</span>
        </Link>

        <div className="flex items-center gap-4 shrink-0">
          <IndicadorModoVoz />
          <Link href="/pasaporte" className="font-bold text-puente-800 underline underline-offset-4 hover:text-puente-600">
            Mi Pasaporte
          </Link>
        </div>
      </nav>
    </header>
  )
}
