'use client'

import { useEffect, useRef, useState } from 'react'

type RecognitionLike = {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  onresult: ((ev: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null
  onerror: (() => void) | null
  onend: (() => void) | null
}

function crearReconocimiento(): RecognitionLike | null {
  if (typeof window === 'undefined') return null
  const W = window as Window & {
    SpeechRecognition?: new () => RecognitionLike
    webkitSpeechRecognition?: new () => RecognitionLike
  }
  const Ctor = W.SpeechRecognition || W.webkitSpeechRecognition
  if (!Ctor) return null
  return new Ctor()
}

interface Props {
  onTexto: (texto: string) => void
  disabled?: boolean
}

/** Dictado por voz para Ensaya (apoyo si cuesta escribir). */
export function BotonDictarRespuesta({ onTexto, disabled }: Props) {
  const [escuchando, setEscuchando] = useState(false)
  const [soporte, setSoporte] = useState(true)
  const recRef = useRef<RecognitionLike | null>(null)

  useEffect(() => {
    const rec = crearReconocimiento()
    if (!rec) {
      setSoporte(false)
      return
    }
    rec.lang = 'es-ES'
    rec.continuous = false
    rec.interimResults = false
    rec.onresult = (ev) => {
      const trozo = Array.from(ev.results)
        .map((r) => r[0]?.transcript ?? '')
        .join(' ')
        .trim()
      if (trozo) onTexto(trozo)
    }
    rec.onerror = () => setEscuchando(false)
    rec.onend = () => setEscuchando(false)
    recRef.current = rec
    return () => {
      try {
        rec.stop()
      } catch {
        /* ignore */
      }
    }
  }, [onTexto])

  if (!soporte) {
    return (
      <p className="text-sm text-puente-700">
        Tu navegador no admite dictado. Puedes practicar en voz alta sin escribir
        y pulsar «Siguiente».
      </p>
    )
  }

  return (
    <button
      type="button"
      className={`btn ${escuchando ? 'btn-primary' : 'btn-secondary'}`}
      disabled={disabled}
      aria-pressed={escuchando}
      onClick={() => {
        const rec = recRef.current
        if (!rec) return
        if (escuchando) {
          try {
            rec.stop()
          } catch {
            /* ignore */
          }
          setEscuchando(false)
          return
        }
        try {
          rec.start()
          setEscuchando(true)
        } catch {
          setEscuchando(false)
        }
      }}
    >
      {escuchando ? 'Escuchando… (pulsa para parar)' : 'Dictar mi respuesta'}
    </button>
  )
}
