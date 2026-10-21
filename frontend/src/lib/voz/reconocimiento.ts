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

export type EstadoPermisoMicrofono =
  | 'concedido'
  | 'denegado'
  | 'no-soportado'
  | 'desconocido'

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
  onspeechstart: (() => void) | null
  onaudiostart: (() => void) | null
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
 * Pide permiso de micrófono de forma clara (getUserMedia).
 * Cierra el stream al instante: solo sirve para el prompt del navegador.
 */
export async function pedirPermisoMicrofono(): Promise<EstadoPermisoMicrofono> {
  if (typeof window === 'undefined') return 'no-soportado'
  const md = navigator.mediaDevices
  if (!md?.getUserMedia) {
    // Sin getUserMedia: el permiso puede salir al iniciar SpeechRecognition.
    return reconocimientoVozDisponible() ? 'desconocido' : 'no-soportado'
  }
  try {
    const stream = await md.getUserMedia({ audio: true })
    stream.getTracks().forEach((t) => t.stop())
    return 'concedido'
  } catch (err) {
    const name =
      err && typeof err === 'object' && 'name' in err
        ? String((err as { name: string }).name)
        : ''
    if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
      return 'denegado'
    }
    if (name === 'NotFoundError') return 'no-soportado'
    return 'denegado'
  }
}

export const MENSAJE_MIC_DENEGADO =
  'No hay permiso de micrófono. Puedes seguir con los botones, el teclado o tu lector de pantalla.'

/**
 * Crea una sesión de reconocimiento en español.
 * `continuous=false` = una frase por gesto (mejor para pedidos cortos).
 * `onHablaUsuario`: barge-in — parar TTS en cuanto detecta voz (speechstart o primer resultado).
 */
export function crearReconocimiento(opts: {
  onResultado: (r: ResultadoReconocimiento) => void
  onError?: (mensaje: string) => void
  onFin?: () => void
  /** Se dispara al detectar voz del usuario (para cortar síntesis al instante). */
  onHablaUsuario?: () => void
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
  let yaAvisoHabla = false
  const rec = new Ctor()
  rec.lang = 'es-ES'
  rec.continuous = opts.continuous ?? false
  rec.interimResults = true
  rec.maxAlternatives = 1

  const avisarHabla = () => {
    if (yaAvisoHabla) return
    yaAvisoHabla = true
    opts.onHablaUsuario?.()
  }

  rec.onspeechstart = () => {
    avisarHabla()
  }

  rec.onresult = (ev) => {
    let texto = ''
    let final = false
    for (let i = ev.resultIndex; i < ev.results.length; i += 1) {
      const item = ev.results[i]
      texto += item[0].transcript
      if (item.isFinal) final = true
    }
    if (texto.trim()) avisarHabla()
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
        ? MENSAJE_MIC_DENEGADO
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
        yaAvisoHabla = false
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
