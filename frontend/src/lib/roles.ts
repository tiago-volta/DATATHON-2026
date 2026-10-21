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
