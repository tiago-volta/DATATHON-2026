/**
 * Asistente de voz (MOCK).
 * Matching por keywords/regex. Listo para enchufar Gemini o POST /api/voz/interpretar.
 *
 * TODO(Gemini): sustituir `procesarPeticionVozLocal` por llamada al backend
 *   cuando NEXT_PUBLIC_VOZ_LLM=1 o similar. Mantener la misma firma de salida.
 */

import {
  AYUDA_MODO_VOZ,
  CONFIRMACION_ACTIVACION,
  FRASES_ACTIVACION,
} from './constantes'

export type IntentVoz =
  | 'activar_modo'
  | 'desactivar_modo'
  | 'repetir'
  | 'explicar'
  | 'ayuda'
  | 'parar'
  | 'mas_despacio'
  | 'desconocido'

export type AccionVoz =
  | 'activar_modo_voz'
  | 'desactivar_modo_voz'
  | 'repetir_ultimo'
  | 'explicar_contexto'
  | 'mostrar_ayuda'
  | 'parar_voz'
  | 'ralentizar'
  | 'ninguna'

export interface ResultadoPeticionVoz {
  intent: IntentVoz
  respuestaHabla: string
  accion: AccionVoz
  /** Texto normalizado que se usó para el matching. */
  textoNormalizado: string
  /** true si vino del stub remoto /api/voz/interpretar */
  fuente: 'local' | 'api'
}

/** Vacío = misma origen (Next reescribe /api → backend). Así funciona el túnel. */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

function normalizar(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[¿?¡!.,;:«»"'…]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function coincideActivacion(n: string): boolean {
  return FRASES_ACTIVACION.some((f) => {
    const fn = normalizar(f)
    return n.includes(fn) || fn.includes(n)
  })
}

const RE_REPETIR =
  /\b(repite|repetir|otra\s+vez|de\s+nuevo|puedes\s+repetir|perdon[a]?,?\s+puedes\s+repetir|vuelve\s+a\s+(decir|leer|explicar)|repitemelo|repítemelo)\b/i

const RE_PARAR = /\b(para|parar|detente|calla|silencio|basta|stop)\b/i

const RE_DESACTIVAR =
  /\b(desactivar|apagar|quitar|cerrar)\s+(el\s+)?(modo\s+)?(con\s+)?voz\b|\bdesactivar\s+modo\b|\bmodo\s+con\s+voz\s+off\b/i

const RE_DESPACIO =
  /\b(mas\s+despacio|m[aá]s\s+lento|despacio|lento|mas\s+lento)\b/i

const RE_AYUDA =
  /\b(ayuda|ayudame|ayúdame|que\s+puedo\s+decir|comandos|opciones)\b/i

const RE_EXPLICAR =
  /\b(explica|explicame|explícame|que\s+es\s+esto|donde\s+estoy|que\s+hago|como\s+funciona)\b/i

/**
 * Interpretación local (mock). Sin red.
 */
export function procesarPeticionVozLocal(texto: string): ResultadoPeticionVoz {
  const textoNormalizado = normalizar(texto)

  if (!textoNormalizado) {
    return {
      intent: 'desconocido',
      respuestaHabla:
        'No te he oído bien. Puedes decir «ayuda» o pulsar Escuchar pedido.',
      accion: 'ninguna',
      textoNormalizado,
      fuente: 'local',
    }
  }

  // Desactivar antes que activar: «desactivar modo con voz» contiene «modo con voz».
  if (RE_DESACTIVAR.test(textoNormalizado)) {
    return {
      intent: 'desactivar_modo',
      respuestaHabla:
        'Modo con voz desactivado. Puedes seguir con los botones o activarlo otra vez cuando quieras.',
      accion: 'desactivar_modo_voz',
      textoNormalizado,
      fuente: 'local',
    }
  }

  if (coincideActivacion(textoNormalizado)) {
    return {
      intent: 'activar_modo',
      respuestaHabla: CONFIRMACION_ACTIVACION,
      accion: 'activar_modo_voz',
      textoNormalizado,
      fuente: 'local',
    }
  }

  if (RE_REPETIR.test(texto) || /\brepite\b|\botra vez\b/.test(textoNormalizado)) {
    return {
      intent: 'repetir',
      respuestaHabla: 'Claro. Te lo repito.',
      accion: 'repetir_ultimo',
      textoNormalizado,
      fuente: 'local',
    }
  }

  if (RE_PARAR.test(textoNormalizado)) {
    return {
      intent: 'parar' as IntentVoz,
      respuestaHabla: 'De acuerdo. Paro la voz.',
      accion: 'parar_voz',
      textoNormalizado,
      fuente: 'local',
    }
  }

  if (RE_DESPACIO.test(textoNormalizado)) {
    return {
      intent: 'mas_despacio' as IntentVoz,
      respuestaHabla: 'Vale. Lo digo un poco más despacio.',
      accion: 'ralentizar',
      textoNormalizado,
      fuente: 'local',
    }
  }

  if (RE_AYUDA.test(textoNormalizado)) {
    return {
      intent: 'ayuda',
      respuestaHabla: AYUDA_MODO_VOZ,
      accion: 'mostrar_ayuda',
      textoNormalizado,
      fuente: 'local',
    }
  }

  if (RE_EXPLICAR.test(textoNormalizado)) {
    return {
      intent: 'explicar',
      respuestaHabla:
        'Estás en PUENTE. Aquí entiendes el juzgado con frases cortas y voz. En Sala Previa puedes probar ruido, luz y gente a tu ritmo. Di «repite» si quieres oír otra vez el último bloque.',
      accion: 'explicar_contexto',
      textoNormalizado,
      fuente: 'local',
    }
  }

  return {
    intent: 'desconocido',
    respuestaHabla:
      'No estoy segura de lo que pides. Di «ayuda» para oír qué puedes decir, o «repite» para volver a escuchar.',
    accion: 'ninguna',
    textoNormalizado,
    fuente: 'local',
  }
}

/**
 * Punto de entrada. Intenta el stub remoto; si falla, usa el mock local.
 * Misma forma de salida para enchufar Gemini después.
 */
export async function procesarPeticionVoz(
  texto: string
): Promise<ResultadoPeticionVoz> {
  const local = procesarPeticionVozLocal(texto)

  try {
    const res = await fetch(`${API_URL}/api/voz/interpretar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ texto }),
      signal: AbortSignal.timeout(2500),
    })
    if (!res.ok) return local
    const data = (await res.json()) as Partial<ResultadoPeticionVoz>
    if (!data.intent || !data.respuestaHabla || !data.accion) return local
    return {
      intent: data.intent,
      respuestaHabla: data.respuestaHabla,
      accion: data.accion,
      textoNormalizado: data.textoNormalizado ?? local.textoNormalizado,
      fuente: 'api',
    }
  } catch {
    return local
  }
}
