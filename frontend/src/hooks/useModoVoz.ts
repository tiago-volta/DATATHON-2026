'use client'

import { useCallback, useEffect, useState } from 'react'
import { CONFIRMACION_ACTIVACION } from '@/lib/voz/constantes'
import {
  marcarOnboardingVozVisto,
  modoVozActivo,
  onboardingVozVisto,
  setModoVozActivo,
} from '@/lib/voz/storage'

/**
 * Estado global ligero del Modo con voz (localStorage).
 * No usa Context para no forzar re-renders en todo el árbol:
 * cada consumidor lee/escucha el mismo storage + evento custom.
 */
const EVENTO = 'puente-modo-voz-cambio'

function emitirCambio(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event(EVENTO))
}

export function useModoVoz() {
  const [activo, setActivo] = useState(false)
  const [onboardingPendiente, setOnboardingPendiente] = useState(false)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    const sync = () => {
      setActivo(modoVozActivo())
      setOnboardingPendiente(!onboardingVozVisto())
      setListo(true)
    }
    sync()
    window.addEventListener(EVENTO, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENTO, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const activar = useCallback(() => {
    setModoVozActivo(true)
    marcarOnboardingVozVisto()
    emitirCambio()
  }, [])

  const desactivar = useCallback(() => {
    setModoVozActivo(false)
    emitirCambio()
  }, [])

  const cerrarOnboarding = useCallback(() => {
    marcarOnboardingVozVisto()
    emitirCambio()
  }, [])

  return {
    listo,
    activo,
    onboardingPendiente,
    activar,
    desactivar,
    cerrarOnboarding,
    mensajeConfirmacion: CONFIRMACION_ACTIVACION,
  }
}
