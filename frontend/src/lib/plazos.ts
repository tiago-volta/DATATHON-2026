/**
 * Cómputo de plazos procesales hábiles (LEC / LOPJ / LECrim).
 * Excluye sábados, domingos y festivos nacionales oficiales de España.
 */

export const FESTIVOS_NACIONALES_ESPANA: Array<[number, number]> = [
  [1, 1],   // Año Nuevo
  [1, 6],   // Epifanía del Señor / Reyes
  [5, 1],   // Fiesta del Trabajo
  [8, 15],  // Asunción de la Virgen
  [10, 12], // Fiesta Nacional de España
  [11, 1],  // Todos los Santos
  [12, 6],  // Día de la Constitución Española
  [12, 8],  // Inmaculada Concepción
  [12, 25], // Natividad del Señor
]

export function esDiaHabilProcesal(
  fecha: Date,
  orden: 'civil' | 'penal' | 'general' = 'general'
): boolean {
  const diaSemana = fecha.getDay() // 0 = domingo, 6 = sábado
  if (diaSemana === 0 || diaSemana === 6) return false

  const mes = fecha.getMonth() + 1
  const dia = fecha.getDate()

  const esFestivoNacional = FESTIVOS_NACIONALES_ESPANA.some(
    ([m, d]) => m === mes && d === dia
  )
  if (esFestivoNacional) return false

  if (orden === 'civil') {
    // Agosto inhábil procesal (Art. 130.2 LEC)
    if (mes === 8) return false
    // Periodo navideño 24 dic a 6 ene inhábil procesal (Art. 130.2 LEC)
    if ((mes === 12 && dia >= 24) || (mes === 1 && dia <= 6)) return false
  }

  return true
}

export function calcularDiasHabilesRestantes(
  fechaDestino: string | Date,
  orden: 'civil' | 'penal' | 'general' = 'general'
): number {
  const destino = typeof fechaDestino === 'string' ? new Date(fechaDestino) : fechaDestino
  const hoy = new Date()
  hoy.setHours(0, 0, 0, 0)
  destino.setHours(0, 0, 0, 0)

  if (destino <= hoy) return 0

  let habiles = 0
  const cursor = new Date(hoy)
  cursor.setDate(cursor.getDate() + 1) // dies a quo non computatur (Art. 133.1 LEC)

  while (cursor <= destino) {
    if (esDiaHabilProcesal(cursor, orden)) {
      habiles += 1
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  return habiles
}

