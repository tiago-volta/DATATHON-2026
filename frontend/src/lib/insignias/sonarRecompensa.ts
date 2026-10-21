/**
 * Sonido corto al ganar una medalla.
 * Respeta mute global (`localStorage court-audio-mute`),
 * prefers-reduced-motion (volumen bajo) y modo calma (volumen bajo).
 */

const RUTA = '/sala-previa/audio/recompensa-medalla.mp3'
const CLAVE_MUTE = 'court-audio-mute'

let audio: HTMLAudioElement | null = null

function preferReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

function muteGlobal(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const v = localStorage.getItem(CLAVE_MUTE)
    return v === '1' || v === 'true'
  } catch {
    return false
  }
}

export interface OpcionesSonidoRecompensa {
  /** Usuario en modo calma: volumen más bajo. */
  enCalma?: boolean
  /** Ducking opcional del ambiente de sala (breve). */
  atenuarAmbiente?: (activo: boolean) => void
}

/**
 * Reproduce el chime de medalla. Idempotente y seguro fuera de gesto de usuario
 * (puede fallar en silenciosos; se ignora).
 */
export function sonarRecompensaInsignia(opts: OpcionesSonidoRecompensa = {}): void {
  if (typeof window === 'undefined') return
  if (muteGlobal()) return

  const reduced = preferReducedMotion()
  const vol = opts.enCalma || reduced ? 0.18 : 0.42

  try {
    if (!audio) {
      audio = new Audio(RUTA)
      audio.preload = 'auto'
    }
    audio.volume = vol
    audio.currentTime = 0
    opts.atenuarAmbiente?.(true)
    const p = audio.play()
    if (p && typeof p.then === 'function') {
      p.catch(() => {
        /* autoplay bloqueado: el toast visual basta */
      })
    }
    window.setTimeout(() => opts.atenuarAmbiente?.(false), 700)
  } catch {
    opts.atenuarAmbiente?.(false)
  }
}

export { CLAVE_MUTE as CLAVE_AUDIO_MUTE }
