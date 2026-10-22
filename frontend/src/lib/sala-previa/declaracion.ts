import type { TipoDistraccion } from './distracciones'
import {
  LAJ,
  PAPELES_SALA,
  miradaHacia,
  type MiradaSala,
  type MiradaTarget,
  type PapelSala,
  type Punto3D,
} from './salaVistasConfig'

/** Desde dónde vive la persona usuaria la declaración. */
export type PuntoVista = 'estrado' | 'testigo' | 'acusado'

export type Hablante = 'jueza' | 'laj' | 'fiscal' | 'acusacion' | 'defensa'

export interface Respuesta {
  texto: string
  /** Por qué esta respuesta es válida (se muestra al final). */
  porQue: string
  /** Id del turno al que salta la simulación (por ejemplo, si decides no declarar). */
  saltaA?: string
  /** Origen: las seguras avanzan al momento; las libres pasan por la réplica de la jueza. */
  origen?: 'segura' | 'libre'
  /** Si es true, la jueza concede pausa y no se avanza de momento. */
  pidePausa?: boolean
}

/** Algo que pasa en la sala mientras alguien habla. */
export interface Interrupcion {
  /** Distracción de la sala 3D (sonido y animación). */
  tipo: TipoDistraccion
  /** Segundos desde que empieza el turno. */
  en: number
  /** Subtítulo del ruido, para quien no lo oye. */
  descripcion: string
}

export interface Intervencion {
  hablante: Hablante
  texto: string
}

export interface Turno {
  id: string
  hablante: Hablante
  /** Lo que dice en voz alta. Dentro de la sala se usa el «usted» habitual. */
  texto: string
  /** La misma pregunta dicha más fácil, si pides que te lo digan más claro. */
  claro?: string
  /** Hacia dónde gira la cámara. Por defecto, hacia quien habla. */
  mirada?: Hablante | 'entrada'
  /** Guía para ti, en tú y en lectura fácil. */
  explicacion?: string
  ley?: string
  /** Respuestas seguras. Si no hay, solo se pulsa «Seguir». */
  respuestas: Respuesta[]
  interrupcion?: Interrupcion
  /** Alguien habla justo después (por ejemplo, la jueza corta una pregunta). */
  intervencion?: Intervencion
}

export interface Guion {
  puntoVista: PuntoVista
  turnos: Turno[]
  cierre: Intervencion & { explicacion: string }
  /** Tres ideas para llevarte en el resumen. */
  claves: string[]
}

interface DatosHablante {
  nombre: string
  posicion: Punto3D
  enfoque: MiradaSala
  voz: 'mujer' | 'hombre'
  tono: number
}

export const HABLANTES: Record<Hablante, DatosHablante> = {
  jueza: {
    nombre: 'Jueza',
    posicion: [0, 1.95, -6.6],
    enfoque: 'juez',
    voz: 'mujer',
    tono: 1,
  },
  laj: {
    nombre: 'Letrado de la Administración de Justicia',
    posicion: LAJ,
    enfoque: 'juez',
    voz: 'hombre',
    tono: 0.9,
  },
  fiscal: {
    nombre: 'Fiscal',
    posicion: [2.4, 1.1, -2.55],
    enfoque: 'abogados',
    voz: 'hombre',
    tono: 1,
  },
  acusacion: {
    nombre: 'Abogado de la acusación',
    posicion: [3.1, 1.1, -2.55],
    enfoque: 'abogados',
    voz: 'hombre',
    tono: 1.1,
  },
  defensa: {
    nombre: 'Abogada de la defensa',
    posicion: [-2.4, 1.1, -2.55],
    enfoque: 'abogados',
    voz: 'mujer',
    tono: 1.15,
  },
}

const PUERTA: Punto3D = [0, 1.5, 7.78]

interface DatosPuntoVista {
  papel: PapelSala
  titulo: string
  /** Una línea: qué pasa en esta simulación. */
  resumen: string
  dondeEstas: string
}

export const PUNTOS_VISTA: Record<PuntoVista, DatosPuntoVista> = {
  estrado: {
    papel: 'victima',
    titulo: 'En el estrado, como víctima',
    resumen: 'Cuentas lo que te pasó. La jueza te protege de preguntas que no vienen al caso.',
    dondeEstas:
      'Estás en el centro de la sala. Una mampara tapa a la persona acusada. Tu acompañante está a tu lado.',
  },
  testigo: {
    papel: 'testigo',
    titulo: 'Como testigo',
    resumen: 'Cuentas lo que viste. Prometes decir la verdad y las dos partes te preguntan.',
    dondeEstas: 'Estás de pie en el atril del centro, mirando a la jueza. Tienes un vaso de agua.',
  },
  acusado: {
    papel: 'investigado',
    titulo: 'Como persona acusada',
    resumen: 'Escuchas tus derechos. Puedes contestar, no contestar o hablar solo con tu defensa.',
    dondeEstas: 'Estás en el banquillo, al lado de la mesa de tu abogada. Un agente está cerca.',
  },
}

export const ORDEN_PUNTOS_VISTA: PuntoVista[] = ['estrado', 'testigo', 'acusado']

export const CASO_INVENTADO = [
  'El caso es inventado. Es igual en las tres simulaciones.',
  'Un martes, 3 de marzo, sobre las siete de la tarde.',
  'En una parada de autobús, alguien quitó un móvil de la mano a una persona y salió corriendo.',
  'Hoy es el juicio en el Juzgado de lo Penal.',
]

export const NOMBRE_POR_DEFECTO = 'Alex Martín'

export function papelDePuntoVista(pv: PuntoVista): PapelSala {
  return PUNTOS_VISTA[pv].papel
}

export function puntoVistaDesdeRol(rol: string | undefined): PuntoVista | null {
  if (rol === 'victima') return 'estrado'
  if (rol === 'testigo') return 'testigo'
  if (rol === 'investigado') return 'acusado'
  return null
}

export function miradaTurno(pv: PuntoVista, destino: Hablante | 'entrada'): MiradaTarget {
  const camara = PAPELES_SALA[papelDePuntoVista(pv)].camara
  const punto = destino === 'entrada' ? PUERTA : HABLANTES[destino].posicion
  return miradaHacia(camara, punto)
}

export function enfoqueDe(destino: Hablante | 'entrada'): MiradaSala {
  return destino === 'entrada' ? 'entrada' : HABLANTES[destino].enfoque
}

export function conNombre(texto: string, nombre: string): string {
  return texto.split('{nombre}').join(nombre)
}
