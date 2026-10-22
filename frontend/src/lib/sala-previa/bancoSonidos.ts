/**
 * Banco de grabaciones reales CC0 para las distracciones de la sala
 * (ver public/sala-previa/CREDITOS.txt). Contexto WebAudio propio, con limitador
 * en el master para que los golpes suenen fuertes sin saturar.
 */

const BASE = '/sala-previa/audio/distracciones/'

export const MUESTRAS = {
  boli: ['boli-cae-1', 'boli-cae-2'],
  tos: ['tos-hombre-1', 'tos-hombre-2', 'tos-hombre-3', 'tos-mujer-1', 'tos-mujer-2'],
  carraspeo: ['carraspeo-1', 'carraspeo-2', 'carraspeo-3'],
  estornudo: ['estornudo-1', 'estornudo-2', 'estornudo-mujer'],
  papeles: ['papeles-1', 'papeles-2', 'papeles-3'],
  telefono: ['telefono-1', 'telefono-2'],
  vibracion: ['vibracion-1', 'vibracion-2'],
  puertaAbre: ['puerta-abre', 'puerta-cruje'],
  puertaAbreCierra: ['puerta-abre-cierra'],
  portazo: ['portazo-1', 'portazo-2'],
  llaves: ['llaves-1', 'llaves-2', 'llaves-3'],
  sillaArrastra: ['silla-arrastra-1', 'silla-arrastra-2'],
  sillaCruje: ['silla-cruje'],
  pasos: ['pasos'],
  susurros: ['susurros-1', 'susurros-2'],
  shh: ['shh-1', 'shh-2'],
  cremallera: ['cremallera-1', 'cremallera-2'],
  botella: ['botella-abre', 'botella-cae', 'botella-tapon'],
} as const satisfies Record<string, readonly string[]>

export type GrupoSonido = keyof typeof MUESTRAS

export interface OpcionesToque {
  /** Segundos de retraso desde ahora. */
  en?: number
  /** 0..1.2 sobre el nivel normalizado de la muestra. */
  volumen?: number
  /** -1 izquierda … 1 derecha. Si falta, se elige al azar. */
  pan?: number
  /** Índice fijo de variante; si falta, al azar sin repetir la última. */
  variante?: number
}

/** Margen para que una muestra que tarda en cargar no suene fuera de sitio. */
const MAX_RETRASO_CARGA = 1.2

class BancoSonidos {
  private ctx: AudioContext | null = null
  private bus: GainNode | null = null
  private buffers = new Map<string, Promise<AudioBuffer | null>>()
  private activas = new Set<AudioScheduledSourceNode>()
  private ruido: AudioBuffer | null = null
  private ultima = new Map<GrupoSonido, number>()
  private generacion = 0
  private escuchandoGesto = false

  /** Crea o reanuda el contexto. Llamar desde un gesto del usuario cuando se pueda. */
  desbloquear() {
    if (typeof window === 'undefined') return
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      this.ctx = new Ctor()
      const limitador = this.ctx.createDynamicsCompressor()
      limitador.threshold.value = -6
      limitador.knee.value = 4
      limitador.ratio.value = 12
      limitador.attack.value = 0.002
      limitador.release.value = 0.15
      this.bus = this.ctx.createGain()
      this.bus.gain.value = 1
      this.bus.connect(limitador)
      limitador.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume().catch(() => {})
    this.escucharGestos()
  }

  /** Si el contexto nació fuera de un gesto (autoplay), se reanuda en el siguiente toque o tecla. */
  private escucharGestos() {
    if (this.escuchandoGesto || typeof window === 'undefined') return
    this.escuchandoGesto = true
    const reanudar = () => {
      if (this.ctx?.state === 'suspended') void this.ctx.resume().catch(() => {})
    }
    for (const ev of ['pointerdown', 'keydown', 'touchend'] as const) {
      window.addEventListener(ev, reanudar, { passive: true })
    }
  }

  precargar() {
    this.desbloquear()
    for (const lista of Object.values(MUESTRAS)) for (const n of lista) void this.buffer(n)
  }

  private buffer(nombre: string): Promise<AudioBuffer | null> {
    const ctx = this.ctx
    if (!ctx) return Promise.resolve(null)
    let p = this.buffers.get(nombre)
    if (!p) {
      p = fetch(`${BASE}${nombre}.mp3`)
        .then((r) => {
          if (!r.ok) throw new Error(nombre)
          return r.arrayBuffer()
        })
        .then((raw) => ctx.decodeAudioData(raw))
        .catch(() => {
          this.buffers.delete(nombre)
          return null
        })
      this.buffers.set(nombre, p)
    }
    return p
  }

  private elegir(grupo: GrupoSonido, fija?: number): string {
    const lista = MUESTRAS[grupo]
    if (fija != null) return lista[fija % lista.length]
    let i = Math.floor(Math.random() * lista.length)
    if (lista.length > 1 && i === this.ultima.get(grupo)) i = (i + 1) % lista.length
    this.ultima.set(grupo, i)
    return lista[i]
  }

  tocar(grupo: GrupoSonido, opciones: OpcionesToque = {}) {
    this.desbloquear()
    const ctx = this.ctx
    if (!ctx || !this.bus) return
    const gen = this.generacion
    const pedido = ctx.currentTime
    const objetivo = pedido + Math.max(0, opciones.en ?? 0)
    const nombre = this.elegir(grupo, opciones.variante)
    void this.buffer(nombre).then((buf) => {
      if (!buf || !this.bus || gen !== this.generacion) return
      const ahora = ctx.currentTime
      if (ahora - objetivo > MAX_RETRASO_CARGA) return
      const src = ctx.createBufferSource()
      src.buffer = buf
      src.playbackRate.value = 0.92 + Math.random() * 0.16
      const g = ctx.createGain()
      const vol = Math.max(0, Math.min(1.2, opciones.volumen ?? 1))
      g.gain.value = vol * (0.85 + Math.random() * 0.15)
      const pan = opciones.pan ?? (Math.random() * 2 - 1) * 0.75
      let salida: AudioNode = g
      if (typeof ctx.createStereoPanner === 'function') {
        const p = ctx.createStereoPanner()
        p.pan.value = Math.max(-1, Math.min(1, pan))
        g.connect(p)
        salida = p
      }
      salida.connect(this.bus)
      src.connect(g)
      this.activas.add(src)
      src.onended = () => {
        this.activas.delete(src)
        salida.disconnect()
      }
      src.start(Math.max(ahora, objetivo))
    })
  }

  private arrancar(fuentes: AudioScheduledSourceNode[], salida: AudioNode, t0: number, t1: number) {
    fuentes.forEach((f, i) => {
      this.activas.add(f)
      f.onended = () => {
        this.activas.delete(f)
        if (i === 0) salida.disconnect()
      }
      f.start(t0)
      f.stop(t1)
    })
  }

  /** Zumbido grave de fluorescente (red de 50 Hz → 100 Hz), bajito y con entrada y salida suaves. */
  zumbido({ en = 0, duracion = 4, volumen = 1 }: { en?: number; duracion?: number; volumen?: number } = {}) {
    this.desbloquear()
    const ctx = this.ctx
    if (!ctx || !this.bus) return
    const t0 = ctx.currentTime + Math.max(0, en)
    const t1 = t0 + Math.max(1.5, duracion)
    const pico = 0.07 * Math.max(0, Math.min(1.2, volumen))
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t0)
    g.gain.linearRampToValueAtTime(pico, t0 + 0.9)
    g.gain.setValueAtTime(pico, t1 - 1.1)
    g.gain.linearRampToValueAtTime(0, t1)
    const filtro = ctx.createBiquadFilter()
    filtro.type = 'lowpass'
    filtro.frequency.value = 650
    filtro.connect(g)
    g.connect(this.bus)
    const parciales: [number, OscillatorType, number][] = [
      [100, 'sawtooth', 0.55],
      [200, 'sine', 0.45],
      [300, 'sine', 0.15],
    ]
    const fuentes = parciales.map(([f, tipo, a]) => {
      const osc = ctx.createOscillator()
      osc.type = tipo
      osc.frequency.value = f
      const og = ctx.createGain()
      og.gain.value = a
      osc.connect(og)
      og.connect(filtro)
      return osc
    })
    this.arrancar(fuentes, g, t0, t1 + 0.05)
  }

  /** Persiana de lamas bajando: roce filtrado con un traqueteo suave y un tope final. */
  persiana({ en = 0, duracion = 2.6, volumen = 1 }: { en?: number; duracion?: number; volumen?: number } = {}) {
    this.desbloquear()
    const ctx = this.ctx
    if (!ctx || !this.bus) return
    if (!this.ruido) {
      const n = Math.floor(ctx.sampleRate * 2)
      this.ruido = ctx.createBuffer(1, n, ctx.sampleRate)
      const datos = this.ruido.getChannelData(0)
      for (let i = 0; i < n; i++) datos[i] = Math.random() * 2 - 1
    }
    const v = Math.max(0, Math.min(1.2, volumen))
    const t0 = ctx.currentTime + Math.max(0, en)
    const t1 = t0 + duracion

    const roce = ctx.createBufferSource()
    roce.buffer = this.ruido
    roce.loop = true
    const banda = ctx.createBiquadFilter()
    banda.type = 'bandpass'
    banda.frequency.value = 2400
    banda.Q.value = 1.1
    const traqueteo = ctx.createGain()
    traqueteo.gain.value = 0.55
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 16
    const lfoG = ctx.createGain()
    lfoG.gain.value = 0.45
    lfo.connect(lfoG)
    lfoG.connect(traqueteo.gain)
    const env = ctx.createGain()
    const pico = 0.16 * v
    env.gain.setValueAtTime(0, t0)
    env.gain.linearRampToValueAtTime(pico, t0 + 0.25)
    env.gain.setValueAtTime(pico, t1 - 0.4)
    env.gain.linearRampToValueAtTime(0, t1)
    roce.connect(banda)
    banda.connect(traqueteo)
    traqueteo.connect(env)
    env.connect(this.bus)
    this.arrancar([roce, lfo], env, t0, t1 + 0.05)

    const tope = ctx.createBufferSource()
    tope.buffer = this.ruido
    const grave = ctx.createBiquadFilter()
    grave.type = 'lowpass'
    grave.frequency.value = 900
    const golpe = ctx.createGain()
    golpe.gain.setValueAtTime(0.28 * v, t1)
    golpe.gain.exponentialRampToValueAtTime(0.001, t1 + 0.12)
    tope.connect(grave)
    grave.connect(golpe)
    golpe.connect(this.bus)
    this.arrancar([tope], golpe, t1, t1 + 0.15)
  }

  /** Corta lo que suena y lo pendiente (modo calma, salir de la sala). */
  cancelar() {
    this.generacion += 1
    for (const src of this.activas) {
      try {
        src.stop()
      } catch {
        // Ya había terminado.
      }
    }
    this.activas.clear()
  }
}

let banco: BancoSonidos | null = null

export function bancoSonidos(): BancoSonidos {
  if (!banco) banco = new BancoSonidos()
  return banco
}
