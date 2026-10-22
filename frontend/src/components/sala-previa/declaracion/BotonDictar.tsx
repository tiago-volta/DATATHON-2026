'use client'

import { useEffect, useRef, useState } from 'react'

interface Reconocimiento {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: (event: { results: { [key: number]: { [key: number]: { transcript: string } } } }) => void
  onerror: () => void
  onend: () => void
  start: () => void
  stop: () => void
}

type ClaseReconocimiento = new () => Reconocimiento

function claseReconocimiento(): ClaseReconocimiento | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: ClaseReconocimiento
    webkitSpeechRecognition?: ClaseReconocimiento
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

interface Props {
  onTexto: (texto: string) => void
  /** Se llama al empezar a escuchar, para callar la voz de la sala. */
  onEmpezar?: () => void
}

export function BotonDictar({ onTexto, onEmpezar }: Props) {
  const [disponible, setDisponible] = useState(false)
  const [escuchando, setEscuchando] = useState(false)
  const [error, setError] = useState('')
  const ref = useRef<Reconocimiento | null>(null)

  useEffect(() => {
    setDisponible(claseReconocimiento() !== null)
    return () => ref.current?.stop()
  }, [])

  if (!disponible) return null

  const alternar = () => {
    if (escuchando) {
      ref.current?.stop()
      setEscuchando(false)
      return
    }
    const Clase = claseReconocimiento()
    if (!Clase) return
    onEmpezar?.()
    const r = new Clase()
    r.lang = 'es-ES'
    r.interimResults = false
    r.maxAlternatives = 1
    r.onresult = (event) => {
      const texto = event.results[0]?.[0]?.transcript?.trim() ?? ''
      if (texto) onTexto(texto)
      setError('')
    }
    r.onerror = () => {
      setEscuchando(false)
      setError('No te he podido oír. Puedes probar otra vez o escribir tu respuesta.')
    }
    r.onend = () => setEscuchando(false)
    ref.current = r
    setError('')
    setEscuchando(true)
    r.start()
  }

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={alternar}
        aria-pressed={escuchando}
        className="btn-secondary text-sm min-h-[44px] py-2"
      >
        {escuchando ? 'Parar el dictado' : 'Dictar mi respuesta'}
      </button>
      <p className="text-sm text-white" role="status" aria-live="polite">
        {escuchando ? 'Te escucho. Habla cuando quieras.' : error}
      </p>
    </div>
  )
}
