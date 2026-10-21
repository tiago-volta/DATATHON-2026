/**
 * Preferencias locales de acceso (localStorage).
 *
 * [PENDIENTE / stub] Integración oficial con organismos para reconocimientos
 * de discapacidad (p. ej. IMSERSO u otros): no inventamos APIs ni flags
 * estigmatizantes. Mientras tanto, la persona puede marcar un apoyo opcional
 * de lectura sin ningún diagnóstico clínico.
 */

export const LS_PREFERENCIAS = 'court-preferencias'

export type PreferenciasAcceso = {
  /** La persona pide más apoyos de lectura y anticipación (opcional, local). */
  necesitoApoyos: boolean
}

const INICIAL: PreferenciasAcceso = {
  necesitoApoyos: false,
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
  }
  if (typeof window === 'undefined') return next
  try {
    window.localStorage.setItem(LS_PREFERENCIAS, JSON.stringify(next))
    window.dispatchEvent(new Event('court-preferencias-cambio'))
    void import('@/lib/sync/estadoUsuario').then((m) => m.programarSyncEstado())
  } catch {
    /* private mode / quota */
  }
  return next
}
