'use client'

import { useEffect, useState } from 'react'
import {
  EVENTO_TOLERANCIA,
  fraseDeTolerancia,
  leerToleranciaAnterior,
  leerUltimaTolerancia,
} from '@/lib/perfil/ultimaTolerancia'

export function FraseTolerancia({ nivel = 'h2' }: { nivel?: 'h2' | 'h3' }) {
  const [ultima, setUltima] = useState('')
  const [antes, setAntes] = useState('')
  const Titulo = nivel

  useEffect(() => {
    const refrescar = () => {
      const reciente = leerUltimaTolerancia()
      const previa = leerToleranciaAnterior()
      setUltima(reciente?.frase ?? '')
      setAntes(
        previa
          ? fraseDeTolerancia(previa.gente, previa.ruido, previa.herramientas, 'Antes')
          : ''
      )
    }
    refrescar()
    window.addEventListener(EVENTO_TOLERANCIA, refrescar)
    window.addEventListener('storage', refrescar)
    return () => {
      window.removeEventListener(EVENTO_TOLERANCIA, refrescar)
      window.removeEventListener('storage', refrescar)
    }
  }, [])

  if (!ultima) return null

  return (
    <section
      className={
        nivel === 'h3'
          ? 'mb-5 rounded-suave border border-court-200 bg-white p-3'
          : 'card mb-6 bg-calma-mist border border-court-200'
      }
      aria-labelledby="titulo-ultima-tolerancia"
    >
      <Titulo id="titulo-ultima-tolerancia" className="text-lg font-bold text-court-900 mb-2">
        Lo que aguantaste
      </Titulo>
      <p className="text-court-900">{ultima}</p>
      {antes && <p className="text-court-800 mt-2">{antes}</p>}
    </section>
  )
}
