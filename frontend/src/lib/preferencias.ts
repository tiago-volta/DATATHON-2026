/**
 * Preferencias locales de acceso (localStorage).
 *
 * [PENDIENTE / stub] Integración oficial con organismos para reconocimientos
 * de discapacidad (p. ej. IMSERSO u otros): no inventamos APIs ni flags
 * estigmatizantes. Mientras tanto, la persona puede marcar un apoyo opcional
 * de voz/lectura sin ningún diagnóstico clínico.
 */

export const LS_PREFERENCIAS = 'puente-preferencias'

export type PreferenciasAcceso = {
  /** La persona pide más apoyos de voz y lectura (opcional, local). */
  necesitoApoyos: boolean
  /** Preferencia alineada con el modo con voz (opcional). */
  accesoPorVoz: boolean
}

const INICIAL: PreferenciasAcceso = {
  necesitoApoyos: false,
  accesoPorVoz: false,
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
