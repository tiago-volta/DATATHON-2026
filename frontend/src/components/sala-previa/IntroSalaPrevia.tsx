'use client'

import { useId, useState } from 'react'
import { CREDITO_AUDIO } from '@/lib/sala-previa/audio'

const PASOS = [
  {
    titulo: 'Qué vas a ver y oír',
    cuerpo:
      'Vas a practicar el ambiente de un juzgado por capas: ruido, luz y gente. Empiezas en una sala casi vacía y en silencio.',
  },
  {
    titulo: 'Tú mandas el ritmo',
    cuerpo:
      'Puedes pausar o pulsar «Volver a la calma» cuando quieras. Nada te obliga a subir de nivel. Los cambios llegan despacio.',
  },
  {
    titulo: 'Antes del audio',
    cuerpo:
      'Al empezar puede sonar sonido del ambiente. Baja el volumen del dispositivo o usa auriculares. El audio no arranca hasta que pulses el botón.',
  },
] as const

interface Props {
  onEmpezar: () => void
}

export function IntroSalaPrevia({ onEmpezar }: Props) {
  const [paso, setPaso] = useState(0)
  const tituloId = useId()
  const total = PASOS.length
  const actual = PASOS[paso]
  const esUltimo = paso === total - 1

  const irAAvisoAudio = () => setPaso(total - 1)

  return (
    <section
      className="card-destacada max-w-2xl"
      aria-labelledby={tituloId}
    >
      <p className="text-sm font-medium text-court-700 mb-2" aria-live="polite">
        Intro · paso {paso + 1} de {total}
      </p>
      <h2 id={tituloId} className="text-2xl font-bold text-court-800 mb-3">
        {actual.titulo}
      </h2>
      <p className="text-lg text-court-800 mb-6">{actual.cuerpo}</p>

      {esUltimo && (
        <div
          className="mb-6 rounded-suave border-2 border-accent-alert bg-accent-alert/10 p-4"
          role="status"
        >
          <p className="font-bold text-court-800 mb-1">Aviso de audio</p>
          <p className="text-court-700">
            Va a haber sonido. Baja el volumen o ponte auriculares. No suena nada
            hasta que pulses «Empezar en nivel 0».
          </p>
        </div>
      )}

      <div
        className="flex gap-2 mb-6"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={paso + 1}
        aria-label="Avance de la intro"
      >
        {PASOS.map((_, i) => (
          <span
            key={PASOS[i].titulo}
            className={`h-2 flex-1 rounded-full ${
              i <= paso ? 'bg-court-600' : 'bg-court-100'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        {esUltimo ? (
          <button type="button" className="btn-primary flex-1" onClick={onEmpezar}>
            Empezar en nivel 0
          </button>
        ) : (
          <button
            type="button"
            className="btn-primary flex-1"
            onClick={() => setPaso((p) => Math.min(total - 1, p + 1))}
          >
            Siguiente
          </button>
        )}

        {paso > 0 && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setPaso((p) => Math.max(0, p - 1))}
          >
            Atrás
          </button>
        )}

        {!esUltimo && (
          <button type="button" className="btn-ghost" onClick={irAAvisoAudio}>
            Saltar intro
          </button>
        )}
      </div>

      <p className="text-sm text-court-700 mt-4">{CREDITO_AUDIO}</p>
    </section>
  )
}
