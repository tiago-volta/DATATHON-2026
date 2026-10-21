'use client'

import { LS_MODO_VOZ, LS_ONBOARDING_VISTO } from './constantes'

function leerFlag(clave: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(clave) === 'true'
  } catch {
    return false
  }
}

function escribirFlag(clave: string, valor: boolean): void {
  if (typeof window === 'undefined') return
  try {
    if (valor) {
      window.localStorage.setItem(clave, 'true')
    } else {
      window.localStorage.removeItem(clave)
    }
  } catch {
    /* private mode / quota */
  }
}

export function onboardingVozVisto(): boolean {
  return leerFlag(LS_ONBOARDING_VISTO)
}

export function marcarOnboardingVozVisto(): void {
  escribirFlag(LS_ONBOARDING_VISTO, true)
}

export function modoVozActivo(): boolean {
  return leerFlag(LS_MODO_VOZ)
}

export function setModoVozActivo(activo: boolean): void {
  escribirFlag(LS_MODO_VOZ, activo)
}
