export type IdEstimulo = 'ruido' | 'luz' | 'gente' | 'eco'

export interface ValoresEstimulo {
  ruido: number
  luz: number
  gente: number
  eco: number
}

export interface NivelSala {
  id: number
  nombre: string
  descripcion: string
  audioguia: string
  preset: ValoresEstimulo
}

export interface Insignia {
  id: string
  nombre: string
  descripcion: string
}

/** Check-in de confort en Sala Previa (3 opciones). */
export type ConfortCheckIn = 'bien' | 'regular' | 'mal'

export interface ProgresoSala {
  nivelMaximo: number
  insignias: string[]
  confianza: number
  racha: number
  ultimaPractica: string | null
  molestias: IdEstimulo[]
  sesionesCompletadas: number
}
