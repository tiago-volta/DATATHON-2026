import { AJUSTES_DISPONIBLES } from '@/lib/contenido'
import { cargarPractica } from '@/lib/practica'
import { ESTIMULOS_META, NIVELES } from '@/lib/sala-previa/niveles'
import { cargarLoQueTeAyuda, tienePractica } from '@/lib/sala-previa/loQueTeAyuda'
import { cargarProgreso } from '@/lib/sala-previa/progreso'
import type { IdEstimulo } from '@/lib/sala-previa/tipos'
import { programarSyncEstado } from '@/lib/sync/estadoUsuario'
import type {
  HerramientaUsada,
  IdHerramienta,
  NivelTolerancia,
  PerfilV1,
  PerfilV2,
  PreguntaDominada,
  RolPerfil,
  TipoPreguntaDificil,
  ToleranciaEstimulo,
} from './tipos'

export * from './tipos'

export const CLAVE_PERFIL = 'court-perfil'
export const EVENTO_PERFIL = 'court-perfil-cambio'

export const ROLES_DISPONIBLES: {
  id: RolPerfil
  nombre: string
  subtitulo: string
  icono: string
}[] = [
  { id: 'testigo', nombre: 'Testigo', subtitulo: 'Viste o sabes algo (no estás acusado)', icono: '👁️' },
  { id: 'investigado', nombre: 'Investigado o acusado', subtitulo: 'Hay una denuncia o proceso penal contra ti', icono: '🛡️' },
  { id: 'victima', nombre: 'Víctima o perjudicado', subtitulo: 'Has sufrido el delito o un daño directo', icono: '🤝' },
  { id: 'parte_civil', nombre: 'Demandante o demandado', subtitulo: 'Juicio civil, familia, vivienda o laboral', icono: '📑' },
]

export const ESTIMULOS_PERFIL: IdEstimulo[] = ['ruido', 'luz', 'gente']

export const TODOS_LOS_ESTIMULOS: IdEstimulo[] = [
  'ruido',
  'luz',
  'gente',
  'voces',
  'puerta',
  'movil',
  'nombre-en-alto',
  'control-seguridad',
  'toga',
]

export const NIVELES_TOLERANCIA: {
  valor: NivelTolerancia
  etiqueta: string
  ayuda: string
}[] = [
  { valor: 0, etiqueta: 'Muy poca', ayuda: 'Prefieres casi silencio y poca gente.' },
  { valor: 1, etiqueta: 'Poca', ayuda: 'Aguantas un murmullo suave.' },
  { valor: 2, etiqueta: 'Media-baja', ayuda: 'Aguantas algo de gente y ruido.' },
  { valor: 3, etiqueta: 'Media', ayuda: 'Aguantas un ambiente normal de espera.' },
  { valor: 4, etiqueta: 'Alta', ayuda: 'Aguantas una sala bastante llena.' },
  { valor: 5, etiqueta: 'Muy alta', ayuda: 'Puedes practicar con mucho estímulo.' },
]

export type PerfilUsuario = PerfilV2

export interface PerfilVista {
  tienePerfil: boolean
  nombre: string | null
  rol: RolPerfil
  tolerancia: NivelTolerancia | null
  toleranciaEtiqueta: string | null
  estimulosSensibles: IdEstimulo[]
  estimulosEtiquetas: string[]
  nivelSalaNombre: string | null
  diasPracticados: number
  sesionesSala: number
}

const VACIO_VISTA: PerfilVista = {
  tienePerfil: false,
  nombre: null,
  rol: 'testigo',
  tolerancia: null,
  toleranciaEtiqueta: null,
  estimulosSensibles: [],
  estimulosEtiquetas: [],
  nivelSalaNombre: null,
  diasPracticados: 0,
  sesionesSala: 0,
}

const AJUSTES_VALIDOS = new Set(AJUSTES_DISPONIBLES.map((a) => a.id))

function limpiarNombre(valor: string): string {
  return valor
    .replace(/[^\p{L}\s'-]/gu, '')
    .replace(/\s{2,}/g, ' ')
    .slice(0, 60)
    .trim()
}

function nombreValido(valor: string): boolean {
  const limpio = valor.trim()
  if (!limpio) return false
  const soloLetras = limpio.replace(/[^\p{L}]/gu, '')
  if (soloLetras.length < 2) return false
  if (/^(\p{L})\1+$/iu.test(soloLetras)) return false
  const palabras = limpio.split(/\s+/)
  if (palabras.some((p) => p.length > 25)) return false
  return true
}

function normalizarIdsAjuste(ids: string[]): string[] {
  return Array.from(new Set(ids.filter((id) => AJUSTES_VALIDOS.has(id))))
}

function esEstimulo(valor: unknown): valor is IdEstimulo {
  return typeof valor === 'string' && TODOS_LOS_ESTIMULOS.includes(valor as IdEstimulo)
}

function esTolerancia(valor: unknown): valor is NivelTolerancia {
  return (
    typeof valor === 'number' &&
    Number.isInteger(valor) &&
    valor >= 0 &&
    valor <= 5
  )
}

function normalizarRol(rol: unknown): RolPerfil {
  if (
    rol === 'investigado' ||
    rol === 'victima' ||
    rol === 'parte_civil' ||
    rol === 'desconocido'
  ) {
    return rol
  }
  return 'testigo'
}

function avisarCambioPerfil() {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(EVENTO_PERFIL))
}

export function etiquetaTolerancia(nivel: NivelTolerancia): string {
  return NIVELES_TOLERANCIA.find((item) => item.valor === nivel)?.etiqueta ?? 'Media'
}

export function etiquetaEstimulo(id: IdEstimulo): string {
  return ESTIMULOS_META[id]?.etiqueta ?? id
}

/**
 * Migra un objeto cualquiera (v1 o v2) a la estructura PerfilV2 garantizada.
 */
export function migrarPerfil(raw: any): PerfilV2 | null {
  if (!raw || typeof raw !== 'object') return null
  const nombre = limpiarNombre(typeof raw.nombre === 'string' ? raw.nombre : '')
  if (!nombreValido(nombre)) return null

  const rol = normalizarRol(raw.rol)
  const ahora = Date.now()
  const creado = typeof raw.creado === 'number' ? raw.creado : ahora
  const actualizado = typeof raw.actualizado === 'number' ? raw.actualizado : ahora

  // Si ya es v2 bien estructurado:
  if (raw.version === 2 && Array.isArray(raw.estimulos)) {
    const estimulos = raw.estimulos.map((e: any): ToleranciaEstimulo => ({
      id: esEstimulo(e.id) ? e.id : 'ruido',
      activo: Boolean(e.activo),
      nivel: esTolerancia(e.nivel) ? e.nivel : 1,
      objetivo: esTolerancia(e.objetivo) ? e.objetivo : 1,
      historial: Array.isArray(e.historial) ? e.historial.slice(-10) : [],
    }))

    const herramientas: HerramientaUsada[] = Array.isArray(raw.herramientas)
      ? raw.herramientas.map((h: any) => ({
          id: h.id,
          vecesUsada: Number(h.vecesUsada) || 1,
          ayudo: h.ayudo === null ? null : Boolean(h.ayudo),
          estimulo: esEstimulo(h.estimulo) ? h.estimulo : undefined,
        }))
      : []

    const preguntas: PreguntaDominada[] = Array.isArray(raw.preguntas)
      ? raw.preguntas.map((p: any) => ({
          tipo: p.tipo,
          intentos: Number(p.intentos) || 0,
          aciertos: Number(p.aciertos) || 0,
          dominada: Boolean(p.dominada),
        }))
      : []

    const v2: PerfilV2 = {
      version: 2,
      nombre,
      rol,
      estimulos,
      herramientas,
      preguntas,
      plan: raw.plan,
      creado,
      actualizado,
      tolerancia: calcularToleranciaMedia(estimulos),
      estimulosSensibles: estimulos.filter((e: ToleranciaEstimulo) => e.activo && e.nivel <= 1).map((e: ToleranciaEstimulo) => e.id),
    }
    return v2
  }

  // Migración desde v1
  const v1 = raw as PerfilV1
  const toleranciaV1: NivelTolerancia = esTolerancia(v1.tolerancia) ? v1.tolerancia : 1
  const sensibles = Array.isArray(v1.estimulosSensibles)
    ? v1.estimulosSensibles.filter(esEstimulo)
    : []

  const estimulos: ToleranciaEstimulo[] = TODOS_LOS_ESTIMULOS.map((id) => {
    const esBase = id === 'ruido' || id === 'luz' || id === 'gente'
    if (esBase) {
      const rebaja = sensibles.includes(id) ? 1 : 0
      const nivel = Math.max(0, toleranciaV1 - rebaja) as NivelTolerancia
      return {
        id,
        activo: true,
        nivel,
        objetivo: nivel,
        historial: [],
      }
    }
    return {
      id,
      activo: false,
      nivel: 0,
      objetivo: 0,
      historial: [],
    }
  })

  // Recuperar herramientas de court-lo-que-te-ayuda si existen
  const herramientas: HerramientaUsada[] = []
  try {
    const ayuda = cargarLoQueTeAyuda()
    if (ayuda && Array.isArray(ayuda.ayudas)) {
      if (ayuda.ayudas.includes('pausas') || ayuda.usoCalma) {
        herramientas.push({
          id: 'pausa',
          vecesUsada: 1,
          ayudo: true,
        })
      }
    }
  } catch {
    /* ignore */
  }

  const nuevoV2: PerfilV2 = {
    version: 2,
    nombre,
    rol,
    estimulos,
    herramientas,
    preguntas: [],
    creado,
    actualizado: ahora,
    tolerancia: toleranciaV1,
    estimulosSensibles: sensibles,
  }

  // Guardar migración en localStorage
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(CLAVE_PERFIL, JSON.stringify(nuevoV2))
      programarSyncEstado()
    } catch {
      /* ignore */
    }
  }

  return nuevoV2
}

function calcularToleranciaMedia(estimulos: ToleranciaEstimulo[]): NivelTolerancia {
  const activos = estimulos.filter((e) => e.activo)
  if (activos.length === 0) return 1
  const suma = activos.reduce((acc, curr) => acc + curr.nivel, 0)
  return Math.min(5, Math.max(0, Math.round(suma / activos.length))) as NivelTolerancia
}

export function cargarPerfil(): PerfilV2 | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CLAVE_PERFIL)
    if (!raw) return null
    return migrarPerfil(JSON.parse(raw))
  } catch {
    return null
  }
}

export function hayPerfil(): boolean {
  return cargarPerfil() !== null
}

export function guardarPerfil(entrada: {
  nombre: string
  rol?: RolPerfil
  tolerancia?: NivelTolerancia
  estimulosSensibles?: IdEstimulo[]
  estimulos?: ToleranciaEstimulo[]
}): PerfilV2 | null {
  if (typeof window === 'undefined') return null
  const anterior = cargarPerfil()

  let estimulos: ToleranciaEstimulo[]
  if (entrada.estimulos && Array.isArray(entrada.estimulos)) {
    estimulos = entrada.estimulos
  } else if (anterior?.estimulos) {
    estimulos = anterior.estimulos
  } else {
    const tol = entrada.tolerancia ?? 1
    estimulos = TODOS_LOS_ESTIMULOS.map((id) => ({
      id,
      activo: id === 'ruido' || id === 'luz' || id === 'gente',
      nivel: tol,
      objetivo: tol,
      historial: [],
    }))
  }

  const candidato = migrarPerfil({
    version: 2,
    nombre: entrada.nombre,
    rol: entrada.rol ?? anterior?.rol ?? 'testigo',
    estimulos,
    herramientas: anterior?.herramientas ?? [],
    preguntas: anterior?.preguntas ?? [],
    creado: anterior?.creado ?? Date.now(),
    actualizado: Date.now(),
  })

  if (!candidato) return null
  try {
    localStorage.setItem(CLAVE_PERFIL, JSON.stringify(candidato))
    avisarCambioPerfil()
    programarSyncEstado()
    return candidato
  } catch {
    return null
  }
}

export function borrarPerfil() {
  if (typeof window === 'undefined') return
  try {
    localStorage.removeItem(CLAVE_PERFIL)
    avisarCambioPerfil()
    programarSyncEstado()
  } catch {
    /* ignore */
  }
}

/**
 * Propone el siguiente objetivo para un estímulo: como máximo nivel + 1. Nunca baja por fallo.
 */
export function proponerObjetivo(id: IdEstimulo): NivelTolerancia {
  const perfil = cargarPerfil()
  const est = perfil?.estimulos.find((e) => e.id === id)
  if (!est) return 1
  return Math.min(5, est.nivel + 1) as NivelTolerancia
}

/**
 * Registra una sesión de entrenamiento sobre un estímulo concreto.
 */
export function registrarSesionEstimulo(
  id: IdEstimulo,
  nivel: number,
  calma: boolean
): PerfilV2 | null {
  const perfil = cargarPerfil()
  if (!perfil) return null

  const idx = perfil.estimulos.findIndex((e) => e.id === id)
  const nuevoHistorial = {
    fecha: new Date().toISOString(),
    nivel,
    calma,
  }

  if (idx >= 0) {
    const est = { ...perfil.estimulos[idx] }
    est.activo = true
    est.historial = [...(est.historial || []), nuevoHistorial].slice(-10)
    if (calma && nivel > est.nivel) {
      est.nivel = Math.min(5, Math.max(0, nivel)) as NivelTolerancia
    }
    // Proponer objetivo siguiente: sube a nivel + 1 si hubo calma, o se mantiene si se detuvo
    est.objetivo = Math.min(5, calma ? est.nivel + 1 : est.nivel) as NivelTolerancia
    perfil.estimulos[idx] = est
  } else {
    const nivelTol = Math.min(5, Math.max(0, nivel)) as NivelTolerancia
    perfil.estimulos.push({
      id,
      activo: true,
      nivel: nivelTol,
      objetivo: Math.min(5, calma ? nivelTol + 1 : nivelTol) as NivelTolerancia,
      historial: [nuevoHistorial],
    })
  }

  perfil.actualizado = Date.now()
  perfil.tolerancia = calcularToleranciaMedia(perfil.estimulos)

  try {
    localStorage.setItem(CLAVE_PERFIL, JSON.stringify(perfil))
    avisarCambioPerfil()
    programarSyncEstado()
    return perfil
  } catch {
    return null
  }
}

/**
 * Registra el uso de una herramienta sensorial y si ayudó a la persona.
 */
export function registrarHerramienta(
  id: IdHerramienta,
  ayudo: boolean | null,
  estimulo?: IdEstimulo
): PerfilV2 | null {
  const perfil = cargarPerfil()
  if (!perfil) return null

  const idx = perfil.herramientas.findIndex((h) => h.id === id)
  if (idx >= 0) {
    perfil.herramientas[idx].vecesUsada += 1
    perfil.herramientas[idx].ayudo = ayudo
    if (estimulo) perfil.herramientas[idx].estimulo = estimulo
  } else {
    perfil.herramientas.push({
      id,
      vecesUsada: 1,
      ayudo,
      estimulo,
    })
  }

  perfil.actualizado = Date.now()
  try {
    localStorage.setItem(CLAVE_PERFIL, JSON.stringify(perfil))
    avisarCambioPerfil()
    programarSyncEstado()
    return perfil
  } catch {
    return null
  }
}

/**
 * Registra un intento de respuesta en una pregunta difícil de Ensaya.
 */
export function registrarPreguntaDificil(
  tipo: TipoPreguntaDificil,
  acierto: boolean
): PerfilV2 | null {
  const perfil = cargarPerfil()
  if (!perfil) return null

  const idx = perfil.preguntas.findIndex((p) => p.tipo === tipo)
  if (idx >= 0) {
    const p = { ...perfil.preguntas[idx] }
    p.intentos += 1
    if (acierto) {
      p.aciertos += 1
    }
    p.dominada = p.aciertos >= 2
    perfil.preguntas[idx] = p
  } else {
    perfil.preguntas.push({
      tipo,
      intentos: 1,
      aciertos: acierto ? 1 : 0,
      dominada: false,
    })
  }

  perfil.actualizado = Date.now()
  try {
    localStorage.setItem(CLAVE_PERFIL, JSON.stringify(perfil))
    avisarCambioPerfil()
    programarSyncEstado()
    return perfil
  } catch {
    return null
  }
}

/**
 * Activa un estímulo adicional para el entrenamiento de la persona.
 */
export function activarEstimulo(id: IdEstimulo): PerfilV2 | null {
  const perfil = cargarPerfil()
  if (!perfil) return null

  const idx = perfil.estimulos.findIndex((e) => e.id === id)
  if (idx >= 0) {
    perfil.estimulos[idx].activo = true
  } else {
    perfil.estimulos.push({
      id,
      activo: true,
      nivel: 0,
      objetivo: 1,
      historial: [],
    })
  }

  perfil.actualizado = Date.now()
  try {
    localStorage.setItem(CLAVE_PERFIL, JSON.stringify(perfil))
    avisarCambioPerfil()
    programarSyncEstado()
    return perfil
  } catch {
    return null
  }
}

/** Ajustes que la sala ya apuntó. No escribe en el almacenamiento de la sala. */
export function leerAyudasSala(): string[] {
  try {
    return normalizarIdsAjuste(cargarLoQueTeAyuda().ayudas)
  } catch {
    return []
  }
}

/** Ajustes sugeridos por los estímulos del perfil y por la sala. */
export function leerAjustesDesdePerfilYSala(): string[] {
  const desdeSala = leerAyudasSala()
  const perfil = cargarPerfil()
  const desdePerfil = perfil
    ? perfil.estimulos
        .filter((e: ToleranciaEstimulo) => e.activo && e.nivel <= 2)
        .flatMap((e: ToleranciaEstimulo) => ESTIMULOS_META[e.id]?.ajustesPasaporte || [])
    : []
  return normalizarIdsAjuste([...desdePerfil, ...desdeSala])
}

export function leerNombrePerfil(): string | null {
  return cargarPerfil()?.nombre ?? null
}

/**
 * Junta el perfil guardado con la práctica y la sala (solo lectura).
 */
export function leerVistaPerfil(): PerfilVista {
  if (typeof window === 'undefined') return VACIO_VISTA
  try {
    const perfil = cargarPerfil()
    if (!perfil) return VACIO_VISTA

    const diasPracticados = cargarPractica().dias.length
    let nivelSalaNombre: string | null = null
    let sesionesSala = 0
    try {
      if (localStorage.getItem('court-sala-previa-progreso') !== null) {
        const progreso = cargarProgreso()
        nivelSalaNombre = NIVELES[progreso.nivelMaximo]?.nombre ?? null
        sesionesSala = progreso.sesionesCompletadas
      }
    } catch {
      /* ignore */
    }

    const estimulosActivos = perfil.estimulos
      .filter((e) => e.activo)
      .map((e) => e.id)

    const tolerancia = perfil.tolerancia ?? calcularToleranciaMedia(perfil.estimulos)

    return {
      tienePerfil: true,
      nombre: perfil.nombre,
      rol: perfil.rol,
      tolerancia,
      toleranciaEtiqueta: etiquetaTolerancia(tolerancia),
      estimulosSensibles: estimulosActivos,
      estimulosEtiquetas: estimulosActivos.map(etiquetaEstimulo),
      nivelSalaNombre,
      diasPracticados,
      sesionesSala,
    }
  } catch {
    return VACIO_VISTA
  }
}
