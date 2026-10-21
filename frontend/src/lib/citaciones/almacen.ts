import type { CitacionProcesada, DatosClave, Plazo, Pictograma } from '@/lib/api'
import { programarSyncEstado } from '@/lib/sync/estadoUsuario'
import { diasNaturalesHasta, parsearFecha } from './fechas'

const CLAVE = 'court-citaciones'
export const EVENTO_CITACIONES = 'court-citaciones-cambio'
const MAX_CITACIONES = 8

export interface CitacionGuardada {
  id: string
  guardadaEn: number
  texto: string
  resultado: CitacionProcesada
}

function huellaTexto(texto: string): string {
  const normal = texto.trim().replace(/\s+/g, ' ').toLowerCase()
  let hash = 2166136261
  for (let i = 0; i < normal.length; i += 1) {
    hash ^= normal.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return `c${(hash >>> 0).toString(36)}`
}

function esPlazo(valor: unknown): valor is Plazo {
  if (!valor || typeof valor !== 'object') return false
  const plazo = valor as Plazo
  return typeof plazo.descripcion === 'string' && typeof plazo.fecha === 'string'
}

function esPictograma(valor: unknown): valor is Pictograma {
  if (!valor || typeof valor !== 'object') return false
  const picto = valor as Pictograma
  return typeof picto.keyword === 'string' && typeof picto.url === 'string' && typeof picto.id === 'number'
}

export function sanitizarResultado(raw: unknown): CitacionProcesada | null {
  if (!raw || typeof raw !== 'object') return null
  const entrada = raw as Partial<CitacionProcesada>
  if (!entrada.datos_clave || typeof entrada.datos_clave !== 'object') return null
  const datos = entrada.datos_clave
  const rol = typeof datos.rol === 'string' && datos.rol.trim() ? datos.rol.trim() : 'desconocido'

  return {
    datos_clave: {
      ...datos,
      rol,
      tipo_procedimiento: typeof datos.tipo_procedimiento === 'string' ? datos.tipo_procedimiento : '',
      organo: typeof datos.organo === 'string' ? datos.organo : '',
      fecha: typeof datos.fecha === 'string' ? datos.fecha : '',
      hora: typeof datos.hora === 'string' ? datos.hora : '',
      lugar: typeof datos.lugar === 'string' ? datos.lugar : '',
      puedo_pedir_ajustes: Boolean(datos.puedo_pedir_ajustes),
    },
    lectura_clara: typeof entrada.lectura_clara === 'string' ? entrada.lectura_clara : '',
    lectura_facil: typeof entrada.lectura_facil === 'string' ? entrada.lectura_facil : '',
    plazos: Array.isArray(entrada.plazos)
      ? entrada.plazos.filter(esPlazo).map((plazo) => ({
          descripcion: plazo.descripcion,
          fecha: plazo.fecha,
          dias_restantes: Number.isFinite(plazo.dias_restantes) ? plazo.dias_restantes : 0,
        }))
      : [],
    pictogram_keywords: Array.isArray(entrada.pictogram_keywords)
      ? entrada.pictogram_keywords.filter((item): item is string => typeof item === 'string')
      : [],
    pictogramas: Array.isArray(entrada.pictogramas) ? entrada.pictogramas.filter(esPictograma) : [],
    metricas_legibilidad: entrada.metricas_legibilidad,
  }
}

function esGuardada(valor: unknown): valor is CitacionGuardada {
  if (!valor || typeof valor !== 'object') return false
  const cita = valor as CitacionGuardada
  return typeof cita.id === 'string' && typeof cita.guardadaEn === 'number' && sanitizarResultado(cita.resultado) !== null
}

export function leerCitaciones(): CitacionGuardada[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(CLAVE)
    if (!raw) return []
    const datos = JSON.parse(raw) as unknown
    if (!Array.isArray(datos)) return []
    return datos.filter(esGuardada).map((cita) => ({
      id: cita.id,
      guardadaEn: cita.guardadaEn,
      texto: typeof cita.texto === 'string' ? cita.texto : '',
      resultado: sanitizarResultado(cita.resultado) as CitacionProcesada,
    }))
  } catch {
    return []
  }
}

function escribir(lista: CitacionGuardada[]) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista))
  } catch {
    return
  }
  window.dispatchEvent(new Event(EVENTO_CITACIONES))
  programarSyncEstado()
}

export function guardarCitacion(entrada: { texto: string; resultado: CitacionProcesada }): CitacionGuardada {
  const resultado = sanitizarResultado(entrada.resultado) ?? entrada.resultado
  const texto = entrada.texto.trim().slice(0, 8000)
  const id = huellaTexto(texto || `${resultado.datos_clave.fecha}|${resultado.datos_clave.organo}|${resultado.datos_clave.rol}`)
  const guardada: CitacionGuardada = {
    id,
    guardadaEn: Date.now(),
    texto,
    resultado,
  }
  const previas = leerCitaciones().filter((cita) => cita.id !== id)
  escribir([guardada, ...previas].slice(0, MAX_CITACIONES))
  return guardada
}

export function obtenerCitacion(id: string): CitacionGuardada | null {
  return leerCitaciones().find((cita) => cita.id === id) ?? null
}

export function fechasDeResultado(resultado: CitacionProcesada, hoy = new Date()): Date[] {
  const crudas = [resultado.datos_clave?.fecha, ...(resultado.plazos ?? []).map((plazo) => plazo.fecha)]
  const vistas = new Set<number>()
  const fechas: Date[] = []
  for (const cruda of crudas) {
    const fecha = parsearFecha(cruda, hoy)
    if (!fecha) continue
    const marca = fecha.getTime()
    if (vistas.has(marca)) continue
    vistas.add(marca)
    fechas.push(fecha)
  }
  return fechas
}

/** La cita más cercana: primero las que están por llegar, de menos a más días. */
export function fechaMasRelevante(resultado: CitacionProcesada, hoy = new Date()): Date | null {
  const fechas = fechasDeResultado(resultado, hoy)
  if (fechas.length === 0) return null
  const conDias = fechas.map((fecha) => ({ fecha, dias: diasNaturalesHasta(fecha, hoy) }))
  const proximas = conDias.filter((item) => item.dias >= 0).sort((a, b) => a.dias - b.dias)
  if (proximas.length > 0) return proximas[0].fecha
  return conDias.sort((a, b) => b.dias - a.dias)[0].fecha
}

export function ordenarPorRelevancia(lista: CitacionGuardada[], hoy = new Date()): CitacionGuardada[] {
  return [...lista].sort((a, b) => {
    const fechaA = fechaMasRelevante(a.resultado, hoy)
    const fechaB = fechaMasRelevante(b.resultado, hoy)
    if (!fechaA && !fechaB) return b.guardadaEn - a.guardadaEn
    if (!fechaA) return 1
    if (!fechaB) return -1
    const diasA = diasNaturalesHasta(fechaA, hoy)
    const diasB = diasNaturalesHasta(fechaB, hoy)
    const aProxima = diasA >= 0
    const bProxima = diasB >= 0
    if (aProxima !== bProxima) return aProxima ? -1 : 1
    if (aProxima) return diasA - diasB
    return diasB - diasA
  })
}

const MARCADOR_FECHA = /comprobar en el documento/i

export function fusionarResultado(remoto: CitacionProcesada, local: CitacionProcesada): CitacionProcesada {
  const datos: DatosClave = { ...local.datos_clave }
  const encima = remoto.datos_clave ?? local.datos_clave

  for (const clave of Object.keys(encima) as (keyof DatosClave)[]) {
    const valor = encima[clave]
    const previo = datos[clave]
    if (typeof valor === 'string') {
      if (!valor.trim()) continue
      if (MARCADOR_FECHA.test(valor) && typeof previo === 'string' && previo.trim() && !MARCADOR_FECHA.test(previo)) {
        continue
      }
    }
    if (Array.isArray(valor) && valor.length === 0 && Array.isArray(previo) && previo.length > 0) continue
    if (valor !== undefined && valor !== null) {
      Object.assign(datos, { [clave]: valor })
    }
  }

  const plazosRemotos = Array.isArray(remoto.plazos) ? remoto.plazos : []
  const plazosLocales = Array.isArray(local.plazos) ? local.plazos : []
  const plazos = plazosRemotos.some((plazo) => parsearFecha(plazo?.fecha)) ? plazosRemotos : plazosLocales

  return {
    ...local,
    ...remoto,
    datos_clave: datos,
    lectura_clara: remoto.lectura_clara?.trim() ? remoto.lectura_clara : local.lectura_clara,
    lectura_facil: remoto.lectura_facil?.trim() ? remoto.lectura_facil : local.lectura_facil,
    plazos,
    pictogram_keywords: remoto.pictogram_keywords?.length
      ? remoto.pictogram_keywords
      : local.pictogram_keywords ?? [],
    pictogramas: remoto.pictogramas?.length ? remoto.pictogramas : local.pictogramas ?? [],
  }
}
