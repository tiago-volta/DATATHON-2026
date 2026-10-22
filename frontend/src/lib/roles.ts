import { leerCitaciones } from '@/lib/citaciones/almacen'
import { resumirCitaciones } from '@/lib/citaciones/resumen'
import { cargarPerfil } from '@/lib/perfil/perfil'
import rolesData from '@/data/roles.json'
import type { RolPerfil } from '@/lib/perfil/tipos'

export interface PasoRuta {
  paso: number
  titulo: string
  detalle: string
}

export interface ObligacionRol {
  texto: string
  articulo: string
  enlace_boe: string
}

export interface DerechoRol {
  texto: string
  articulo: string
  enlace_boe: string
}

export interface SiNoVas {
  resumen: string
  articulo: string
  enlace_boe: string
  consejo: string
  consecuencia?: string
  multa?: string
}

export interface FaqRol {
  pregunta: string
  respuesta: string
  articulo: string
  enlace_boe: string
}

export interface RolDetalle {
  id: RolPerfil
  nombre: string
  subtitulo: string
  orden: string
  descripcion: string
  icono: string
  ruta: PasoRuta[]
  obligaciones: ObligacionRol[]
  derechos: DerechoRol[]
  si_no_vas: SiNoVas
  faq: FaqRol[]
  ajustes_recomendados: string[]
}

const ROLES_LISTA = rolesData as RolDetalle[]

export function obtenerTodosLosRoles(): RolDetalle[] {
  return ROLES_LISTA
}

export function obtenerRol(id: RolPerfil): RolDetalle | null {
  return ROLES_LISTA.find((r) => r.id === id) ?? null
}

export function obtenerRutaPorRol(id: RolPerfil): PasoRuta[] {
  const rol = obtenerRol(id)
  return rol ? rol.ruta : []
}

export function obtenerFaqsPorRol(id: RolPerfil): FaqRol[] {
  const rol = obtenerRol(id)
  return rol ? rol.faq : []
}

/**
 * Fuente única de la verdad para el papel procesal en la aplicación.
 * 1. Prioridad: papel extraído de la citación judicial activa más próxima.
 * 2. Segunda opción: papel guardado en el perfil de usuario (`court-perfil`).
 * 3. Si no existe ninguno: devuelve 'desconocido' para preguntar a la persona en lugar de suponer.
 */
export function obtenerRolActivo(): RolPerfil {
  if (typeof window === 'undefined') return 'desconocido'

  // 1. Elección explícita del usuario en su perfil
  try {
    const perfil = cargarPerfil()
    if (perfil?.rol && perfil.rol !== 'desconocido') {
      return perfil.rol
    }
  } catch {
    /* ignore */
  }

  // 2. Rol extraído de la citación activa
  try {
    const lista = leerCitaciones()
    const id = resumirCitaciones(lista)[0]?.id
    const cita = lista.find((item) => item.id === id)
    const bruto = cita?.resultado.datos_clave.rol?.trim().toLowerCase() ?? ''
    if (
      bruto === 'testigo' ||
      bruto === 'investigado' ||
      bruto === 'victima' ||
      bruto === 'parte_civil'
    ) {
      return bruto
    }
    if (bruto === 'víctima') return 'victima'
    if (bruto === 'demandante' || bruto === 'demandado' || bruto === 'demandada') {
      return 'parte_civil'
    }
  } catch {
    /* ignore */
  }

  return 'desconocido'
}
