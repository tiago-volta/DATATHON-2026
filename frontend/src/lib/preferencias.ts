/**
 * Preferencias locales de acceso (localStorage).
 *
 * [PENDIENTE / stub] Integración oficial con organismos para reconocimientos
 * de discapacidad (p. ej. IMSERSO u otros): no inventamos APIs ni flags
 * estigmatizantes. Mientras tanto, la persona marca apoyos funcionales
 * (lectura, números, escritura) sin diagnóstico clínico.
 */

export const LS_PREFERENCIAS = 'puente-preferencias'

export type PreferenciasAcceso = {
  /** La persona pide más apoyos de voz y lectura (opcional, local). */
  necesitoApoyos: boolean
  /** Preferencia alineada con el modo con voz (opcional). */
  accesoPorVoz: boolean
  /** Tipografía/espaciado amplios (ayuda si cuesta leer — p. ej. dislexia). */
  lecturaEspaciada: boolean
  /** Destacar cifras en palabras (ayuda si confunden números — p. ej. discalculia). */
  apoyoNumeros: boolean
  /** Preferir voz y plantillas frente a escribir (ayuda si cuesta escribir — p. ej. disgrafía). */
  evitarEscribir: boolean
}

const INICIAL: PreferenciasAcceso = {
  necesitoApoyos: false,
  accesoPorVoz: false,
  lecturaEspaciada: false,
  apoyoNumeros: false,
  evitarEscribir: false,
}

function esBooleano(v: unknown): v is boolean {
  return typeof v === 'boolean'
}

export function leerPreferencias(): PreferenciasAcceso {
  if (typeof window === 'undefined') return { ...INICIAL }
  try {
    const raw = window.localStorage.getItem(LS_PREFERENCIAS)
    if (!raw) return { ...INICIAL }
    const parsed = JSON.parse(raw) as Partial<PreferenciasAcceso>
    return {
      necesitoApoyos: esBooleano(parsed.necesitoApoyos)
        ? parsed.necesitoApoyos
        : false,
      accesoPorVoz: esBooleano(parsed.accesoPorVoz)
        ? parsed.accesoPorVoz
        : false,
      lecturaEspaciada: esBooleano(parsed.lecturaEspaciada)
        ? parsed.lecturaEspaciada
        : false,
      apoyoNumeros: esBooleano(parsed.apoyoNumeros)
        ? parsed.apoyoNumeros
        : false,
      evitarEscribir: esBooleano(parsed.evitarEscribir)
        ? parsed.evitarEscribir
        : false,
    }
  } catch {
    return { ...INICIAL }
  }
}

export function guardarPreferencias(
  parcial: Partial<PreferenciasAcceso>
): PreferenciasAcceso {
  const actual = leerPreferencias()
  const next: PreferenciasAcceso = {
    necesitoApoyos:
      parcial.necesitoApoyos !== undefined
        ? parcial.necesitoApoyos
        : actual.necesitoApoyos,
    accesoPorVoz:
      parcial.accesoPorVoz !== undefined
        ? parcial.accesoPorVoz
        : actual.accesoPorVoz,
    lecturaEspaciada:
      parcial.lecturaEspaciada !== undefined
        ? parcial.lecturaEspaciada
        : actual.lecturaEspaciada,
    apoyoNumeros:
      parcial.apoyoNumeros !== undefined
        ? parcial.apoyoNumeros
        : actual.apoyoNumeros,
    evitarEscribir:
      parcial.evitarEscribir !== undefined
        ? parcial.evitarEscribir
        : actual.evitarEscribir,
  }
  if (typeof window === 'undefined') return next
  try {
    window.localStorage.setItem(LS_PREFERENCIAS, JSON.stringify(next))
    window.dispatchEvent(new Event('puente-preferencias-cambio'))
  } catch {
    /* private mode / quota */
  }
  return next
}

/** Aplica clases en <body> según preferencias (lectura / números). */
export function aplicarClasesApoyo(prefs: PreferenciasAcceso) {
  if (typeof document === 'undefined') return
  const { classList } = document.body
  classList.toggle('apoyo-lectura', prefs.lecturaEspaciada)
  classList.toggle('apoyo-numeros', prefs.apoyoNumeros)
  classList.toggle('apoyo-sin-escritura', prefs.evitarEscribir)
}
