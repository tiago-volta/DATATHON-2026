'use client'

import { useEffect, useRef } from 'react'
import type { ResultadoPeticionVoz } from '@/lib/voz/asistenteVoz'
import { procesarPeticionVoz } from '@/lib/voz/asistenteVoz'
import {
  crearReconocimiento,
  reconocimientoVozDisponible,
  type ControlesReconocimiento,
} from '@/lib/voz/reconocimiento'
import { useModoVoz } from '@/hooks/useModoVoz'

type Props = {
  /** Audioguía encendida. */
  audioguiaActiva: boolean
  /** True mientras la guía habla (no escuchar para no captar el TTS). */
  hablando: boolean
  onResultado: (r: ResultadoPeticionVoz) => void
}

/**
 * Con Modo con voz + audioguía: micrófono en escucha entre bloques.
 * Se pausa mientras habla la guía.
 */
export function EscuchaContinuaAudioguia({
  audioguiaActiva,
  hablando,
  onResultado,
}: Props) {
  const { activo: modoVoz } = useModoVoz()
  const controlesRef = useRef<ControlesReconocimiento | null>(null)
  const onRef = useRef(onResultado)
  onRef.current = onResultado
  const hablandoRef = useRef(hablando)
  hablandoRef.current = hablando

  useEffect(() => {
    if (!reconocimientoVozDisponible()) return
    if (!modoVoz || !audioguiaActiva) {
      controlesRef.current?.parar()
      controlesRef.current = null
      return
    }

    const controles = crearReconocimiento({
      continuous: true,
      onResultado: ({ texto, final }) => {
        if (!final || !texto || hablandoRef.current) return
        void (async () => {
          const r = await procesarPeticionVoz(texto)
          onRef.current(r)
        })()
      },
    })
    controlesRef.current = controles

    return () => {
      controles.parar()
      controlesRef.current = null
    }
  }, [modoVoz, audioguiaActiva])

  useEffect(() => {
    const c = controlesRef.current
    if (!c || !modoVoz || !audioguiaActiva) return
    if (hablando) {
      c.parar()
    } else {
      // Pequeña pausa tras el TTS para no captar eco.
      const t = window.setTimeout(() => c.iniciar(), 600)
      return () => window.clearTimeout(t)
    }
  }, [hablando, modoVoz, audioguiaActiva])

  return null
}
