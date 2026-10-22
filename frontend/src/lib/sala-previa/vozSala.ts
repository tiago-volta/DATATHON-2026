/**
 * Voces de la sala con speechSynthesis (es-ES). El backend no tiene TTS propio.
 * Cada rol tiene preferencias estables; si hay pocas voces, se distingue por tono y ritmo.
 */

import type { Hablante } from './declaracion'

export type GeneroVoz = 'mujer' | 'hombre'

interface PreferenciaRol {
  genero: GeneroVoz
  /** Nombres de voz preferidos (minúsculas, sin acentos en la comparación). */
  preferidas: string[]
  pitch: number
  rate: number
  /** Desempate entre voces del mismo género cuando hay varias. */
  slot: number
}

/** Preferencias estables por hablante: voz + pitch/rate de respaldo. */
export const PREFS_VOZ: Record<Hablante, PreferenciaRol> = {
  jueza: {
    genero: 'mujer',
    preferidas: ['helena', 'elvira', 'lucia', 'lucía', 'sabina'],
    pitch: 1.0,
    rate: 0.9,
    slot: 0,
  },
  defensa: {
    genero: 'mujer',
    preferidas: ['laura', 'monica', 'mónica', 'paulina', 'irene'],
    pitch: 1.14,
    rate: 0.96,
    slot: 1,
  },
  laj: {
    genero: 'hombre',
    preferidas: ['pablo', 'jorge', 'dario', 'darío'],
    pitch: 0.86,
    rate: 0.86,
    slot: 0,
  },
  fiscal: {
    genero: 'hombre',
    preferidas: ['diego', 'enrique', 'raul', 'raúl'],
    pitch: 0.96,
    rate: 0.94,
    slot: 1,
  },
  acusacion: {
    genero: 'hombre',
    preferidas: ['alvaro', 'álvaro', 'antonio', 'manuel'],
    pitch: 1.1,
    rate: 1.0,
    slot: 2,
  },
}

const PISTAS_MUJER = ['helena', 'laura', 'elvira', 'lucia', 'lucía', 'monica', 'mónica', 'paulina', 'irene', 'sabina', 'female', 'mujer', 'zira', 'susan']
const PISTAS_HOMBRE = ['pablo', 'alvaro', 'álvaro', 'jorge', 'diego', 'enrique', 'raul', 'raúl', 'antonio', 'manuel', 'dario', 'darío', 'male', 'hombre', 'david', 'mark']

function sintetizador(): SpeechSynthesis | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  return window.speechSynthesis
}

export function hayVoz(): boolean {
  return sintetizador() !== null
}

function sinAcentos(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
}

function vocesEspanol(): SpeechSynthesisVoice[] {
  const synth = sintetizador()
  if (!synth) return []
  const todas = synth.getVoices()
  const esEs = todas.filter((v) => v.lang.toLowerCase().startsWith('es-es'))
  if (esEs.length > 0) return esEs
  const es = todas.filter((v) => v.lang.toLowerCase().startsWith('es'))
  return es.length > 0 ? es : todas
}

function pareceMujer(v: SpeechSynthesisVoice): boolean {
  const n = sinAcentos(v.name)
  if (PISTAS_HOMBRE.some((p) => n.includes(sinAcentos(p)))) return false
  if (PISTAS_MUJER.some((p) => n.includes(sinAcentos(p)))) return true
  // Sin pista clara: en Windows/Chrome las voces es-ES suelen ir en orden estable.
  return false
}

function vocesPorGenero(genero: GeneroVoz): SpeechSynthesisVoice[] {
  const voces = vocesEspanol()
  const filtradas = voces.filter((v) => (genero === 'mujer' ? pareceMujer(v) : !pareceMujer(v)))
  return filtradas.length > 0 ? filtradas : voces
}

function elegirVozRol(rol: Hablante): SpeechSynthesisVoice | undefined {
  const prefs = PREFS_VOZ[rol]
  const candidatas = vocesPorGenero(prefs.genero)
  if (candidatas.length === 0) return undefined

  for (const nombre of prefs.preferidas) {
    const clave = sinAcentos(nombre)
    const hit = candidatas.find((v) => sinAcentos(v.name).includes(clave))
    if (hit) return hit
  }

  // Reparte voces distintas por slot para que fiscal ≠ laj ≠ acusación.
  return candidatas[prefs.slot % candidatas.length]
}

/** Algunos navegadores cargan las voces tarde: pedirlas pronto evita la primera frase muda. */
export function precargarVoces() {
  const synth = sintetizador()
  if (!synth) return
  synth.getVoices()
  synth.addEventListener?.('voiceschanged', () => synth.getVoices(), { once: true })
}

export interface OpcionesHablar {
  /** Preferido: voz distinta por rol de la sala. */
  rol?: Hablante
  /** Compatibilidad: si no hay rol, elige por género. */
  genero?: GeneroVoz
  tono?: number
  velocidad?: number
  onFin?: () => void
}

function elegirVozLegacy(genero: GeneroVoz): SpeechSynthesisVoice | undefined {
  const voces = vocesPorGenero(genero)
  const pistas = genero === 'mujer' ? PISTAS_MUJER : PISTAS_HOMBRE
  const porNombre = voces.find((v) => pistas.some((p) => sinAcentos(v.name).includes(sinAcentos(p))))
  return porNombre ?? voces[0]
}

/** Habla una frase. Si no hay voz o falla, llama a onFin igualmente para no bloquear el turno. */
export function hablar(texto: string, opts: OpcionesHablar) {
  const { rol, genero = 'mujer', onFin } = opts
  const synth = sintetizador()
  if (!synth) {
    onFin?.()
    return
  }
  try {
    const prefs = rol ? PREFS_VOZ[rol] : null
    const u = new SpeechSynthesisUtterance(texto)
    u.lang = 'es-ES'
    const voz = rol ? elegirVozRol(rol) : elegirVozLegacy(genero)
    if (voz) u.voice = voz
    u.pitch = opts.tono ?? prefs?.pitch ?? 1
    u.rate = opts.velocidad ?? prefs?.rate ?? 0.92
    u.onend = () => onFin?.()
    u.onerror = () => onFin?.()
    synth.speak(u)
  } catch {
    onFin?.()
  }
}

/** Atajo: habla con la voz del rol (jueza, fiscal, defensa…). */
export function hablarComo(rol: Hablante, texto: string, onFin?: () => void) {
  hablar(texto, { rol, onFin })
}

export function callar() {
  sintetizador()?.cancel()
}
