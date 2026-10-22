/**
 * Tutorial de primera visita (lectura fácil).
 */

export const LS_TUTORIAL_VISTO = 'court-tutorial-visto'
export const EVENTO_TUTORIAL = 'court-tutorial-cambio'

export type PasoTutorial = {
  id: string
  titulo: string
  texto: string
  /** Keyword ARASAAC opcional (pictograma decorativo). */
  pictoKeyword?: string
  pictoId?: number
}

export const PASOS_TUTORIAL: PasoTutorial[] = [
  {
    id: 'bienvenida',
    titulo: 'Hola, soy TribunalInclusivo',
    texto:
      'Te ayudo a entender el juzgado con frases cortas y pictogramas. Sin prisas.',
    pictoKeyword: 'hola',
    pictoId: 8289,
  },
  {
    id: 'citacion',
    titulo: 'Tu citación',
    texto:
      'Pega la carta del juzgado en Citación. Te digo qué día, a qué hora y dónde.',
    pictoKeyword: 'documento',
    pictoId: 28247,
  },
  {
    id: 'pasaporte',
    titulo: 'Pasaporte y ensayo',
    texto:
      'En Pasaporte pides apoyos sin diagnóstico. En la Sala practicas la declaración antes del día.',
    pictoKeyword: 'ayuda',
    pictoId: 37178,
  },
  {
    id: 'sala',
    titulo: 'Sala Previa',
    texto:
      'Practica la sala 3D con un ambiente estable. Activa pocas o muchas distracciones cuando quieras.',
    pictoKeyword: 'juzgado',
    pictoId: 26885,
  },
  {
    id: 'ayuda',
    titulo: 'Si tienes dudas',
    texto:
      'Entra en Ayuda y escribe tu pregunta. Te respondemos con frases cortas.',
    pictoKeyword: 'pregunta',
    pictoId: 9847,
  },
]

export function tutorialVisto(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(LS_TUTORIAL_VISTO) === 'true'
  } catch {
    return true
  }
}

export function marcarTutorialVisto(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(LS_TUTORIAL_VISTO, 'true')
    window.dispatchEvent(new Event(EVENTO_TUTORIAL))
  } catch {
    /* private mode / quota */
  }
}

export function urlPictograma(id: number): string {
  return `https://static.arasaac.org/pictograms/${id}/${id}_300.png`
}
