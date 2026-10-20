/**
 * Insignias útiles (Fase 3.2): premian conductas de cuidado, no la velocidad.
 * Persistencia propia en localStorage, compartida entre Sala Previa, Pasaporte y Ensaya.
 */

export type IdInsigniaUtil =
  | 'primera-calma'
  | 'pedi-ajustes'
  | 'ensaye-1-nivel'

export interface InsigniaUtil {
  id: IdInsigniaUtil
  nombre: string
  /** Frase corta: por qué importa. */
  porQueImporta: string
  /** Etiqueta corta del pictograma (aria / visual). */
  pictograma: string
}

export const CLAVE_INSIGNIAS = 'puente-insignias-utiles'

export const INSIGNIAS_UTILES: InsigniaUtil[] = [
  {
    id: 'primera-calma',
    nombre: 'Primera calma',
    porQueImporta:
      'Cuidarte está bien. Pedir una pausa no es fallar: es cuidarte.',
    pictograma: 'calma',
  },
  {
    id: 'pedi-ajustes',
    nombre: 'Pedí ajustes',
    porQueImporta:
      'Pedir lo que necesitas ayuda a que te traten mejor en el juzgado.',
    pictograma: 'ajustes',
  },
  {
    id: 'ensaye-1-nivel',
    nombre: 'Ensayé 1 nivel',
    porQueImporta:
      'Practicar un poco ya suma. No hace falta correr ni terminarlo todo.',
    pictograma: 'ensayo',
  },
]

const IDS_VALIDOS = new Set<string>(INSIGNIAS_UTILES.map((i) => i.id))

function sanitizar(ids: unknown): IdInsigniaUtil[] {
  if (!Array.isArray(ids)) return []
  return Array.from(
    new Set(
      ids.filter((id): id is IdInsigniaUtil => typeof id === 'string' && IDS_VALIDOS.has(id))
    )
  )
}

export function metaInsignia(id: IdInsigniaUtil): InsigniaUtil {
  return INSIGNIAS_UTILES.find((i) => i.id === id)!
}

export function cargarInsigniasUtiles(): IdInsigniaUtil[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CLAVE_INSIGNIAS)
    if (!raw) return []
    return sanitizar(JSON.parse(raw))
  } catch {
    return []
  }
}

export function guardarInsigniasUtiles(ids: IdInsigniaUtil[]) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CLAVE_INSIGNIAS, JSON.stringify(sanitizar(ids)))
  } catch {
    /* ignore quota / private mode */
  }
}

export interface ResultadoDesbloqueo {
  nueva: boolean
  insignias: IdInsigniaUtil[]
}

/** Desbloquea una insignia. Idempotente: solo marca `nueva` la primera vez. */
export function desbloquearInsigniaUtil(id: IdInsigniaUtil): ResultadoDesbloqueo {
  const actuales = cargarInsigniasUtiles()
  if (actuales.includes(id)) {
    return { nueva: false, insignias: actuales }
  }
  const insignias = [...actuales, id]
  guardarInsigniasUtiles(insignias)
  return { nueva: true, insignias }
}
