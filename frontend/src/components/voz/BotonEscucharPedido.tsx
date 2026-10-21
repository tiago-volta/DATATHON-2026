'use client'

import { useCallback, useRef, useState } from 'react'
import { hablarCola, parar as pararVoz, vozNaturalDisponible } from '@/lib/vozNatural'
import type { ResultadoPeticionVoz } from '@/lib/voz/asistenteVoz'
import { pedirPermisoMicrofono, MENSAJE_MIC_DENEGADO } from '@/lib/voz/reconocimiento'
import { useEscuchaVoz } from '@/hooks/useEscuchaVoz'
import { useModoVoz } from '@/hooks/useModoVoz'

type Props = {
  /** Si true, el botón se muestra aunque el modo no esté activo. */
  siempreVisible?: boolean
  onResultado?: (r: ResultadoPeticionVoz) => void
  /** Corta también el estado React de audioguía (además del mutex TTS). */
  onPararSintesis?: () => void
  className?: string
}

/**
 * Micrófono push-to-talk: escucha un pedido y lo interpreta.
 * Al pulsar o al detectar voz: para toda síntesis antes de procesar.
 */
export function BotonEscucharPedido({
  siempreVisible = false,
  onResultado,
  onPararSintesis,
  className = '',
}: Props) {
  const { activo, activar } = useModoVoz()
  const [feedback, setFeedback] = useState('')
  const cancelarRef = useRef<(() => void) | null>(null)
  const onPararRef = useRef(onPararSintesis)
  onPararRef.current = onPararSintesis

  const cortarVoz = useCallback(() => {
    cancelarRef.current?.()
    cancelarRef.current = null
    pararVoz()
    onPararRef.current?.()
  }, [])

  const hablarRespuesta = useCallback(
    (texto: string) => {
      if (!vozNaturalDisponible() || !texto) return
      cortarVoz()
      const { cancelar } = hablarCola([texto], {
        onFin: () => {
          cancelarRef.current = null
        },
      })
      cancelarRef.current = cancelar
    },
    [cortarVoz]
  )

  const escucha = useEscuchaVoz({
    onHablaUsuario: cortarVoz,
    onInterpretacion: (r) => {
      setFeedback(r.respuestaHabla)
      if (r.accion === 'activar_modo_voz') {
        activar()
      }
      if (onResultado) {
        // El padre (p. ej. Sala Previa) aplica la acción y habla si hace falta.
        onResultado(r)
        return
      }
      hablarRespuesta(r.respuestaHabla)
    },
  })

  if (!siempreVisible && !activo) return null

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        type="button"
        className={`btn ${escucha.escuchando ? 'btn-primary' : 'btn-secondary'}`}
        aria-pressed={escucha.escuchando}
        aria-describedby={
          !escucha.disponible ? 'escucha-pedido-sin-soporte' : undefined
        }
        onClick={() => {
          if (escucha.escuchando) {
            escucha.parar()
            return
          }
          if (!escucha.disponible) {
            setFeedback(escucha.mensajeSinSoporte)
            return
          }
          // Antes de escuchar: cortar guía / ayuda en curso.
          cortarVoz()
          void (async () => {
            const perm = await pedirPermisoMicrofono()
            if (perm === 'denegado') {
              setFeedback(MENSAJE_MIC_DENEGADO)
              return
            }
            setFeedback('Te escucho…')
            escucha.iniciar()
          })()
        }}
      >
        {escucha.escuchando ? 'Escuchando… (pulsa para parar)' : 'Escuchar pedido'}
      </button>

      {!escucha.disponible && (
        <p
          id="escucha-pedido-sin-soporte"
          className="text-sm text-court-700"
          role="status"
        >
          {escucha.mensajeSinSoporte}
        </p>
      )}

      {(escucha.parcial || feedback || escucha.anuncio) && (
        <p
          className="text-sm text-court-700 max-w-md"
          role="status"
          aria-live="polite"
        >
          {escucha.parcial || feedback || escucha.anuncio}
        </p>
      )}
    </div>
  )
}
