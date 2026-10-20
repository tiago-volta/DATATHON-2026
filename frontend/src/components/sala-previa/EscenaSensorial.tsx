'use client'

import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import type { NivelSala, ValoresEstimulo } from '@/lib/sala-previa/tipos'

interface Props {
  nivel: NivelSala
  valores: ValoresEstimulo
  enCalma: boolean
}

const MAX_SILUETAS = 12

function nivelPalabra(valor: number): 'Bajo' | 'Medio' | 'Alto' {
  if (valor < 34) return 'Bajo'
  if (valor < 67) return 'Medio'
  return 'Alto'
}

function SiluetasSuaves({
  gente,
  duracion,
}: {
  gente: number
  duracion: string
}) {
  // Siempre montadas: la opacidad marca cuántas se ven (sin saltos al crear/destruir nodos).
  return (
    <div
      className="absolute inset-x-0 bottom-0 h-2/5 flex items-end justify-around px-4 sm:px-6 pointer-events-none"
      aria-hidden="true"
    >
      {Array.from({ length: MAX_SILUETAS }, (_, i) => {
        const umbral = ((i + 0.35) / MAX_SILUETAS) * 100
        // Rampa continua: evita el salto booleano visible/invisible.
        const fuerza = Math.min(1, Math.max(0, (gente - umbral + 14) / 32))
        const opacidad = fuerza * 0.68
        const elevacion = (1 - fuerza) * 8
        return (
          <div
            key={i}
            className="rounded-t-full bg-puente-800"
            style={{
              width: `${16 + (i % 3) * 5}px`,
              height: `${44 + (i % 4) * 9}px`,
              opacity: opacidad,
              transform: `translateY(${elevacion}px) scaleY(${0.88 + fuerza * 0.12})`,
              transition: duracion
                ? `opacity ${duracion}, transform ${duracion}`
                : 'none',
            }}
          />
        )
      })}
    </div>
  )
}

export function EscenaSensorial({ nivel, valores, enCalma }: Props) {
  const reduced = useReducedMotion()
  // Con reduced-motion: cambio inmediato (sin animación). Si no: interpolación lenta.
  const duracion = reduced ? '' : '1.8s ease-out'
  const transicion = (props: string) =>
    duracion ? `${props.split(',').map((p) => `${p.trim()} ${duracion}`).join(', ')}` : 'none'

  const luz = enCalma ? Math.min(valores.luz, 12) : valores.luz
  const gente = enCalma ? 0 : valores.gente
  const ruido = enCalma ? 0 : valores.ruido
  const eco = enCalma ? 0 : valores.eco

  // Capas fijas + opacity: los gradientes CSS no interpolan y provocan flashes.
  const oscuridad = Math.min(0.55, (luz / 100) * 0.55)
  const calidez = Math.min(0.5, Math.max(0, (luz - 20) / 160))
  const brilloSuperior = Math.min(0.75, 0.08 + (luz / 100) * 0.62)
  const opacidadVelosonido = Math.min(0.38, (ruido * 0.55 + eco * 0.45) / 200)
  const barraRuido = ruido / 100
  const barraEco = eco / 100

  const [anuncio, setAnuncio] = useState('')
  const prevRef = useRef({ ruido: -1, eco: -1, luz: -1, gente: -1 })

  useEffect(() => {
    const prev = prevRef.current
    const partes: string[] = []
    if (nivelPalabra(ruido) !== nivelPalabra(prev.ruido) && prev.ruido >= 0) {
      partes.push(`Ruido ${nivelPalabra(ruido)}`)
    }
    if (nivelPalabra(eco) !== nivelPalabra(prev.eco) && prev.eco >= 0) {
      partes.push(`Eco ${nivelPalabra(eco)}`)
    }
    if (nivelPalabra(luz) !== nivelPalabra(prev.luz) && prev.luz >= 0) {
      partes.push(`Luz ${nivelPalabra(luz)}`)
    }
    if (nivelPalabra(gente) !== nivelPalabra(prev.gente) && prev.gente >= 0) {
      partes.push(`Gente ${nivelPalabra(gente)}`)
    }
    prevRef.current = { ruido, eco, luz, gente }
    if (partes.length === 0) return

    const t = window.setTimeout(() => {
      setAnuncio(partes.join('. '))
    }, reduced ? 0 : 400)
    return () => window.clearTimeout(t)
  }, [ruido, eco, luz, gente, reduced])

  return (
    <div className="space-y-3">
      <div
        className="aspect-video rounded-tarjeta relative overflow-hidden border border-puente-200"
        role="img"
        aria-label={`Vista de la sala: ${nivel.nombre}. Ruido ${Math.round(ruido)}, luz ${Math.round(luz)}, gente ${Math.round(gente)}, eco ${Math.round(eco)}.`}
        style={{
          // Base fija (teal/calma). Oscuridad y calidez van en capas con opacity.
          background: 'linear-gradient(180deg, hsl(200, 16%, 94%) 0%, hsl(195, 12%, 86%) 100%)',
        }}
      >
        {/* Oscuridad al subir la luz fluorescente (tenue → intenso) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'hsl(200, 14%, 72%)',
            opacity: oscuridad,
            transition: transicion('opacity'),
          }}
          aria-hidden="true"
        />

        {/* Calidez / temperatura */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'linear-gradient(180deg, rgba(255,236,200,0.9) 0%, rgba(255,248,220,0.15) 55%, transparent 100%)',
            opacity: calidez,
            transition: transicion('opacity'),
          }}
          aria-hidden="true"
        />

        {/* Brillo superior suave */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 90% 55% at 50% -5%, rgba(255,248,220,0.85) 0%, transparent 60%)',
            opacity: brilloSuperior,
            transition: transicion('opacity'),
          }}
          aria-hidden="true"
        />

        {/* Mobiliario sugerido */}
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-[1]" aria-hidden="true">
          <div
            className="w-3/5 h-3 rounded-sm bg-puente-700/30 mb-8"
            style={{
              opacity: 0.35 + gente / 220,
              transition: transicion('opacity'),
            }}
          />
          <div className="flex gap-8 w-4/5 justify-between mb-10">
            <div className="w-1/3 h-2 rounded-sm bg-puente-600/25" />
            <div className="w-1/3 h-2 rounded-sm bg-puente-600/25" />
          </div>
          <p className="text-xl font-bold text-puente-800 text-center">
            {nivel.nombre}
          </p>
          <p className="text-puente-600 text-center max-w-md mt-2">
            {nivel.descripcion}
          </p>
        </div>

        <SiluetasSuaves gente={gente} duracion={duracion} />

        {/* Velo de ambiente (ruido + eco): color fijo, solo opacity */}
        <div
          className="absolute inset-0 pointer-events-none z-[2]"
          style={{
            background: 'rgba(26, 70, 82, 1)',
            opacity: opacidadVelosonido,
            transition: transicion('opacity'),
          }}
          aria-hidden="true"
        />

        {/* Ondas discretas de sonido (visual para quien no oye) */}
        <div
          className="absolute bottom-3 left-3 right-3 z-[3] flex items-end gap-1 h-8 pointer-events-none"
          aria-hidden="true"
        >
          {Array.from({ length: 16 }, (_, i) => {
            const fase = (i / 15) * Math.PI
            const altura =
              0.12 +
              barraRuido * (0.35 + 0.45 * Math.abs(Math.sin(fase * 2.1))) +
              barraEco * (0.2 + 0.35 * Math.abs(Math.cos(fase * 1.4)))
            const opacidadBarra =
              barraRuido + barraEco < 0.02
                ? 0.12
                : 0.22 + barraRuido * 0.35 + barraEco * 0.25
            return (
              <span
                key={i}
                className="flex-1 rounded-full bg-puente-700/55 origin-bottom"
                style={{
                  height: '100%',
                  transform: `scaleY(${Math.min(1, altura)})`,
                  opacity: opacidadBarra,
                  transition: transicion('transform, opacity'),
                }}
              />
            )
          })}
        </div>

        {enCalma && (
          <div className="absolute top-3 left-3 right-3 text-center z-[4]">
            <span className="inline-block bg-white/90 text-puente-800 font-bold px-4 py-2 rounded-suave text-sm">
              Modo calma activo
            </span>
          </div>
        )}
      </div>

      {/* Indicador textual ruido/eco (no depende del audio) */}
      <div
        className="rounded-suave border border-puente-100 bg-white/80 px-4 py-3"
        aria-label={`Nivel visual de sonido. Ruido ${nivelPalabra(ruido)}, eco ${nivelPalabra(eco)}.`}
      >
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex justify-between text-puente-700 mb-1">
              <span className="font-bold">Ruido (visual)</span>
              <span>{nivelPalabra(ruido)}</span>
            </div>
            <div className="h-2 rounded-full bg-puente-100 overflow-hidden">
              <div
                className="h-full bg-puente-600 rounded-full origin-left"
                style={{
                  transform: `scaleX(${barraRuido})`,
                  transition: transicion('transform'),
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-puente-700 mb-1">
              <span className="font-bold">Eco (visual)</span>
              <span>{nivelPalabra(eco)}</span>
            </div>
            <div className="h-2 rounded-full bg-puente-100 overflow-hidden">
              <div
                className="h-full bg-puente-500 rounded-full origin-left"
                style={{
                  transform: `scaleX(${barraEco})`,
                  transition: transicion('transform'),
                }}
              />
            </div>
          </div>
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {anuncio}
        </p>
      </div>
    </div>
  )
}
