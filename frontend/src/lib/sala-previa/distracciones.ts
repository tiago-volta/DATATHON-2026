import type { PapelSala } from './salaVistasConfig'

export type NivelDistracciones = 'apagadas' | 'pocas' | 'muchas'

export type TipoDistraccion =
  | 'entra-persona'
  | 'habla-fondo'
  | 'movil'
  | 'timbre-movil'
  | 'tos'
  | 'boli-cae'
  | 'llaves-caen'
  | 'estornudo'
  | 'carraspeo'
  | 'silla-arrastra'
  | 'cremallera'
  | 'botella'
  | 'papeles'
  | 'levanta-sienta'
  | 'cruza-agente'
  | 'silla-cruje'
  | 'portazo'
  | 'luz-suave'
  | 'agente-postura'
  | 'acompanante-susurra'
  | 'abogado-susurra'
  | 'shh'
  | 'pasos-lejanos'
  | 'nombre-llamado'
  | 'nube-tapa-sol'
  | 'sale-sol'
  | 'fluorescente-zumba'
  | 'persiana-baja'

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
  /** Sonido corto que puede solaparse con otra distracción en marcha. */
  rapida?: boolean
  aviso: string
  explicacion: string
  registro: string
}

export const DISTRACCIONES: Record<TipoDistraccion, DefDistraccion> = {
  'entra-persona': {
    duracion: 9,
    peso: 2,
    aviso: 'En un momento se abrirá la puerta y entrará una persona.',
    explicacion: 'Ha entrado una persona por la puerta. No tiene que ver contigo. Puedes seguir.',
    registro: 'Entró una persona por la puerta',
  },
  'habla-fondo': {
    duracion: 4.5,
    peso: 2.5,
    necesitaPublico: true,
    aviso: 'Alguien del público va a hablar bajito.',
    explicacion:
      'Una persona del público ha hablado bajito con quien tiene al lado. No te habla a ti. Puedes seguir.',
    registro: 'Alguien habló bajito en el público',
  },
  movil: {
    duracion: 4,
    peso: 2.5,
    necesitaPublico: true,
    rapida: true,
    aviso: 'Va a vibrar un móvil entre el público.',
    explicacion: 'Ha vibrado un móvil y se ha encendido su pantalla. Es de otra persona. Puedes seguir.',
    registro: 'Vibró un móvil',
  },
  'timbre-movil': {
    duracion: 5,
    peso: 2.5,
    necesitaPublico: true,
    aviso: 'Va a sonar el timbre de un móvil.',
    explicacion:
      'Ha sonado el timbre de un móvil. Alguien lo apagará. No tiene que ver contigo. Puedes seguir.',
    registro: 'Sonó el timbre de un móvil',
  },
  tos: {
    duracion: 2.5,
    peso: 6,
    necesitaPublico: true,
    rapida: true,
    aviso: 'Alguien va a toser.',
    explicacion: 'Una persona ha tosido. Es normal. Puedes seguir.',
    registro: 'Alguien tosió',
  },
  carraspeo: {
    duracion: 2,
    peso: 4,
    necesitaPublico: true,
    rapida: true,
    aviso: 'Alguien va a aclararse la garganta.',
    explicacion: 'Alguien se ha aclarado la garganta. Es un ruido normal. Puedes seguir.',
    registro: 'Alguien carraspeó',
  },
  estornudo: {
    duracion: 2.2,
    peso: 2.5,
    necesitaPublico: true,
    rapida: true,
    aviso: 'Alguien va a estornudar.',
    explicacion: 'Una persona ha estornudado. Le pasa a cualquiera. Puedes seguir.',
    registro: 'Alguien estornudó',
  },
  'boli-cae': {
    duracion: 2.4,
    peso: 4,
    rapida: true,
    aviso: 'A alguien se le va a caer un bolígrafo al suelo.',
    explicacion: 'Se ha caído un bolígrafo al suelo. Lo recogerán. Puedes seguir.',
    registro: 'Se cayó un bolígrafo',
  },
  'llaves-caen': {
    duracion: 2,
    peso: 2,
    necesitaPublico: true,
    rapida: true,
    aviso: 'A alguien se le van a caer las llaves.',
    explicacion: 'A alguien se le han caído las llaves. Es solo un ruido. Puedes seguir.',
    registro: 'Se cayeron unas llaves',
  },
  'silla-arrastra': {
    duracion: 2.5,
    peso: 2.5,
    necesitaPublico: true,
    rapida: true,
    aviso: 'Alguien va a mover su silla.',
    explicacion: 'Alguien ha arrastrado su silla. Se está acomodando. Puedes seguir.',
    registro: 'Alguien arrastró una silla',
  },
  cremallera: {
    duracion: 2.5,
    peso: 2,
    necesitaPublico: true,
    rapida: true,
    aviso: 'Alguien va a abrir la cremallera de su bolso.',
    explicacion: 'Alguien ha abierto su bolso. Está buscando algo. Puedes seguir.',
    registro: 'Alguien abrió su bolso',
  },
  botella: {
    duracion: 2.5,
    peso: 2,
    rapida: true,
    aviso: 'Alguien va a abrir una botella de agua.',
    explicacion: 'Alguien ha abierto una botella de agua. Puedes seguir.',
    registro: 'Alguien abrió una botella',
  },
  papeles: {
    duracion: 3,
    peso: 4,
    rapida: true,
    aviso: 'Un abogado va a mover sus papeles.',
    explicacion: 'Un abogado ha movido sus papeles. Está ordenando su trabajo. Puedes seguir.',
    registro: 'Un abogado movió papeles',
  },
  'levanta-sienta': {
    duracion: 5,
    peso: 1.5,
    necesitaPublico: true,
    aviso: 'Una persona del público se va a levantar un momento.',
    explicacion:
      'Una persona se ha levantado y se ha vuelto a sentar. No pasa nada. Puedes seguir.',
    registro: 'Alguien se levantó y se sentó',
  },
  'cruza-agente': {
    duracion: 7,
    peso: 1.5,
    aviso: 'Un funcionario va a cruzar por delante de la sala.',
    explicacion: 'Un funcionario ha cruzado por delante. Está haciendo su trabajo. Puedes seguir.',
    registro: 'Un funcionario cruzó la sala',
  },
  'silla-cruje': {
    duracion: 2,
    peso: 2,
    rapida: true,
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
  shh: {
    duracion: 2.2,
    peso: 1.5,
    necesitaPublico: true,
    rapida: true,
    aviso: 'Alguien va a pedir silencio bajito.',
    explicacion: 'Alguien ha hecho «shh». Quiere que la sala esté más tranquila. Puedes seguir.',
    registro: 'Alguien pidió silencio',
  },
  'pasos-lejanos': {
    duracion: 4,
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
  'nube-tapa-sol': {
    duracion: 10,
    peso: 1.5,
    aviso: 'Una nube va a tapar el sol. La sala se verá un poco más oscura.',
    explicacion:
      'Una nube ha tapado el sol y la sala se ha oscurecido un momento. Es la luz de fuera. Puedes seguir.',
    registro: 'Una nube tapó el sol',
  },
  'sale-sol': {
    duracion: 9,
    peso: 1.2,
    aviso: 'Va a salir el sol. Entrará más luz por las ventanas.',
    explicacion:
      'Ha salido el sol y ha entrado más luz por las ventanas. Luego vuelve a ser como antes. Puedes seguir.',
    registro: 'Salió el sol',
  },
  'fluorescente-zumba': {
    duracion: 6,
    peso: 1.2,
    aviso: 'Un fluorescente del techo va a zumbar y bajar un poco.',
    explicacion:
      'Un fluorescente del techo ha zumbado y ha bajado un poco. Pasa en muchos edificios. Puedes seguir.',
    registro: 'Zumbó un fluorescente',
  },
  'persiana-baja': {
    duracion: 4.5,
    peso: 1,
    aviso: 'Alguien va a bajar una persiana.',
    explicacion:
      'Alguien ha bajado una persiana porque entraba mucho sol. Ahora entra menos luz. Puedes seguir.',
    registro: 'Bajaron una persiana',
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
  /** Solo sonidos cortos que pueden solaparse con otra distracción. */
  soloRapidas?: boolean
}): Distraccion {
  const { id, papel, nivel, numPublico, anterior, soloRapidas } = opciones
  const candidatas = (Object.keys(DISTRACCIONES) as TipoDistraccion[]).filter((t) => {
    const d = DISTRACCIONES[t]
    if (t === anterior) return false
    if (soloRapidas && !d.rapida) return false
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

/** Milisegundos entre el inicio de una distracción y la siguiente. */
export function intervaloDistraccion(nivel: NivelDistracciones): number {
  const [min, max] = nivel === 'muchas' ? [2000, 5000] : [6000, 12000]
  return min + Math.random() * (max - min)
}

/** Probabilidad de que otro sonido corto se solape con la distracción en marcha. */
export function probabilidadSolape(nivel: NivelDistracciones): number {
  return nivel === 'muchas' ? 0.45 : nivel === 'pocas' ? 0.12 : 0
}

/** Volumen de las grabaciones (ya normalizadas): no depende del ambiente. */
export function volumenDistraccion(nivel: NivelDistracciones): number {
  return nivel === 'muchas' ? 1 : 0.92
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
