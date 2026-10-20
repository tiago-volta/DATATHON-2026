import type { ValoresEstimulo } from './tipos'

const FADE_NORMAL = 2.2
const FADE_CALMA = 0.9

function crearRuidoRosa(ctx: AudioContext, segundos = 2): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * segundos
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  let b0 = 0
  let b1 = 0
  let b2 = 0
  let b3 = 0
  let b4 = 0
  let b5 = 0
  let b6 = 0

  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.969 * b2 + white * 0.153852
    b3 = 0.8665 * b3 + white * 0.3104856
    b4 = 0.55 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.016898
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
    b6 = white * 0.115926
  }
  return buffer
}

function rampGain(param: AudioParam, value: number, seconds: number, ctx: AudioContext) {
  const now = ctx.currentTime
  param.cancelScheduledValues(now)
  param.setValueAtTime(param.value, now)
  param.linearRampToValueAtTime(Math.max(0.0001, value), now + seconds)
}

/**
 * Capas de audio procedurales (sin archivos externos).
 * Generadas en el navegador con Web Audio API.
 */
export class MotorAudioSala {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private ruidoGain: GainNode | null = null
  private ecoGain: GainNode | null = null
  private impulsosGain: GainNode | null = null
  private ruidoSource: AudioBufferSourceNode | null = null
  private impulsosTimer: number | null = null
  private activo = false
  private valores: ValoresEstimulo = { ruido: 0, luz: 0, gente: 0, eco: 0 }

  async iniciar() {
    if (typeof window === 'undefined') return
    if (!this.ctx) {
      this.ctx = new AudioContext()
      this.master = this.ctx.createGain()
      this.master.gain.value = 0.0001
      this.master.connect(this.ctx.destination)

      this.ruidoGain = this.ctx.createGain()
      this.ruidoGain.gain.value = 0.0001
      this.ecoGain = this.ctx.createGain()
      this.ecoGain.gain.value = 0.0001
      this.impulsosGain = this.ctx.createGain()
      this.impulsosGain.gain.value = 0.0001

      const filtroMurmullo = this.ctx.createBiquadFilter()
      filtroMurmullo.type = 'bandpass'
      filtroMurmullo.frequency.value = 420
      filtroMurmullo.Q.value = 0.7

      const delay = this.ctx.createDelay(1.2)
      delay.delayTime.value = 0.28
      const feedback = this.ctx.createGain()
      feedback.gain.value = 0.35
      const ecoFiltro = this.ctx.createBiquadFilter()
      ecoFiltro.type = 'lowpass'
      ecoFiltro.frequency.value = 900

      this.ruidoGain.connect(filtroMurmullo)
      filtroMurmullo.connect(this.master)

      this.ecoGain.connect(ecoFiltro)
      ecoFiltro.connect(delay)
      delay.connect(feedback)
      feedback.connect(delay)
      delay.connect(this.master)
      ecoFiltro.connect(this.master)

      this.impulsosGain.connect(this.master)

      const buffer = crearRuidoRosa(this.ctx)
      this.ruidoSource = this.ctx.createBufferSource()
      this.ruidoSource.buffer = buffer
      this.ruidoSource.loop = true
      this.ruidoSource.connect(this.ruidoGain)
      this.ruidoSource.connect(this.ecoGain)
      this.ruidoSource.start()
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume()
    }

    this.activo = true
    rampGain(this.master!.gain, 0.55, FADE_NORMAL, this.ctx)
    this.programarImpulsos()
    this.aplicarValores(this.valores, FADE_NORMAL)
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
    if (!this.ctx || !this.ruidoGain || !this.ecoGain || !this.impulsosGain) return
    const r = valores.ruido / 100
    const e = valores.eco / 100
    rampGain(this.ruidoGain.gain, r * 0.22, segundos, this.ctx)
    rampGain(this.ecoGain.gain, e * 0.14, segundos, this.ctx)
    rampGain(this.impulsosGain.gain, Math.max(r, e) * 0.35, segundos, this.ctx)
  }

  private programarImpulsos() {
    if (!this.ctx || !this.impulsosGain) return

    const tick = () => {
      if (!this.activo || !this.ctx || !this.impulsosGain) return
      const intensidad = Math.max(this.valores.ruido, this.valores.eco) / 100
      if (intensidad > 0.12 && Math.random() < 0.55 + intensidad * 0.3) {
        this.dispararPaso()
      }
      if (intensidad > 0.35 && Math.random() < 0.2) {
        this.dispararPuerta()
      }
      const espera = 1400 + Math.random() * (3200 - intensidad * 1200)
      this.impulsosTimer = window.setTimeout(tick, espera)
    }

    this.impulsosTimer = window.setTimeout(tick, 800)
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
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02)
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
    gain.gain.value = 0.08
    source.connect(filtro)
    filtro.connect(gain)
    gain.connect(this.impulsosGain)
    source.start(now)
  }
}

export const CREDITO_AUDIO =
  'Sonido: capas procedurales generadas en el navegador (Web Audio API). Sin muestras de terceros.'
