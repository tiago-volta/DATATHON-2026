import type { RolPerfil } from '@/lib/perfil/tipos'

export type MiradaSala = 'entrada' | 'abogados' | 'juez'

export interface MiradaTarget {
  yaw: number
  pitch: number
}

export type Punto3D = [number, number, number]

/** Dónde está la persona usuaria dentro de la sala de vistas. */
export type PapelSala = 'publico' | 'testigo' | 'investigado' | 'victima' | 'parte_civil'

/** Ángulos de cámara (yaw 0 = juez al frente; 180 = puerta/entrada detrás). */
export const MIRADAS_3D: Record<MiradaSala, MiradaTarget> = {
  juez: { yaw: 0, pitch: -6 },
  abogados: { yaw: 38, pitch: -4 },
  entrada: { yaw: 180, pitch: -2 },
}

/**
 * Ángulos para el panorama fotográfico equirectangular (captura local del equipo).
 * yaw 0 ≈ centro de la imagen (estrado); negativos miran a la izquierda de la foto.
 */
export const MIRADAS_FOTO_360: Record<MiradaSala, MiradaTarget> = {
  juez: { yaw: 8, pitch: -5 },
  abogados: { yaw: -52, pitch: -3 },
  entrada: { yaw: 178, pitch: -2 },
}

export const YAW_INICIAL_ESCENA: Record<string, number> = {
  entrada: 180,
  'control-seguridad': 150,
  'sala-espera': 95,
  'sala-vistas': 0,
}

export const PITCH_MAX = 85

export const ESCENAS_SALA = new Set([
  'sala-vistas',
  'sala-investigado',
  'sala-protegida',
  'vista-civil',
])

interface ConfigPapel {
  camara: Punto3D
  objetivos: Record<MiradaSala, Punto3D>
  /** Multiplicador del público visible respecto a la barra «gente». */
  publico: number
  descripcion: string
}

const PUERTA: Punto3D = [0, 1.5, 7.78]
const JUEZ: Punto3D = [0, 1.95, -6.6]

export const PAPELES_SALA: Record<PapelSala, ConfigPapel> = {
  publico: {
    camara: [0, 1.55, 0.8],
    objetivos: { juez: JUEZ, abogados: [-2.4, 1.1, -2.55], entrada: PUERTA },
    publico: 1,
    descripcion: 'Miras desde el público, en la primera fila.',
  },
  testigo: {
    camara: [0, 1.6, -2.7],
    objetivos: { juez: JUEZ, abogados: [2.4, 1.05, -2.55], entrada: PUERTA },
    publico: 1,
    descripcion:
      'Estás de pie en el atril de testigos, en el centro, mirando al juez. Tienes un vaso de agua.',
  },
  investigado: {
    camara: [-4.45, 1.2, -1.95],
    objetivos: { juez: JUEZ, abogados: [-2.4, 1.05, -2.55], entrada: PUERTA },
    publico: 1,
    descripcion:
      'Te sientas en el banquillo, al lado de la mesa de tu defensa. Un agente está de pie a tu lado.',
  },
  victima: {
    camara: [0.35, 1.2, -2.45],
    objetivos: { juez: JUEZ, abogados: [2.4, 1.05, -2.55], entrada: PUERTA },
    publico: 0.35,
    descripcion:
      'Te sientas en el centro, con una mampara que tapa el lado de la persona investigada. Tu acompañante está a tu lado y hay poco público.',
  },
  parte_civil: {
    camara: [1.75, 1.2, -2.45],
    objetivos: { juez: JUEZ, abogados: [2.95, 1.05, -2.5], entrada: PUERTA },
    publico: 0.15,
    descripcion:
      'Te sientas en la mesa de la derecha, junto a tu abogado o abogada. Casi no hay público.',
  },
}

export const TOTAL_PUBLICO = 15

export function numPublicoVisible(gente: number, papel: PapelSala): number {
  return Math.round((gente / 100) * PAPELES_SALA[papel].publico * TOTAL_PUBLICO)
}

export function papelDesdeRol(rol: RolPerfil | undefined, escenaId: string): PapelSala {
  if (!ESCENAS_SALA.has(escenaId)) return 'publico'
  switch (rol) {
    case 'testigo':
    case 'investigado':
    case 'victima':
    case 'parte_civil':
      return rol
    default:
      return 'publico'
  }
}

export function miradaHacia(desde: Punto3D, hacia: Punto3D): MiradaTarget {
  const dx = hacia[0] - desde[0]
  const dy = hacia[1] - desde[1]
  const dz = hacia[2] - desde[2]
  const yaw = (Math.atan2(-dx, -dz) * 180) / Math.PI
  const pitch = (Math.atan2(dy, Math.hypot(dx, dz)) * 180) / Math.PI
  return { yaw: wrapDeg(yaw), pitch: Math.max(-PITCH_MAX, Math.min(PITCH_MAX, pitch)) }
}

export function miradasPapel(papel: PapelSala): Record<MiradaSala, MiradaTarget> {
  if (papel === 'publico') return MIRADAS_3D
  const { camara, objetivos } = PAPELES_SALA[papel]
  return {
    juez: miradaHacia(camara, objetivos.juez),
    abogados: miradaHacia(camara, objetivos.abogados),
    entrada: miradaHacia(camara, objetivos.entrada),
  }
}

export function wrapDeg(deg: number): number {
  return ((deg % 360) + 360) % 360
}
