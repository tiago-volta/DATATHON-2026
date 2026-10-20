import { AJUSTES_DISPONIBLES } from '@/lib/contenido'
import { ESTIMULOS_META, UMBRAL_ESTIMULO_ALTO, ajustesDesdeMolestias } from './niveles'
import type { ConfortCheckIn, IdEstimulo, ValoresEstimulo } from './tipos'

/** Clave localStorage: resumen de práctica exportable al Pasaporte (solo ajustes). */
export const CLAVE_LO_QUE_TE_AYUDA = 'puente-lo-que-te-ayuda'

export type NivelMolestia = 'medio' | 'alto'

export interface MolestiaRegistrada {
  id: IdEstimulo
  nivel: NivelMolestia
}

/**
 * Resumen de lo aprendido en Sala Previa.
 * Nunca guarda diagnóstico clínico; solo estímulos, ajustes y prácticas útiles.
 */
export interface LoQueTeAyuda {
  /** Estímulos que molestaron (check-in regular/mal). */
  molestias: MolestiaRegistrada[]
  /**
   * Ajustes del Pasaporte sugeridos o que funcionaron
   * (IDs de AJUSTES_DISPONIBLES: pausas, sala-tranquila, luz-tenue…).
   */
  ayudas: string[]
  /** Usó «Volver a la calma» al menos una vez. */
  usoCalma: boolean
  /** Número de check-ins registrados (regular/mal/bien con práctica). */
  checkIns: number
}

const ESTIMULOS_VALIDOS: IdEstimulo[] = ['ruido', 'luz', 'gente', 'eco']
const AJUSTES_VALIDOS = new Set(AJUSTES_DISPONIBLES.map((a) => a.id))

const INICIAL: LoQueTeAyuda = {
  molestias: [],
  ayudas: [],
  usoCalma: false,
  checkIns: 0,
}

function nivelDesdeValor(valor: number): NivelMolestia {
  return valor >= UMBRAL_ESTIMULO_ALTO ? 'alto' : 'medio'
}

function sanitizar(raw: Partial<LoQueTeAyuda>): LoQueTeAyuda {
  const molestiasMap = new Map<IdEstimulo, NivelMolestia>()
  if (Array.isArray(raw.molestias)) {
    for (const m of raw.molestias) {
      if (!m || typeof m !== 'object') continue
      const id = (m as MolestiaRegistrada).id
      const nivel = (m as MolestiaRegistrada).nivel
      if (!ESTIMULOS_VALIDOS.includes(id)) continue
      if (nivel !== 'medio' && nivel !== 'alto') continue
      const prev = molestiasMap.get(id)
      // Conserva el nivel más alto visto.
      if (!prev || (prev === 'medio' && nivel === 'alto')) {
        molestiasMap.set(id, nivel)
      }
    }
  }

  const ayudas = Array.isArray(raw.ayudas)
    ? Array.from(
        new Set(
          raw.ayudas.filter(
            (id): id is string => typeof id === 'string' && AJUSTES_VALIDOS.has(id)
          )
        )
      )
    : []

  const checkIns = Number.isFinite(raw.checkIns)
    ? Math.max(0, Math.trunc(raw.checkIns!))
    : 0

  return {
    molestias: ESTIMULOS_VALIDOS.filter((id) => molestiasMap.has(id)).map((id) => ({
      id,
      nivel: molestiasMap.get(id)!,
    })),
    ayudas,
    usoCalma: Boolean(raw.usoCalma),
    checkIns,
  }
}

export function cargarLoQueTeAyuda(): LoQueTeAyuda {
  if (typeof window === 'undefined') return { ...INICIAL, molestias: [], ayudas: [] }
  try {
    const raw = localStorage.getItem(CLAVE_LO_QUE_TE_AYUDA)
    if (!raw) return { ...INICIAL, molestias: [], ayudas: [] }
    return sanitizar(JSON.parse(raw))
  } catch {
    return { ...INICIAL, molestias: [], ayudas: [] }
  }
}

export function guardarLoQueTeAyuda(dato: LoQueTeAyuda) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CLAVE_LO_QUE_TE_AYUDA, JSON.stringify(sanitizar(dato)))
  } catch {
    /* ignore storage quota / private mode */
  }
}

/** ¿Hay algo que mostrar (no vacío)? Solo contenido útil, no un check-in «bien» solo. */
export function tienePractica(dato: LoQueTeAyuda): boolean {
  return dato.molestias.length > 0 || dato.ayudas.length > 0 || dato.usoCalma
}

/**
 * Registra un check-in. Si regular/mal, guarda molestias + ajustes sugeridos.
 * Si bien, solo cuenta la práctica (sin diagnóstico).
 */
export function registrarCheckInLoQueTeAyuda(
  actual: LoQueTeAyuda,
  confort: ConfortCheckIn,
  molestias: IdEstimulo[],
  valores: ValoresEstimulo
): LoQueTeAyuda {
  let next: LoQueTeAyuda = {
    ...actual,
    checkIns: actual.checkIns + 1,
    molestias: [...actual.molestias],
    ayudas: [...actual.ayudas],
  }

  if (confort === 'regular' || confort === 'mal') {
    const map = new Map(next.molestias.map((m) => [m.id, m.nivel] as const))
    for (const id of molestias) {
      if (!ESTIMULOS_VALIDOS.includes(id)) continue
      const nivel = nivelDesdeValor(valores[id] ?? 0)
      const prev = map.get(id)
      if (!prev || (prev === 'medio' && nivel === 'alto')) {
        map.set(id, nivel)
      }
    }
    next.molestias = ESTIMULOS_VALIDOS.filter((id) => map.has(id)).map((id) => ({
      id,
      nivel: map.get(id)!,
    }))

    const sugeridos = ajustesDesdeMolestias(molestias)
    next.ayudas = Array.from(new Set([...next.ayudas, ...sugeridos]))
  }

  return sanitizar(next)
}

/** Marca que la calma / pausa funcionó → sugiere ajuste «pausas». */
export function registrarCalmaLoQueTeAyuda(actual: LoQueTeAyuda): LoQueTeAyuda {
  const ayudas = actual.ayudas.includes('pausas')
    ? actual.ayudas
    : [...actual.ayudas, 'pausas']
  return sanitizar({
    ...actual,
    usoCalma: true,
    ayudas,
  })
}

/**
 * Deriva un resumen a partir del progreso antiguo (molestias ya guardadas)
 * si aún no hay datos en la clave nueva. No inventa niveles altos.
 */
export function derivarDesdeMolestiasProgreso(
  molestiasProgreso: IdEstimulo[]
): LoQueTeAyuda | null {
  if (!molestiasProgreso.length) return null
  const validas = molestiasProgreso.filter((id) => ESTIMULOS_VALIDOS.includes(id))
  if (validas.length === 0) return null
  return sanitizar({
    molestias: validas.map((id) => ({ id, nivel: 'alto' as NivelMolestia })),
    ayudas: ajustesDesdeMolestias(validas),
    usoCalma: false,
    checkIns: 1,
  })
}

/** Frase en primera persona: «Me molesta el ruido alto». */
export function fraseMolestia(id: IdEstimulo, nivel: NivelMolestia): string {
  const etiqueta = ESTIMULOS_META[id].etiqueta.toLowerCase()
  if (id === 'gente') {
    return nivel === 'alto' ? 'Me molesta mucha gente' : 'Me molesta la gente'
  }
  if (id === 'eco') {
    return nivel === 'alto'
      ? 'Me molestan las voces y el eco fuertes'
      : 'Me molestan las voces y el eco'
  }
  return nivel === 'alto'
    ? `Me molesta el ${etiqueta} alto`
    : `Me molesta el ${etiqueta}`
}

/** Frase en primera persona para un ajuste: «Me ayuda…». */
export function fraseAyuda(ajusteId: string): string {
  const ajuste = AJUSTES_DISPONIBLES.find((a) => a.id === ajusteId)
  if (!ajuste) return `Me ayuda: ${ajusteId}`
  const nombre = ajuste.nombre
  // Primera persona sin repetir «Me ayuda» si el nombre ya empieza igual.
  if (/^poder /i.test(nombre)) {
    return `Me ayuda poder ${nombre.slice(6)}`
  }
  return `Me ayuda: ${nombre.charAt(0).toLowerCase()}${nombre.slice(1)}`
}

/** Etiqueta corta del nivel para lectores de pantalla. */
export function etiquetaNivelMolestia(nivel: NivelMolestia): string {
  return nivel === 'alto' ? 'nivel alto' : 'nivel medio'
}
