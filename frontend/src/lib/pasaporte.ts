import { AJUSTES_DISPONIBLES } from './contenido'

export interface PasaportePayload {
  id: string
  nombre: string
  ajustes: string[]
  contacto: string
}

export function normalizarAjustes(ids: string[]): string[] {
  const validos = new Set(AJUSTES_DISPONIBLES.map((a) => a.id))
  return Array.from(new Set(ids.filter((id) => validos.has(id))))
}

export function buildPasaporteUrl(payload: PasaportePayload, origin?: string): string {
  const params = new URLSearchParams()
  params.set('id', payload.id)
  params.set('n', payload.nombre.trim())
  params.set('a', normalizarAjustes(payload.ajustes).join(','))
  if (payload.contacto.trim()) {
    params.set('c', payload.contacto.trim())
  }
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '')
  return `${base}/pasaporte/ver?${params.toString()}`
}

export function parsePasaporteSearchParams(
  searchParams: URLSearchParams | Record<string, string | string[] | undefined>
): PasaportePayload | null {
  const get = (key: string): string => {
    if (searchParams instanceof URLSearchParams) {
      return searchParams.get(key) ?? ''
    }
    const value = searchParams[key]
    if (Array.isArray(value)) return value[0] ?? ''
    return value ?? ''
  }

  const id = get('id').trim().toUpperCase()
  const nombre = get('n').trim() || get('nombre').trim()
  const ajustesRaw = get('a') || get('ajustes')
  const contacto = get('c').trim() || get('contacto').trim()
  const ajustes = normalizarAjustes(
    ajustesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  )

  if (!nombre || ajustes.length === 0) return null

  return {
    id: id || 'SIN-ID',
    nombre,
    ajustes,
    contacto,
  }
}

export function etiquetasAjustes(ids: string[]) {
  return AJUSTES_DISPONIBLES.filter((a) => ids.includes(a.id))
}
