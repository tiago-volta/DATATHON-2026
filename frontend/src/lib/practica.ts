/**
 * Días de práctica (Fase 3.4).
 * Cuenta días en que la persona practicó (Sala Previa o Ensaya).
 * Sin castigo: no reinicia, no dice "has perdido tu racha".
 * Persistencia compartida en localStorage (fecha local YYYY-MM-DD).
 */

export const CLAVE_PRACTICA = 'court-practica'

/** Mensaje al volver tras uno o más días sin practicar. */
export const MENSAJE_BIENVENIDA =
  'Hola otra vez. Puedes seguir cuando quieras.'

export interface EstadoPractica {
  /** Fechas YYYY-MM-DD (zona local) en las que se practicó. */
  dias: string[]
  /**
   * Última práctica (fecha) para la que ya se mostró la bienvenida
   * tras una pausa. Evita repetir el mensaje hasta la siguiente pausa.
   */
  bienvenidaVistaTras: string | null
}

export interface DiaSemana {
  /** YYYY-MM-DD */
  fecha: string
  /** Etiqueta corta: L, M, X, J, V, S, D */
  etiqueta: string
  /** Nombre largo para lectores de pantalla */
  nombreLargo: string
  practicado: boolean
}

const INICIAL: EstadoPractica = {
  dias: [],
  bienvenidaVistaTras: null,
}

const ETIQUETAS_CORTO = ['L', 'M', 'X', 'J', 'V', 'S', 'D'] as const
const NOMBRES_LARGO = [
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
  'domingo',
] as const

const RE_FECHA = /^\d{4}-\d{2}-\d{2}$/

/** Fecha local YYYY-MM-DD (no UTC). */
export function fechaLocalISO(d: Date = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function parseFechaLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function sumarDiasISO(iso: string, delta: number): string {
  const d = parseFechaLocal(iso)
  d.setDate(d.getDate() + delta)
  return fechaLocalISO(d)
}

function sanitizar(raw: Partial<EstadoPractica> | null | undefined): EstadoPractica {
  const dias = Array.isArray(raw?.dias)
    ? Array.from(
        new Set(
          raw!.dias.filter(
            (f): f is string => typeof f === 'string' && RE_FECHA.test(f)
          )
        )
      ).sort()
    : []
  const bienvenidaVistaTras =
    typeof raw?.bienvenidaVistaTras === 'string' &&
    RE_FECHA.test(raw.bienvenidaVistaTras)
      ? raw.bienvenidaVistaTras
      : null
  return { dias, bienvenidaVistaTras }
}

export function cargarPractica(): EstadoPractica {
  if (typeof window === 'undefined') return { ...INICIAL, dias: [] }
  try {
    const raw = localStorage.getItem(CLAVE_PRACTICA)
    if (!raw) return { ...INICIAL, dias: [] }
    return sanitizar(JSON.parse(raw))
  } catch {
    return { ...INICIAL, dias: [] }
  }
}

export function guardarPractica(estado: EstadoPractica) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CLAVE_PRACTICA, JSON.stringify(sanitizar(estado)))
  } catch {
    /* ignore quota / private mode */
  }
}

export function totalDiasPracticados(estado?: EstadoPractica): number {
  const e = estado ?? cargarPractica()
  return e.dias.length
}

/** Lunes de la semana que contiene `ref` (semana L–D). */
export function lunesDeLaSemana(ref: Date = new Date()): string {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate())
  const dia = d.getDay() // 0=D … 6=S
  const offset = dia === 0 ? -6 : 1 - dia
  d.setDate(d.getDate() + offset)
  return fechaLocalISO(d)
}

export function diasDeEstaSemana(estado?: EstadoPractica, ref: Date = new Date()): DiaSemana[] {
  const e = estado ?? cargarPractica()
  const set = new Set(e.dias)
  const lunes = lunesDeLaSemana(ref)
  return ETIQUETAS_CORTO.map((etiqueta, i) => {
    const fecha = sumarDiasISO(lunes, i)
    return {
      fecha,
      etiqueta,
      nombreLargo: NOMBRES_LARGO[i],
      practicado: set.has(fecha),
    }
  })
}

export function diasPracticadosEstaSemana(
  estado?: EstadoPractica,
  ref: Date = new Date()
): number {
  return diasDeEstaSemana(estado, ref).filter((d) => d.practicado).length
}

function ultimaPractica(dias: string[]): string | null {
  if (dias.length === 0) return null
  return dias[dias.length - 1]
}

/**
 * ¿Hubo al menos un día de calendario sin practicar entre la última
 * práctica y hoy? (última < ayer).
 */
export function huboPausaAntesDeHoy(estado?: EstadoPractica, hoy?: string): boolean {
  const e = estado ?? cargarPractica()
  const hoyISO = hoy ?? fechaLocalISO()
  const ultima = ultimaPractica(e.dias)
  if (!ultima) return false
  if (ultima === hoyISO) return false
  const ayer = sumarDiasISO(hoyISO, -1)
  return ultima < ayer
}

/**
 * Mensaje de bienvenida si vuelve tras una pausa y aún no lo ha visto
 * para esa vuelta. No es un reproche.
 */
export function mensajeBienvenidaPendiente(
  estado?: EstadoPractica,
  hoy?: string
): string | null {
  const e = estado ?? cargarPractica()
  if (!huboPausaAntesDeHoy(e, hoy)) return null
  const ultima = ultimaPractica(e.dias)
  if (!ultima) return null
  if (e.bienvenidaVistaTras === ultima) return null
  return MENSAJE_BIENVENIDA
}

/** Marca la bienvenida como vista (dismiss o al mostrarla una vez). */
export function marcarBienvenidaVista(estado?: EstadoPractica): EstadoPractica {
  const e = estado ?? cargarPractica()
  const ultima = ultimaPractica(e.dias)
  if (!ultima) return e
  const siguiente: EstadoPractica = {
    ...e,
    bienvenidaVistaTras: ultima,
  }
  guardarPractica(siguiente)
  return siguiente
}

export interface ResultadoRegistroPractica {
  /** Si hoy se añadió por primera vez. */
  nuevoDia: boolean
  estado: EstadoPractica
  total: number
  estaSemana: number
}

/**
 * Registra que hoy se ha practicado. Idempotente el mismo día.
 * Nunca borra días anteriores ni reinicia contadores.
 */
export function registrarPracticaHoy(hoy?: string): ResultadoRegistroPractica {
  const hoyISO = hoy ?? fechaLocalISO()
  const actual = cargarPractica()
  const ya = actual.dias.includes(hoyISO)
  const dias = ya ? actual.dias : [...actual.dias, hoyISO].sort()
  const estado: EstadoPractica = {
    dias,
    // Al practicar de nuevo, la bienvenida de la pausa anterior ya no aplica.
    bienvenidaVistaTras: ya ? actual.bienvenidaVistaTras : null,
  }
  guardarPractica(estado)
  return {
    nuevoDia: !ya,
    estado,
    total: estado.dias.length,
    estaSemana: diasPracticadosEstaSemana(estado),
  }
}
