import type { IdEstimulo, ProgresoSala } from './tipos'
import { INSIGNIAS, NIVELES } from './niveles'

const CLAVE = 'court-sala-previa-progreso'
/** Intro 2.1 vista: clave aparte para no mezclar con el progreso de niveles. */
const CLAVE_INTRO = 'court-sala-previa-intro-vista'
const ESTIMULOS_VALIDOS: IdEstimulo[] = ['ruido', 'luz', 'gente']

const INICIAL: ProgresoSala = {
  nivelMaximo: 0,
  insignias: [],
  confianza: 20,
  racha: 0,
  ultimaPractica: null,
  molestias: [],
  sesionesCompletadas: 0,
}

function hoyISO(): string {
  return new Date().toISOString().slice(0, 10)
}

function sanitizarProgreso(raw: Partial<ProgresoSala>): ProgresoSala {
  const maxIdx = NIVELES.length - 1
  const nivelMaximo = Number.isFinite(raw.nivelMaximo)
    ? Math.min(maxIdx, Math.max(0, Math.trunc(raw.nivelMaximo!)))
    : INICIAL.nivelMaximo
  const confianza = Number.isFinite(raw.confianza)
    ? Math.min(100, Math.max(0, Math.round(raw.confianza!)))
    : INICIAL.confianza
  const racha = Number.isFinite(raw.racha)
    ? Math.max(0, Math.trunc(raw.racha!))
    : INICIAL.racha
  const sesionesCompletadas = Number.isFinite(raw.sesionesCompletadas)
    ? Math.max(0, Math.trunc(raw.sesionesCompletadas!))
    : INICIAL.sesionesCompletadas
  const ultimaPractica =
    typeof raw.ultimaPractica === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(raw.ultimaPractica)
      ? raw.ultimaPractica
      : null
  const molestias = Array.isArray(raw.molestias)
    ? Array.from(
        new Set(raw.molestias.filter((m): m is IdEstimulo => ESTIMULOS_VALIDOS.includes(m as IdEstimulo)))
      )
    : []
  const insigniasValidas = new Set(INSIGNIAS.map((i) => i.id))
  const insignias = Array.isArray(raw.insignias)
    ? Array.from(new Set(raw.insignias.filter((id): id is string => insigniasValidas.has(id))))
    : []

  return {
    nivelMaximo,
    insignias,
    confianza,
    racha,
    ultimaPractica,
    molestias,
    sesionesCompletadas,
  }
}

export function cargarProgreso(): ProgresoSala {
  if (typeof window === 'undefined') return { ...INICIAL }
  try {
    const raw = localStorage.getItem(CLAVE)
    if (!raw) return { ...INICIAL }
    return sanitizarProgreso(JSON.parse(raw))
  } catch {
    return { ...INICIAL }
  }
}

export function guardarProgreso(progreso: ProgresoSala) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CLAVE, JSON.stringify(sanitizarProgreso(progreso)))
    void import('@/lib/sync/estadoUsuario').then((m) => m.programarSyncEstado())
  } catch {
    /* ignore storage quota / private mode */
  }
}

export function registrarPractica(progreso: ProgresoSala): ProgresoSala {
  const hoy = hoyISO()
  if (progreso.ultimaPractica === hoy) {
    return otorgarInsignias(progreso)
  }

  // Suma días practicados; no reinicia si hubo pausa (sin castigo).
  const racha = progreso.racha + 1

  const siguiente: ProgresoSala = {
    ...progreso,
    racha,
    ultimaPractica: hoy,
    sesionesCompletadas: progreso.sesionesCompletadas + 1,
  }

  return otorgarInsignias(siguiente)
}

export function marcarNivel(progreso: ProgresoSala, nivel: number): ProgresoSala {
  const nivelSeguro = Math.min(NIVELES.length - 1, Math.max(0, Math.trunc(nivel)))
  const nivelMaximo = Math.max(progreso.nivelMaximo, nivelSeguro)
  return otorgarInsignias({ ...progreso, nivelMaximo })
}

export function sumarConfianza(progreso: ProgresoSala, delta: number): ProgresoSala {
  return {
    ...progreso,
    confianza: Math.min(100, Math.max(0, Math.round(progreso.confianza + delta))),
  }
}

export function anadirMolestia(progreso: ProgresoSala, estimulo: IdEstimulo): ProgresoSala {
  if (!ESTIMULOS_VALIDOS.includes(estimulo)) return progreso
  if (progreso.molestias.includes(estimulo)) return progreso
  return otorgarInsignias({
    ...progreso,
    molestias: [...progreso.molestias, estimulo],
  })
}

/** ¿Ya se vio la intro de Sala Previa? (para no repetirla al entrar desde Ensaya). */
export function introYaVista(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return localStorage.getItem(CLAVE_INTRO) === '1'
  } catch {
    return false
  }
}

export function marcarIntroVista() {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CLAVE_INTRO, '1')
  } catch {
    /* ignore storage quota / private mode */
  }
}

/**
 * Nivel sensorial conservado para deep-links (Ensaya → Sala Previa).
 * Usa nivelMaximo guardado; si no hay progreso, 0. Nunca inventa un nivel más alto.
 */
export function nivelSensorialConservado(): number {
  return cargarProgreso().nivelMaximo
}

function otorgarInsignias(progreso: ProgresoSala): ProgresoSala {
  const set = new Set(progreso.insignias)

  if (progreso.nivelMaximo >= 0) set.add('primer-paso')
  if (progreso.nivelMaximo >= 2) set.add('explorador')
  if (progreso.nivelMaximo >= 4) set.add('paso-firme')
  if (progreso.nivelMaximo >= 5) set.add('sala-superada')
  if (progreso.molestias.length > 0) set.add('conoce-limites')
  if (progreso.racha >= 3) set.add('constancia')

  const validas = INSIGNIAS.map((i) => i.id)
  const insignias = Array.from(set).filter((id) => validas.includes(id))
  return { ...progreso, insignias }
}
