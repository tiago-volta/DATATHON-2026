'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  construirBloquesAudioguia,
  leerBloquesEnVoz,
  vozNaturalDisponible,
  type ContextoAudioguia,
} from '@/lib/sala-previa/audioguia'

export interface ControlesAmbientales {
  /** Baja un poco el gain master mientras habla la guía (menos invasivo que pausar). */
  atenuarParaVoz: (activo: boolean) => void
}

/**
 * Modo audioguía de Sala Previa.
 * Voz natural vía /api/tts (edge-tts); fallback speechSynthesis.
 * Solo arranca con gesto del usuario (clic del botón). No auto-inicia.
 */
export function useAudioguiaSala(ambientales?: ControlesAmbientales) {
  const [activo, setActivo] = useState(false)
  const [hablando, setHablando] = useState(false)
  const [anuncio, setAnuncio] = useState('')
  const [sinSoporte, setSinSoporte] = useState(false)
  const cancelarRef = useRef<(() => void) | null>(null)
  const contextoRef = useRef<ContextoAudioguia | null>(null)
  const ambientalesRef = useRef(ambientales)
  ambientalesRef.current = ambientales

  useEffect(() => {
    setSinSoporte(!vozNaturalDisponible())
  }, [])

  const pararSintesis = useCallback(() => {
    cancelarRef.current?.()
    cancelarRef.current = null
    setHablando(false)
    ambientalesRef.current?.atenuarParaVoz(false)
  }, [])

  const leerContexto = useCallback((ctx: ContextoAudioguia) => {
    if (!vozNaturalDisponible()) {
      setSinSoporte(true)
      setAnuncio(
        'Tu navegador no puede leer en voz alta. Puedes seguir con el lector de pantalla.'
      )
      return
    }

    pararSintesis()
    contextoRef.current = ctx
    const bloques = construirBloquesAudioguia(ctx)

    // Ducking: baja un poco el ambiente mientras habla la guía (sigue audible, no se corta).
    ambientalesRef.current?.atenuarParaVoz(true)
    setHablando(true)

    const { cancelar } = leerBloquesEnVoz(bloques, {
      onFin: () => {
        cancelarRef.current = null
        setHablando(false)
        ambientalesRef.current?.atenuarParaVoz(false)
      },
    })
    cancelarRef.current = cancelar
  }, [pararSintesis])

  const activar = useCallback(
    (ctx: ContextoAudioguia) => {
      if (!vozNaturalDisponible()) {
        setSinSoporte(true)
        setActivo(false)
        setAnuncio(
          'Tu navegador no puede leer en voz alta. Puedes seguir con el lector de pantalla.'
        )
        return
      }
      setActivo(true)
      setAnuncio('Audioguía activada. Escucha con calma. Puedes pararla cuando quieras.')
      leerContexto({ ...ctx, soloBloqueActual: false })
    },
    [leerContexto]
  )

  const desactivar = useCallback(() => {
    pararSintesis()
    setActivo(false)
    setAnuncio('Audioguía parada.')
  }, [pararSintesis])

  const toggle = useCallback(
    (ctx: ContextoAudioguia) => {
      if (activo) {
        desactivar()
      } else {
        activar(ctx)
      }
    },
    [activo, activar, desactivar]
  )

  /** Si el modo sigue activo, lee el nuevo bloque (cambio de escena o nivel). */
  const alCambiarContexto = useCallback(
    (ctx: ContextoAudioguia) => {
      if (!activo) return
      setAnuncio('Continúo con el nuevo paso.')
      leerContexto({ ...ctx, soloBloqueActual: true })
    },
    [activo, leerContexto]
  )

  /** Pausa/Calma: corta la síntesis de inmediato. */
  const alCalma = useCallback(() => {
    if (!activo && !hablando) return
    pararSintesis()
    if (activo) {
      setAnuncio('Audioguía en pausa por calma. Actívala de nuevo si quieres seguir.')
      setActivo(false)
    }
  }, [activo, hablando, pararSintesis])

  useEffect(() => {
    return () => {
      cancelarRef.current?.()
      ambientalesRef.current?.atenuarParaVoz(false)
    }
  }, [])

  return {
    activo,
    hablando,
    anuncio,
    sinSoporte,
    disponible: !sinSoporte,
    toggle,
    desactivar,
    alCambiarContexto,
    alCalma,
    etiquetaBoton: activo ? 'Parar audioguía' : 'Modo audioguía',
  }
}

/** Alias listo para otros puntos de entrada (mismo hook). */
export const usarAudioguia = useAudioguiaSala
