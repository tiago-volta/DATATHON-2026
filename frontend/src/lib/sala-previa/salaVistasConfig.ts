export type MiradaSala = 'entrada' | 'abogados' | 'juez'

export interface MiradaTarget {
  yaw: number
  pitch: number
}

/** Ángulos de cámara (yaw 0 = juez al frente; 180 = puerta/entrada detrás). */
export const MIRADAS_3D: Record<MiradaSala, MiradaTarget> = {
  juez: { yaw: 0, pitch: -6 },
  abogados: { yaw: 38, pitch: -4 },
  entrada: { yaw: 180, pitch: -2 },
}

export const YAW_INICIAL_ESCENA: Record<string, number> = {
  entrada: 180,
  'control-seguridad': 150,
  'sala-espera': 95,
  'sala-vistas': 0,
}

export const PITCH_MAX = 85

export function wrapDeg(deg: number): number {
  return ((deg % 360) + 360) % 360
}
