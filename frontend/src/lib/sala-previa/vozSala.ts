/**
 * Voces de la sala con speechSynthesis (es-ES). El backend no tiene TTS propio.
 * Si el navegador no tiene voz, la simulación sigue igual con subtítulos.
 */

export type GeneroVoz = 'mujer' | 'hombre'

const PISTAS_MUJER = ['helena', 'laura', 'elvira', 'lucia', 'lucía', 'monica', 'mónica', 'paulina', 'female', 'mujer']
const PISTAS_HOMBRE = ['pablo', 'alvaro', 'álvaro', 'jorge', 'diego', 'enrique', 'male', 'hombre']

function sintetizador(): SpeechSynthesis | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null
  return window.speechSynthesis
}

export function hayVoz(): boolean {
  return sintetizador() !== null
}

function vocesEspanol(): SpeechSynthesisVoice[] {
  const synth = sintetizador()
  if (!synth) return []
  const todas = synth.getVoices()
  const es = todas.filter((v) => v.lang.toLowerCase().startsWith('es-es'))
  return es.length > 0 ? es : todas.filter((v) => v.lang.toLowerCase().startsWith('es'))
}

function elegirVoz(genero: GeneroVoz): SpeechSynthesisVoice | undefined {
  const voces = vocesEspanol()
  const pistas = genero === 'mujer' ? PISTAS_MUJER : PISTAS_HOMBRE
  const porNombre = voces.find((v) => pistas.some((p) => v.name.toLowerCase().includes(p)))
  return porNombre ?? voces[0]
}

/** Algunos navegadores cargan las voces tarde: pedirlas pronto evita la primera frase muda. */
export function precargarVoces() {
  const synth = sintetizador()
  if (!synth) return
  synth.getVoices()
  synth.addEventListener?.('voiceschanged', () => synth.getVoices(), { once: true })
}

export interface OpcionesHablar {
  genero: GeneroVoz
  tono?: number
  velocidad?: number
  onFin?: () => void
}

/** Habla una frase. Si no hay voz o falla, llama a onFin igualmente para no bloquear el turno. */
export function hablar(texto: string, { genero, tono = 1, velocidad = 0.92, onFin }: OpcionesHablar) {
  const synth = sintetizador()
  if (!synth) {
    onFin?.()
    return
  }
  try {
    const u = new SpeechSynthesisUtterance(texto)
    u.lang = 'es-ES'
    const voz = elegirVoz(genero)
    if (voz) u.voice = voz
    u.pitch = tono
    u.rate = velocidad
    u.onend = () => onFin?.()
    u.onerror = () => onFin?.()
    synth.speak(u)
  } catch {
    onFin?.()
  }
}

export function callar() {
  sintetizador()?.cancel()
}
