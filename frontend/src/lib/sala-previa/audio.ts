import type { ValoresEstimulo } from './tipos'

const FADE_NORMAL = 2.2
const FADE_CALMA = 0.9
const CROSSFADE_SEC = 1.6

const RUTAS = {
  ambiente: '/sala-previa/audio/ambiente-sala.mp3',
  murmullosSala: '/sala-previa/audio/murmullos-sala.mp3',
  murmullosGente: '/sala-previa/audio/murmullos-gente.mp3',
} as const

function rampGain(param: AudioParam, value: number, seconds: number, ctx: AudioContext) {
  const now = ctx.currentTime
  param.cancelScheduledValues(now)
  param.setValueAtTime(param.value, now)
  param.linearRampToValueAtTime(Math.max(0.0001, value), now + seconds)
}

/**
 * Loop con crossfade: dos BufferSource solapados para evitar clic
 * y el corte seco de loop=true en ambient/murmullos.
 */
class CapaLoopCrossfade {
  private ctx: AudioContext
  private buffer: AudioBuffer
  private dest: AudioNode
  private activo = false
  private timer: number | null = null
  private generacion = 0

  constructor(ctx: AudioContext, buffer: AudioBuffer, dest: AudioNode) {
    this.ctx = ctx
    this.buffer = buffer
    this.dest = dest
  }

  start() {
    if (this.activo) return
    this.activo = true
    this.generacion += 1
    this.programar(this.ctx.currentTime + 0.02, this.generacion)
  }

  stop() {
    this.activo = false
    this.generacion += 1
    if (this.timer != null) {
      window.clearTimeout(this.timer)
      this.timer = null
    }
  }

  private programar(when: number, gen: number) {
    if (!this.activo || gen !== this.generacion) return

    const dur = this.buffer.duration
    const overlap = Math.min(CROSSFADE_SEC, dur / 3)
    const playLen = Math.max(0.5, dur - overlap)

    const src = this.ctx.createBufferSource()
    const g = this.ctx.createGain()
    src.buffer = this.buffer
    src.connect(g)
    g.connect(this.dest)

    const fadeInEnd = when + overlap
    const fadeOutStart = when + playLen
    const end = when + playLen + overlap

    g.gain.setValueAtTime(0.0001, when)
    g.gain.linearRampToValueAtTime(1, fadeInEnd)
    g.gain.setValueAtTime(1, fadeOutStart)
    g.gain.linearRampToValueAtTime(0.0001, end)

    src.start(when)
    src.stop(end + 0.05)

    const nextWhen = when + playLen
    const ms = Math.max(50, (nextWhen - this.ctx.currentTime) * 1000 - 80)
    this.timer = window.setTimeout(() => {
      this.timer = null
      this.programar(Math.max(this.ctx.currentTime + 0.01, nextWhen), gen)
    }, ms)
  }
}

async function cargarBuffer(ctx: AudioContext, url: string): Promise<AudioBuffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`No se pudo cargar ${url}`)
  const raw = await res.arrayBuffer()
  return await ctx.decodeAudioData(raw.slice(0))
}

/**
 * Motor de audio Sala Previa: samples CC0 en loop con crossfade.
 * El estímulo «ruido» incluye murmullos y voces lejanas (antes repartidos con eco).
 * API pública estable para page.tsx (iniciar / actualizar / volverACalma / detener).
 */
/** Gain master normal vs atenuado mientras habla la audioguía (ducking suave). */
const MASTER_NORMAL = 0.62
const MASTER_CON_VOZ = 0.22

export class MotorAudioSala {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private ambienteGain: GainNode | null = null
  private murmullosSalaGain: GainNode | null = null
  private genteGain: GainNode | null = null
  private impulsosGain: GainNode | null = null
  private capas: CapaLoopCrossfade[] = []
  private impulsosTimer: number | null = null
  private activo = false
  private cargando: Promise<void> | null = null
  private valores: ValoresEstimulo = { ruido: 0, luz: 0, gente: 0 }
  /** True mientras speechSynthesis habla: ambiente más bajo, sin cortarlo. */
  private atenuadoPorVoz = false

  async iniciar() {
    if (typeof window === 'undefined') return
    if (!this.ctx) {
      this.cargando = this.montarGrafo()
    }
    await this.cargando

    if (!this.ctx || !this.master) return
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }

    for (const capa of this.capas) capa.start()
    this.activo = true
    const masterTarget = this.atenuadoPorVoz ? MASTER_CON_VOZ : MASTER_NORMAL
    rampGain(this.master.gain, masterTarget, FADE_NORMAL, this.ctx)
    this.programarImpulsos()
    this.aplicarValores(this.valores, FADE_NORMAL)
  }

  /**
   * Ducking para audioguía: baja el master un poco mientras habla la guía.
   * Menos invasivo que pausar el ambiente (sigue el contexto sonoro, sin solaparse).
   */
  atenuarParaVoz(activo: boolean) {
    this.atenuadoPorVoz = activo
    if (!this.ctx || !this.master || !this.activo) return
    rampGain(
      this.master.gain,
      activo ? MASTER_CON_VOZ : MASTER_NORMAL,
      FADE_CALMA,
      this.ctx
    )
  }

  private async montarGrafo() {
    this.ctx = new AudioContext()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0.0001
    this.master.connect(this.ctx.destination)

    this.ambienteGain = this.ctx.createGain()
    this.ambienteGain.gain.value = 0.0001
    this.murmullosSalaGain = this.ctx.createGain()
    this.murmullosSalaGain.gain.value = 0.0001
    this.genteGain = this.ctx.createGain()
    this.genteGain.gain.value = 0.0001
    this.impulsosGain = this.ctx.createGain()
    this.impulsosGain.gain.value = 0.0001

    this.ambienteGain.connect(this.master)
    this.murmullosSalaGain.connect(this.master)
    this.genteGain.connect(this.master)
    this.impulsosGain.connect(this.master)

    const [bufAmbiente, bufSala, bufGente] = await Promise.all([
      cargarBuffer(this.ctx, RUTAS.ambiente),
      cargarBuffer(this.ctx, RUTAS.murmullosSala),
      cargarBuffer(this.ctx, RUTAS.murmullosGente),
    ])

    this.capas = [
      new CapaLoopCrossfade(this.ctx, bufAmbiente, this.ambienteGain),
      new CapaLoopCrossfade(this.ctx, bufSala, this.murmullosSalaGain),
      new CapaLoopCrossfade(this.ctx, bufGente, this.genteGain),
    ]
  }

  detener(suave = true) {
    if (!this.ctx || !this.master) return
    const dur = suave ? FADE_CALMA : 0.05
    rampGain(this.master.gain, 0.0001, dur, this.ctx)
    this.activo = false
    if (this.impulsosTimer != null) {
      window.clearTimeout(this.impulsosTimer)
      this.impulsosTimer = null
    }
    window.setTimeout(
      () => {
        if (!this.activo) {
          for (const capa of this.capas) capa.stop()
        }
      },
      Math.ceil(dur * 1000) + 50
    )
  }

  volverACalma() {
    this.actualizar(
      { ruido: 0, luz: this.valores.luz * 0.15, gente: 0 },
      FADE_CALMA
    )
  }

  actualizar(valores: ValoresEstimulo, segundos = FADE_NORMAL) {
    this.valores = { ...valores }
    if (!this.activo || !this.ctx) return
    this.aplicarValores(valores, segundos)
  }

  private aplicarValores(valores: ValoresEstimulo, segundos: number) {
    if (
      !this.ctx ||
      !this.ambienteGain ||
      !this.murmullosSalaGain ||
      !this.genteGain ||
      !this.impulsosGain
    ) {
      return
    }

    const r = valores.ruido / 100
    const g = valores.gente / 100

    // Room tone + voces lejanas (antes mezcladas con el estímulo eco).
    rampGain(this.ambienteGain.gain, r * 0.42, segundos, this.ctx)
    rampGain(
      this.murmullosSalaGain.gain,
      Math.min(1, r * 0.7 + g * 0.2) * 0.34,
      segundos,
      this.ctx
    )
    rampGain(
      this.genteGain.gain,
      Math.min(1, g * 0.88 + r * 0.22) * 0.46,
      segundos,
      this.ctx
    )
    rampGain(
      this.impulsosGain.gain,
      Math.max(r, g) * 0.3,
      segundos,
      this.ctx
    )
  }

  private programarImpulsos() {
    if (!this.ctx || !this.impulsosGain) return

    const tick = () => {
      if (!this.activo || !this.ctx || !this.impulsosGain) return
      const intensidad = Math.max(this.valores.ruido, this.valores.gente) / 100
      if (intensidad > 0.12 && Math.random() < 0.45 + intensidad * 0.3) {
        this.dispararPaso()
      }
      if (intensidad > 0.4 && Math.random() < 0.18) {
        this.dispararPuerta()
      }
      const espera = 1600 + Math.random() * (3600 - intensidad * 1400)
      this.impulsosTimer = window.setTimeout(tick, espera)
    }

    this.impulsosTimer = window.setTimeout(tick, 900)
  }

  private dispararPaso() {
    if (!this.ctx || !this.impulsosGain) return
    const now = this.ctx.currentTime
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filtro = this.ctx.createBiquadFilter()
    osc.type = 'triangle'
    osc.frequency.value = 90 + Math.random() * 40
    filtro.type = 'lowpass'
    filtro.frequency.value = 280
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.09, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
    osc.connect(filtro)
    filtro.connect(gain)
    gain.connect(this.impulsosGain)
    osc.start(now)
    osc.stop(now + 0.2)
  }

  private dispararPuerta() {
    if (!this.ctx || !this.impulsosGain) return
    const now = this.ctx.currentTime
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.15)
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }
    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    const filtro = this.ctx.createBiquadFilter()
    filtro.type = 'bandpass'
    filtro.frequency.value = 650
    const gain = this.ctx.createGain()
    gain.gain.value = 0.06
    source.connect(filtro)
    filtro.connect(gain)
    gain.connect(this.impulsosGain)
    source.start(now)
  }

  reproducirPuerta() {
    if (!this.ctx || !this.impulsosGain) return
    const now = this.ctx.currentTime
    // Apertura (creak) + cierre suave
    const osc = this.ctx.createOscillator()
    const gain = this.ctx.createGain()
    const filtro = this.ctx.createBiquadFilter()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(150, now)
    osc.frequency.linearRampToValueAtTime(90, now + 0.55)
    filtro.type = 'bandpass'
    filtro.frequency.value = 500
    filtro.Q.value = 5
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.linearRampToValueAtTime(0.07, now + 0.12)
    gain.gain.linearRampToValueAtTime(0.0001, now + 0.7)
    osc.connect(filtro)
    filtro.connect(gain)
    gain.connect(this.impulsosGain)
    osc.start(now)
    osc.stop(now + 0.75)
    this.dispararPuerta()
  }

  /** Vibración corta de móvil (buzz). */
  reproducirMovil() {
    if (!this.ctx || !this.impulsosGain) return
    const now = this.ctx.currentTime
    for (const offset of [0, 0.28, 1.4, 1.68]) {
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()
      const filtro = this.ctx.createBiquadFilter()
      osc.type = 'square'
      osc.frequency.value = 155
      filtro.type = 'lowpass'
      filtro.frequency.value = 420
      gain.gain.setValueAtTime(0.0001, now + offset)
      gain.gain.linearRampToValueAtTime(0.18, now + offset + 0.03)
      gain.gain.linearRampToValueAtTime(0.0001, now + offset + 0.2)
      osc.connect(filtro)
      filtro.connect(gain)
      gain.connect(this.impulsosGain)
      osc.start(now + offset)
      osc.stop(now + offset + 0.22)
    }
  }

  /** Timbre de móvil (dos tonos), distinto de la vibración. */
  reproducirTimbreMovil() {
    if (!this.ctx || !this.impulsosGain) return
    const now = this.ctx.currentTime
    for (let i = 0; i < 4; i++) {
      const t0 = now + i * 0.55
      for (const freq of [880, 988]) {
        const osc = this.ctx.createOscillator()
        const gain = this.ctx.createGain()
        osc.type = 'sine'
        osc.frequency.value = freq
        gain.gain.setValueAtTime(0.0001, t0)
        gain.gain.linearRampToValueAtTime(0.16, t0 + 0.02)
        gain.gain.linearRampToValueAtTime(0.0001, t0 + 0.3)
        osc.connect(gain)
        gain.connect(this.impulsosGain)
        osc.start(t0)
        osc.stop(t0 + 0.32)
      }
    }
  }

  /** Dos golpes de martillo del juez. */
  reproducirMartillo() {
    if (!this.ctx || !this.impulsosGain) return
    const now = this.ctx.currentTime
    for (const offset of [0, 0.36]) {
      const t0 = now + offset
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.12)
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
      }
      const source = this.ctx.createBufferSource()
      source.buffer = buffer
      const filtro = this.ctx.createBiquadFilter()
      filtro.type = 'lowpass'
      filtro.frequency.value = 280
      const gain = this.ctx.createGain()
      gain.gain.setValueAtTime(0.0001, t0)
      gain.gain.linearRampToValueAtTime(0.14, t0 + 0.008)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.28)
      source.connect(filtro)
      filtro.connect(gain)
      gain.connect(this.impulsosGain)
      source.start(t0)
      source.stop(t0 + 0.3)

      const osc = this.ctx.createOscillator()
      const og = this.ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(170, t0)
      osc.frequency.exponentialRampToValueAtTime(50, t0 + 0.2)
      og.gain.setValueAtTime(0.0001, t0)
      og.gain.linearRampToValueAtTime(0.09, t0 + 0.005)
      og.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22)
      osc.connect(og)
      og.connect(this.impulsosGain)
      osc.start(t0)
      osc.stop(t0 + 0.25)
    }
  }

  /** Aviso sonoro breve (sin síntesis de voz): el nombre se muestra en pantalla. */
  reproducirNombreEnAlto(_nombre = 'Luis García') {
    this.reproducirMartillo()
  }

  reproducirTosMurmullo() {
    if (!this.ctx || !this.impulsosGain) return
    const now = this.ctx.currentTime
    for (const [off, freq, pico] of [
      [0, 720, 0.28],
      [0.3, 600, 0.24],
      [0.55, 680, 0.18],
    ] as const) {
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.22)
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
      }
      const source = this.ctx.createBufferSource()
      source.buffer = buffer
      const filtro = this.ctx.createBiquadFilter()
      filtro.type = 'bandpass'
      filtro.frequency.value = freq
      filtro.Q.value = 1.3
      const gain = this.ctx.createGain()
      const t0 = now + off
      gain.gain.setValueAtTime(0.0001, t0)
      gain.gain.linearRampToValueAtTime(pico, t0 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.2)
      source.connect(filtro)
      filtro.connect(gain)
      gain.connect(this.impulsosGain)
      source.start(t0)
      source.stop(t0 + 0.22)
    }
  }
}

export const CREDITO_AUDIO =
  'Sonido: ambientación y murmullos CC0 (Freesound: callmethefoo, Breviceps, craigsmith).'