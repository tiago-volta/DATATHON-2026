/**
 * Clasificador ligero (offline) de respuestas libres en la simulación de declaración.
 * Prioriza lectura fácil: frases cortas, tú, sin diagnóstico.
 */

export type TipoRespuestaLibre =
  | 'agua'
  | 'pausa'
  | 'no_se'
  | 'no_contestar'
  | 'fuera_tema'
  | 'al_tema'

export interface ResultadoRespuestaLibre {
  tipo: TipoRespuestaLibre
  replicaJuez: string
  /** Tras la réplica, pasar al siguiente turno del guion. */
  avanzar: boolean
  /** Abrir el flujo de pausa (igual que «Pedir una pausa»). */
  entrarPausa: boolean
  /** Tras la réplica, esperar a que la persona diga que está lista (o un beat corto). */
  esperarListo: boolean
  porQue: string
}

export interface ContextoClasificacion {
  /** Pregunta del turno actual (texto o versión clara). */
  pregunta: string
  /** Si es persona acusada, refuerza el derecho a no contestar. */
  esInvestigado?: boolean
}

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[¿?¡!.,;:…"«»'"`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function coincide(texto: string, patrones: RegExp[]): boolean {
  return patrones.some((p) => p.test(texto))
}

const PATRONES_AGUA = [
  /\b(agua|vaso|beber|bebida|sed)\b/,
  /\bpuedo\s+(beber|tomar)\b/,
  /\btomar\s+(un\s+)?(poco\s+de\s+)?agua\b/,
]

const PATRONES_PAUSA = [
  /\b(pausa|parar|pare|paramos|paremos)\b/,
  /\b(me\s+)?(agobio|agobiado|agobiada|agobia)\b/,
  /\b(me\s+)?(ahogo|ahogado|ahogada)\b/,
  /\b(necesito|quiero|pido)\s+(un\s+)?(momento|descanso|break)\b/,
  /\bno\s+puedo\s+(seguir|continuar)\b/,
  /\bestoy\s+(mal|nervios[oa]|ansios[oa])\b/,
  /\bhacemos?\s+una\s+pausa\b/,
]

const PATRONES_NO_SE = [
  /\bno\s+lo\s+se\b/,
  /\bno\s+se\b/,
  /\bno\s+(lo\s+)?recuerd[oa]\b/,
  /\bno\s+me\s+acuerdo\b/,
  /\bno\s+tengo\s+(ni\s+)?idea\b/,
  /\bno\s+estoy\s+segur[oa]\b/,
  /\bno\s+sabria\b/,
  /\bse\s+me\s+olvido\b/,
]

const PATRONES_NO_CONTESTAR = [
  /\bprefiero\s+no\s+(contestar|responder|declarar)\b/,
  /\bno\s+(quiero|voy\s+a)\s+(contestar|responder|declarar)\b/,
  /\bme\s+acojo\s+(a\s+)?(mi\s+)?derecho\b/,
  /\bderecho\s+a\s+no\s+(contestar|declarar)\b/,
  /\bsin\s+declaracion\b/,
  /\bno\s+declaro\b/,
]

/** Palabras del caso inventado y de preguntas típicas de sala. */
const PALABRAS_CASO = [
  'parada',
  'autobus',
  'movil',
  'telefono',
  'correr',
  'corriendo',
  'plaza',
  'calle',
  'real',
  'martes',
  'marzo',
  'tarde',
  'casa',
  'trabajo',
  'abogada',
  'abogado',
  'fiscal',
  'jueza',
  'juez',
  'nombre',
  'llamo',
  'conozco',
  'vi',
  'vio',
  'visto',
  'paso',
  'mano',
  'mujer',
  'persona',
  'acusad',
  'inocente',
  'culpable',
  'verdad',
  'juro',
  'prometo',
  'miedo',
  'dano',
  'reclamar',
  'farola',
  'luz',
  'hora',
  'ropa',
  'cara',
]

function tokens(texto: string): string[] {
  return texto.split(' ').filter((t) => t.length > 2)
}

function solapaConPregunta(respuesta: string, pregunta: string): boolean {
  const pt = new Set(tokens(normalizar(pregunta)))
  const rt = tokens(respuesta)
  let hits = 0
  for (const t of rt) {
    if (pt.has(t)) hits += 1
  }
  return hits >= 2
}

function tocaCaso(respuesta: string): boolean {
  return PALABRAS_CASO.some((p) => respuesta.includes(p))
}

function acortarPregunta(pregunta: string, max = 120): string {
  const limpia = pregunta.replace(/\s+/g, ' ').trim()
  if (limpia.length <= max) return limpia
  return `${limpia.slice(0, max - 1).trim()}…`
}

/**
 * Clasifica una respuesta libre y propone la réplica de la jueza.
 */
export function clasificarRespuestaLibre(
  textoUsuario: string,
  contexto: ContextoClasificacion
): ResultadoRespuestaLibre {
  const texto = normalizar(textoUsuario)
  const preguntaCorta = acortarPregunta(contexto.pregunta)

  if (!texto) {
    return {
      tipo: 'al_tema',
      replicaJuez: 'De acuerdo. Seguimos.',
      avanzar: true,
      entrarPausa: false,
      esperarListo: false,
      porQue: 'Respondiste con tus palabras.',
    }
  }

  if (coincide(texto, PATRONES_AGUA)) {
    return {
      tipo: 'agua',
      replicaJuez: 'Sí, claro. Puedes beber agua. Cuando quieras, seguimos.',
      avanzar: true,
      entrarPausa: false,
      esperarListo: true,
      porQue: 'Pedir agua está bien. Te ayuda a seguir con calma.',
    }
  }

  if (coincide(texto, PATRONES_PAUSA)) {
    return {
      tipo: 'pausa',
      replicaJuez: 'De acuerdo. Hacemos una pausa de cinco minutos.',
      avanzar: false,
      entrarPausa: true,
      esperarListo: false,
      porQue: 'Pedir una pausa es un derecho. Te ayuda a seguir.',
    }
  }

  if (coincide(texto, PATRONES_NO_CONTESTAR)) {
    const replica = contexto.esInvestigado
      ? 'De acuerdo. Es tu derecho. No contestas a esta pregunta. Seguimos.'
      : 'De acuerdo. Prefieres no contestar ahora. Seguimos.'
    return {
      tipo: 'no_contestar',
      replicaJuez: replica,
      avanzar: true,
      entrarPausa: false,
      esperarListo: false,
      porQue: contexto.esInvestigado
        ? 'No contestar a una pregunta es un derecho. No te pueden castigar por eso.'
        : 'Puedes decir que prefieres no contestar. La jueza lo entiende.',
    }
  }

  if (coincide(texto, PATRONES_NO_SE)) {
    return {
      tipo: 'no_se',
      replicaJuez: 'De acuerdo. «No lo sé» o «no lo recuerdo» vale. Seguimos.',
      avanzar: true,
      entrarPausa: false,
      esperarListo: false,
      porQue: '«No lo recuerdo» es una respuesta válida. Es mejor que inventar.',
    }
  }

  if (solapaConPregunta(texto, contexto.pregunta) || tocaCaso(texto) || texto.split(' ').length >= 4) {
    return {
      tipo: 'al_tema',
      replicaJuez: 'De acuerdo. Gracias. Seguimos.',
      avanzar: true,
      entrarPausa: false,
      esperarListo: false,
      porQue: 'Respondiste con tus palabras. Lo importante es decir lo que sabes, sin inventar.',
    }
  }

  return {
    tipo: 'fuera_tema',
    replicaJuez: `Eso lo anotamos. Ahora volvemos a la pregunta: ${preguntaCorta}`,
    avanzar: false,
    entrarPausa: false,
    esperarListo: false,
    porQue: 'La jueza te devolvió a la pregunta. En un juicio, responde a lo que te preguntan.',
  }
}
