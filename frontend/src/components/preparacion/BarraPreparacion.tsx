'use client'

import { useEffect, useState } from 'react'
import {
  EVENTO_PREPARACION,
  cargarPreparacion,
  hechosPreparacion,
  textoPreparacion,
  type Preparacion,
} from '@/lib/preparacion'

export function BarraPreparacion() {
  const [dato, setDato] = useState<Preparacion>({
    vistaSala: false,
    juicioEnsayado: false,
  })

  useEffect(() => {
    const sync = () => setDato(cargarPreparacion())
    sync()
    window.addEventListener(EVENTO_PREPARACION, sync)
    window.addEventListener('storage', sync)
    return () => {
      window.removeEventListener(EVENTO_PREPARACION, sync)
      window.removeEventListener('storage', sync)
    }
  }, [])

  const hechos = hechosPreparacion(dato)

  return (
    <div className="max-w-xl">
      <p className="text-sm font-bold text-court-800 mb-2">Preparación para el juicio</p>
      <div
        className="h-2.5 w-full rounded-full bg-court-100 border border-court-200 overflow-hidden"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={2}
        aria-valuenow={hechos}
        aria-label={textoPreparacion(dato)}
      >
        <div
          className="h-full bg-accent-info"
          style={{ width: hechos === 0 ? '0%' : hechos === 1 ? '50%' : '100%' }}
        />
      </div>
      <p className="text-court-800 mt-2">{textoPreparacion(dato)}</p>
    </div>
  )
}
