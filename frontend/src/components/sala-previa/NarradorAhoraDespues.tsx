'use client'

import { useEffect, useState } from 'react'
import type { EventoSala } from '@/lib/sala-previa/eventos'
import { Icono } from '@/components/Icono'

interface Props {
  agenda: EventoSala[]
  enCalma: boolean
  nivel: number
  onDispararEvento?: (ev: EventoSala) => void
}

export function NarradorAhoraDespues({
  agenda,
  enCalma,
  nivel,
  onDispararEvento,
}: Props) {
  const [segundo, setSegundo] = useState(0)
  const [sinAviso, setSinAviso] = useState(false)
  const [eventoActivo, setEventoActivo] = useState<EventoSala | null>(null)
  const [avisoPrevio, setAvisoPrevio] = useState<string | null>(null)
  const [mensajeVoz, setMensajeVoz] = useState<string | null>(null)

  // Timer de la agenda: avanza cada segundo si no está en calma
  useEffect(() => {
    if (enCalma) return
    const timer = window.setInterval(() => {
      setSegundo((s) => s + 1)
    }, 1000)
    return () => window.clearInterval(timer)
  }, [enCalma])

  // Evaluación de eventos y avisos según el segundo actual
  useEffect(() => {
    if (enCalma) return

    // Buscar si hay aviso previo en curso
    const evConAviso = agenda.find(
      (ev) =>
        segundo >= ev.enSegundo - ev.avisoPrevioSegundos &&
        segundo < ev.enSegundo
    )
    if (evConAviso && !sinAviso) {
      setAvisoPrevio(evConAviso.avisoTexto)
      setMensajeVoz(evConAviso.avisoTexto)
    } else {
      setAvisoPrevio(null)
    }

    // Buscar si hay evento activo en curso
    const evActivo = agenda.find(
      (ev) =>
        segundo >= ev.enSegundo &&
        segundo < ev.enSegundo + ev.duracionSegundos
    )
    if (evActivo) {
      if (eventoActivo?.id !== evActivo.id) {
        setEventoActivo(evActivo)
        onDispararEvento?.(evActivo)
      }
    } else if (eventoActivo) {
      setEventoActivo(null)
    }
  }, [segundo, enCalma, agenda, sinAviso, eventoActivo, onDispararEvento])

  // Próximo evento de la lista
  const proximoEvento = agenda.find((ev) => ev.enSegundo > segundo)

  return (
    <section
      className="rounded-suave border-2 border-court-200 bg-white p-3 shadow-sm space-y-2"
      aria-label="Narrador de la sala: ahora y después"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-court-100 pb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-accent-navy animate-pulse" aria-hidden="true" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-court-800">
            Agenda de simulación viva
          </h3>
        </div>

        {nivel >= 4 && (
          <label className="flex items-center gap-1.5 text-xs text-court-700 cursor-pointer">
            <input
              type="checkbox"
              checked={sinAviso}
              onChange={(e) => setSinAviso(e.target.checked)}
              className="accent-court-600 rounded"
            />
            Modo sin aviso previo (estímulo sorpresa)
          </label>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-2 text-xs">
        {/* AHORA */}
        <div
          className={`p-2.5 rounded-suave border transition-colors ${
            eventoActivo
              ? 'bg-amber-50 border-amber-300'
              : avisoPrevio
                ? 'bg-sky-50 border-sky-300'
                : 'bg-calma-sage/50 border-court-200'
          }`}
        >
          <span className="font-bold uppercase tracking-wider text-[10px] text-court-600 block mb-0.5">
            Ahora:
          </span>
          {enCalma ? (
            <p className="font-semibold text-court-800 flex items-center gap-1.5">
              <Icono nombre="⏸" className="h-3.5 w-3.5" />
              Simulación pausada (modo calma)
            </p>
          ) : avisoPrevio ? (
            <p className="font-semibold text-sky-900 animate-fade-in">
              🔔 {avisoPrevio}
            </p>
          ) : eventoActivo ? (
            <p className="font-semibold text-amber-900">
              ⚡ {eventoActivo.titulo}: {eventoActivo.descripcion}
            </p>
          ) : (
            <p className="text-court-700">
              Ambiente sereno. Esperando siguiente momento del juzgado...
            </p>
          )}
        </div>

        {/* DESPUÉS */}
        <div className="p-2.5 rounded-suave bg-court-50 border border-court-200">
          <span className="font-bold uppercase tracking-wider text-[10px] text-court-600 block mb-0.5">
            Después:
          </span>
          {proximoEvento ? (
            <p className="text-court-800">
              {proximoEvento.despuesTexto || proximoEvento.titulo}
            </p>
          ) : (
            <p className="text-court-600 italic">
              Has completado la secuencia de eventos de esta sala.
            </p>
          )}
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {mensajeVoz}
      </p>
    </section>
  )
}
