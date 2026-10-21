import type { Distraccion } from './distracciones'
import { bancoSonidos, type GrupoSonido, type OpcionesToque } from './bancoSonidos'

/**
 * Sonidos de las distracciones de la sala 3D con grabaciones reales CC0.
 * Los tiempos cuadran con las animaciones de SalaVistas3D (progreso 0..1 de `duracion`).
 */
export class SonidosDistraccion {
  private timers: number[] = []
  private hablando = false

  preparar() {
    bancoSonidos().precargar()
  }

  cancelar() {
    for (const t of this.timers) window.clearTimeout(t)
    this.timers = []
    bancoSonidos().cancelar()
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
    if (synth?.speaking && this.hablando) synth.cancel()
    this.hablando = false
  }

  cerrar() {
    this.cancelar()
  }

  reproducir(d: Distraccion, volumen: number) {
    if (d.silenciosa) return
    const v = Math.max(0.1, Math.min(1.2, volumen))
    const dur = d.duracion
    const lado = Math.random() < 0.5 ? -1 : 1
    const t = (grupo: GrupoSonido, en: number, vol = 1, extra: OpcionesToque = {}) =>
      bancoSonidos().tocar(grupo, { en, volumen: v * vol, ...extra })

    switch (d.tipo) {
      case 'entra-persona': {
        const pan = 0.55 * lado
        t('puertaAbre', 0, 1, { pan })
        t('pasos', 1, 0.8, { pan: pan * 0.8 })
        t('pasos', 4.6, 0.7, { pan: pan * 0.4 })
        t('portazo', dur - 1.4, 0.55, { pan, variante: 1 })
        if (d.variante === 0) t('sillaCruje', dur - 2.6, 0.8)
        break
      }
      case 'habla-fondo':
        t('susurros', 0.4, 0.95)
        break
      case 'movil':
        t('vibracion', 0.3, 1)
        break
      case 'timbre-movil':
        t('telefono', 0.2, 1)
        break
      case 'tos':
        t('tos', 0.35, 1)
        if (d.variante === 1) t('tos', 1.3, 0.75)
        break
      case 'carraspeo':
        t('carraspeo', 0.3, 1)
        break
      case 'estornudo':
        t('estornudo', 0.3, 1)
        break
      case 'boli-cae':
        t('boli', 0.3, 1.1)
        break
      case 'llaves-caen':
        t('llaves', 0.3, 1)
        break
      case 'silla-arrastra':
        t('sillaArrastra', 0.2, 1)
        break
      case 'cremallera':
        t('cremallera', 0.3, 1)
        break
      case 'botella':
        t('botella', 0.3, 1)
        break
      case 'papeles':
        t('papeles', 0.2, 1)
        if (d.variante === 1) t('papeles', 1.6, 0.7)
        break
      case 'levanta-sienta':
        t('sillaArrastra', 0.6, 0.9)
        t('sillaCruje', dur - 1.2, 0.8)
        break
      case 'cruza-agente': {
        const pan = 0.6 * lado
        t('pasos', 0.3, 0.9, { pan })
        t('pasos', 3.9, 0.9, { pan: -pan })
        break
      }
      case 'silla-cruje':
        t('sillaCruje', 0.2, 1)
        break
      case 'portazo':
        t('portazo', 0.6, 1.1, { pan: 0.55 * lado, variante: 0 })
        break
      case 'agente-postura':
        t('sillaCruje', 0.5, 0.75, { pan: 0.3 * lado })
        break
      case 'acompanante-susurra':
        this.voz(0.4, d.frase ?? 'Estoy aquí contigo.', 0.85 * v, 0.9)
        break
      case 'abogado-susurra':
        this.voz(0.4, d.frase ?? 'Vamos bien.', 0.85 * v, 0.95)
        break
      case 'martillo':
        t('martillo', 0.25, 1.15, { pan: 0 })
        break
      case 'shh':
        t('shh', 0.3, 1)
        break
      case 'pasos-lejanos':
        t('pasos', 0.2, 0.6, { pan: 0.8 * lado })
        break
      case 'nombre-llamado':
        this.voz(0.35, d.frase ?? 'García López, a la sala tres.', v, 0.85)
        break
      default:
        break
    }
  }

  private en(seg: number, fn: () => void) {
    this.timers.push(window.setTimeout(fn, Math.max(0, seg * 1000)))
  }

  /** Frases con sentido (acompañante, nombre en el pasillo); si la voz está ocupada, susurros grabados. */
  private voz(seg: number, frase: string, v: number, tono: number) {
    const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined
    const respaldo = () => bancoSonidos().tocar('susurros', { volumen: v })
    this.en(seg, () => {
      if (!synth || synth.speaking || synth.pending) {
        respaldo()
        return
      }
      try {
        const u = new SpeechSynthesisUtterance(frase)
        u.lang = 'es-ES'
        u.volume = Math.max(0.3, Math.min(1, v))
        u.rate = 0.95
        u.pitch = tono
        u.onend = () => {
          this.hablando = false
        }
        this.hablando = true
        synth.speak(u)
      } catch {
        respaldo()
      }
    })
  }
}
