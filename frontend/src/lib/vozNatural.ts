/**
 * Voz natural para audioguía (diseño universal).
 * 1) Intenta POST /api/tts (edge-tts, es-ES-ElviraNeural).
 * 2) Si falla, speechSynthesis con ranking de voces es-ES.
 * Solo arranca tras gesto del usuario (el llamador controla el clic).
 *
 * Mutex global: una sola cola/voz a la vez. Hablar cancela lo anterior.
 */

/** Vacío = misma origen (Next reescribe /api → backend). Así funciona el túnel. */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
const PAUSA_ENTRE_FRASES_MS = 700
const RATE_FALLBACK = 0.9
const PITCH_FALLBACK = 1

let audioActual: HTMLAudioElement | null = null
let urlActual: string | null = null
let canceladoGlobal = false
let timerCola: ReturnType<typeof setTimeout> | null = null
/** Generación de sesión: evita que colas viejas sigan tras un nuevo `hablarCola`. */
let sesionHabla = 0
let ocupado = false

export function vozNaturalDisponible(): boolean {
  if (typeof window === 'undefined') return false
  return typeof Audio !== 'undefined' || 'speechSynthesis' in window
}

export function speechSynthesisDisponible(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** True si hay TTS de red o speechSynthesis activo (o cola en curso). */
export function estaHablando(): boolean {
  if (ocupado) return true
  if (audioActual && !audioActual.paused) return true
  if (speechSynthesisDisponible() && (speechSynthesis.speaking || speechSynthesis.pending)) {
    return true
  }
  return false
}

function detenerReproduccion(): void {
  if (timerCola != null) {
    clearTimeout(timerCola)
    timerCola = null
  }
  if (audioActual) {
    try {
      audioActual.pause()
      audioActual.src = ''
    } catch {
      /* ignore */
    }
    audioActual = null
  }
  if (urlActual) {
    URL.revokeObjectURL(urlActual)
    urlActual = null
  }
  if (speechSynthesisDisponible()) {
    speechSynthesis.cancel()
  }
}

/** Para calma / toggle / barge-in: corta TTS de red y speechSynthesis. */
export function parar(): void {
  canceladoGlobal = true
  sesionHabla += 1
  ocupado = false
  detenerReproduccion()
}

function limpiarAudio(): void {
  if (audioActual) {
    try {
      audioActual.pause()
      audioActual.src = ''
    } catch {
      /* ignore */
    }
    audioActual = null
  }
  if (urlActual) {
    URL.revokeObjectURL(urlActual)
    urlActual = null
  }
}

/** Ranking: voces neurales / naturales es-ES antes que genéricas. */
export function elegirMejorVozEs(): SpeechSynthesisVoice | null {
  if (!speechSynthesisDisponible()) return null
  const voces = speechSynthesis.getVoices()
  if (voces.length === 0) return null

  const es = voces.filter((v) => v.lang.toLowerCase().startsWith('es'))
  const candidatos = es.length > 0 ? es : voces

  const puntuacion = (v: SpeechSynthesisVoice): number => {
    const nombre = v.name.toLowerCase()
    const lang = v.lang.toLowerCase()
    let pts = 0
    if (lang === 'es-es') pts += 40
    else if (lang.startsWith('es')) pts += 20
    if (/elvira|neural|natural|google|microsoft|premium|enhanced|sabina|helena|monica|paloma/.test(nombre)) {
      pts += 30
    }
    if (/female|mujer|woman/.test(nombre)) pts += 5
    if (v.localService) pts += 2
    if (/compact|espeak|robot/.test(nombre)) pts -= 20
    return pts
  }

  return [...candidatos].sort((a, b) => puntuacion(b) - puntuacion(a))[0] ?? null
}

async function fetchAudioTts(texto: string): Promise<Blob> {
  const response = await fetch(`${API_URL}/api/tts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto }),
  })
  if (!response.ok) {
    throw new Error(`TTS HTTP ${response.status}`)
  }
  const tipo = response.headers.get('content-type') || ''
  if (!tipo.includes('audio')) {
    throw new Error('Respuesta TTS sin audio')
  }
  return response.blob()
}

function reproducirBlob(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    limpiarAudio()
    const url = URL.createObjectURL(blob)
    urlActual = url
    const audio = new Audio(url)
    audioActual = audio
    audio.onended = () => {
      limpiarAudio()
      resolve()
    }
    audio.onerror = () => {
      limpiarAudio()
      reject(new Error('Error al reproducir audio TTS'))
    }
    const play = audio.play()
    if (play && typeof play.then === 'function') {
      play.catch((err) => {
        limpiarAudio()
        reject(err)
      })
    }
  })
}

function hablarConSpeechSynthesis(texto: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!speechSynthesisDisponible()) {
      reject(new Error('speechSynthesis no disponible'))
      return
    }

    const hablar = () => {
      const utterance = new SpeechSynthesisUtterance(texto)
      utterance.lang = 'es-ES'
      utterance.rate = RATE_FALLBACK
      utterance.pitch = PITCH_FALLBACK
      const voz = elegirMejorVozEs()
      if (voz) utterance.voice = voz

      utterance.onend = () => resolve()
      utterance.onerror = () => reject(new Error('Error speechSynthesis'))

      speechSynthesis.speak(utterance)
    }

    const voces = speechSynthesis.getVoices()
    if (voces.length > 0) {
      hablar()
      return
    }
    const once = () => {
      speechSynthesis.removeEventListener('voiceschanged', once)
      hablar()
    }
    speechSynthesis.addEventListener('voiceschanged', once)
    setTimeout(() => {
      speechSynthesis.removeEventListener('voiceschanged', once)
      hablar()
    }, 300)
  })
}

async function hablarUnaFrase(texto: string): Promise<'tts' | 'fallback'> {
  try {
    const blob = await fetchAudioTts(texto)
    if (canceladoGlobal) return 'tts'
    await reproducirBlob(blob)
    return 'tts'
  } catch {
    if (canceladoGlobal) return 'fallback'
    await hablarConSpeechSynthesis(texto)
    return 'fallback'
  }
}

export type MotivoFinVoz = 'fin' | 'cancelado' | 'error'

/**
 * Cola de frases con pausas accesibles entre ellas.
 * Mutex: cancela cualquier cola/TTS anterior antes de empezar.
 * Devuelve `cancelar` (alias de parar acotado a esta cola).
 */
export function hablarCola(
  frases: string[],
  opts?: {
    onInicio?: () => void
    onFin?: (motivo: MotivoFinVoz) => void
  }
): { cancelar: () => void } {
  // Una sola voz: corta lo que hubiera (ayuda no solapa con audioguía).
  parar()

  const miSesion = ++sesionHabla
  let cancelado = false
  let finNotificado = false
  let indice = 0

  const notificarFin = (motivo: MotivoFinVoz) => {
    if (finNotificado) return
    finNotificado = true
    if (sesionHabla === miSesion) ocupado = false
    opts?.onFin?.(motivo)
  }

  const cancelar = () => {
    if (cancelado) return
    cancelado = true
    if (sesionHabla === miSesion) {
      parar()
    }
    notificarFin('cancelado')
  }

  const limpias = frases.map((f) => f.trim()).filter(Boolean)
  if (limpias.length === 0 || !vozNaturalDisponible()) {
    notificarFin('error')
    return { cancelar: () => undefined }
  }

  canceladoGlobal = false
  ocupado = true
  opts?.onInicio?.()

  const siguiente = async () => {
    if (cancelado || canceladoGlobal || sesionHabla !== miSesion) {
      notificarFin('cancelado')
      return
    }
    if (indice >= limpias.length) {
      notificarFin('fin')
      return
    }

    const texto = limpias[indice]
    indice += 1

    try {
      await hablarUnaFrase(texto)
    } catch {
      if (!cancelado && !canceladoGlobal && sesionHabla === miSesion) {
        notificarFin('error')
        return
      }
    }

    if (cancelado || canceladoGlobal || sesionHabla !== miSesion) {
      notificarFin('cancelado')
      return
    }

    if (indice >= limpias.length) {
      notificarFin('fin')
      return
    }

    timerCola = setTimeout(() => {
      timerCola = null
      void siguiente()
    }, PAUSA_ENTRE_FRASES_MS)
  }

  void siguiente()

  return { cancelar }
}
