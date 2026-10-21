import { normalizarAjustes, sanitizarNombre, validarNombre } from '@/lib/pasaporte'
import { cargarPractica } from '@/lib/practica'
import { NIVELES } from '@/lib/sala-previa/niveles'
import { cargarLoQueTeAyuda, tienePractica } from '@/lib/sala-previa/loQueTeAyuda'
import { cargarProgreso } from '@/lib/sala-previa/progreso'

const CLAVE_PASAPORTE = 'court-pasaporte'
const CLAVE_PROGRESO = 'court-sala-previa-progreso'

export interface PerfilLectura {
  visible: boolean
  nombre: string | null
  rol: 'testigo'
  nivelNombre: string | null
  diasPracticados: number
}

const VACIO: PerfilLectura = {
  visible: false,
  nombre: null,
  rol: 'testigo',
  nivelNombre: null,
  diasPracticados: 0,
}

function leerNombrePasaporte(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(CLAVE_PASAPORTE)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { nombre?: unknown }
    if (typeof parsed.nombre !== 'string') return null
    const nombre = sanitizarNombre(parsed.nombre).trim()
    return validarNombre(nombre) === null ? nombre : null
  } catch {
    return null
  }
}

function hayProgresoDeSala(): boolean {
  if (typeof window === 'undefined') return false
  try {
    if (localStorage.getItem(CLAVE_PROGRESO) === null) return false
    const progreso = cargarProgreso()
    return (
      progreso.nivelMaximo > 0 ||
      progreso.sesionesCompletadas > 0 ||
      progreso.molestias.length > 0
    )
  } catch {
    return false
  }
}

/** Ajustes que la sala ya apuntó. No escribe en el almacenamiento de la sala. */
export function leerAyudasSala(): string[] {
  try {
    return normalizarAjustes(cargarLoQueTeAyuda().ayudas)
  } catch {
    return []
  }
}

/** Junta nombre, práctica y sala. Si el JSON falla, no hay resumen. */
export function leerPerfil(): PerfilLectura {
  if (typeof window === 'undefined') return VACIO
  try {
    const nombre = leerNombrePasaporte()
    const diasPracticados = cargarPractica().dias.length
    const progreso = hayProgresoDeSala() ? cargarProgreso() : null
    const nivelNombre = progreso
      ? (NIVELES[progreso.nivelMaximo]?.nombre ?? null)
      : null
    const salaConDatos = tienePractica(cargarLoQueTeAyuda())
    const visible = Boolean(nombre) || diasPracticados > 0 || nivelNombre !== null || salaConDatos
    if (!visible) return VACIO
    return {
      visible: true,
      nombre,
      rol: 'testigo',
      nivelNombre,
      diasPracticados,
    }
  } catch {
    return VACIO
  }
}
