/**
 * Wrapper calmado sobre Web Speech API (SpeechRecognition / webkit).
 * No lanza si no existe: el llamador muestra fallback accesible.
 */

export type ResultadoReconocimiento = {
  texto: string
  final: boolean
}

export type ControlesReconocimiento = {
  iniciar: () => void
  parar: () => void
  disponible: boolean
}

type SpeechRecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((ev: SpeechRecognitionEventLike) => void) | null
  onerror: ((ev: { error: string }) => void) | null
  onend: (() => void) | null
}

type SpeechRecognitionEventLike = {
  resultIndex: number
  results: ArrayLike<{
    isFinal: boolean
    0: { transcript: string }
  }>
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function obtenerCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as Window & {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function reconocimientoVozDisponible(): boolean {
  return obtenerCtor() !== null
}

/**
 * Crea una sesión de reconocimiento en español.
 * `continuous=false` = una frase por gesto (mejor para pedidos cortos).
 */
export function crearReconocimiento(opts: {
  onResultado: (r: ResultadoReconocimiento) => void
  onError?: (mensaje: string) => void
  onFin?: () => void
  continuous?: boolean
}): ControlesReconocimiento {
  const Ctor = obtenerCtor()
  if (!Ctor) {
    return {
      disponible: false,
      iniciar: () => undefined,
      parar: () => undefined,
    }
  }

  let activo = false
  const rec = new Ctor()
  rec.lang = 'es-ES'
  rec.continuous = opts.continuous ?? false
  rec.interimResults = true
  rec.maxAlternatives = 1

  rec.onresult = (ev) => {
    let texto = ''
    let final = false
    for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
      const item = ev.results[i]
      texto += item[0].transcript
      if (item.isFinal) final = true
    }
    opts.onResultado({ texto: texto.trim(), final })
  }

  rec.onerror = (ev) => {
    activo = false
    if (ev.error === 'aborted' || ev.error === 'no-speech') {
      opts.onFin?.()
      return
    }
    opts.onError?.(
      ev.error === 'not-allowed'
        ? 'Necesito permiso de micrófono para escucharte.'
        : 'No he podido oírte. Puedes usar los botones o tu lector de pantalla.'
    )
  }

  rec.onend = () => {
    activo = false
    opts.onFin?.()
  }

  return {
    disponible: true,
    iniciar: () => {
      if (activo) return
      try {
        activo = true
        rec.start()
      } catch {
        activo = false
        opts.onError?.(
          'No he podido iniciar el micrófono. Prueba otra vez o usa los botones.'
        )
      }
    },
    parar: () => {
      try {
        rec.stop()
      } catch {
        /* ignore */
      }
      activo = false
    },
  }
}
