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

/** Impulso sintético: sala mediana (eco de pasillo/juzgado), no delay metálico. */
function crearImpulsoReverb(ctx: AudioContext, segundos = 2.4): AudioBuffer {
  const rate = ctx.sampleRate
  const length = Math.floor(rate * segundos)
  const buffer = ctx.createBuffer(2, length, rate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      const t = i / rate
      const env = Math.exp(-t * 2.8) * (1 - i / length)
      // Ruido filtrado por decaimiento + early reflections espaciadas
      let sample = (Math.random() * 2 - 1) * env * 0.55
      if (i === Math.floor(0.018 * rate + ch * 40)) sample += 0.35 * env
      if (i === Math.floor(0.041 * rate + ch * 70)) sample += 0.22 * env
      if (i === Math.floor(0.078 * rate + ch * 55)) sample += 0.14 * env
      data[i] = sample
    }
  }
  return buffer
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
 * Motor de audio Sala Previa: samples CC0 en loop con crossfade + reverb.
 * API pública estable para page.tsx (iniciar / actualizar / volverACalma / detener).
 */
export class MotorAudioSala {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private ambienteGain: GainNode | null = null
  private murmullosSalaGain: GainNode | null = null
  private genteGain: GainNode | null = null
  private ecoWetGain: GainNode | null = null
  private impulsosGain: GainNode | null = null
  private busDry: GainNode | null = null
  private busEcoSend: GainNode | null = null
  private capas: CapaLoopCrossfade[] = []
  private impulsosTimer: number | null = null
  private activo = false
  private cargando: Promise<void> | null = null
  private valores: ValoresEstimulo = { ruido: 0, luz: 0, gente: 0, eco: 0 }

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
    rampGain(this.master.gain, 0.62, FADE_NORMAL, this.ctx)
    this.programarImpulsos()
    this.aplicarValores(this.valores, FADE_NORMAL)
  }

  private async montarGrafo() {
    this.ctx = new AudioContext()
    this.master = this.ctx.createGain()
    this.master.gain.value = 0.0001
    this.master.connect(this.ctx.destination)

    this.busDry = this.ctx.createGain()
    this.busDry.gain.value = 1
    this.busDry.connect(this.master)

    this.busEcoSend = this.ctx.createGain()
    this.busEcoSend.gain.value = 1

    const convolver = this.ctx.createConvolver()
    convolver.buffer = crearImpulsoReverb(this.ctx)
    const ecoFiltro = this.ctx.createBiquadFilter()
    ecoFiltro.type = 'lowpass'
    ecoFiltro.frequency.value = 4200
    this.ecoWetGain = this.ctx.createGain()
    this.ecoWetGain.gain.value = 0.0001

    this.busEcoSend.connect(convolver)
    convolver.connect(ecoFiltro)
    ecoFiltro.connect(this.ecoWetGain)
    this.ecoWetGain.connect(this.master)

    // Early reflection corta (complementa el convolver)
    const early = this.ctx.createDelay(0.5)
    early.delayTime.value = 0.085
    const earlyGain = this.ctx.createGain()
    earlyGain.gain.value = 0.22
    this.busEcoSend.connect(early)
    early.connect(earlyGain)
    earlyGain.connect(this.ecoWetGain)

    this.ambienteGain = this.ctx.createGain()
    this.ambienteGain.gain.value = 0.0001
    this.murmullosSalaGain = this.ctx.createGain()
    this.murmullosSalaGain.gain.value = 0.0001
    this.genteGain = this.ctx.createGain()
    this.genteGain.gain.value = 0.0001
    this.impulsosGain = this.ctx.createGain()
    this.impulsosGain.gain.value = 0.0001

    const conectarCapa = (g: GainNode) => {
      g.connect(this.busDry!)
      g.connect(this.busEcoSend!)
    }
    conectarCapa(this.ambienteGain)
    conectarCapa(this.murmullosSalaGain)
    conectarCapa(this.genteGain)
    this.impulsosGain.connect(this.busDry)
    this.impulsosGain.connect(this.busEcoSend)

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
    // Tras el fade, detener capas para no gastar CPU en silencio.
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
      { ruido: 0, luz: this.valores.luz * 0.15, gente: 0, eco: 0 },
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
      !this.ecoWetGain ||
      !this.impulsosGain
    ) {
      return
    }

    const r = valores.ruido / 100
    const g = valores.gente / 100
    const e = valores.eco / 100

    // Room tone suave con el estímulo ruido (sin soplido de ventilador).
    rampGain(this.ambienteGain.gain, r * 0.38, segundos, this.ctx)
    // Murmullo lejano de sala: sube con ruido y un poco con gente.
    rampGain(
      this.murmullosSalaGain.gain,
      Math.min(1, r * 0.55 + g * 0.25) * 0.28,
      segundos,
      this.ctx
    )
    // Voces/gente: estímulo gente (principal) + algo de ruido alto.
    rampGain(
      this.genteGain.gain,
      Math.min(1, g * 0.85 + r * 0.18) * 0.42,
      segundos,
      this.ctx
    )
    // Wet reverb según eco.
    rampGain(this.ecoWetGain.gain, e * 0.72, segundos, this.ctx)
    rampGain(
      this.impulsosGain.gain,
      Math.max(r, g, e) * 0.28,
      segundos,
      this.ctx
    )
  }

  private programarImpulsos() {
    if (!this.ctx || !this.impulsosGain) return

    const tick = () => {
      if (!this.activo || !this.ctx || !this.impulsosGain) return
      const intensidad =
        Math.max(this.valores.ruido, this.valores.gente, this.valores.eco) / 100
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
}

export const CREDITO_AUDIO =
  'Sonido: ambientación y murmullos CC0 (Freesound: callmethefoo, Breviceps, craigsmith). Eco generado en el navegador.'
