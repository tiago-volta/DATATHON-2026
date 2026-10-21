/** Vacío = misma origen (Next reescribe /api → backend). */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? ''

export interface ApoyoNumerico {
  etiqueta: string
  cifra: string
  en_palabras: string
}

export interface QuePasaSiNoVoy {
  resumen: string
  pasos_si_no_puedes: string[]
  mensaje_calma: string
}

export interface PasoPipelineIA {
  paso: number
  nombre: string
  detalle: string
}

export interface DatosClave {
  tipo_documento?: 'citacion' | 'sentencia'
  rol: string
  tipo_procedimiento: string
  organo: string
  fecha: string
  hora: string
  lugar: string
  delito?: string
  numero_procedimiento?: string
  derechos?: string[]
  que_llevar?: string[]
  puedo_pedir_ajustes: boolean
  base_legal_ajustes?: string
  apoyo_numerico?: ApoyoNumerico[]
  que_pasa_si_no_voy?: QuePasaSiNoVoy
  pasos_super_simples?: string[]
  pipeline_ia?: PasoPipelineIA[]
}

export interface Plazo {
  descripcion: string
  fecha: string
  dias_restantes: number
}

export interface Pictograma {
  keyword: string
  id: number
  url: string
}

export interface CitacionProcesada {
  datos_clave: DatosClave
  lectura_clara: string
  lectura_facil: string
  plazos: Plazo[]
  pictogram_keywords: string[]
  pictogramas: Pictograma[]
}

export interface Fase {
  numero: number
  nombre: string
  descripcion: string
  icono: string
  que_hacer: string
  pictograma: string
}

export interface Rol {
  nombre: string
  descripcion: string
  que_hace: string
  como_reconocerlo: string
  icono: string
  pictograma: string
}

export interface AnalisisPregunta {
  original: string
  semaforo: 'verde' | 'amarillo' | 'rojo'
  problemas: string[]
  impacto_cognitivo: string
  reformulada: string | null
  preguntas_divididas: string[]
  consejos: string[]
}

export async function procesarCitacion(texto: string, perfil?: string): Promise<CitacionProcesada> {
  const response = await fetch(`${API_URL}/api/procesar-citacion`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texto, perfil }),
  })

  if (!response.ok) throw new Error('Error al procesar la citación')
  return response.json()
}

export async function analizarPreguntaAPI(
  pregunta: string,
  perfil?: string
): Promise<AnalisisPregunta> {
  const response = await fetch(`${API_URL}/api/analizar-pregunta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ pregunta, perfil }),
  })

  if (!response.ok) throw new Error('Error al analizar la pregunta')
  return response.json()
}

export async function obtenerDemoLuis() {
  const response = await fetch(`${API_URL}/api/demo/luis`)
  if (!response.ok) throw new Error('Error al cargar datos')
  return response.json()
}

export async function obtenerDemoJuan() {
  const response = await fetch(`${API_URL}/api/demo/juan`)
  if (!response.ok) throw new Error('Error al cargar datos')
  return response.json()
}

export async function obtenerFases(orden: string): Promise<{ fases: Fase[] }> {
  const response = await fetch(`${API_URL}/api/fases-judiciales/${orden}`)
  if (!response.ok) throw new Error('Error al cargar fases')
  return response.json()
}

export async function obtenerRoles(): Promise<Rol[]> {
  const response = await fetch(`${API_URL}/api/roles-judiciales`)
  if (!response.ok) throw new Error('Error al cargar roles')
  return response.json()
}

export function descargarICS(plazos: Plazo[], titulo: string) {
  const params = new URLSearchParams({ titulo })

  fetch(`${API_URL}/api/generar-ics?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(plazos),
  })
    .then((response) => response.blob())
    .then((blob) => {
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'citacion_puente.ics'
      a.click()
      window.URL.revokeObjectURL(url)
    })
}
