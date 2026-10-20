import type { EscenaJuzgado, NivelSala } from './tipos'
import { NIVELES } from './niveles'

/** Recorrido por fases del día en el juzgado (4 escenas). */
export const ESCENAS_JUZGADO: EscenaJuzgado[] = [
  {
    id: 'entrada',
    titulo: 'Entrada del juzgado',
    frase:
      'Llegas al edificio. Entras por la puerta principal. Hay un hall y gente que entra y sale. Vas a tu ritmo.',
    roles: [
      {
        nombre: 'Personal de información',
        explicacion: 'Te dice dónde ir y en qué planta está tu sala.',
      },
      {
        nombre: 'Otras personas',
        explicacion: 'También vienen a su cita. Cada una va a lo suyo.',
      },
    ],
    nivelTipicoId: 1,
    audioguia:
      'Estás en la entrada del juzgado. Hay un hall amplio. Se oye algo de movimiento. Puedes quedarte aquí el tiempo que necesites antes de seguir.',
  },
  {
    id: 'control-seguridad',
    titulo: 'Control de seguridad',
    frase:
      'Pasas por el arco detector. Te piden mirar la bolsa o la mochila. Es normal. No pasa nada malo.',
    roles: [
      {
        nombre: 'Personal de seguridad',
        explicacion: 'Revisa que no lleves objetos peligrosos. Te indica cómo pasar.',
      },
    ],
    nivelTipicoId: 2,
    audioguia:
      'Estás en el control de seguridad. Hay un arco y personas que pasan una a una. Puede haber pitidos cortos. Cuando termines, sigues hacia la espera.',
  },
  {
    id: 'sala-espera',
    titulo: 'Sala de espera',
    frase:
      'Te sientas y esperas a que te llamen. Puede haber murmullos. Si te agobia, puedes pedir una sala más tranquila.',
    roles: [
      {
        nombre: 'Abogado/a',
        explicacion:
          'Si tienes abogado o abogada, te acompaña, te explica qué va a pasar y defiende tus derechos.',
      },
      {
        nombre: 'Otras personas que esperan',
        explicacion: 'Esperan su turno, como tú. No tienes que hablar con ellas.',
      },
    ],
    nivelTipicoId: 3,
    audioguia:
      'Estás en la sala de espera. Hay bancos y gente sentada. Se oyen murmullos. Cuando te llamen, irás a la sala de vistas. Tú mandas el ritmo.',
  },
  {
    id: 'sala-vistas',
    titulo: 'Sala de vistas',
    frase:
      'Entras en la sala donde se celebra la vista. Te harán preguntas. Puedes pedir que te las expliquen y pedir pausas.',
    roles: [
      {
        nombre: 'Juez/a',
        explicacion: 'Dirige la vista, escucha a todas las personas y toma la decisión.',
      },
      {
        nombre: 'Letrado/a de la Administración de Justicia',
        explicacion:
          'Cuida los papeles, las fechas y que todo se haga bien. Antes se llamaba secretario o secretaria judicial.',
      },
      {
        nombre: 'Fiscal',
        explicacion:
          'En asuntos penales representa a la sociedad. Puede hacer preguntas.',
      },
      {
        nombre: 'Abogado/a',
        explicacion: 'Te defiende, habla por ti cuando hace falta y te ayuda a entender.',
      },
    ],
    nivelTipicoId: 4,
    audioguia:
      'Estás en la sala de vistas. Hay un estrado y varias personas con toga. El juez o la jueza dirige. Tú puedes pedir pausas y que te expliquen las preguntas.',
  },
]

export const TOTAL_ESCENAS = ESCENAS_JUZGADO.length

export function escenaPorIndice(indice: number): EscenaJuzgado {
  const i = Math.min(TOTAL_ESCENAS - 1, Math.max(0, Math.trunc(indice)))
  return ESCENAS_JUZGADO[i]
}

/** Nivel visual para EscenaSensorial: título/frase de la escena, sin tocar el preset del usuario. */
export function nivelVisualDesdeEscena(
  escena: EscenaJuzgado,
  presetUsuario: NivelSala['preset']
): NivelSala {
  return {
    id: escena.nivelTipicoId,
    nombre: escena.titulo,
    descripcion: escena.frase,
    audioguia: escena.audioguia,
    preset: presetUsuario,
  }
}

export function etiquetaNivelTipico(escena: EscenaJuzgado): string {
  const nivel = NIVELES[escena.nivelTipicoId]
  if (!nivel) return ''
  return nivel.nombre
}
