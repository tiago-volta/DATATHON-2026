/**
 * Fechas de citación en calendario local.
 * No usa `new Date('YYYY-MM-DD')`: ese formato es UTC y puede cambiar de día.
 */

const MESES: Record<string, number> = {
  enero: 0,
  febrero: 1,
  marzo: 2,
  abril: 3,
  mayo: 4,
  junio: 5,
  julio: 6,
  agosto: 7,
  septiembre: 8,
  setiembre: 8,
  octubre: 9,
  noviembre: 10,
  diciembre: 11,
}

function fechaLocal(anio: number, mes: number, dia: number): Date | null {
  if (mes < 0 || mes > 11 || dia < 1 || dia > 31) return null
  const fecha = new Date(anio, mes, dia)
  if (fecha.getFullYear() !== anio || fecha.getMonth() !== mes || fecha.getDate() !== dia) {
    return null
  }
  return fecha
}

function indiceMes(nombre: string): number | null {
  const limpio = nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
  return MESES[limpio] ?? null
}

export function parsearFecha(valor: string | null | undefined, hoy = new Date()): Date | null {
  if (!valor) return null
  const texto = valor.trim()
  if (!texto) return null

  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) {
    return fechaLocal(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3]))
  }

  const numerica = texto.match(/\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})\b/)
  if (numerica) {
    return fechaLocal(Number(numerica[3]), Number(numerica[2]) - 1, Number(numerica[1]))
  }

  const prosa = texto.match(/(\d{1,2})\s+de\s+([a-záéíóúñ]+)(?:\s+de\s+(20\d{2}))?/i)
  if (!prosa) return null

  const dia = Number(prosa[1])
  const mes = indiceMes(prosa[2])
  if (mes === null) return null

  if (prosa[3]) return fechaLocal(Number(prosa[3]), mes, dia)

  const esteAnio = fechaLocal(hoy.getFullYear(), mes, dia)
  if (!esteAnio) return null
  const hace = diasNaturalesHasta(esteAnio, hoy)
  if (hace < -30) return fechaLocal(hoy.getFullYear() + 1, mes, dia)
  return esteAnio
}

export function diasNaturalesHasta(fecha: Date, hoy = new Date()): number {
  const inicioHoy = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  const inicioFecha = Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate())
  return Math.round((inicioFecha - inicioHoy) / 86_400_000)
}

export function etiquetaDias(dias: number | null): string {
  if (dias === null) return 'Fecha por confirmar'
  if (dias === 0) return 'Es hoy'
  if (dias === 1) return 'Falta 1 día'
  if (dias > 1) return `Faltan ${dias} días`
  if (dias === -1) return 'Fue ayer'
  return `Pasó hace ${Math.abs(dias)} días`
}

export function formatearFechaLarga(fecha: Date): string {
  const texto = fecha.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}
