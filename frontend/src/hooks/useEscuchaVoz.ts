'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  procesarPeticionVoz,
  type ResultadoPeticionVoz,
} from '@/lib/voz/asistenteVoz'
import {
  crearReconocimiento,
  reconocimientoVozDisponible,
  type ControlesReconocimiento,
} from '@/lib/voz/reconocimiento'
import { MENSAJE_SIN_RECONOCIMIENTO } from '@/lib/voz/constantes'

/**
 * Escucha una frase (gesto del usuario o sesión continua) y la interpreta.
 */
export function useEscuchaVoz(opts?: {
  continuous?: boolean
  onInterpretacion?: (r: ResultadoPeticionVoz) => void
}) {
  const [escuchando, setEscuchando] = useState(false)
  const [parcial, setParcial] = useState('')
  const [ultimoTexto, setUltimoTexto] = useState('')
  const [anuncio, setAnuncio] = useState('')
  const [disponible, setDisponible] = useState(false)
  const controlesRef = useRef<ControlesReconocimiento | null>(null)
  const onInterpRef = useRef(opts?.onInterpretacion)
  onInterpRef.current = opts?.onInterpretacion
  const continuous = opts?.continuous ?? false

  useEffect(() => {
    setDisponible(reconocimientoVozDisponible())
  }, [])

  useEffect(() => {
    if (!reconocimientoVozDisponible()) return

    const controles = crearReconocimiento({
      continuous,
      onResultado: ({ texto, final }) => {
        setParcial(texto)
        if (!final || !texto) return
        setUltimoTexto(texto)
        setEscuchando(false)
        void (async () => {
          const r = await procesarPeticionVoz(texto)
          onInterpRef.current?.(r)
        })()
      },
      onError: (mensaje) => {
        setAnuncio(mensaje)
        setEscuchando(false)
      },
      onFin: () => {
        setEscuchando(false)
      },
    })
    controlesRef.current = controles
    return () => {
      controles.parar()
      controlesRef.current = null
    }
  }, [continuous])

  const iniciar = useCallback(() => {
    if (!reconocimientoVozDisponible()) {
      setAnuncio(MENSAJE_SIN_RECONOCIMIENTO)
      return
    }
    setAnuncio('')
    setParcial('')
    setEscuchando(true)
    controlesRef.current?.iniciar()
  }, [])

  const parar = useCallback(() => {
    controlesRef.current?.parar()
    setEscuchando(false)
  }, [])

  return {
    disponible,
    escuchando,
    parcial,
    ultimoTexto,
    anuncio,
    setAnuncio,
    iniciar,
    parar,
    mensajeSinSoporte: MENSAJE_SIN_RECONOCIMIENTO,
  }
}
