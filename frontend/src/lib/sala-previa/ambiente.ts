import type { ValoresEstimulo } from './tipos'
import { VALORES_AMBIENTE_SALA } from './niveles'

const CLAVE = 'inclusivecourt-sala-ambiente'

function sanitizar(v: Partial<ValoresEstimulo> | null): ValoresEstimulo {
  const n = (x: unknown, fallback: number) => {
    const nro = typeof x === 'number' ? x : Number(x)
    if (!Number.isFinite(nro)) return fallback
    return Math.max(0, Math.min(100, Math.round(nro)))
  }
  return {
    ruido: n(v?.ruido, VALORES_AMBIENTE_SALA.ruido),
    luz: n(v?.luz, VALORES_AMBIENTE_SALA.luz),
    gente: n(v?.gente, VALORES_AMBIENTE_SALA.gente),
  }
}

export function cargarAmbiente(): ValoresEstimulo {
  if (typeof window === 'undefined') return { ...VALORES_AMBIENTE_SALA }
  try {
    const raw = localStorage.getItem(CLAVE)
    if (!raw) return { ...VALORES_AMBIENTE_SALA }
    return sanitizar(JSON.parse(raw) as Partial<ValoresEstimulo>)
  } catch {
    return { ...VALORES_AMBIENTE_SALA }
  }
}

export function guardarAmbiente(valores: ValoresEstimulo) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(CLAVE, JSON.stringify(sanitizar(valores)))
  } catch {
    /* ignore */
  }
}
