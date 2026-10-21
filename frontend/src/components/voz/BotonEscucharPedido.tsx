'use client'

import { useCallback, useRef, useState } from 'react'
import { hablarCola, parar as pararVoz, vozNaturalDisponible } from '@/lib/vozNatural'
import type { ResultadoPeticionVoz } from '@/lib/voz/asistenteVoz'
import { useEscuchaVoz } from '@/hooks/useEscuchaVoz'
import { useModoVoz } from '@/hooks/useModoVoz'

type Props = {
  /** Si true, el botón se muestra aunque el modo no esté activo. */
  siempreVisible?: boolean
  onResultado?: (r: ResultadoPeticionVoz) => void
  className?: string
}

/**
 * Micrófono: escucha un pedido y lo interpreta (mock /api/voz).
 * Visible cuando el Modo con voz está activo, o si `siempreVisible`.
 */
export function BotonEscucharPedido({
  siempreVisible = false,
  onResultado,
  className = '',
}: Props) {
  const { activo, activar } = useModoVoz()
  const [feedback, setFeedback] = useState('')
  const cancelarRef = useRef<(() => void) | null>(null)

  const hablarRespuesta = useCallback((texto: string) => {
    if (!vozNaturalDisponible() || !texto) return
    cancelarRef.current?.()
    pararVoz()
    const { cancelar } = hablarCola([texto], {
      onFin: () => {
        cancelarRef.current = null
      },
    })
    cancelarRef.current = cancelar
  }, [])

  const escucha = useEscuchaVoz({
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
          setFeedback('Te escucho…')
          escucha.iniciar()
        }}
      >
        {escucha.escuchando ? 'Escuchando… (pulsa para parar)' : 'Escuchar pedido'}
      </button>

      {!escucha.disponible && (
        <p
          id="escucha-pedido-sin-soporte"
          className="text-sm text-puente-700"
          role="status"
        >
          {escucha.mensajeSinSoporte}
        </p>
      )}

      {(escucha.parcial || feedback) && (
        <p
          className="text-sm text-puente-700 max-w-md"
          role="status"
          aria-live="polite"
        >
          {escucha.parcial || feedback}
        </p>
      )}
    </div>
  )
}
