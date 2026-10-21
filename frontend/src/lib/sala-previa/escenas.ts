import type { RolPerfil } from '@/lib/perfil/tipos'
import type { EscenaJuzgado, NivelSala, ValoresEstimulo } from './tipos'
import { NIVELES } from './niveles'

/** Recorrido general por fases del día en el juzgado (4 escenas base). */
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

export const ESCENAS_TESTIGO: EscenaJuzgado[] = [
  {
    id: 'entrada',
    titulo: 'Entrada del juzgado',
    frase: 'Llegas al edificio del juzgado. Entras por el acceso principal a tu propio ritmo.',
    roles: [
      { nombre: 'Personal de información', explicacion: 'Te orienta sobre la planta de la sala de vistas.' },
    ],
    nivelTipicoId: 1,
    audioguia: 'Estás en la entrada del juzgado. Hay un hall amplio. Tómate el tiempo que necesites.',
  },
  {
    id: 'control-seguridad',
    titulo: 'Control de seguridad',
    frase: 'Pasas por el arco detector y dejas tus pertenencias en la bandeja. Es un control rutinario.',
    roles: [
      { nombre: 'Agentes de seguridad', explicacion: 'Verifican el acceso pacífico a la sede judicial.' },
    ],
    nivelTipicoId: 2,
    audioguia: 'Paso por el control de seguridad. Si pita, te revisan con tranquilidad.',
  },
  {
    id: 'espera-fuera',
    titulo: 'Espera exterior a la sala',
    frase: 'Esperas fuera de la sala. Por ley (art. 433 LECrim), no puedes ver ni oír el juicio antes de declarar.',
    roles: [
      { nombre: 'Acompañante o facilitador', explicacion: 'Puede estar contigo fuera para ayudarte a mantener la calma.' },
      { nombre: 'Otros testigos', explicacion: 'Esperan fuera también sin poder entrar al juicio.' },
    ],
    nivelTipicoId: 3,
    audioguia: 'Esperas en el pasillo o sala de espera de testigos. Por ley debes esperar fuera hasta que sea tu turno.',
  },
  {
    id: 'llamada',
    titulo: 'Llamada por tu nombre',
    frase: 'Un funcionario o agente sale a la puerta y pronuncia tu nombre y apellidos en voz alta.',
    roles: [
      { nombre: 'Auxilio judicial / Agente', explicacion: 'Sale a llamarte cuando el tribunal está listo para tu declaración.' },
    ],
    nivelTipicoId: 3,
    audioguia: 'Escuchas tu nombre en alto. Ha llegado el momento de entrar a la sala con calma.',
  },
  {
    id: 'sala-vistas',
    titulo: 'Declaración en sala',
    frase: 'Entras y prometes decir la verdad (art. 433 LECrim). Puedes decir "no lo recuerdo" y pedir pausas.',
    roles: [
      { nombre: 'Juez/a', explicacion: 'Preside la sala, modera las preguntas y te protege de preguntas capciosas.' },
      { nombre: 'Abogados y Fiscal', explicacion: 'Te formulan preguntas sobre lo que viste o escuchaste.' },
    ],
    nivelTipicoId: 4,
    audioguia: 'Estás ante el tribunal. Prometes decir la verdad. No recordar es una respuesta válida. Puedes pedir pausas.',
  },
]

export const ESCENAS_INVESTIGADO: EscenaJuzgado[] = [
  {
    id: 'entrada',
    titulo: 'Entrada del juzgado',
    frase: 'Llegas con antelación para reunirte con tu defensa.',
    roles: [
      { nombre: 'Personal de información', explicacion: 'Te indica la planta del juzgado o sala de vistas.' },
    ],
    nivelTipicoId: 1,
    audioguia: 'Llegada al juzgado. Recuerda que tienes derecho a un proceso con todas las garantías.',
  },
  {
    id: 'control-seguridad',
    titulo: 'Control de seguridad',
    frase: 'Acceso por el arco de seguridad de forma habitual.',
    roles: [
      { nombre: 'Seguridad', explicacion: 'Control de acceso a las dependencias judiciales.' },
    ],
    nivelTipicoId: 2,
    audioguia: 'Paso por el arco de seguridad hacia la zona de vistas.',
  },
  {
    id: 'reunion-abogado',
    titulo: 'Hablas con tu abogado/a',
    frase: 'Te reúnes con tu defensa antes de entrar a la sala para repasar cómo será la vista.',
    roles: [
      { nombre: 'Tu abogado/a', explicacion: 'Te explica tus derechos y la estrategia de defensa antes de entrar.' },
    ],
    nivelTipicoId: 2,
    audioguia: 'Reunión previa con tu letrado para resolver cualquier duda y entrar con seguridad.',
  },
  {
    id: 'sala-investigado',
    titulo: 'En la sala todo el tiempo',
    frase: 'Permaneces sentado junto a tu abogado. Tienes derecho a no declarar y no confesarte culpable (art. 118 LECrim).',
    roles: [
      { nombre: 'Juez/a', explicacion: 'Garantiza tu presunción de inocencia y dirige el juicio.' },
      { nombre: 'Tu abogado/a', explicacion: 'Se sienta a tu lado y te asiste continuamente durante el acto.' },
    ],
    nivelTipicoId: 4,
    audioguia: 'Estás en la sala durante todo el juicio junto a tu abogado. Tienes derecho a guardar silencio.',
  },
  {
    id: 'ultima-palabra',
    titulo: 'Derecho a la última palabra',
    frase: 'Al concluir las pruebas y conclusiones, el tribunal te preguntará si deseas manifestar algo.',
    roles: [
      { nombre: 'Juez/a', explicacion: 'Te concede la palabra final antes de declarar el juicio visto para sentencia.' },
    ],
    nivelTipicoId: 3,
    audioguia: 'Turno de última palabra. Puedes manifestar lo que consideres oportuno o guardar silencio.',
  },
]

export const ESCENAS_VICTIMA: EscenaJuzgado[] = [
  {
    id: 'entrada',
    titulo: 'Entrada con acceso protegido',
    frase: 'Llegada al juzgado con posibilidad de acceso diferenciado o discreto.',
    roles: [
      { nombre: 'Personal judicial / Oficina de Víctimas', explicacion: 'Te guía hacia dependencias protegidas.' },
    ],
    nivelTipicoId: 1,
    audioguia: 'Entrada al edificio con apoyo de la oficina de atención a las víctimas.',
  },
  {
    id: 'control-seguridad',
    titulo: 'Control de seguridad',
    frase: 'Paso por el control de acceso al edificio.',
    roles: [
      { nombre: 'Seguridad', explicacion: 'Control de entrada rutinario.' },
    ],
    nivelTipicoId: 2,
    audioguia: 'Paso por el arco de seguridad.',
  },
  {
    id: 'espera-separada',
    titulo: 'Espera en sala protegida',
    frase: 'Esperas en un espacio separado para víctimas, sin coincidir con el investigado (Estatuto de la Víctima).',
    roles: [
      { nombre: 'Oficina de Asistencia a las Víctimas', explicacion: 'Acompañamiento profesional durante la espera.' },
      { nombre: 'Facilitador o acompañante', explicacion: 'Persona de tu confianza a tu lado.' },
    ],
    nivelTipicoId: 2,
    audioguia: 'Espera en una sala tranquila y separada para evitar cualquier confrontación visual previa.',
  },
  {
    id: 'sala-protegida',
    titulo: 'Declaración con medidas de protección',
    frase: 'Opción de declarar con biombo o videoconferencia para no tener contacto visual. Puedes pedirlo; decide el juez (arts. 7 bis LEC, 109 LECrim).',
    roles: [
      { nombre: 'Juez/a', explicacion: 'Acuerda las medidas de protección y tutela tu bienestar.' },
      { nombre: 'Fiscal y abogados', explicacion: 'Formulan preguntas adaptadas a tu situación.' },
    ],
    nivelTipicoId: 4,
    audioguia: 'Declaración en sala con protección visual (biombo o pantalla). Tienes derecho a pedir pausas.',
  },
]

export const ESCENAS_PARTE_CIVIL: EscenaJuzgado[] = [
  {
    id: 'entrada',
    titulo: 'Entrada del juzgado',
    frase: 'Llegas a la sede judicial para tu vista o audiencia civil/laboral.',
    roles: [
      { nombre: 'Información', explicacion: 'Te indica la sala civil correspondiente.' },
    ],
    nivelTipicoId: 1,
    audioguia: 'Entrada al juzgado civil. Acudes para resolver una cuestión de derechos o contratos.',
  },
  {
    id: 'control-seguridad',
    titulo: 'Control de seguridad',
    frase: 'Acceso por el arco detector habitual.',
    roles: [
      { nombre: 'Seguridad', explicacion: 'Control de entrada a la sede.' },
    ],
    nivelTipicoId: 2,
    audioguia: 'Paso por seguridad.',
  },
  {
    id: 'sala-espera',
    titulo: 'Espera con tu representación',
    frase: 'Te encuentras con tu abogado/a y procurador/a en la zona de espera.',
    roles: [
      { nombre: 'Abogado/a y Procurador/a', explicacion: 'Asumen la dirección técnica y representación en estrados.' },
    ],
    nivelTipicoId: 3,
    audioguia: 'Espera previa a la vista junto a tu equipo legal.',
  },
  {
    id: 'vista-civil',
    titulo: 'Vista judicial civil',
    frase: 'Audiencia o juicio con intervención letrada. Puedes solicitar explicaciones en lenguaje claro (art. 7 bis LEC).',
    roles: [
      { nombre: 'Juez/a o Magistrado/a', explicacion: 'Dirige el debate procesal y dictará sentencia civil.' },
      { nombre: 'Letrado de la Administración de Justicia', explicacion: 'Da fe pública de las actuaciones.' },
    ],
    nivelTipicoId: 4,
    audioguia: 'Vista civil ante el tribunal. Tu letrado interviene y puedes pedir aclaraciones si no entiendes algo.',
  },
]

export function escenasPorRol(rol?: RolPerfil): EscenaJuzgado[] {
  switch (rol) {
    case 'testigo':
      return ESCENAS_TESTIGO
    case 'investigado':
      return ESCENAS_INVESTIGADO
    case 'victima':
      return ESCENAS_VICTIMA
    case 'parte_civil':
      return ESCENAS_PARTE_CIVIL
    default:
      return ESCENAS_JUZGADO
  }
}

export function totalEscenasPorRol(rol?: RolPerfil): number {
  return escenasPorRol(rol).length
}

export const TOTAL_ESCENAS = ESCENAS_JUZGADO.length

export function escenaPorIndice(indice: number, rol?: RolPerfil): EscenaJuzgado {
  const lista = escenasPorRol(rol)
  const i = Math.min(lista.length - 1, Math.max(0, Math.trunc(indice)))
  return lista[i]
}

/** Nivel visual para EscenaSensorial: título/frase de la escena, sin tocar el preset del usuario. */
export function nivelVisualDesdeEscena(
  escena: EscenaJuzgado,
  valores: ValoresEstimulo
): NivelSala {
  return {
    id: escena.nivelTipicoId,
    nombre: escena.titulo,
    descripcion: escena.frase,
    audioguia: escena.audioguia,
    preset: valores,
  }
}

export function etiquetaNivelTipico(escena: EscenaJuzgado): string {
  const n = NIVELES[escena.nivelTipicoId]
  return n ? `Ambiente habitual: nivel ${n.id} (${n.nombre.toLowerCase()})` : ''
}
