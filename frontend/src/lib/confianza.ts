/**
 * Medidor de confianza (Fase 3.3).
 * Solo sube o se mantiene: nunca resta por calma, check-in mal/regular ni bajar de nivel.
 * Persistencia propia en localStorage, en paralelo a insignias útiles.
 */

export const CLAVE_CONFIANZA = 'puente-confianza'

/** Eventos que pueden sumar (idempotentes o con techo). */
export type TipoEventoConfianza =
  | 'nivel-probado'
  | 'checkin-bien'
  | 'pasaporte'
  | 'ensaya-nivel'

export interface EstadoConfianza {
  /** 0–100. Nunca baja por castigo. */
  score: number
  /** Claves ya contadas (p. ej. "nivel-probado:2", "checkin-bien", "pasaporte"). */
  eventos: string[]
  /** Contador de check-ins "bien" (con techo de puntos). */
  checkinsBien: number
}

export interface EtiquetaConfianza {
  palabra: string
  /** Frase corta bajo la barra. */
  detalle: string
  min: number
  max: number
}

export const ETIQUETAS_CONFIANZA: EtiquetaConfianza[] = [
  {
    palabra: 'Empezando',
    detalle: 'Todavía estás dando los primeros pasos. Sin prisa.',
    min: 0,
    max: 19,
  },
  {
    palabra: 'Vas dando pasos',
    detalle: 'Ya has practicado un poco. Cada paso cuenta.',
    min: 20,
    max: 39,
  },
  {
    palabra: 'Vas cogiendo confianza',
    detalle: 'Se nota que vas conociendo el recorrido.',
    min: 40,
    max: 64,
  },
  {
    palabra: 'Te sientes más seguro',
    detalle: 'Has sumado varias prácticas. Vas bien encaminado.',
    min: 65,
    max: 84,
  },
  {
    palabra: 'Te ves preparado',
    detalle: 'Has hecho lo que necesitabas para el día del juicio.',
    min: 85,
    max: 100,
  },
]

const INICIAL: EstadoConfianza = {
  score: 0,
  eventos: [],
  checkinsBien: 0,
}

/** Puntos por tipo (máximos / por instancia). */
const PUNTOS = {
  /** Una vez por nivel de Sala Previa (0–5). */
  'nivel-probado': 10,
  /** Cada check-in bien, hasta un techo. */
  'checkin-bien': 8,
  checkinBienTecho: 24,
  /** Pasaporte generado (una vez). */
  pasaporte: 15,
  /** Una vez por nivel de Ensaya (1–3). */
  'ensaya-nivel': 12,
} as const

const MENSAJES_POSITIVOS: Record<TipoEventoConfianza, (extra?: string | number) => string> = {
  'nivel-probado': (n) =>
    typeof n === 'number'
      ? `Has practicado el nivel ${n}: eso suma a tu confianza.`
      : 'Has practicado un nivel: eso suma a tu confianza.',
  'checkin-bien': () => 'Has hecho un check-in bien: eso cuenta.',
  pasaporte: () => 'Has generado tu Pasaporte: eso también suma.',
  'ensaya-nivel': (n) =>
    typeof n === 'number'
      ? `Has terminado un nivel de Ensaya (${n}): eso cuenta.`
      : 'Has terminado un nivel de Ensaya: eso cuenta.',
}

function claveEvento(tipo: TipoEventoConfianza, detalle?: string | number): string {
  if (detalle === undefined || detalle === null || detalle === '') return tipo
  return `${tipo}:${detalle}`
}

function sanitizar(raw: Partial<EstadoConfianza> | null | undefined): EstadoConfianza {
  const score = Number.isFinite(raw?.score)
    ? Math.min(100, Math.max(0, Math.round(raw!.score!)))
    : 0
  const checkinsBien = Number.isFinite(raw?.checkinsBien)
    ? Math.max(0, Math.trunc(raw!.checkinsBien!))
    : 0
  const eventos = Array.isArray(raw?.eventos)
    ? Array.from(
        new Set(raw!.eventos.filter((e): e is string => typeof e === 'string' && e.length > 0))
      )
    : []
  return { score, eventos, checkinsBien }
}

export function cargarConfianza(): EstadoConfianza {
  if (typeof window === 'undefined') return { ...INICIAL, eventos: [] }
  try {
    const raw = localStorage.getItem(CLAVE_CONFIANZA)
    if (!raw) return { ...INICIAL, eventos: [] }
    return sanitizar(JSON.parse(raw))
  } catch {
    return { ...INICIAL, eventos: [] }
  }
}

export function guardarConfianza(estado: EstadoConfianza) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CLAVE_CONFIANZA, JSON.stringify(sanitizar(estado)))
  } catch {
    /* ignore quota / private mode */
  }
}

export function etiquetaParaScore(score: number): EtiquetaConfianza {
  const s = Math.min(100, Math.max(0, Math.round(score)))
  return (
    ETIQUETAS_CONFIANZA.find((e) => s >= e.min && s <= e.max) ??
    ETIQUETAS_CONFIANZA[0]
  )
}

export interface ResultadoEventoConfianza {
  /** Si el score ha subido. */
  subio: boolean
  estado: EstadoConfianza
  /** Mensaje positivo breve, o null si no hubo cambio / no aplica. */
  mensaje: string | null
  etiqueta: EtiquetaConfianza
}

/**
 * Registra un evento. Solo sube o mantiene el score; nunca resta.
 * Eventos únicos (nivel, pasaporte, ensaya) solo suman la primera vez.
 * Check-in bien puede sumar varias veces hasta un techo de puntos.
 */
export function registrarEvento(
  tipo: TipoEventoConfianza,
  detalle?: string | number
): ResultadoEventoConfianza {
  const actual = cargarConfianza()
  const etiquetaActual = etiquetaParaScore(actual.score)

  if (tipo === 'checkin-bien') {
    const puntosYa = Math.min(actual.checkinsBien * PUNTOS['checkin-bien'], PUNTOS.checkinBienTecho)
    if (puntosYa >= PUNTOS.checkinBienTecho) {
      return {
        subio: false,
        estado: actual,
        mensaje: null,
        etiqueta: etiquetaActual,
      }
    }
    const delta = Math.min(PUNTOS['checkin-bien'], PUNTOS.checkinBienTecho - puntosYa)
    const score = Math.min(100, actual.score + delta)
    const estado: EstadoConfianza = {
      score,
      eventos: actual.eventos.includes('checkin-bien')
        ? actual.eventos
        : [...actual.eventos, 'checkin-bien'],
      checkinsBien: actual.checkinsBien + 1,
    }
    guardarConfianza(estado)
    return {
      subio: score > actual.score,
      estado,
      mensaje: MENSAJES_POSITIVOS['checkin-bien'](),
      etiqueta: etiquetaParaScore(score),
    }
  }

  const key = claveEvento(tipo, detalle)
  if (actual.eventos.includes(key)) {
    return {
      subio: false,
      estado: actual,
      mensaje: null,
      etiqueta: etiquetaActual,
    }
  }

  const delta =
    tipo === 'nivel-probado'
      ? PUNTOS['nivel-probado']
      : tipo === 'pasaporte'
        ? PUNTOS.pasaporte
        : PUNTOS['ensaya-nivel']

  const score = Math.min(100, actual.score + delta)
  const estado: EstadoConfianza = {
    score,
    eventos: [...actual.eventos, key],
    checkinsBien: actual.checkinsBien,
  }
  guardarConfianza(estado)
  return {
    subio: score > actual.score,
    estado,
    mensaje: MENSAJES_POSITIVOS[tipo](detalle),
    etiqueta: etiquetaParaScore(score),
  }
}
