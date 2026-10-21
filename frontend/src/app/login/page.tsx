'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icono } from '@/components/Icono'
import { useAuth } from '@/lib/auth/AuthContext'

export default function PaginaLogin() {
  const router = useRouter()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setEnviando(true)
    try {
      await login(email.trim(), password.trim())
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se ha podido entrar.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main id="contenido-principal" className="page-shell">
      <nav aria-label="Volver" className="mb-6">
        <Link href="/" className="link-atras">
          <Icono nombre="←" />
          Volver al inicio
        </Link>
      </nav>

      <h1 className="titulo-pagina">Entrar</h1>
      <p className="entradilla max-w-[42ch]">
        Entra con tu email y tu contraseña para recuperar tu progreso.
      </p>

      <form className="card max-w-lg" onSubmit={(e) => void enviar(e)} noValidate>
        <div className="space-y-6">
          <div>
            <label htmlFor="login-email" className="block font-medium text-court-800 mb-2">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-accesible"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="block font-medium text-court-800 mb-2">
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-accesible"
              autoComplete="current-password"
              required
            />
          </div>
          {error && (
            <p className="text-red-700 font-medium" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary w-full" disabled={enviando || !email.trim()}>
            {enviando ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      </form>

      <p className="mt-6 text-court-700">
        ¿No tienes cuenta?{' '}
        <Link href="/registro" className="font-bold underline underline-offset-4">
          Crear cuenta
        </Link>
      </p>
    </main>
  )
}
