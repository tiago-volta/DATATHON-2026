import type { CitacionGuardada } from './almacen'
import { fechaMasRelevante, ordenarPorRelevancia } from './almacen'
import { diasNaturalesHasta, etiquetaDias, formatearFechaLarga } from './fechas'

export interface ResumenCita {
  id: string
  titulo: string
  rol: string
  lugar: string
  fechaTexto: string
  dias: number | null
  diasTexto: string
  esLaMasProxima: boolean
}

const ORGANOS_GENERICOS = new Set([
  'órgano judicial',
  'organo judicial',
  'sede judicial indicada en la carta',
])

const LUGARES_GENERICOS = new Set([
  'sede judicial indicada en la carta',
  'comprobar en el documento original',
])

const ROLES: Record<string, string> = {
  testigo: 'Testigo',
  investigado: 'Investigado o acusado',
  victima: 'Víctima',
  víctima: 'Víctima',
  demandante: 'Demandante',
  demandado: 'Demandado',
  demandada: 'Demandada',
  parte_civil: 'Parte civil',
  desconocido: 'Papel por confirmar',
  'persona absuelta': 'Persona absuelta',
  'persona condenada': 'Persona condenada',
}

function etiquetaRol(rol: string | undefined): string {
  const limpio = rol?.trim().toLowerCase() ?? ''
  if (!limpio) return 'Papel por confirmar'
  return ROLES[limpio] ?? limpio.charAt(0).toUpperCase() + limpio.slice(1)
}

function tituloCitacion(organo: string | undefined): string {
  const limpio = organo?.trim() ?? ''
  if (!limpio || ORGANOS_GENERICOS.has(limpio.toLowerCase())) return 'Citación judicial'
  return limpio
}

function lugarVisible(lugar: string | undefined): string {
  const limpio = lugar?.trim() ?? ''
  if (!limpio || LUGARES_GENERICOS.has(limpio.toLowerCase())) return ''
  return limpio
}

export function resumirCitaciones(lista: CitacionGuardada[], hoy = new Date()): ResumenCita[] {
  return ordenarPorRelevancia(lista, hoy).map((cita, indice) => {
    const fecha = fechaMasRelevante(cita.resultado, hoy)
    const dias = fecha ? diasNaturalesHasta(fecha, hoy) : null
    const datos = cita.resultado.datos_clave
    const fechaEscrita = datos.fecha?.trim() ?? ''
    return {
      id: cita.id,
      titulo: tituloCitacion(datos.organo),
      rol: etiquetaRol(datos.rol),
      lugar: lugarVisible(datos.lugar),
      fechaTexto: fecha ? formatearFechaLarga(fecha) : fechaEscrita || 'Fecha por confirmar',
      dias,
      diasTexto: etiquetaDias(dias),
      esLaMasProxima: indice === 0 && dias !== null && dias >= 0,
    }
  })
}
