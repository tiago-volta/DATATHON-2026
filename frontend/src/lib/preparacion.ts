/** Dos pasos: ver la sala y simular el juicio. Sin insignias ni racha. */

const CLAVE = 'court-preparacion'

export const EVENTO_PREPARACION = 'TribunalInclusivo:preparacion'

export interface Preparacion {
  vistaSala: boolean
  juicioEnsayado: boolean
}

const VACIA: Preparacion = { vistaSala: false, juicioEnsayado: false }

function guardar(dato: Preparacion): Preparacion {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(dato))
    window.dispatchEvent(new Event(EVENTO_PREPARACION))
  } catch {
    /* el progreso es local; si el navegador lo bloquea, la pantalla sigue */
  }
  return dato
}

export function cargarPreparacion(): Preparacion {
  if (typeof window === 'undefined') return VACIA
  try {
    const raw = window.localStorage.getItem(CLAVE)
    if (!raw) return VACIA
    const dato = JSON.parse(raw) as Partial<Preparacion>
    return {
      vistaSala: dato.vistaSala === true,
      juicioEnsayado: dato.juicioEnsayado === true,
    }
  } catch {
    return VACIA
  }
}

export function marcarVistaSala(): Preparacion {
  return guardar({ ...cargarPreparacion(), vistaSala: true })
}

export function marcarJuicioEnsayado(): Preparacion {
  return guardar({ ...cargarPreparacion(), juicioEnsayado: true })
}

export function hechosPreparacion(dato: Preparacion): number {
  return Number(dato.vistaSala) + Number(dato.juicioEnsayado)
}

export function textoPreparacion(dato: Preparacion): string {
  if (dato.vistaSala && dato.juicioEnsayado) {
    return 'Ya conoces la sala y has simulado el juicio.'
  }
  if (dato.vistaSala) {
    return 'Has visto la sala. Te falta simular el juicio.'
  }
  if (dato.juicioEnsayado) {
    return 'Has simulado el juicio. Te falta ver la sala.'
  }
  return 'Aún no has visto la sala ni simulado el juicio.'
}
