import Link from 'next/link'

export function Cabecera() {
  return (
    <header className="bg-white border-b border-puente-100">
      <nav className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 text-puente-700 hover:text-puente-900">
          <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" aria-hidden="true">
            <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2.5" fill="none" />
            <path d="M12 24 L20 16 L28 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            <path d="M20 16 L20 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          <span className="text-2xl font-bold">PUENTE</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/pasaporte" className="btn-ghost text-base">
            Mi Pasaporte
          </Link>
        </div>
      </nav>
    </header>
  )
}
