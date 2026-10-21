import type { IdEstimulo } from '@/lib/sala-previa/tipos'

export type RolPerfil = 'testigo' | 'investigado' | 'victima' | 'parte_civil' | 'desconocido'

export type NivelTolerancia = 0 | 1 | 2 | 3 | 4 | 5

export interface ToleranciaEstimulo {
  id: IdEstimulo
  activo: boolean // el usuario lo ha añadido a su entrenamiento
  nivel: NivelTolerancia // máximo aguantado con calma (0 a 5)
  objetivo: NivelTolerancia // propuesta próxima sesión (nivel + 1 como mucho)
  historial: { fecha: string; nivel: number; calma: boolean }[] // últimas 10 sesiones
}

export type IdHerramienta =
  | 'cascos'
  | 'gafas-sol'
  | 'objeto-mano'
  | 'pausa'
  | 'respiracion'
  | 'acompanante'

export interface HerramientaUsada {
  id: IdHerramienta
  vecesUsada: number
  ayudo: boolean | null // respuesta del check-in: «¿te ayudó?»
  estimulo?: IdEstimulo // qué estímulo bajó
}

export type TipoPreguntaDificil =
  | 'compuesta'
  | 'doble-negacion'
  | 'afirmacion-pregunta'
  | 'coletilla'
  | 'hipotetica'

export interface PreguntaDominada {
  tipo: TipoPreguntaDificil
  intentos: number
  aciertos: number // eligió la respuesta segura
  dominada: boolean // ≥ 2 aciertos seguidos
}

/** Opcional (Fase 2). Solo necesidades funcionales: nunca diagnóstico. */
export interface PlanJuicio {
  necesidades: string[] // ids de AJUSTES_DISPONIBLES (contenido.ts)
  frasesPropias: string[] // «Necesito preguntas de una en una»
  compartirCon: ('abogado' | 'facilitador' | 'oficina-juzgado' | 'acompanante')[]
  consentimiento: { aceptado: boolean; fecha: string | null } // nunca premarcado
}

export interface PerfilV2 {
  version: 2
  nombre: string
  rol: RolPerfil
  estimulos: ToleranciaEstimulo[]
  herramientas: HerramientaUsada[]
  preguntas: PreguntaDominada[]
  plan?: PlanJuicio
  creado: number
  actualizado: number
  // Campos de compatibilidad v1 para código existente
  tolerancia?: NivelTolerancia
  estimulosSensibles?: IdEstimulo[]
}

/** Perfil v1 legado para migración */
export interface PerfilV1 {
  version?: 1
  nombre: string
  rol?: RolPerfil
  tolerancia: NivelTolerancia
  estimulosSensibles?: IdEstimulo[]
  creado?: number
  actualizado?: number
}
