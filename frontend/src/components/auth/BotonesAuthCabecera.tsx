'use client'

import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'

export function BotonesAuthCabecera() {
  const { sesion, cargando, logout } = useAuth()

  if (cargando) {
    return (
      <span className="inline-flex items-center min-h-[44px] px-3 text-court-700 text-sm">
        …
      </span>
    )
  }

  if (sesion) {
    const corto = sesion.email.split('@')[0]
    return (
      <div className="flex items-center gap-1">
        <span className="hidden sm:inline text-sm text-court-700 px-2 max-w-[10rem] truncate" title={sesion.email}>
          {corto}
        </span>
        <button
          type="button"
          className="inline-flex items-center min-h-[44px] px-3 rounded-suave text-court-800 hover:bg-court-50"
          onClick={() => void logout()}
        >
          Salir
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <Link
        href="/login"
        className="inline-flex items-center min-h-[44px] px-3 rounded-suave text-court-800 hover:bg-court-50"
      >
        Entrar
      </Link>
      <Link
        href="/registro"
        className="inline-flex items-center min-h-[44px] px-3 rounded-suave font-medium text-court-900 hover:bg-court-50"
      >
        Crear cuenta
      </Link>
    </div>
  )
}
