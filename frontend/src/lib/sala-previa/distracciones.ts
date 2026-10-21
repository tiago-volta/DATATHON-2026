import type { PapelSala } from './salaVistasConfig'

export type NivelDistracciones = 'apagadas' | 'pocas' | 'muchas'

export type TipoDistraccion =
  | 'entra-persona'
  | 'habla-fondo'
  | 'movil'
  | 'timbre-movil'
  | 'tos'
  | 'boligrafo'
  | 'papeles'
  | 'levanta-sienta'
  | 'cruza-agente'
  | 'silla-cruje'
  | 'portazo'
  | 'luz-suave'
  | 'agente-postura'
  | 'acompanante-susurra'
  | 'abogado-susurra'
  | 'martillo'
  | 'shh'
  | 'pasos-lejanos'
  | 'nombre-llamado'

export interface Distraccion {
  id: number
  tipo: TipoDistraccion
  /** Segundos que dura la animación. */
  duracion: number
  /** Figura del público implicada (-1 si no hay). */
  indice: number
  /** 0 = la persona que entra se sienta; 1 = se da la vuelta y se va. */
  variante: 0 | 1
  /** El sonido ya lo pone otro motor (agenda anunciada). */
  silenciosa?: boolean
  frase?: string
}

interface DefDistraccion {
  duracion: number
  peso: number
  necesitaPublico?: boolean
  papeles?: PapelSala[]
  soloMuchas?: boolean
  aviso: string
  explicacion: string
  registro: string
}

export const DISTRACCIONES: Record<TipoDistraccion, DefDistraccion> = {
  'entra-persona': {
    duracion: 9,
    peso: 3,
    aviso: 'En un momento se abrirá la puerta y entrará una persona.',
    explicacion: 'Ha entrado una persona por la puerta. No tiene que ver contigo. Puedes seguir.',
    registro: 'Entró una persona por la puerta',
  },
  'habla-fondo': {
    duracion: 4.5,
    peso: 3,
    necesitaPublico: true,
    aviso: 'Alguien del público va a hablar bajito.',
    explicacion:
      'Una persona del público ha hablado bajito con quien tiene al lado. No te habla a ti. Puedes seguir.',
    registro: 'Alguien habló bajito en el público',
  },
  movil: {
    duracion: 4,
    peso: 2,
    necesitaPublico: true,
    aviso: 'Va a vibrar un móvil entre el público.',
    explicacion: 'Ha vibrado un móvil y se ha encendido su pantalla. Es de otra persona. Puedes seguir.',
    registro: 'Vibró un móvil',
  },
  'timbre-movil': {
    duracion: 5,
    peso: 2,
    necesitaPublico: true,
    aviso: 'Va a sonar el timbre de un móvil.',
    explicacion:
      'Ha sonado el timbre de un móvil. Alguien lo apagará. No tiene que ver contigo. Puedes seguir.',
    registro: 'Sonó el timbre de un móvil',
  },
  tos: {
    duracion: 2.5,
    peso: 2.5,
    necesitaPublico: true,
    aviso: 'Alguien va a toser.',
    explicacion: 'Una persona ha tosido. Es normal. Puedes seguir.',
    registro: 'Alguien tosió',
  },
  boligrafo: {
    duracion: 2.5,
    peso: 1.5,
    aviso: 'Alguien va a pulsar un bolígrafo varias veces.',
    explicacion: 'Alguien ha hecho clic con un bolígrafo. Es un ruido pequeño. Puedes seguir.',
    registro: 'Clics de bolígrafo',
  },
  papeles: {
    duracion: 3,
    peso: 2,
    aviso: 'Un abogado va a mover sus papeles.',
    explicacion: 'Un abogado ha movido sus papeles. Está ordenando su trabajo. Puedes seguir.',
    registro: 'Un abogado movió papeles',
  },
  'levanta-sienta': {
    duracion: 5,
    peso: 2,
    necesitaPublico: true,
    aviso: 'Una persona del público se va a levantar un momento.',
    explicacion:
      'Una persona se ha levantado y se ha vuelto a sentar. No pasa nada. Puedes seguir.',
    registro: 'Alguien se levantó y se sentó',
  },
  'cruza-agente': {
    duracion: 7,
    peso: 2,
    aviso: 'Un funcionario va a cruzar por delante de la sala.',
    explicacion: 'Un funcionario ha cruzado por delante. Está haciendo su trabajo. Puedes seguir.',
    registro: 'Un funcionario cruzó la sala',
  },
  'silla-cruje': {
    duracion: 2,
    peso: 1.5,
    aviso: 'Va a crujir una silla.',
    explicacion: 'Ha crujido una silla. Es solo un ruido de los muebles. Puedes seguir.',
    registro: 'Crujió una silla',
  },
  portazo: {
    duracion: 3,
    peso: 1,
    soloMuchas: true,
    aviso: 'La puerta se va a cerrar con un golpe.',
    explicacion: 'La puerta se ha cerrado con fuerza. No es por ti. Puedes seguir.',
    registro: 'La puerta se cerró de golpe',
  },
  'luz-suave': {
    duracion: 5,
    peso: 0.8,
    soloMuchas: true,
    aviso: 'La luz va a bajar un poco y volverá despacio.',
    explicacion: 'La luz ha bajado un poco y ha vuelto. Puedes seguir.',
    registro: 'La luz bajó un poco',
  },
  'agente-postura': {
    duracion: 4,
    peso: 2,
    papeles: ['investigado'],
    aviso: 'El agente que está a tu lado se va a mover un poco.',
    explicacion:
      'El agente se ha movido un poco. Es normal que cambie de postura. No significa nada malo. Puedes seguir.',
    registro: 'El agente cambió de postura',
  },
  'acompanante-susurra': {
    duracion: 4,
    peso: 2,
    papeles: ['victima'],
    aviso: 'Tu acompañante te va a decir algo bajito.',
    explicacion: 'Tu acompañante te ha hablado bajito para darte apoyo. Puedes seguir.',
    registro: 'Tu acompañante te habló bajito',
  },
  'abogado-susurra': {
    duracion: 4,
    peso: 2,
    papeles: ['parte_civil', 'investigado'],
    aviso: 'Tu abogado o abogada te va a decir algo bajito.',
    explicacion:
      'Tu abogado o abogada te ha dicho algo bajito. Si no lo entiendes, puedes pedir que te lo repita.',
    registro: 'Tu abogado te habló bajito',
  },
  martillo: {
    duracion: 2.5,
    peso: 1.8,
    aviso: 'El juez va a golpear el martillo.',
    explicacion:
      'El juez ha golpeado el martillo. Es para llamar la atención o marcar un momento. Puedes seguir.',
    registro: 'El juez golpeó el martillo',
  },
  shh: {
    duracion: 2.2,
    peso: 1.5,
    necesitaPublico: true,
    aviso: 'Alguien va a pedir silencio bajito.',
    explicacion: 'Alguien ha hecho «shh». Quiere que la sala esté más tranquila. Puedes seguir.',
    registro: 'Alguien pidió silencio',
  },
  'pasos-lejanos': {
    duracion: 3.5,
    peso: 2,
    aviso: 'Vas a oír pasos al fondo del pasillo.',
    explicacion: 'Se han oído pasos lejos, en el pasillo. No entran aquí. Puedes seguir.',
    registro: 'Se oyeron pasos lejanos',
  },
  'nombre-llamado': {
    duracion: 4,
    peso: 0.7,
    soloMuchas: true,
    aviso: 'Van a llamar un nombre en alto en el pasillo.',
    explicacion:
      'Han llamado un nombre en el pasillo. No es el tuyo en este ensayo. Puedes seguir.',
    registro: 'Llamaron un nombre en el pasillo',
  },
}

const FRASES: Partial<Record<TipoDistraccion, string[]>> = {
  'habla-fondo': [
    '¿Qué hora es?',
    'Luego te lo cuento.',
    'Ya queda poco.',
    '¿Has traído los papeles?',
    'Mira, ya empiezan.',
  ],
  'acompanante-susurra': ['Estoy aquí contigo.', 'Lo estás haciendo bien.', 'Respira despacio.'],
  'abogado-susurra': ['Vamos bien.', 'Ahora toca escuchar.', 'Luego te lo explico.'],
  'nombre-llamado': [
    'García López, a la sala tres.',
    'Martínez Ruiz, por favor.',
    'Siguiente: Fernández.',
  ],
}

function azar<T>(lista: T[]): T {
  return lista[Math.floor(Math.random() * lista.length)]
}

export function elegirDistraccion(opciones: {
  id: number
  papel: PapelSala
  nivel: NivelDistracciones
  numPublico: number
  anterior: TipoDistraccion | null
}): Distraccion {
  const { id, papel, nivel, numPublico, anterior } = opciones
  const candidatas = (Object.keys(DISTRACCIONES) as TipoDistraccion[]).filter((t) => {
    const d = DISTRACCIONES[t]
    if (t === anterior) return false
    if (d.necesitaPublico && numPublico < 1) return false
    if (d.papeles && !d.papeles.includes(papel)) return false
    if (d.soloMuchas && nivel !== 'muchas') return false
    return true
  })
  const total = candidatas.reduce((s, t) => s + DISTRACCIONES[t].peso, 0)
  let r = Math.random() * total
  let tipo = candidatas[0] ?? 'silla-cruje'
  for (const t of candidatas) {
    r -= DISTRACCIONES[t].peso
    if (r <= 0) {
      tipo = t
      break
    }
  }
  return crearDistraccion(id, tipo, numPublico)
}

export function crearDistraccion(
  id: number,
  tipo: TipoDistraccion,
  numPublico: number,
  silenciosa = false
): Distraccion {
  const frases = FRASES[tipo]
  return {
    id,
    tipo,
    duracion: DISTRACCIONES[tipo].duracion,
    indice: numPublico > 0 ? Math.floor(Math.random() * numPublico) : -1,
    variante: Math.random() < 0.6 ? 0 : 1,
    silenciosa,
    frase: frases ? azar(frases) : undefined,
  }
}

/** Milisegundos hasta la siguiente distracción. Muchas ≈ más seguidas que Pocas. */
export function intervaloDistraccion(nivel: NivelDistracciones, _estimulo = 0.4): number {
  const [min, max] = nivel === 'muchas' ? [7000, 15000] : [22000, 40000]
  return min + Math.random() * (max - min)
}

export function volumenDistraccion(nivel: NivelDistracciones, ruido: number): number {
  const base = nivel === 'muchas' ? 1 : 0.78
  // Ambiente fijo ~40: el volumen no depende de sliders; solo del nivel de distracciones.
  const suelo = Math.max(0.4, Math.min(1, ruido / 100 || 0.4))
  return base * (0.45 + 0.55 * suelo)
}

export const AVISO_PREVIO_MS = 3000

/** Qué se ve en la sala 3D cuando salta un evento de la agenda anunciada. */
export function distraccionDeAgenda(idEvento: string, tipo: string): TipoDistraccion | null {
  if (idEvento === 'ev-persona-entra') return 'entra-persona'
  if (tipo === 'puerta') return 'portazo'
  if (tipo === 'movil') return 'timbre-movil'
  if (tipo === 'gente') return 'tos'
  if (tipo === 'nombre-en-alto') return 'nombre-llamado'
  return null
}
