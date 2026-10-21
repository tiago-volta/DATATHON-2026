import type { EscenaJuzgado, ValoresEstimulo } from './tipos'
import { TOTAL_ESCENAS, etiquetaNivelTipico } from './escenas'
import {
  hablarCola,
  parar as pararVozNatural,
  speechSynthesisDisponible,
  vozNaturalDisponible,
} from '@/lib/vozNatural'

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

export { speechSynthesisDisponible, vozNaturalDisponible }

export type EstadoLectura = 'idle' | 'hablando' | 'cancelado'

/**
 * Lee bloques en cola con voz natural (edge-tts) y pausas entre ellos.
 * Fallback a speechSynthesis. `cancelar` para calma/toggle.
 */
export function leerBloquesEnVoz(
  bloques: BloqueAudioguia[],
  opts?: {
    onInicio?: () => void
    onFin?: (motivo: 'fin' | 'cancelado' | 'error') => void
  }
): { cancelar: () => void } {
  if (!vozNaturalDisponible() || bloques.length === 0) {
    opts?.onFin?.('error')
    return { cancelar: () => undefined }
  }

  pararVozNatural()
  return hablarCola(bloques, opts)
}
