import type { IdEstimulo } from './tipos'
import type { PerfilV2 } from '@/lib/perfil/tipos'

export interface EventoSala {
  id: string
  tipo: IdEstimulo
  titulo: string
  descripcion: string
  enSegundo: number
  duracionSegundos: number
  avisoPrevioSegundos: number
  avisoTexto: string
  despuesTexto: string
}

export const EVENTOS_DEFECTO: EventoSala[] = [
  {
    id: 'ev-gente-pasillo',
    tipo: 'gente',
    titulo: 'Gente andando por el pasillo',
    descripcion: 'Paso de personas y movimiento de público en el entorno.',
    enSegundo: 10,
    duracionSegundos: 8,
    avisoPrevioSegundos: 5,
    avisoTexto: 'Ahora van a pasar varias personas andando por el pasillo.',
    despuesTexto: 'Después una persona entrará por la puerta.',
  },
  {
    id: 'ev-persona-entra',
    tipo: 'gente',
    titulo: 'Persona que entra a la sala',
    descripcion: 'Un funcionario o asistente abre la puerta y accede a la sala.',
    enSegundo: 25,
    duracionSegundos: 10,
    avisoPrevioSegundos: 5,
    avisoTexto: 'Ahora va a entrar una persona a la sala.',
    despuesTexto: 'Después sonará una puerta al cerrarse.',
  },
  {
    id: 'ev-puerta',
    tipo: 'puerta',
    titulo: 'Sonido de puerta',
    descripcion: 'Una puerta de madera que se abre o encaja al fondo.',
    enSegundo: 42,
    duracionSegundos: 4,
    avisoPrevioSegundos: 5,
    avisoTexto: 'Ahora vas a oír el sonido de una puerta.',
    despuesTexto: 'Después se escuchará la vibración de un teléfono.',
  },
  {
    id: 'ev-movil',
    tipo: 'movil',
    titulo: 'Teléfono móvil en vibración',
    descripcion: 'Una vibración corta de un móvil entre el público.',
    enSegundo: 58,
    duracionSegundos: 5,
    avisoPrevioSegundos: 5,
    avisoTexto: 'Ahora va a vibrar un teléfono móvil en la sala.',
    despuesTexto: 'Después te llamarán por tu nombre.',
  },
  {
    id: 'ev-nombre-llamada',
    tipo: 'nombre-en-alto',
    titulo: 'Llamada oficial por tu nombre',
    descripcion: 'El agente judicial pronuncia tu nombre en voz alta para pasar a sala.',
    enSegundo: 75,
    duracionSegundos: 6,
    avisoPrevioSegundos: 6,
    avisoTexto: 'Ahora van a llamar tu nombre en alto.',
    despuesTexto: 'Todo listo para tu declaración.',
  },
]

export function generarAgendaEventos(perfil?: PerfilV2 | null): EventoSala[] {
  const nombre = perfil?.nombre || 'Luis García'
  return EVENTOS_DEFECTO.map((ev) => {
    if (ev.id === 'ev-nombre-llamada') {
      return {
        ...ev,
        descripcion: `El agente judicial llama: "${nombre}, a la sala de vistas".`,
        avisoTexto: `Ahora van a llamar en alto: "${nombre}, a la sala 3".`,
      }
    }
    return ev
  })
}
