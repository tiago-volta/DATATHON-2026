'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { SalaJuzgado360 } from '@/components/sala-previa/SalaJuzgado360'
import type {
  IdEscenaJuzgado,
  IdEstimulo,
  NivelSala,
  ValoresEstimulo,
} from '@/lib/sala-previa/tipos'

interface Props {
  nivel: NivelSala
  escenaId: IdEscenaJuzgado
  valores: ValoresEstimulo
  enCalma: boolean
  onChangeEstimulo?: (id: IdEstimulo, valor: number) => void
  deshabilitadoEstimulos?: boolean
}

function nivelPalabra(valor: number): 'Bajo' | 'Medio' | 'Alto' {
  if (valor < 34) return 'Bajo'
  if (valor < 67) return 'Medio'
  return 'Alto'
}

export function EscenaSensorial({
  nivel,
  escenaId,
  valores,
  enCalma,
  onChangeEstimulo,
  deshabilitadoEstimulos,
}: Props) {
  const reduced = useReducedMotion()

  const luz = enCalma ? Math.min(valores.luz, 12) : valores.luz
  const gente = enCalma ? 0 : valores.gente
  const ruido = enCalma ? 0 : valores.ruido

  const [anuncio, setAnuncio] = useState('')
  const prevRef = useRef({ ruido: -1, luz: -1, gente: -1 })

  useEffect(() => {
    const prev = prevRef.current
    const partes: string[] = []
    if (nivelPalabra(ruido) !== nivelPalabra(prev.ruido) && prev.ruido >= 0) {
      partes.push(`Ruido ${nivelPalabra(ruido)}`)
    }
    if (nivelPalabra(luz) !== nivelPalabra(prev.luz) && prev.luz >= 0) {
      partes.push(`Luz ${nivelPalabra(luz)}`)
    }
    if (nivelPalabra(gente) !== nivelPalabra(prev.gente) && prev.gente >= 0) {
      partes.push(`Gente ${nivelPalabra(gente)}`)
    }
    prevRef.current = { ruido, luz, gente }
    if (partes.length === 0) return

    const t = window.setTimeout(() => {
      setAnuncio(partes.join('. '))
    }, reduced ? 0 : 400)
    return () => window.clearTimeout(t)
  }, [ruido, luz, gente, reduced])

  return (
    <div className="space-y-3">
      <SalaJuzgado360
        escenaId={escenaId}
        titulo={nivel.nombre}
        valores={valores}
        enCalma={enCalma}
        onChangeEstimulo={onChangeEstimulo}
        deshabilitadoEstimulos={deshabilitadoEstimulos}
      />

      <div className="rounded-suave border border-puente-100 bg-white/90 px-4 py-3">
        <p className="font-bold text-puente-800 text-lg">{nivel.nombre}</p>
        <p className="text-puente-700 mt-1">{nivel.descripcion}</p>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {anuncio}
        </p>
      </div>
    </div>
  )
}
