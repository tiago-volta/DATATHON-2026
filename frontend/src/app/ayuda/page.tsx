'use client'

import Link from 'next/link'
import { FormEvent, useCallback, useEffect, useId, useRef, useState } from 'react'
import { preguntarAyudaAPI } from '@/lib/api'
import {
  crearReconocimiento,
  MENSAJE_MIC_DENEGADO,
  pedirPermisoMicrofono,
  reconocimientoVozDisponible,
  type ControlesReconocimiento,
} from '@/lib/voz/reconocimiento'
import {
  hablarCola,
  parar as pararVoz,
  vozNaturalDisponible,
} from '@/lib/vozNatural'

type Mensaje = {
  id: string
  rol: 'persona' | 'asistente'
  texto: string
}

/**
 * Pregunta a InclusiveCourt: dudas por texto o voz.
 * Respuesta leída con vozNatural (mutex). Sin diagnóstico médico.
 */
export default function PaginaAyuda() {
  const tituloId = useId()
  const campoId = useId()
  const liveId = useId()
  const [pregunta, setPregunta] = useState('')
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      id: 'saludo',
      rol: 'asistente',
      texto:
        'Hola. Soy InclusiveCourt. Puedes preguntarme por la citación, el Pasaporte, Ensaya, la Sala Previa o el modo con voz. Escribe o habla. No pido datos de salud.',
    },
  ])
  const [enviando, setEnviando] = useState(false)
  const [escuchando, setEscuchando] = useState(false)
  const [hablando, setHablando] = useState(false)
  const [anuncio, setAnuncio] = useState('')
  const [ultimaRespuesta, setUltimaRespuesta] = useState(
    'Hola. Soy InclusiveCourt. Puedes preguntarme por la citación, el Pasaporte, Ensaya, la Sala Previa o el modo con voz.'
  )
  const cancelarHablaRef = useRef<(() => void) | null>(null)
  const reconocimientoRef = useRef<ControlesReconocimiento | null>(null)
  const listaRef = useRef<HTMLUListElement>(null)
  const enviandoRef = useRef(false)
  const enviarRef = useRef<(texto: string) => Promise<void>>(async () => undefined)

  const pararHabla = useCallback(() => {
    cancelarHablaRef.current?.()
    cancelarHablaRef.current = null
    pararVoz()
    setHablando(false)
  }, [])

  const leerTexto = useCallback(
    (texto: string) => {
      if (!vozNaturalDisponible() || !texto.trim()) {
        setAnuncio(
          'Tu navegador no puede leer en voz alta. El texto está en pantalla.'
        )
        return
      }
      pararHabla()
      setHablando(true)
      setAnuncio('Leyendo la respuesta…')
      const { cancelar } = hablarCola([texto], {
        onFin: () => {
          cancelarHablaRef.current = null
          setHablando(false)
          setAnuncio('')
        },
      })
      cancelarHablaRef.current = cancelar
    },
    [pararHabla]
  )

  const enviarPregunta = useCallback(
    async (textoRaw: string) => {
      const texto = textoRaw.trim()
      if (texto.length < 2 || enviandoRef.current) return

      pararHabla()
      reconocimientoRef.current?.parar()
      setEscuchando(false)

      const idPersona = `p-${Date.now()}`
      setMensajes((prev) => [
        ...prev,
        { id: idPersona, rol: 'persona', texto },
      ])
      setPregunta('')
      enviandoRef.current = true
      setEnviando(true)
      setAnuncio('Pensando la respuesta…')

      try {
        const { respuesta } = await preguntarAyudaAPI(texto)
        const idInclusiveCourt = `r-${Date.now()}`
        setMensajes((prev) => [
          ...prev,
          { id: idInclusiveCourt, rol: 'asistente', texto: respuesta },
        ])
        setUltimaRespuesta(respuesta)
        setAnuncio('Respuesta lista.')
        leerTexto(respuesta)
      } catch {
        const fallback =
          'Ahora mismo no puedo responder. Prueba otra vez en unos segundos, o mira Citación, Pasaporte, Ensaya o Sala en el menú.'
        setMensajes((prev) => [
          ...prev,
          { id: `e-${Date.now()}`, rol: 'asistente', texto: fallback },
        ])
        setUltimaRespuesta(fallback)
        setAnuncio(fallback)
      } finally {
        enviandoRef.current = false
        setEnviando(false)
      }
    },
    [leerTexto, pararHabla]
  )

  enviarRef.current = enviarPregunta

  useEffect(() => {
    if (!reconocimientoVozDisponible()) return
    const controles = crearReconocimiento({
      continuous: false,
      onHablaUsuario: () => {
        pararVoz()
        setHablando(false)
      },
      onResultado: ({ texto, final }) => {
        if (!texto) return
        setPregunta(texto)
        if (final) {
          setEscuchando(false)
          void enviarRef.current(texto)
        }
      },
      onError: (mensaje) => {
        setAnuncio(mensaje)
        setEscuchando(false)
      },
      onFin: () => setEscuchando(false),
    })
    reconocimientoRef.current = controles
    return () => {
      controles.parar()
      reconocimientoRef.current = null
    }
  }, [])

  useEffect(() => {
    listaRef.current?.lastElementChild?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
    })
  }, [mensajes])

  useEffect(() => {
    return () => {
      cancelarHablaRef.current?.()
      pararVoz()
      reconocimientoRef.current?.parar()
    }
  }, [])

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    void enviarPregunta(pregunta)
  }

  const empezarHablar = async () => {
    if (!reconocimientoVozDisponible()) {
      setAnuncio(
        'Tu navegador no reconoce la voz. Puedes escribir la pregunta con el teclado.'
      )
      return
    }
    const permiso = await pedirPermisoMicrofono()
    if (permiso === 'denegado') {
      setAnuncio(MENSAJE_MIC_DENEGADO)
      return
    }
    pararHabla()
    setEscuchando(true)
    setAnuncio('Te escucho. Di tu duda con calma.')
    reconocimientoRef.current?.iniciar()
  }

  return (
    <main id="contenido-principal" className="page-shell">
      <header className="mb-8">
        <p className="text-sm font-bold tracking-wide text-court-700 mb-2">
          Pregunta a InclusiveCourt
        </p>
        <h1 id={tituloId} className="titulo-pagina">
          Ayuda
        </h1>
        <p className="entradilla max-w-[40ch]">
          Escribe o habla tu duda. Te respondo con frases cortas. No hago
          diagnósticos ni pido datos de salud.
        </p>
      </header>

      <ul
        ref={listaRef}
        className="space-y-4 mb-8"
        aria-label="Conversación"
        aria-live="polite"
        aria-relevant="additions"
      >
        {mensajes.map((m) => (
          <li
            key={m.id}
            className={
              m.rol === 'persona'
                ? 'ml-4 md:ml-12 p-4 rounded-tarjeta bg-court-50 border border-court-200'
                : 'mr-4 md:mr-12 p-4 rounded-tarjeta bg-calma-sage border border-court-200'
            }
          >
            <p className="text-sm font-bold text-court-700 mb-1">
              {m.rol === 'persona' ? 'Tú' : 'InclusiveCourt'}
            </p>
            <p className="text-court-900 leading-relaxed">{m.texto}</p>
          </li>
        ))}
      </ul>

      <p id={liveId} className="sr-only" role="status" aria-live="polite">
        {anuncio}
      </p>

      {anuncio && (
        <p
          className="mb-4 text-court-800 bg-court-50 border border-court-200 rounded-lg p-3"
          role="status"
          aria-live="polite"
        >
          {anuncio}
        </p>
      )}

      <form onSubmit={onSubmit} className="card mb-6" aria-labelledby={tituloId}>
        <label htmlFor={campoId} className="block text-lg font-medium text-court-800 mb-2">
          Tu pregunta
        </label>
        <textarea
          id={campoId}
          value={pregunta}
          onChange={(e) => setPregunta(e.target.value.slice(0, 800))}
          className="textarea-accesible min-h-[120px] mb-4"
          placeholder="Ejemplo: ¿Qué es el Pasaporte de ajustes?"
          maxLength={800}
          disabled={enviando}
          aria-describedby="ayuda-pregunta-hint"
        />
        <p id="ayuda-pregunta-hint" className="text-sm text-court-700 mb-4">
          Puedes escribir o pulsar Hablar para dictar. Máximo 800 caracteres.
        </p>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            className="btn-secondary min-h-[44px]"
            onClick={() => void empezarHablar()}
            aria-pressed={escuchando}
            disabled={enviando}
          >
            {escuchando ? 'Escuchando…' : 'Hablar'}
          </button>
          <button
            type="submit"
            className="btn-primary min-h-[44px]"
            disabled={enviando || pregunta.trim().length < 2}
          >
            {enviando ? 'Enviando…' : 'Enviar'}
          </button>
          <button
            type="button"
            className="btn-ghost min-h-[44px]"
            onClick={() => {
              reconocimientoRef.current?.parar()
              setEscuchando(false)
              pararHabla()
              setAnuncio('Parado.')
            }}
          >
            Parar
          </button>
          <button
            type="button"
            className="btn-ghost min-h-[44px]"
            onClick={() => leerTexto(ultimaRespuesta)}
            disabled={!ultimaRespuesta || hablando}
            aria-pressed={hablando}
          >
            {hablando ? 'Leyendo…' : 'Repetir respuesta'}
          </button>
        </div>
      </form>

      <nav aria-label="Atajos de ayuda" className="flex flex-wrap gap-4 text-court-800">
        <Link href="/citacion" className="underline underline-offset-4 font-bold min-h-[44px] inline-flex items-center">
          Citación
        </Link>
        <Link href="/pasaporte" className="underline underline-offset-4 font-bold min-h-[44px] inline-flex items-center">
          Pasaporte
        </Link>
        <Link href="/ensaya" className="underline underline-offset-4 font-bold min-h-[44px] inline-flex items-center">
          Ensaya
        </Link>
        <Link href="/sala-previa" className="underline underline-offset-4 font-bold min-h-[44px] inline-flex items-center">
          Sala Previa
        </Link>
        <Link href="/" className="underline underline-offset-4 min-h-[44px] inline-flex items-center">
          Inicio
        </Link>
      </nav>
    </main>
  )
}
