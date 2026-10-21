export type IdEstimulo =
  | 'ruido'
  | 'luz'
  | 'gente'
  | 'voces'
  | 'puerta'
  | 'movil'
  | 'nombre-en-alto'
  | 'control-seguridad'
  | 'toga'

export type ValoresEstimulo = {
  ruido: number
  luz: number
  gente: number
} & { [K in IdEstimulo]?: number }

export interface NivelSala {
  id: number
  nombre: string
  descripcion: string
  audioguia: string
  preset: ValoresEstimulo
}

/** Escenas físicas del día en el juzgado (recorrido narrativo). */
export type IdEscenaJuzgado =
  | 'entrada'
  | 'control-seguridad'
  | 'sala-espera'
  | 'sala-vistas'
  | 'espera-fuera'
  | 'llamada'
  | 'reunion-abogado'
  | 'sala-investigado'
  | 'ultima-palabra'
  | 'espera-separada'
  | 'sala-protegida'
  | 'vista-civil'

export interface RolEscena {
  nombre: string
  explicacion: string
}

export interface EscenaJuzgado {
  id: IdEscenaJuzgado
  titulo: string
  /** Frase corta en lectura fácil: qué pasa aquí. */
  frase: string
  roles: RolEscena[]
  /**
   * Índice en NIVELES: solo referencia informativa del ambiente típico.
   * Nunca se aplica sola al cambiar de escena.
   */
  nivelTipicoId: number
  audioguia: string
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