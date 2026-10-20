import type { IdEstimulo, ProgresoSala } from './tipos'
import { INSIGNIAS } from './niveles'

const CLAVE = 'puente-sala-previa-progreso'

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

function ayerISO(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

export function cargarProgreso(): ProgresoSala {
  if (typeof window === 'undefined') return { ...INICIAL }
  try {
    const raw = localStorage.getItem(CLAVE)
    if (!raw) return { ...INICIAL }
    return { ...INICIAL, ...JSON.parse(raw) }
  } catch {
    return { ...INICIAL }
  }
}

export function guardarProgreso(progreso: ProgresoSala) {
  if (typeof window === 'undefined') return
  localStorage.setItem(CLAVE, JSON.stringify(progreso))
}

export function registrarPractica(progreso: ProgresoSala): ProgresoSala {
  const hoy = hoyISO()
  if (progreso.ultimaPractica === hoy) {
    return progreso
  }

  let racha = 1
  if (progreso.ultimaPractica === ayerISO()) {
    racha = progreso.racha + 1
  }

  const siguiente: ProgresoSala = {
    ...progreso,
    racha,
    ultimaPractica: hoy,
    sesionesCompletadas: progreso.sesionesCompletadas + 1,
  }

  return otorgarInsignias(siguiente)
}

export function marcarNivel(progreso: ProgresoSala, nivel: number): ProgresoSala {
  const nivelMaximo = Math.max(progreso.nivelMaximo, nivel)
  return otorgarInsignias({ ...progreso, nivelMaximo })
}

export function sumarConfianza(progreso: ProgresoSala, delta: number): ProgresoSala {
  return {
    ...progreso,
    confianza: Math.min(100, Math.max(0, progreso.confianza + delta)),
  }
}

export function anadirMolestia(progreso: ProgresoSala, estimulo: IdEstimulo): ProgresoSala {
  if (progreso.molestias.includes(estimulo)) return progreso
  return otorgarInsignias({
    ...progreso,
    molestias: [...progreso.molestias, estimulo],
  })
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
