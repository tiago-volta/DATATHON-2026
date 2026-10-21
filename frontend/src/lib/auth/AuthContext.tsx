'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  cerrarSesion as apiLogout,
  eliminarCuenta as apiEliminarCuenta,
  iniciarSesion as apiLogin,
  obtenerSesion,
  registrarCuenta as apiRegistro,
  type SesionUsuario,
} from '@/lib/auth/api'
import {
  limpiarEstadoLocal,
  marcarSesionActiva,
  sincronizarTrasLogin,
  vaciarColaSync,
} from '@/lib/sync/estadoUsuario'

interface AuthContextValue {
  sesion: SesionUsuario | null
  cargando: boolean
  refrescar: () => Promise<void>
  login: (email: string, password: string) => Promise<void>
  registro: (email: string, password: string, nombre?: string) => Promise<void>
  logout: () => Promise<void>
  eliminarCuenta: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function ProveedorAuth({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<SesionUsuario | null>(null)
  const [cargando, setCargando] = useState(true)

  const refrescar = useCallback(async () => {
    try {
      const actual = await obtenerSesion()
      setSesion(actual)
      if (actual) {
        await sincronizarTrasLogin(actual.email)
      } else {
        marcarSesionActiva(false)
      }
    } catch {
      setSesion(null)
      marcarSesionActiva(false)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => {
    void refrescar()
  }, [refrescar])

  const login = useCallback(async (email: string, password: string) => {
    const actual = await apiLogin({ email, password })
    setSesion(actual)
    // La sesión ya es válida; un fallo de sync no debe abortar el login.
    try {
      await sincronizarTrasLogin(actual.email)
    } catch {
      marcarSesionActiva(true, actual.email)
    }
  }, [])

  const registro = useCallback(
    async (email: string, password: string, nombre?: string) => {
      const actual = await apiRegistro({ email, password, nombre })
      setSesion(actual)
      try {
        await sincronizarTrasLogin(actual.email)
      } catch {
        marcarSesionActiva(true, actual.email)
      }
    },
    []
  )

  const logout = useCallback(async () => {
    vaciarColaSync()
    limpiarEstadoLocal()
    await apiLogout()
    setSesion(null)
  }, [])

  const eliminarCuenta = useCallback(async () => {
    vaciarColaSync()
    limpiarEstadoLocal()
    await apiEliminarCuenta()
    setSesion(null)
  }, [])

  const valor = useMemo(
    () => ({ sesion, cargando, refrescar, login, registro, logout, eliminarCuenta }),
    [sesion, cargando, refrescar, login, registro, logout, eliminarCuenta]
  )

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de ProveedorAuth.')
  }
  return ctx
}
