import { AJUSTES_DISPONIBLES } from './contenido'

export interface PasaportePayload {
  id: string
  nombre: string
  ajustes: string[]
  contacto: string
}

export function sanitizarNombre(valor: string): string {
  return valor
    .replace(/[^\p{L}\s'-]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, 60)
}

export function validarNombre(valor: string): string | null {
  const limpio = valor.trim()
  if (!limpio) {
    return 'Escribe tu nombre para continuar.'
  }
  const soloLetras = limpio.replace(/[^\p{L}]/gu, '')
  if (soloLetras.length < 2) {
    return 'El nombre debe tener al menos 2 letras.'
  }
  if (/^(\p{L})\1+$/iu.test(soloLetras)) {
    return 'Escribe un nombre real (no repitas la misma letra).'
  }
  const palabras = limpio.split(/\s+/)
  if (palabras.some((p) => p.length > 25)) {
    return 'Cada palabra del nombre debe tener una longitud normal.'
  }
  return null
}

export function sanitizarTelefono(valor: string): string {
  const tieneMasInicial = valor.trimStart().startsWith('+')
  const soloDigitosYEspacios = valor
    .replace(/[^\d\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trimStart()
  const resultado = (tieneMasInicial ? '+' : '') + soloDigitosYEspacios
  return resultado.slice(0, 18)
}

export function validarTelefono(valor: string): string | null {
  const limpio = valor.trim()
  if (!limpio) return null
  if (/[^\d+\s]/.test(limpio) || limpio.slice(1).includes('+')) {
    return 'El teléfono solo puede tener números y espacios.'
  }
  const digitos = limpio.replace(/\D/g, '')
  if (digitos.length < 9) {
    return 'Escribe un teléfono válido de al menos 9 números (por ejemplo: 600 123 456).'
  }
  if (digitos.length > 15) {
    return 'El teléfono no puede tener más de 15 números.'
  }
  if (/^(\d)\1+$/.test(digitos)) {
    return 'Escribe un número de teléfono real (no repitas el mismo dígito).'
  }

  const nacional = digitos.startsWith('34') && digitos.length === 11
    ? digitos.slice(2)
    : digitos.startsWith('0034') && digitos.length === 13
      ? digitos.slice(4)
      : !limpio.startsWith('+') && digitos.length === 9
        ? digitos
        : null

  if (!limpio.startsWith('+') && digitos.length !== 9) {
    return 'En España el teléfono debe tener 9 cifras (ej: 600 123 456) o empezar con prefijo internacional (+34...).'
  }

  if (nacional && !/^[6789]\d{8}$/.test(nacional)) {
    return 'Los teléfonos en España deben empezar por 6, 7, 8 o 9 y tener 9 cifras.'
  }

  return null
}

export function normalizarAjustes(ids: string[]): string[] {
  const validos = new Set(AJUSTES_DISPONIBLES.map((a) => a.id))
  return Array.from(new Set(ids.filter((id) => validos.has(id))))
}

export function buildPasaporteUrl(payload: PasaportePayload, origin?: string): string {
  const params = new URLSearchParams()
  params.set('id', payload.id)
  params.set('n', sanitizarNombre(payload.nombre).trim())
  params.set('a', normalizarAjustes(payload.ajustes).join(','))
  const contactoLimpio = sanitizarTelefono(payload.contacto).trim()
  if (contactoLimpio && validarTelefono(contactoLimpio) === null) {
    params.set('c', contactoLimpio)
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

  const id = get('id').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 12)
  const nombre = sanitizarNombre(get('n').trim() || get('nombre').trim()).trim()
  const ajustesRaw = get('a') || get('ajustes')
  const contactoRaw = sanitizarTelefono(get('c').trim() || get('contacto').trim()).trim()
  const contacto = validarTelefono(contactoRaw) === null ? contactoRaw : ''
  const ajustes = normalizarAjustes(
    ajustesRaw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
  )

  if (validarNombre(nombre) !== null || ajustes.length === 0) return null

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

const MARCA_RUTA_FICHA = '/pasaporte/ver?'

/** Path interno de la ficha, o null si el texto no es esa ruta. */
export function rutaPasaporteDesdeTexto(texto: string): string | null {
  const recortado = texto.trim()
  const idx = recortado.indexOf(MARCA_RUTA_FICHA)
  if (idx === -1) return null
  const candidato = recortado.slice(idx).split(/\s/)[0]
  if (!candidato.startsWith(MARCA_RUTA_FICHA) || candidato.length > 2000) return null
  try {
    const url = new URL(candidato, 'https://inclusivecourt.local')
    if (url.pathname !== '/pasaporte/ver') return null
    if (url.search.length < 2) return null
    return `${url.pathname}${url.search}`
  } catch {
    return null
  }
}
