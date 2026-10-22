import { registrarSesionEstimulo } from '@/lib/perfil/perfil'

const CLAVE = 'court-ultima-tolerancia'
export const EVENTO_TOLERANCIA = 'court-tolerancia-cambio'
const RECIENTE_MS = 2 * 60 * 60 * 1000
const MAX_SESIONES = 6

export interface SesionTolerancia {
  fecha: string
  gente: number
  ruido: number
  luz: number
  herramientas: string[]
  frase: string
}

const NOMBRES_HERRAMIENTA: Record<string, string> = {
  cascos: 'cascos',
  'gafas-sol': 'gafas de sol',
  'objeto-mano': 'un objeto en la mano',
  pausa: 'pausas',
}

function acotar(valor: number): number {
  if (!Number.isFinite(valor)) return 0
  return Math.min(100, Math.max(0, Math.round(valor)))
}

function tramo(valor: number, poca: string, media: string, mucha: string): string {
  if (valor < 34) return poca
  if (valor < 67) return media
  return mucha
}

function fraseHerramientas(ids: string[]): string {
  const nombres = ids
    .map((id) => NOMBRES_HERRAMIENTA[id])
    .filter((nombre): nombre is string => Boolean(nombre))
  if (nombres.length === 0) return ''
  if (nombres.length === 1) return `con ${nombres[0]}`
  const ultimo = nombres[nombres.length - 1]
  return `con ${nombres.slice(0, -1).join(', ')} y ${ultimo}`
}

/** Frase corta, sin niveles ni insignias. */
export function fraseDeTolerancia(
  gente: number,
  ruido: number,
  herramientas: string[],
  prefijo = 'La última vez'
): string {
  const g = tramo(acotar(gente), 'poca gente', 'gente media', 'mucha gente')
  const r = tramo(acotar(ruido), 'poco ruido', 'ruido medio', 'mucho ruido')
  const apoyo = fraseHerramientas(herramientas)
  const base = `${prefijo} aguantaste ${g} y ${r}`
  return apoyo ? `${base}, ${apoyo}.` : `${base}.`
}

function esSesion(valor: unknown): valor is SesionTolerancia {
  if (!valor || typeof valor !== 'object') return false
  const fila = valor as SesionTolerancia
  return (
    typeof fila.fecha === 'string' &&
    typeof fila.frase === 'string' &&
    Number.isFinite(fila.gente) &&
    Number.isFinite(fila.ruido)
  )
}

export function leerHistorialTolerancia(): SesionTolerancia[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = JSON.parse(window.localStorage.getItem(CLAVE) ?? '[]') as unknown
    if (!Array.isArray(raw)) return []
    return raw.filter(esSesion).slice(-MAX_SESIONES)
  } catch {
    return []
  }
}

export function leerUltimaTolerancia(): SesionTolerancia | null {
  const lista = leerHistorialTolerancia()
  return lista.length > 0 ? lista[lista.length - 1] : null
}

export function leerToleranciaAnterior(): SesionTolerancia | null {
  const lista = leerHistorialTolerancia()
  return lista.length > 1 ? lista[lista.length - 2] : null
}

function guardarLista(lista: SesionTolerancia[]) {
  window.localStorage.setItem(CLAVE, JSON.stringify(lista.slice(-MAX_SESIONES)))
  window.dispatchEvent(new Event(EVENTO_TOLERANCIA))
}

export function guardarUltimaTolerancia(entrada: {
  gente: number
  ruido: number
  luz: number
  herramientas: string[]
  /** Si aguantó el sonido hasta el final, el perfil sube esa tolerancia. */
  subirPerfil?: boolean
}): SesionTolerancia | null {
  if (typeof window === 'undefined') return null
  const gente = acotar(entrada.gente)
  const ruido = acotar(entrada.ruido)
  const luz = acotar(entrada.luz)
  const herramientas = Array.from(new Set(entrada.herramientas.filter((id) => id in NOMBRES_HERRAMIENTA)))
  const sesion: SesionTolerancia = {
    fecha: new Date().toISOString(),
    gente,
    ruido,
    luz,
    herramientas,
    frase: fraseDeTolerancia(gente, ruido, herramientas),
  }
  try {
    const lista = leerHistorialTolerancia()
    const ultima = lista[lista.length - 1]
    const reciente =
      ultima && Date.now() - Date.parse(ultima.fecha) < RECIENTE_MS && Date.parse(ultima.fecha) > 0
    const siguiente = reciente ? [...lista.slice(0, -1), sesion] : [...lista, sesion]
    guardarLista(siguiente)
  } catch {
    return null
  }

  if (entrada.subirPerfil) {
    const nivelDe = (valor: number) => Math.min(5, Math.max(0, Math.round(valor / 20))) as 0 | 1 | 2 | 3 | 4 | 5
    registrarSesionEstimulo('gente', nivelDe(gente), true)
    registrarSesionEstimulo('ruido', nivelDe(ruido), true)
    registrarSesionEstimulo('luz', nivelDe(luz), true)
  }
  return sesion
}

/** Dos prácticas de ejemplo para el perfil de Luis, si todavía no hay ninguna. */
export function sembrarToleranciaEjemplo(): void {
  if (typeof window === 'undefined') return
  if (leerHistorialTolerancia().length > 0) return
  const ahora = new Date()
  const lunes = new Date(ahora)
  const dia = lunes.getDay()
  const distanciaLunes = dia === 0 ? 6 : dia - 1
  lunes.setDate(lunes.getDate() - distanciaLunes)
  lunes.setHours(10, 0, 0, 0)
  const jueves = new Date(lunes)
  jueves.setDate(lunes.getDate() + 3)
  const antes: SesionTolerancia = {
    fecha: lunes.toISOString(),
    gente: 25,
    ruido: 20,
    luz: 30,
    herramientas: [],
    frase: fraseDeTolerancia(25, 20, [], 'Antes'),
  }
  const ultima: SesionTolerancia = {
    fecha: jueves.toISOString(),
    gente: 78,
    ruido: 50,
    luz: 40,
    herramientas: ['cascos'],
    frase: fraseDeTolerancia(78, 50, ['cascos']),
  }
  try {
    guardarLista([antes, ultima])
  } catch {
    /* sin almacenamiento */
  }
}
