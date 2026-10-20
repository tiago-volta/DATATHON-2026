'use client'

import { useState, useEffect } from 'react'

interface Props {
  texto: string
  etiqueta?: string
}

export function BotonLeerEnVoz({ texto, etiqueta = 'Leer en voz alta' }: Props) {
  const [leyendo, setLeyendo] = useState(false)
  const [disponible, setDisponible] = useState(false)

  useEffect(() => {
    setDisponible('speechSynthesis' in window)
  }, [])

  const leer = () => {
    if (!disponible) return

    if (leyendo) {
      speechSynthesis.cancel()
      setLeyendo(false)
      return
    }

    const utterance = new SpeechSynthesisUtterance(texto)
    utterance.lang = 'es-ES'
    utterance.rate = 0.9
    utterance.pitch = 1

    utterance.onend = () => setLeyendo(false)
    utterance.onerror = () => setLeyendo(false)

    speechSynthesis.speak(utterance)
    setLeyendo(true)
  }

  if (!disponible) return null

  return (
    <button
      onClick={leer}
      className="btn-secondary"
      aria-pressed={leyendo}
      aria-label={leyendo ? 'Detener lectura' : etiqueta}
    >
      {leyendo ? (
        <>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
            <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
          </svg>
          Detener
        </>
      ) : (
        <>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          {etiqueta}
        </>
      )}
    </button>
  )
}
