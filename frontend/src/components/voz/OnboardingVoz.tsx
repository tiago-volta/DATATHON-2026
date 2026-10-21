'use client'

import Link from 'next/link'
import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { hablarCola, parar as pararVoz, vozNaturalDisponible } from '@/lib/vozNatural'
import {
  FRASE_ACTIVACION,
  TEXTO_ONBOARDING,
} from '@/lib/voz/constantes'
import { procesarPeticionVoz } from '@/lib/voz/asistenteVoz'
import { useEscuchaVoz } from '@/hooks/useEscuchaVoz'
import { useModoVoz } from '@/hooks/useModoVoz'

/**
 * Primera visita: explica PUENTE y la frase para activar el Modo con voz.
 * No atrapa el foco: «Ahora no» / «Ya lo activé» cierran el panel.
 */
export function OnboardingVoz() {
  const tituloId = useId()
  const { listo, onboardingPendiente, activo, activar, cerrarOnboarding } =
    useModoVoz()
  const [abierto, setAbierto] = useState(false)
  const [hablando, setHablando] = useState(false)
  const [feedback, setFeedback] = useState('')
  const cancelarHablaRef = useRef<(() => void) | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!listo) return
    if (onboardingPendiente && !activo) {
      setAbierto(true)
    }
  }, [listo, onboardingPendiente, activo])

  const pararHabla = useCallback(() => {
    cancelarHablaRef.current?.()
    cancelarHablaRef.current = null
    pararVoz()
    setHablando(false)
  }, [])

  const escucharExplicacion = useCallback(() => {
    if (!vozNaturalDisponible()) {
      setFeedback(
        'Tu navegador no puede leer en voz alta. El texto está en pantalla; también puedes usar tu lector de pantalla.'
      )
      return
    }
    pararHabla()
    setHablando(true)
    setFeedback('Escuchando la explicación…')
    const { cancelar } = hablarCola(
      [
        TEXTO_ONBOARDING,
        `La frase es: ${FRASE_ACTIVACION}.`,
      ],
      {
        onFin: () => {
          cancelarHablaRef.current = null
          setHablando(false)
          setFeedback('Cuando quieras, di la frase o pulsa Ya lo activé.')
        },
      }
    )
    cancelarHablaRef.current = cancelar
  }, [pararHabla])

  const cerrar = useCallback(() => {
    pararHabla()
    cerrarOnboarding()
    setAbierto(false)
  }, [cerrarOnboarding, pararHabla])

  const activarYCerrar = useCallback(() => {
    pararHabla()
    activar()
    setFeedback('Modo con voz activado.')
    setAbierto(false)
  }, [activar, pararHabla])

  const escucha = useEscuchaVoz({
    onInterpretacion: (r) => {
      if (r.accion === 'activar_modo_voz') {
        activar()
        setFeedback(r.respuestaHabla)
        if (vozNaturalDisponible()) {
          const { cancelar } = hablarCola([r.respuestaHabla], {
            onFin: () => {
              cancelarHablaRef.current = null
            },
          })
          cancelarHablaRef.current = cancelar
        }
        setAbierto(false)
        return
      }
      setFeedback(r.respuestaHabla)
    },
  })

  useEffect(() => {
    return () => {
      cancelarHablaRef.current?.()
      pararVoz()
    }
  }, [])

  if (!listo || !abierto) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-puente-900/40"
      role="presentation"
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="w-full max-w-lg bg-calma-cream border-2 border-puente-800 rounded-tarjeta shadow-lg p-6 md:p-8 max-h-[90vh] overflow-y-auto"
      >
        <p className="text-sm font-bold tracking-wide text-puente-700 mb-2">
          PUENTE · Modo con voz
        </p>
        <h2 id={tituloId} className="text-2xl text-puente-900 mb-3">
          Cómo funciona PUENTE
        </h2>
        <p className="text-lg text-puente-800 mb-4 leading-relaxed">
          {TEXTO_ONBOARDING}
        </p>

        <blockquote className="border-l-4 border-puente-500 pl-4 mb-6">
          <p className="text-xl font-bold text-puente-900">
            «{FRASE_ACTIVACION}»
          </p>
          <p className="text-puente-700 mt-1 text-sm">
            También vale: «activar acceso por voz», «necesito audio» o «modo
            audiodescrito».
          </p>
        </blockquote>

        <div className="flex flex-wrap gap-3 mb-4">
          <button
            type="button"
            className="btn-primary"
            onClick={escucharExplicacion}
            aria-pressed={hablando}
          >
            {hablando ? 'Escuchando…' : 'Escuchar explicación'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              if (!escucha.disponible) {
                setFeedback(escucha.mensajeSinSoporte)
                return
              }
              setFeedback('Te escucho. Di la frase cuando quieras.')
              escucha.iniciar()
            }}
            aria-pressed={escucha.escuchando}
          >
            {escucha.escuchando ? 'Escuchando tu voz…' : 'Probar con mi voz'}
          </button>
        </div>

        {(escucha.parcial || feedback) && (
          <p
            className="mb-4 text-puente-800 bg-puente-50 border border-puente-200 rounded-lg p-3"
            role="status"
            aria-live="polite"
          >
            {escucha.parcial || feedback}
          </p>
        )}

        {!escucha.disponible && (
          <p className="mb-4 text-sm text-puente-700" role="status">
            {escucha.mensajeSinSoporte}
          </p>
        )}

        <div className="flex flex-wrap gap-3 mb-4">
          <button type="button" className="btn-primary" onClick={activarYCerrar}>
            Ya lo activé
          </button>
          <button type="button" className="btn-ghost" onClick={cerrar}>
            Ahora no
          </button>
        </div>

        <p className="text-sm text-puente-700 mb-2">
          Cuando esté activo, puedes ir a:
        </p>
        <div className="flex flex-wrap gap-4 text-puente-800 font-bold">
          <Link
            href="/sala-previa"
            className="underline underline-offset-4 hover:text-puente-600"
            onClick={cerrar}
          >
            Sala Previa
          </Link>
          <Link
            href="/citacion"
            className="underline underline-offset-4 hover:text-puente-600"
            onClick={cerrar}
          >
            Mi citación
          </Link>
        </div>
      </div>
    </div>
  )
}

/** Interpreta un texto suelto (útil en tests / demos). */
export async function interpretarFraseOnboarding(texto: string) {
  return procesarPeticionVoz(texto)
}
