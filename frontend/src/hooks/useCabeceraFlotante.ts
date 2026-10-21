'use client'

import { useEffect, useState } from 'react'

const UMBRAL_PX = 50

export function useCabeceraFlotante() {
  const [flotante, setFlotante] = useState(false)

  useEffect(() => {
    const actualizar = () => {
      setFlotante(window.scrollY > UMBRAL_PX)
    }

    actualizar()
    window.addEventListener('scroll', actualizar, { passive: true })
    return () => window.removeEventListener('scroll', actualizar)
  }, [])

  return flotante
}
