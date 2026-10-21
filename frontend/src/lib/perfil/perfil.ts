import { AJUSTES_DISPONIBLES } from '@/lib/contenido'
import { cargarPractica } from '@/lib/practica'
import { ESTIMULOS_META, NIVELES } from '@/lib/sala-previa/niveles'
import { cargarLoQueTeAyuda, tienePractica } from '@/lib/sala-previa/loQueTeAyuda'
import { cargarProgreso } from '@/lib/sala-previa/progreso'
import type { IdEstimulo } from '@/lib/sala-previa/tipos'
import { programarSyncEstado } from '@/lib/sync/estadoUsuario'

export const CLAVE_PERFIL = 'court-perfil'
export const EVENTO_PERFIL = 'court-perfil-cambio'

/** En este foco solo hay testigo (Luis / TEA). */
export type RolPerfil = 'testigo'

/** Nivel de tolerancia declarado al empezar (0 = poca carga, 5 = mucha). */
export type NivelTolerancia = 0 | 1 | 2 | 3 | 4 | 5

export const ESTIMULOS_PERFIL: IdEstimulo[] = ['ruido', 'luz', 'gente']

export const NIVELES_TOLERANCIA: {
  valor: NivelTolerancia
  etiqueta: string
  ayuda: string
}[] = [
  { valor: 0, etiqueta: 'Muy poca', ayuda: 'Prefieres casi silencio y poca gente.' },
  { valor: 1, etiqueta: 'Poca', ayuda: 'Aguantas un murmullo suave.' },
  { valor: 2, etiqueta: 'Media-baja', ayuda: 'Aguantas algo de gente y ruido.' },
  { valor: 3, etiqueta: 'Media', ayuda: 'Aguantas un ambiente normal de espera.' },
  { valor: 4, etiqueta: 'Alta', ayuda: 'Aguantas una sala bastante llena.' },
  { valor: 5, etiqueta: 'Muy alta', ayuda: 'Puedes practicar con mucho estímulo.' },
]

export interface PerfilUsuario {
  nombre: string
  rol: RolPerfil
  tolerancia: NivelTolerancia
  estimulosSensibles: IdEstimulo[]
  creado: number
  actualizado: number
}

/** Vista para la home: perfil + lo que ya aprendió la sala. */
export interface PerfilVista {
  tienePerfil: boolean
  nombre: string | null
  rol: RolPerfil
  tolerancia: NivelTolerancia | null
  toleranciaEtiqueta: string | null
  estimulosSensibles: IdEstimulo[]
  estimulosEtiquetas: string[]
  nivelSalaNombre: string | null
  diasPracticados: number
  sesionesSala: number
}

const VACIO_VISTA: PerfilVista = {
  tienePerfil: false,
  nombre: null,
  rol: 'testigo',
  tolerancia: null,
  toleranciaEtiqueta: null,
  estimulosSensibles: [],
  estimulosEtiquetas: [],
  nivelSalaNombre: null,
  diasPracticados: 0,
  sesionesSala: 0,
}

const AJUSTES_VALIDOS = new Set(AJUSTES_DISPONIBLES.map((a) => a.id))

function limpiarNombre(valor: string): string {
  return valor
    .replace(/[^\p{L}\s'-]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, 60)
    .trim()
}

function nombreValido(valor: string): boolean {
  const limpio = valor.trim()
  if (!limpio) return false
  const soloLetras = limpio.replace(/[^\p{L}]/gu, '')
  if (soloLetras.length < 2) return false
  if (/^(\p{L})\1+$/iu.test(soloLetras)) return false
  const palabras = limpio.split(/\s+/)
  if (palabras.some((p) => p.length > 25)) return false
  return true
}

function normalizarIdsAjuste(ids: string[]): string[] {
  return Array.from(new Set(ids.filter((id) => AJUSTES_VALIDOS.has(id))))
}

function esEstimulo(valor: unknown): valor is IdEstimulo {
  return valor === 'ruido' || valor === 'luz' || valor === 'gente'
}

function esTolerancia(valor: unknown): valor is NivelTolerancia {
  return (
    typeof valor === 'number' &&
    Number.isInteger(valor) &&
    valor >= 0 &&
    valor <= 5
  )
}

function sanitizarEstimulos(raw: unknown): IdEstimulo[] {
  if (!Array.isArray(raw)) return []
  return Array.from(new Set(raw.filter(esEstimulo)))
}

function sanitizarPerfil(raw: Partial<PerfilUsuario> | null | undefined): PerfilUsuario | null {
  if (!raw || typeof raw !== 'object') return null
  if (typeof raw.nombre !== 'string') return null
  const nombre = limpiarNombre(raw.nombre)
  if (!nombreValido(nombre)) return null
  const tolerancia = esTolerancia(raw.tolerancia) ? raw.tolerancia : 1
  const creado =
    typeof raw.creado === 'number' && Number.isFinite(raw.creado) ? raw.creado : Date.now()
  const actualizado =
    typeof raw.actualizado === 'number' && Number.isFinite(raw.actualizado)
      ? raw.actualizado
      : creado
  return {
    nombre,
    rol: 'testigo',
    tolerancia,
    estimulosSensibles: sanitizarEstimulos(raw.estimulosSensibles),
    creado,
    actualizado,
  }
}

function avisarCambioPerfil() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(EVENTO_PERFIL))
}

export function etiquetaTolerancia(nivel: NivelTolerancia): string {
  return NIVELES_TOLERANCIA.find((item) => item.valor === nivel)?.etiqueta ?? 'Media'
}

export function etiquetaEstimulo(id: IdEstimulo): string {
  return ESTIMULOS_META[id].etiqueta
}

export function cargarPerfil(): PerfilUsuario | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CLAVE_PERFIL)
    if (!raw) return null
    return sanitizarPerfil(JSON.parse(raw) as Partial<PerfilUsuario>)
  } catch {
    return null
  }
}

export function hayPerfil(): boolean {
  return cargarPerfil() !== null
}

/** Guarda el perfil local. No escribe en las claves de la sala. */
export function guardarPerfil(entrada: {
  nombre: string
  tolerancia: NivelTolerancia
  estimulosSensibles: IdEstimulo[]
}): PerfilUsuario | null {
  if (typeof window === 'undefined') return null
  const anterior = cargarPerfil()
  const candidato = sanitizarPerfil({
    nombre: entrada.nombre,
    rol: 'testigo',
    tolerancia: entrada.tolerancia,
    estimulosSensibles: entrada.estimulosSensibles,
    creado: anterior?.creado ?? Date.now(),
    actualizado: Date.now(),
  })
  if (!candidato) return null
  try {
    localStorage.setItem(CLAVE_PERFIL, JSON.stringify(candidato))
    avisarCambioPerfil()
    programarSyncEstado()
    return candidato
  } catch {
    return null
  }
}

export function borrarPerfil() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(CLAVE_PERFIL)
    avisarCambioPerfil()
    programarSyncEstado()
  } catch {
    /* ignore */
  }
}

/** Ajustes que la sala ya apuntó. No escribe en el almacenamiento de la sala. */
export function leerAyudasSala(): string[] {
  try {
    return normalizarIdsAjuste(cargarLoQueTeAyuda().ayudas)
  } catch {
    return []
  }
}

/** Ajustes sugeridos por los estímulos del perfil y por la sala. */
export function leerAjustesDesdePerfilYSala(): string[] {
  const desdeSala = leerAyudasSala()
  const perfil = cargarPerfil()
  const desdePerfil = perfil
    ? perfil.estimulosSensibles.flatMap((id) => ESTIMULOS_META[id].ajustesPasaporte)
    : []
  return normalizarIdsAjuste([...desdePerfil, ...desdeSala])
}

export function leerNombrePerfil(): string | null {
  return cargarPerfil()?.nombre ?? null
}

/**
 * Junta el perfil guardado con la práctica y la sala (solo lectura).
 * Si no hay perfil, la vista sigue vacía aunque haya días de práctica sueltos.
 */
export function leerVistaPerfil(): PerfilVista {
  if (typeof window === 'undefined') return VACIO_VISTA
  try {
    const perfil = cargarPerfil()
    if (!perfil) return VACIO_VISTA

    const diasPracticados = cargarPractica().dias.length
    let nivelSalaNombre: string | null = null
    let sesionesSala = 0
    try {
      if (localStorage.getItem('court-sala-previa-progreso') !== null) {
        const progreso = cargarProgreso()
        nivelSalaNombre = NIVELES[progreso.nivelMaximo]?.nombre ?? null
        sesionesSala = progreso.sesionesCompletadas
      }
    } catch {
      /* ignore */
    }

    let estimulos = perfil.estimulosSensibles
    if (estimulos.length === 0) {
      try {
        const ayuda = cargarLoQueTeAyuda()
        if (tienePractica(ayuda)) {
          estimulos = ayuda.molestias.map((m) => m.id)
        }
      } catch {
        /* ignore */
      }
    }

    return {
      tienePerfil: true,
      nombre: perfil.nombre,
      rol: perfil.rol,
      tolerancia: perfil.tolerancia,
      toleranciaEtiqueta: etiquetaTolerancia(perfil.tolerancia),
      estimulosSensibles: estimulos,
      estimulosEtiquetas: estimulos.map(etiquetaEstimulo),
      nivelSalaNombre,
      diasPracticados,
      sesionesSala,
    }
  } catch {
    return VACIO_VISTA
  }
}
