import type { Distraccion } from './distracciones'

const MAX_GAIN = 0.5

/**
 * Sonidos cortos sintetizados (WebAudio) para las distracciones de la sala 3D.
 * Contexto propio para no tocar la mezcla del ambiente; se crea tras un gesto.
 */
export class SonidosDistraccion {
  private ctx: AudioContext | null = null
  private salida: GainNode | null = null
  private timers: number[] = []

  preparar() {
    if (typeof window === 'undefined') return
    if (!this.ctx) {
      const Ctor =
        window.AudioContext ??
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) return
      this.ctx = new Ctor()
      this.salida = this.ctx.createGain()
      this.salida.gain.value = MAX_GAIN
      this.salida.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume()
  }

  cancelar() {
    for (const t of this.timers) window.clearTimeout(t)
    this.timers = []
  }

  cerrar() {
    this.cancelar()
    void this.ctx?.close()
    this.ctx = null
    this.salida = null
  }

  reproducir(d: Distraccion, volumen: number) {
    if (d.silenciosa) return
    const v = Math.max(0.05, Math.min(1, volumen))
    const dur = d.duracion
    switch (d.tipo) {
      case 'entra-persona':
        this.puerta(0, v * 0.7)
        this.pasos(0.9, 6, 0.5, v * 0.6)
        this.puerta(dur - 1.4, v * 0.5)
        if (d.variante === 0) this.crujido(dur - 2.6, v * 0.5)
        break
      case 'habla-fondo':
        this.voz(0.5, d.frase ?? 'Ya queda poco.', v * 0.35, 1.05)
        break
      case 'movil':
        this.vibracion(0.3, v)
        this.vibracion(1.5, v)
        break
      case 'tos':
        this.tos(0.4, v)
        break
      case 'boligrafo':
        for (let i = 0; i < 5; i++) this.clic(0.3 + i * 0.32 + Math.random() * 0.08, v)
        break
      case 'papeles':
        this.papeles(0.3, v)
        this.papeles(1.4, v * 0.8)
        break
      case 'levanta-sienta':
        this.crujido(0.3, v * 0.7)
        this.crujido(dur - 1, v * 0.6)
        break
      case 'cruza-agente':
        this.pasos(0.2, 11, 0.55, v * 0.55)
        break
      case 'silla-cruje':
        this.crujido(0.2, v)
        break
      case 'portazo':
        this.golpe(0.7, v)
        break
      case 'agente-postura':
        this.pasos(0.6, 2, 0.5, v * 0.45)
        break
      case 'acompanante-susurra':
        this.voz(0.4, d.frase ?? 'Estoy aquí contigo.', v * 0.3, 0.9)
        break
      case 'abogado-susurra':
        this.voz(0.4, d.frase ?? 'Vamos bien.', v * 0.3, 0.95)
        break
      default:
        break
    }
  }

  private en(seg: number, fn: () => void) {
    this.timers.push(window.setTimeout(fn, Math.max(0, seg * 1000)))
  }

  private ruido(segundos: number): AudioBufferSourceNode | null {
    if (!this.ctx) return null
    const n = Math.max(1, Math.floor(this.ctx.sampleRate * segundos))
    const buffer = this.ctx.createBuffer(1, n, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < n; i++) data[i] = Math.random() * 2 - 1
    const src = this.ctx.createBufferSource()
    src.buffer = buffer
    return src
  }

  private envolvente(
    t0: number,
    pico: number,
    ataque: number,
    caida: number
  ): GainNode | null {
    if (!this.ctx || !this.salida) return null
    const g = this.ctx.createGain()
    g.gain.setValueAtTime(0.0001, t0)
    g.gain.linearRampToValueAtTime(Math.max(0.0002, pico), t0 + ataque)
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + ataque + caida)
    g.connect(this.salida)
    return g
  }

  private ruidoFiltrado(
    seg: number,
    tipo: BiquadFilterType,
    freq: number,
    q: number,
    pico: number,
    ataque: number,
    caida: number
  ) {
    if (!this.ctx) return
    const t0 = this.ctx.currentTime + seg
    const src = this.ruido(ataque + caida + 0.05)
    const g = this.envolvente(t0, pico, ataque, caida)
    if (!src || !g) return
    const f = this.ctx.createBiquadFilter()
    f.type = tipo
    f.frequency.value = freq
    f.Q.value = q
    src.connect(f)
    f.connect(g)
    src.start(t0)
    src.stop(t0 + ataque + caida + 0.05)
  }

  private puerta(seg: number, v: number) {
    if (!this.ctx) return
    const t0 = this.ctx.currentTime + seg
    const osc = this.ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(140, t0)
    osc.frequency.linearRampToValueAtTime(95, t0 + 0.7)
    const f = this.ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 520
    f.Q.value = 6
    const g = this.envolvente(t0, 0.05 * v, 0.15, 0.6)
    if (!g) return
    osc.connect(f)
    f.connect(g)
    osc.start(t0)
    osc.stop(t0 + 0.8)
    this.ruidoFiltrado(seg + 0.75, 'lowpass', 380, 1, 0.12 * v, 0.01, 0.18)
  }

  private golpe(seg: number, v: number) {
    this.ruidoFiltrado(seg, 'lowpass', 260, 0.8, 0.32 * v, 0.005, 0.45)
    this.ruidoFiltrado(seg + 0.02, 'bandpass', 900, 2, 0.08 * v, 0.005, 0.2)
  }

  private pasos(seg: number, n: number, cada: number, v: number) {
    for (let i = 0; i < n; i++) {
      this.ruidoFiltrado(
        seg + i * cada + Math.random() * 0.05,
        'lowpass',
        320 + Math.random() * 80,
        1,
        0.1 * v,
        0.008,
        0.12
      )
    }
  }

  private vibracion(seg: number, v: number) {
    if (!this.ctx) return
    for (const off of [0, 0.28]) {
      const t0 = this.ctx.currentTime + seg + off
      const osc = this.ctx.createOscillator()
      osc.type = 'square'
      osc.frequency.value = 160
      const f = this.ctx.createBiquadFilter()
      f.type = 'lowpass'
      f.frequency.value = 400
      const g = this.envolvente(t0, 0.035 * v, 0.03, 0.2)
      if (!g) return
      osc.connect(f)
      f.connect(g)
      osc.start(t0)
      osc.stop(t0 + 0.25)
    }
  }

  private tos(seg: number, v: number) {
    this.ruidoFiltrado(seg, 'bandpass', 700, 1.2, 0.22 * v, 0.02, 0.22)
    this.ruidoFiltrado(seg + 0.32, 'bandpass', 620, 1.2, 0.16 * v, 0.02, 0.2)
  }

  private clic(seg: number, v: number) {
    this.ruidoFiltrado(seg, 'highpass', 3200, 1, 0.12 * v, 0.001, 0.025)
  }

  private papeles(seg: number, v: number) {
    this.ruidoFiltrado(seg, 'highpass', 2400, 0.7, 0.05 * v, 0.12, 0.5)
  }

  private crujido(seg: number, v: number) {
    if (!this.ctx) return
    const t0 = this.ctx.currentTime + seg
    const osc = this.ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(70, t0)
    osc.frequency.linearRampToValueAtTime(120, t0 + 0.35)
    const f = this.ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 900
    f.Q.value = 9
    const g = this.envolvente(t0, 0.06 * v, 0.05, 0.35)
    if (!g) return
    osc.connect(f)
    f.connect(g)
    osc.start(t0)
    osc.stop(t0 + 0.45)
  }

  private murmullo(seg: number, v: number) {
    if (!this.ctx) return
    const t0 = this.ctx.currentTime + seg
    const src = this.ruido(1.8)
    const g = this.envolvente(t0, 0.07 * v, 0.25, 1.4)
    if (!src || !g) return
    const f = this.ctx.createBiquadFilter()
    f.type = 'bandpass'
    f.frequency.value = 480
    f.Q.value = 3
    const lfo = this.ctx.createOscillator()
    const lfoG = this.ctx.createGain()
    lfo.frequency.value = 4.5
    lfoG.gain.value = 0.5
    const mod = this.ctx.createGain()
    mod.gain.value = 0.5
    lfo.connect(lfoG)
    lfoG.connect(mod.gain)
    src.connect(f)
    f.connect(mod)
    mod.connect(g)
    src.start(t0)
    lfo.start(t0)
    src.stop(t0 + 1.8)
    lfo.stop(t0 + 1.8)
  }

  private voz(seg: number, frase: string, v: number, tono: number) {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
    if (!synth || synth.speaking || synth.pending) {
      this.murmullo(seg, v * 2)
      return
    }
    this.en(seg, () => {
      if (synth.speaking || synth.pending) {
        this.murmullo(0, v * 2)
        return
      }
      try {
        const u = new SpeechSynthesisUtterance(frase)
        u.lang = 'es-ES'
        u.volume = Math.max(0.08, Math.min(0.4, v))
        u.rate = 0.95
        u.pitch = tono
        synth.speak(u)
      } catch {
        this.murmullo(0, v * 2)
      }
    })
  }
}
