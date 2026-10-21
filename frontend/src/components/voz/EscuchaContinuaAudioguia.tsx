'use client'

import { useEffect, useRef } from 'react'
import type { ResultadoPeticionVoz } from '@/lib/voz/asistenteVoz'
import { procesarPeticionVoz } from '@/lib/voz/asistenteVoz'
import {
  crearReconocimiento,
  reconocimientoVozDisponible,
  type ControlesReconocimiento,
} from '@/lib/voz/reconocimiento'
import { parar as pararSintesis } from '@/lib/vozNatural'
import { useModoVoz } from '@/hooks/useModoVoz'

type Props = {
  /**
   * Compat: la audioguía puede estar encendida; la escucha depende del Modo con voz.
   * Se mantiene por si el padre quiere forzar contexto.
   */
  audioguiaActiva?: boolean
  /** True mientras la guía / TTS habla. Al acabar, reanudamos escucha. */
  hablando: boolean
  /** Extra: cortar síntesis del hook de audioguía (estado React). */
  onPararSintesis?: () => void
  onResultado: (r: ResultadoPeticionVoz) => void
}

/**
 * Con Modo con voz: micrófono en escucha continua o por turnos.
 * Push-to-talk sigue en «Escuchar pedido»; aquí auto-listen tras acabar la guía.
 * Al detectar voz del usuario: para toda síntesis y luego procesa el pedido.
 */
export function EscuchaContinuaAudioguia({
  hablando,
  onPararSintesis,
  onResultado,
}: Props) {
  const { activo: modoVoz } = useModoVoz()
  const controlesRef = useRef<ControlesReconocimiento | null>(null)
  const onRef = useRef(onResultado)
  onRef.current = onResultado
  const onPararRef = useRef(onPararSintesis)
  onPararRef.current = onPararSintesis
  const procesandoRef = useRef(false)
  const quiereEscuchar = modoVoz

  useEffect(() => {
    if (!reconocimientoVozDisponible()) return
    if (!quiereEscuchar) {
      controlesRef.current?.parar()
      controlesRef.current = null
      return
    }

    const controles = crearReconocimiento({
      continuous: true,
      onHablaUsuario: () => {
        pararSintesis()
        onPararRef.current?.()
      },
      onResultado: ({ texto, final }) => {
        if (!final || !texto || procesandoRef.current) return
        procesandoRef.current = true
        // Por si onHablaUsuario no disparó (algunos navegadores).
        pararSintesis()
        onPararRef.current?.()
        void (async () => {
          try {
            const r = await procesarPeticionVoz(texto)
            onRef.current(r)
          } finally {
            procesandoRef.current = false
          }
        })()
      },
    })
    controlesRef.current = controles

    return () => {
      controles.parar()
      controlesRef.current = null
    }
  }, [quiereEscuchar])

  useEffect(() => {
    const c = controlesRef.current
    if (!c || !quiereEscuchar) return
    if (hablando) {
      // Mientras habla la guía no reiniciamos el mic (evita eco),
      // pero barge-in ya cortó TTS vía onHablaUsuario si el usuario habló.
      c.parar()
      return
    }
    // Auto-listen tras acabar de hablar la guía / respuesta.
    const t = window.setTimeout(() => c.iniciar(), 500)
    return () => window.clearTimeout(t)
  }, [hablando, quiereEscuchar])

  return null
}
