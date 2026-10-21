/**
 * Sincroniza el estado local (court-*) con /api/me/estado cuando hay sesión.
 */

import { guardarEstadoUsuario, obtenerEstadoUsuario } from '@/lib/auth/api'

const CLAVE_PERFIL = 'court-perfil'
const CLAVE_PRACTICA = 'court-practica'
const CLAVE_SALA = 'court-sala-previa-progreso'
const CLAVE_AYUDA = 'court-lo-que-te-ayuda'
const CLAVE_PASAPORTE = 'court-pasaporte'
const CLAVE_CONFIANZA = 'court-confianza'
const CLAVE_INSIGNIAS = 'court-insignias-utiles'
const CLAVE_PREFERENCIAS = 'court-preferencias'
const CLAVE_OWNER = 'court-sync-email'

type Bloque =
  | 'perfil'
  | 'practica'
  | 'sala_progreso'
  | 'lo_que_te_ayuda'
  | 'pasaporte'
  | 'confianza'
  | 'insignias'
  | 'preferencias'

const MAPA: { clave: string; bloque: Bloque }[] = [
  { clave: CLAVE_PERFIL, bloque: 'perfil' },
  { clave: CLAVE_PRACTICA, bloque: 'practica' },
  { clave: CLAVE_SALA, bloque: 'sala_progreso' },
  { clave: CLAVE_AYUDA, bloque: 'lo_que_te_ayuda' },
  { clave: CLAVE_PASAPORTE, bloque: 'pasaporte' },
  { clave: CLAVE_CONFIANZA, bloque: 'confianza' },
  { clave: CLAVE_INSIGNIAS, bloque: 'insignias' },
  { clave: CLAVE_PREFERENCIAS, bloque: 'preferencias' },
]

let timer: ReturnType<typeof setTimeout> | null = null
let haySesion = false
let emailSesion: string | null = null

function leerJson(clave: string): unknown | null {
  try {
    const raw = localStorage.getItem(clave)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function escribirJson(clave: string, valor: unknown) {
  if (valor === null || valor === undefined) return
  try {
    localStorage.setItem(clave, JSON.stringify(valor))
  } catch {
    /* ignore */
  }
}

function estadoLocalVacio(): boolean {
  return MAPA.every(({ clave }) => localStorage.getItem(clave) === null)
}

function estadoServidorVacio(estado: Record<string, unknown>): boolean {
  return MAPA.every(({ bloque }) => {
    const v = estado[bloque]
    return v === null || v === undefined
  })
}

function leerEstadoLocal(): Partial<Record<Bloque, unknown>> {
  const out: Partial<Record<Bloque, unknown>> = {}
  for (const { clave, bloque } of MAPA) {
    const valor = leerJson(clave)
    if (valor !== null) out[bloque] = valor
  }
  return out
}

function aplicarEstadoServidor(estado: Record<string, unknown>) {
  for (const { clave, bloque } of MAPA) {
    const valor = estado[bloque]
    if (valor !== null && valor !== undefined) {
      escribirJson(clave, valor)
    }
  }
  window.dispatchEvent(new Event('court-perfil-cambio'))
  window.dispatchEvent(new Event('InclusiveCourt:insignias-cambiadas'))
  window.dispatchEvent(new Event('court-preferencias-cambio'))
}

/** Borra el cache local del recorrido (logout / cambio de cuenta). */
export function limpiarEstadoLocal() {
  if (typeof window === 'undefined') return
  for (const { clave } of MAPA) {
    try {
      localStorage.removeItem(clave)
    } catch {
      /* ignore */
    }
  }
  try {
    localStorage.removeItem(CLAVE_OWNER)
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event('court-perfil-cambio'))
  window.dispatchEvent(new Event('InclusiveCourt:insignias-cambiadas'))
  window.dispatchEvent(new Event('court-preferencias-cambio'))
}

function puedeMigrarLocal(email: string): boolean {
  try {
    const owner = localStorage.getItem(CLAVE_OWNER)
    // Sin owner: datos de invitado → migración permitida
    if (!owner) return !estadoLocalVacio()
    return owner === email && !estadoLocalVacio()
  } catch {
    return false
  }
}

function marcarOwner(email: string) {
  try {
    localStorage.setItem(CLAVE_OWNER, email)
  } catch {
    /* ignore */
  }
}

export function marcarSesionActiva(activa: boolean, email?: string | null) {
  haySesion = activa
  emailSesion = activa ? email ?? emailSesion : null
  if (!activa && timer) {
    clearTimeout(timer)
    timer = null
  }
}

export function vaciarColaSync() {
  marcarSesionActiva(false)
}

/** Tras login/registro: baja el estado del servidor o sube el local si el servidor está vacío. */
export async function sincronizarTrasLogin(email: string) {
  marcarSesionActiva(true, email)
  let ownerAnterior: string | null = null
  try {
    ownerAnterior = localStorage.getItem(CLAVE_OWNER)
  } catch {
    ownerAnterior = null
  }
  // Cambio de cuenta en el mismo navegador: no reutilizar datos ajenos
  if (ownerAnterior && ownerAnterior !== email) {
    limpiarEstadoLocal()
  }

  const remoto = (await obtenerEstadoUsuario()) as unknown as Record<string, unknown>
  if (estadoServidorVacio(remoto) && puedeMigrarLocal(email)) {
    await guardarEstadoUsuario(leerEstadoLocal())
    marcarOwner(email)
    return
  }
  aplicarEstadoServidor(remoto)
  marcarOwner(email)
}

/** Encola un PUT del estado completo (debounce). Solo bloques presentes en local. */
export function programarSyncEstado() {
  if (!haySesion || typeof window === 'undefined') return
  if (timer) clearTimeout(timer)
  timer = setTimeout(() => {
    timer = null
    const payload = leerEstadoLocal()
    if (Object.keys(payload).length === 0) return
    void guardarEstadoUsuario(payload).catch(() => {
      /* red caída: el local sigue */
    })
  }, 500)
}
