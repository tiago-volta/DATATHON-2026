'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icono } from '@/components/Icono'
import { useAuth } from '@/lib/auth/AuthContext'

export default function PaginaRegistro() {
  const router = useRouter()
  const { registro } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [consentimiento, setConsentimiento] = useState(true)

  const enviar = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if (!consentimiento) {
      setError('Debes aceptar el consentimiento de privacidad para crear tu cuenta.')
      return
    }
    setEnviando(true)
    try {
      await registro(email.trim(), password, nombre.trim() || undefined)
      router.push('/perfil')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se ha podido crear la cuenta.')
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

      <h1 className="titulo-pagina">Crear cuenta</h1>
      <p className="entradilla max-w-[42ch]">
        Tu cuenta guarda el progreso en InclusiveCourt.
        No muestra ningún diagnóstico.
      </p>

      <form className="card max-w-lg" onSubmit={(e) => void enviar(e)} noValidate>
        <div className="space-y-6">
          <div>
            <label htmlFor="reg-nombre" className="block font-medium text-court-800 mb-2">
              Tu nombre (opcional)
            </label>
            <input
              id="reg-nombre"
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="input-accesible"
              autoComplete="name"
              maxLength={60}
            />
          </div>
          <div>
            <label htmlFor="reg-email" className="block font-medium text-court-800 mb-2">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-accesible"
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="block font-medium text-court-800 mb-2">
              Contraseña
            </label>
            <input
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-accesible"
              autoComplete="new-password"
              minLength={8}
              required
              aria-describedby="ayuda-reg-password"
            />
            <p id="ayuda-reg-password" className="text-sm text-court-700 mt-2">
              Mínimo 8 caracteres.
            </p>
          </div>
          <div className="pt-2 border-t border-court-200">
            <label htmlFor="reg-consentimiento" className="flex items-start gap-3 cursor-pointer text-sm text-court-800">
              <input
                id="reg-consentimiento"
                type="checkbox"
                required
                checked={consentimiento}
                onChange={(e) => setConsentimiento(e.target.checked)}
                className="mt-1 h-5 w-5 shrink-0 accent-court-700"
              />
              <span>
                Acepto el tratamiento de mis preferencias y datos de apoyo conforme al RGPD (arts. 6.1.a y 9.2.a). Puedo solicitar la supresión completa de mi cuenta y mis datos en cualquier momento.
              </span>
            </label>
          </div>

          {error && (
            <p className="text-red-700 font-medium" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="btn-primary w-full" disabled={enviando || !email.trim() || !consentimiento}>
            {enviando ? 'Creando cuenta…' : 'Crear cuenta'}
          </button>
        </div>
      </form>

      <p className="mt-6 text-court-700">
        ¿Ya tienes cuenta?{' '}
        <Link href="/login" className="font-bold underline underline-offset-4">
          Entrar
        </Link>
      </p>
    </main>
  )
}
