'use client'

import { useEffect } from 'react'
import {
  aplicarClasesApoyo,
  leerPreferencias,
} from '@/lib/preferencias'

/** Sincroniza en toda la app las clases de apoyo de lectura/números. */
export function ActivarApoyosAprendizaje() {
  useEffect(() => {
    const sync = () => aplicarClasesApoyo(leerPreferencias())
    sync()
    window.addEventListener('puente-preferencias-cambio', sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener('puente-preferencias-cambio', sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  return null
}
