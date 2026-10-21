'use client'

import { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'

function IconoPersona() {
  return (
    <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5.5 19.25c1.4-3.1 3.7-4.5 6.5-4.5s5.1 1.4 6.5 4.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function BotonesAuthCabecera() {
  const { sesion, cargando, logout } = useAuth()
  const pathname = usePathname()
  const [abierto, setAbierto] = useState(false)
  const [saliendo, setSaliendo] = useState(false)
  const menuId = useId()
  const tituloId = useId()
  const raizRef = useRef<HTMLDivElement>(null)
  const botonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    setAbierto(false)
  }, [pathname])

  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAbierto(false)
        botonRef.current?.focus()
      }
    }
    const onPointer = (e: MouseEvent | TouchEvent) => {
      const nodo = raizRef.current
      if (!nodo) return
      if (e.target instanceof Node && !nodo.contains(e.target)) {
        setAbierto(false)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
    }
  }, [abierto])

  if (cargando) {
    return (
      <span
        className="inline-flex h-11 min-w-[11rem] shrink-0"
        aria-hidden="true"
      />
    )
  }

  if (!sesion) {
    const enLogin = pathname === '/login' || pathname.startsWith('/login/')
    const enRegistro = pathname === '/registro' || pathname.startsWith('/registro/')
    const claseEnlace = (activo: boolean) =>
      `inline-flex items-center min-h-[44px] px-3 rounded-suave cursor-pointer ${
        activo
          ? 'font-bold text-court-900 underline decoration-court-900 decoration-2 underline-offset-8'
          : 'font-medium text-court-800 hover:bg-court-50'
      }`

    return (
      <div className="flex items-center gap-1">
        <Link href="/login" aria-current={enLogin ? 'page' : undefined} className={claseEnlace(enLogin)}>
          Entrar
        </Link>
        <Link
          href="/registro"
          aria-current={enRegistro ? 'page' : undefined}
          className={claseEnlace(enRegistro)}
        >
          Crear cuenta
        </Link>
      </div>
    )
  }

  const nombreVisible = sesion.perfil?.nombre?.trim() || sesion.email.split('@')[0]
  const enPerfil = pathname === '/perfil' || pathname.startsWith('/perfil/')

  const salir = async () => {
    setSaliendo(true)
    try {
      await logout()
    } finally {
      setSaliendo(false)
      setAbierto(false)
    }
  }

  const claseItem =
    'flex items-center min-h-[44px] w-full px-3 rounded-suave text-left text-court-800 hover:bg-court-50 cursor-pointer'

  return (
    <div ref={raizRef} className="relative shrink-0">
      <button
        ref={botonRef}
        type="button"
        className={`relative inline-flex items-center justify-center min-h-[44px] min-w-[44px] w-11 h-11 rounded-full border bg-white text-court-900 cursor-pointer transition-colors duration-200 hover:bg-court-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-court-400 ${
          enPerfil || abierto ? 'border-court-800' : 'border-court-300'
        }`}
        aria-label={`Tu perfil. Sesión de ${nombreVisible}`}
        aria-expanded={abierto}
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={() => setAbierto((v) => !v)}
      >
        <IconoPersona />
      </button>

      {abierto && (
        <div
          id={menuId}
          role="region"
          aria-labelledby={tituloId}
          className="absolute right-0 top-[calc(100%+0.5rem)] z-[70] w-[min(18rem,calc(100vw-1.5rem))] rounded-suave border border-court-200 bg-white shadow-lg p-2"
        >
          <p id={tituloId} className="px-3 pt-2 pb-1 text-sm text-court-700 truncate" title={sesion.email}>
            {sesion.email}
          </p>
          <ul className="mt-1">
            <li>
              <Link href="/perfil" className={claseItem} onClick={() => setAbierto(false)}>
                Tu perfil
              </Link>
            </li>
            <li>
              <Link
                href="/perfil#medallas"
                className={claseItem}
                onClick={() => setAbierto(false)}
              >
                Tus medallas
              </Link>
            </li>
            <li>
              <button
                type="button"
                className={claseItem}
                onClick={() => void salir()}
                disabled={saliendo}
              >
                {saliendo ? 'Saliendo…' : 'Salir'}
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
