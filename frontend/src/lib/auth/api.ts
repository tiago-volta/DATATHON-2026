/** Cliente de autenticación y estado de usuario (cookies httpOnly). */

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export interface PerfilCuenta {
  nombre: string
  rol: 'testigo'
  tolerancia: number
  estimulosSensibles: string[]
  creado: number
  actualizado: number
}

export interface SesionUsuario {
  email: string
  perfil: PerfilCuenta | null
}

export interface EstadoUsuarioAPI {
  perfil: unknown | null
  practica: unknown | null
  sala_progreso: unknown | null
  lo_que_te_ayuda: unknown | null
  pasaporte: unknown | null
  confianza: unknown | null
  insignias: unknown | null
  preferencias: unknown | null
}

async function leerError(res: Response): Promise<string> {
  const data = await res.json().catch(() => null)
  if (typeof data?.detail === 'string') return data.detail
  if (Array.isArray(data?.detail) && data.detail[0]?.msg) {
    return String(data.detail[0].msg)
  }
  return 'No se ha podido completar la petición.'
}

async function pedir<T>(ruta: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${ruta}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
    ...init,
  })
  if (!res.ok) {
    throw new Error(await leerError(res))
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export async function registrarCuenta(entrada: {
  email: string
  password: string
  nombre?: string
}): Promise<SesionUsuario> {
  return pedir<SesionUsuario>('/api/auth/registro', {
    method: 'POST',
    body: JSON.stringify(entrada),
  })
}

export async function iniciarSesion(entrada: {
  email: string
  password: string
}): Promise<SesionUsuario> {
  return pedir<SesionUsuario>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(entrada),
  })
}

export async function cerrarSesion(): Promise<void> {
  await pedir<{ ok: boolean }>('/api/auth/logout', { method: 'POST' })
}

export async function obtenerSesion(): Promise<SesionUsuario | null> {
  const res = await fetch(`${API_URL}/api/auth/me`, { credentials: 'include' })
  if (res.status === 401) return null
  if (!res.ok) throw new Error(await leerError(res))
  return res.json()
}

export async function obtenerEstadoUsuario(): Promise<EstadoUsuarioAPI> {
  return pedir<EstadoUsuarioAPI>('/api/me/estado')
}

export async function guardarEstadoUsuario(
  estado: Partial<EstadoUsuarioAPI>
): Promise<EstadoUsuarioAPI> {
  return pedir<EstadoUsuarioAPI>('/api/me/estado', {
    method: 'PUT',
    body: JSON.stringify(estado),
  })
}
