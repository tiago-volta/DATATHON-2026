/**
 * Insignias útiles (Fase 3.2): premian conductas de cuidado, no la velocidad.
 * Persistencia propia en localStorage, compartida entre Sala Previa, Pasaporte y Ensaya.
 * Las originales se mantienen; Ensaya añade medallas por nivel (ids nuevos, sin romper los viejos).
 */

export type IdInsigniaUtil =
  | 'primera-calma'
  | 'pedi-ajustes'
  | 'ensaye-1-nivel'
  | 'ensaya-nivel-1'
  | 'ensaya-nivel-2'
  | 'ensaya-nivel-3'
  | 'ensaye-con-calma'
  | 'casi-listo'
  | 'testigo-en-forma'
  | 'ensaye-declaracion'

export interface InsigniaUtil {
  id: IdInsigniaUtil
  nombre: string
  /** Frase corta: por qué importa. */
  porQueImporta: string
  /** Qué hacer para conseguirla (tooltip / ayuda). */
  comoConseguirla: string
  /** Etiqueta corta del pictograma (aria / visual). */
  pictograma: string
}

export const CLAVE_INSIGNIAS = 'court-insignias-utiles'

export const INSIGNIAS_UTILES: InsigniaUtil[] = [
  {
    id: 'primera-calma',
    nombre: 'Primera calma',
    porQueImporta:
      'Cuidarte está bien. Pedir una pausa no es fallar: es cuidarte.',
    comoConseguirla:
      'En Sala Previa, pulsa «Pausa / Volver a la calma» cuando lo necesites.',
    pictograma: 'calma',
  },
  {
    id: 'pedi-ajustes',
    nombre: 'Pedí ajustes',
    porQueImporta:
      'Pedir lo que necesitas ayuda a que te traten mejor en el juzgado.',
    comoConseguirla:
      'En el Pasaporte, marca al menos un ajuste o preferencia que te ayude.',
    pictograma: 'ajustes',
  },
  {
    id: 'ensaye-1-nivel',
    nombre: 'Ensayé 1 nivel',
    porQueImporta:
      'Practicar un poco ya suma. No hace falta correr ni terminarlo todo.',
    comoConseguirla:
      'Practica un nivel en Sala Previa o en Ensaya, a tu ritmo.',
    pictograma: 'ensayo',
  },
  {
    id: 'ensaya-nivel-1',
    nombre: 'Nivel 1 de Ensaya',
    porQueImporta: 'Completaste las preguntas claras. Buen primer paso.',
    comoConseguirla: 'En Ensaya, termina el bloque «Preguntas claras».',
    pictograma: 'ensayo-1',
  },
  {
    id: 'ensaya-nivel-2',
    nombre: 'Nivel 2 de Ensaya',
    porQueImporta: 'Practicaste preguntas más concretas. Vas a tu ritmo.',
    comoConseguirla: 'En Ensaya, termina el bloque «Preguntas de los abogados».',
    pictograma: 'ensayo-2',
  },
  {
    id: 'ensaya-nivel-3',
    nombre: 'Nivel 3 de Ensaya',
    porQueImporta: 'Ensayaste preguntas difíciles. Pedir que te las aclaren está bien.',
    comoConseguirla: 'En Ensaya, termina el bloque «Preguntas difíciles».',
    pictograma: 'ensayo-3',
  },
  {
    id: 'ensaye-con-calma',
    nombre: 'Ensayé con calma',
    porQueImporta: 'Te sentiste bien al terminar un bloque. Eso también cuenta.',
    comoConseguirla:
      'Al terminar un nivel de Ensaya, responde «Bien» en el check-in de confort.',
    pictograma: 'calma-ensayo',
  },
  {
    id: 'casi-listo',
    nombre: 'Casi listo',
    porQueImporta: 'Muy bien, ya casi estás.',
    comoConseguirla:
      'En Sala Previa, llega al nivel 3 (o más) a tu ritmo.',
    pictograma: 'casi',
  },
  {
    id: 'testigo-en-forma',
    nombre: 'Testigo en forma',
    porQueImporta: 'Eres un testigo de diez. Has practicado con calma.',
    comoConseguirla:
      'En Sala Previa, llega al nivel 5 (vista real) cuando te sientas listo.',
    pictograma: 'testigo',
  },
  {
    id: 'ensaye-declaracion',
    nombre: 'Ensayé mi declaración',
    porQueImporta: 'Ya sabes cómo son las preguntas en la sala. Saberlo da tranquilidad.',
    comoConseguirla:
      'En Sala Previa, termina «Simula tu declaración» desde cualquier punto de vista.',
    pictograma: 'declaracion',
  },
]

export const TOTAL_INSIGNIAS = INSIGNIAS_UTILES.length

/** Apartados de la app con medallas propias (panel inferior). */
export type ApartadoInsignias = 'pasaporte' | 'ensaya' | 'sala-previa'

/** Medallas relacionadas con cada sección (el perfil muestra todas). */
export const INSIGNIAS_POR_APARTADO: Record<ApartadoInsignias, IdInsigniaUtil[]> = {
  pasaporte: ['pedi-ajustes'],
  ensaya: [
    'ensaye-1-nivel',
    'ensaya-nivel-1',
    'ensaya-nivel-2',
    'ensaya-nivel-3',
    'ensaye-con-calma',
  ],
  'sala-previa': [
    'primera-calma',
    'ensaye-1-nivel',
    'casi-listo',
    'testigo-en-forma',
    'ensaye-declaracion',
  ],
}

export const TITULO_INSIGNIAS_APARTADO: Record<ApartadoInsignias, string> = {
  pasaporte: 'Insignias de este apartado',
  ensaya: 'Insignias de Ensaya',
  'sala-previa': 'Insignias de Sala Previa',
}

export function insigniasDeApartado(apartado: ApartadoInsignias): InsigniaUtil[] {
  const ids = INSIGNIAS_POR_APARTADO[apartado]
  return ids.map((id) => metaInsignia(id))
}

/** Evento en window cuando cambian las medallas (perfil y otras pestañas). */
export const EVENTO_INSIGNIAS = 'TribunalInclusivo:insignias-cambiadas'

export function avisarCambioInsignias(ids: IdInsigniaUtil[]) {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(EVENTO_INSIGNIAS, { detail: { ids } }))
}

const IDS_VALIDOS = new Set<string>(INSIGNIAS_UTILES.map((i) => i.id))

/** Mapa nivel Ensaya (1–3) → medalla concreta. */
export const MEDALLA_NIVEL_ENSAYA: Record<1 | 2 | 3, IdInsigniaUtil> = {
  1: 'ensaya-nivel-1',
  2: 'ensaya-nivel-2',
  3: 'ensaya-nivel-3',
}

function sanitizar(ids: unknown): IdInsigniaUtil[] {
  if (!Array.isArray(ids)) return []
  return Array.from(
    new Set(
      ids.filter((id): id is IdInsigniaUtil => typeof id === 'string' && IDS_VALIDOS.has(id))
    )
  )
}

export function metaInsignia(id: IdInsigniaUtil): InsigniaUtil {
  return INSIGNIAS_UTILES.find((i) => i.id === id)!
}

export function cargarInsigniasUtiles(): IdInsigniaUtil[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CLAVE_INSIGNIAS)
    if (!raw) return []
    return sanitizar(JSON.parse(raw))
  } catch {
    return []
  }
}

export function guardarInsigniasUtiles(ids: IdInsigniaUtil[]) {
  if (typeof window === 'undefined') return
  const limpios = sanitizar(ids)
  try {
    localStorage.setItem(CLAVE_INSIGNIAS, JSON.stringify(limpios))
    void import('@/lib/sync/estadoUsuario').then((m) => m.programarSyncEstado())
  } catch {
    /* ignore quota / private mode */
  }
  avisarCambioInsignias(limpios)
}

export interface ResultadoDesbloqueo {
  nueva: boolean
  insignias: IdInsigniaUtil[]
}

/** Desbloquea una insignia. Idempotente: solo marca `nueva` la primera vez. */
export function desbloquearInsigniaUtil(id: IdInsigniaUtil): ResultadoDesbloqueo {
  const actuales = cargarInsigniasUtiles()
  if (actuales.includes(id)) {
    return { nueva: false, insignias: actuales }
  }
  const insignias = [...actuales, id]
  guardarInsigniasUtiles(insignias)
  return { nueva: true, insignias }
}

/**
 * Al completar un bloque de Ensaya: medalla del nivel + `ensaye-1-nivel` (compat).
 * Devuelve la primera medalla nueva (para el toast), priorizando la del nivel.
 */
export function desbloquearMedallaNivelEnsaya(
  nivel: 1 | 2 | 3
): { nuevas: IdInsigniaUtil[]; toastId: IdInsigniaUtil | null } {
  const idNivel = MEDALLA_NIVEL_ENSAYA[nivel]
  const rNivel = desbloquearInsigniaUtil(idNivel)
  const rLegacy = desbloquearInsigniaUtil('ensaye-1-nivel')
  const nuevas: IdInsigniaUtil[] = []
  if (rNivel.nueva) nuevas.push(idNivel)
  if (rLegacy.nueva) nuevas.push('ensaye-1-nivel')
  return {
    nuevas,
    toastId: rNivel.nueva ? idNivel : rLegacy.nueva ? 'ensaye-1-nivel' : null,
  }
}

/**
 * Texto de tooltip unificado: «Medalla: {nombre}. {comoConseguirla}».
 */
export function textoTooltipMedalla(ins: InsigniaUtil): string {
  return `Medalla: ${ins.nombre}. ${ins.comoConseguirla}`
}
