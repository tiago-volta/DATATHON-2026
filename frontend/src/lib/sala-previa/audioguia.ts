import type { EscenaJuzgado, ValoresEstimulo } from './tipos'
import { TOTAL_ESCENAS, etiquetaNivelTipico } from './escenas'

const PAUSA_ENTRE_BLOQUES_MS = 650
const RATE = 0.9
const PITCH = 1

export type BloqueAudioguia = string

export interface ContextoAudioguia {
  escena: EscenaJuzgado
  escenaIndice: number
  valores: ValoresEstimulo
  enCalma: boolean
  /** Si true, omite el bloque de presentación global (tras cambio de escena/nivel). */
  soloBloqueActual?: boolean
  nivelNombre?: string
}

/** Construye los bloques de lectura en orden lógico y calmado. */
export function construirBloquesAudioguia(ctx: ContextoAudioguia): BloqueAudioguia[] {
  const { escena, escenaIndice, valores, enCalma, soloBloqueActual, nivelNombre } =
    ctx
  const paso = escenaIndice + 1
  const tipico = etiquetaNivelTipico(escena)
  const bloques: BloqueAudioguia[] = []

  if (!soloBloqueActual) {
    bloques.push(
      'Sala Previa. Recorre las fases del día en el juzgado: entrada, control, espera y sala de vistas. Empiezas en silencio. Subes estímulos solo cuando tú digas.'
    )
  }

  bloques.push(
    `Paso ${paso} de ${TOTAL_ESCENAS}. ${escena.titulo}. ${escena.frase}`
  )

  if (escena.roles.length > 0) {
    const roles = escena.roles
      .map((r) => `${r.nombre}. ${r.explicacion}`)
      .join(' ')
    bloques.push(`Quién está aquí. ${roles}`)
  }

  if (tipico) {
    bloques.push(
      `En un día real, esta zona suele parecerse al nivel «${tipico}». Aquí ves y oyes solo lo que tú eliges. No subimos nada por ti.`
    )
  }

  if (nivelNombre) {
    bloques.push(`Tu nivel sensorial ahora: ${nivelNombre}.`)
  }

  bloques.push(
    `Controles disponibles: ruido, luz y gente. Ahora: ruido ${Math.round(valores.ruido)}, luz ${Math.round(valores.luz)}, gente ${Math.round(valores.gente)}. Puedes pausar cuando quieras.`
  )

  bloques.push(
    enCalma
      ? 'El botón de calma está activo. Los estímulos están bajos.'
      : 'Abajo tienes el botón Volver a la calma. Lo puedes pulsar en cualquier momento.'
  )

  return bloques
}

export function speechSynthesisDisponible(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

function vozEspanol(): SpeechSynthesisVoice | null {
  if (!speechSynthesisDisponible()) return null
  const voces = speechSynthesis.getVoices()
  return (
    voces.find((v) => v.lang === 'es-ES') ||
    voces.find((v) => v.lang.toLowerCase().startsWith('es')) ||
    null
  )
}

export type EstadoLectura = 'idle' | 'hablando' | 'cancelado'

/**
 * Lee bloques en cola con pausas entre ellos.
 * Devuelve `cancelar` para parar de inmediato (p. ej. botón Calma).
 */
export function leerBloquesEnVoz(
  bloques: BloqueAudioguia[],
  opts?: {
    onInicio?: () => void
    onFin?: (motivo: 'fin' | 'cancelado' | 'error') => void
  }
): { cancelar: () => void } {
  let cancelado = false
  let timer: ReturnType<typeof setTimeout> | null = null
  let indice = 0

  const limpiarTimer = () => {
    if (timer != null) {
      clearTimeout(timer)
      timer = null
    }
  }

  let finNotificado = false
  const notificarFin = (motivo: 'fin' | 'cancelado' | 'error') => {
    if (finNotificado) return
    finNotificado = true
    opts?.onFin?.(motivo)
  }

  const cancelar = () => {
    if (cancelado) return
    cancelado = true
    limpiarTimer()
    if (speechSynthesisDisponible()) {
      speechSynthesis.cancel()
    }
    notificarFin('cancelado')
  }

  if (!speechSynthesisDisponible() || bloques.length === 0) {
    notificarFin('error')
    return { cancelar: () => undefined }
  }

  // Algunos navegadores cargan voces de forma asíncrona.
  const asegurarVoces = (siguiente: () => void) => {
    const voces = speechSynthesis.getVoices()
    if (voces.length > 0) {
      siguiente()
      return
    }
    const once = () => {
      speechSynthesis.removeEventListener('voiceschanged', once)
      siguiente()
    }
    speechSynthesis.addEventListener('voiceschanged', once)
    // Fallback si el evento no llega.
    timer = setTimeout(() => {
      speechSynthesis.removeEventListener('voiceschanged', once)
      siguiente()
    }, 300)
  }

  const hablarSiguiente = () => {
    if (cancelado) return
    if (indice >= bloques.length) {
      notificarFin('fin')
      return
    }

    const texto = bloques[indice]
    indice += 1

    const utterance = new SpeechSynthesisUtterance(texto)
    utterance.lang = 'es-ES'
    utterance.rate = RATE
    utterance.pitch = PITCH
    const voz = vozEspanol()
    if (voz) utterance.voice = voz

    utterance.onend = () => {
      if (cancelado) return
      if (indice >= bloques.length) {
        notificarFin('fin')
        return
      }
      // Pausa calmada entre bloques (no solapa con el siguiente).
      timer = setTimeout(hablarSiguiente, PAUSA_ENTRE_BLOQUES_MS)
    }
    utterance.onerror = () => {
      if (cancelado) return
      notificarFin('error')
    }

    speechSynthesis.speak(utterance)
  }

  opts?.onInicio?.()
  speechSynthesis.cancel()
  asegurarVoces(() => {
    if (cancelado) return
    hablarSiguiente()
  })

  return { cancelar }
}
