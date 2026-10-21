'use client'

import { useEffect, useRef, useState } from 'react'
import { rutaPasaporteDesdeTexto } from '@/lib/pasaporte'

interface CodigoLeido {
  rawValue?: string
}

interface LectorCodigos {
  detect: (origen: HTMLVideoElement) => Promise<CodigoLeido[]>
}

type ConstructorLector = new (opciones?: { formats?: string[] }) => LectorCodigos

function lectorDelNavegador(): ConstructorLector | null {
  if (typeof window === 'undefined') return null
  const candidato = (window as Window & { BarcodeDetector?: ConstructorLector }).BarcodeDetector
  return candidato ?? null
}

function pararPistas(stream: MediaStream | null) {
  stream?.getTracks().forEach((pista) => pista.stop())
}

async function abrirCamara(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: 'environment' } },
      audio: false,
    })
  } catch {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  }
}

export function EscanerFicha({
  onRuta,
  onSoporte,
}: {
  onRuta: (ruta: string) => void
  onSoporte?: (soportado: boolean) => void
}) {
  const [listo, setListo] = useState(false)
  const [soportado, setSoportado] = useState(false)
  const [activo, setActivo] = useState(false)
  const [abriendo, setAbriendo] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const intentoRef = useRef(0)
  const montadoRef = useRef(true)
  const devolverFocoRef = useRef(false)
  const onRutaRef = useRef(onRuta)
  const cerrarRef = useRef<HTMLButtonElement>(null)
  const abrirRef = useRef<HTMLButtonElement>(null)

  onRutaRef.current = onRuta

  useEffect(() => {
    montadoRef.current = true
    const hay = lectorDelNavegador() !== null
    setSoportado(hay)
    setListo(true)
    onSoporte?.(hay)
    return () => {
      montadoRef.current = false
      intentoRef.current += 1
      pararPistas(streamRef.current)
      streamRef.current = null
    }
  }, [onSoporte])

  useEffect(() => {
    if (!activo) {
      if (devolverFocoRef.current) {
        devolverFocoRef.current = false
        abrirRef.current?.focus()
      }
      return
    }

    const video = videoRef.current
    const stream = streamRef.current
    const Lector = lectorDelNavegador()
    const intento = intentoRef.current
    if (!video || !stream || !Lector) return

    video.srcObject = stream
    cerrarRef.current?.focus()
    setMensaje('Cámara abierta. Apunta al código de la ficha.')

    let timer = 0
    let cancelado = false
    const lector = new Lector({ formats: ['qr_code'] })

    const vigente = () => !cancelado && montadoRef.current && intento === intentoRef.current

    const leer = async () => {
      if (!vigente()) return
      try {
        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
          const codigos = await lector.detect(video)
          if (!vigente()) return
          const texto = codigos.find((codigo) => codigo.rawValue)?.rawValue
          if (texto) {
            const ruta = rutaPasaporteDesdeTexto(texto)
            if (ruta) {
              devolverFocoRef.current = false
              pararPistas(stream)
              if (streamRef.current === stream) streamRef.current = null
              video.srcObject = null
              setActivo(false)
              onRutaRef.current(ruta)
              return
            }
            setMensaje('Ese código no abre una ficha. Prueba con el código de la ficha.')
          }
        }
      } catch {
        /* el fotograma aún no está listo */
      }
      if (vigente()) timer = window.setTimeout(() => void leer(), 400)
    }

    const alListo = () => {
      void video.play().then(() => {
        if (vigente()) void leer()
      }).catch(() => {
        if (!vigente()) return
        setMensaje('No se ha podido mostrar la cámara. Pega el enlace.')
        intentoRef.current += 1
        pararPistas(streamRef.current)
        streamRef.current = null
        setActivo(false)
      })
    }

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) alListo()
    else video.addEventListener('loadedmetadata', alListo)

    return () => {
      cancelado = true
      window.clearTimeout(timer)
      video.removeEventListener('loadedmetadata', alListo)
      pararPistas(stream)
      if (streamRef.current === stream) streamRef.current = null
      video.srcObject = null
    }
  }, [activo])

  const abrir = async () => {
    if (abriendo || activo) return
    const intento = intentoRef.current + 1
    intentoRef.current = intento
    setMensaje('')
    setAbriendo(true)
    try {
      const stream = await abrirCamara()
      if (!montadoRef.current || intento !== intentoRef.current) {
        pararPistas(stream)
        return
      }
      streamRef.current = stream
      devolverFocoRef.current = true
      setActivo(true)
    } catch {
      if (montadoRef.current && intento === intentoRef.current) {
        setMensaje('No se ha podido abrir la cámara. Pega el enlace.')
      }
    } finally {
      if (montadoRef.current && intento === intentoRef.current) setAbriendo(false)
    }
  }

  const cerrar = () => {
    intentoRef.current += 1
    devolverFocoRef.current = true
    pararPistas(streamRef.current)
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setAbriendo(false)
    setActivo(false)
    setMensaje('')
  }

  if (!listo) return null

  if (!soportado) {
    return (
      <p className="text-court-700 mb-4">
        En este navegador no se puede usar la cámara. Pega el enlace de la ficha.
      </p>
    )
  }

  return (
    <div className="mb-4">
      <p className="text-court-800" role="status">
        {mensaje}
      </p>
      {!activo ? (
        <button
          ref={abrirRef}
          type="button"
          className="btn-secondary mt-3"
          onClick={() => void abrir()}
          disabled={abriendo}
          aria-busy={abriendo}
        >
          {abriendo ? 'Abriendo la cámara…' : 'Escanear el código'}
        </button>
      ) : (
        <div className="mt-3 rounded-suave border border-court-200 bg-white p-3">
          <video
            ref={videoRef}
            className="w-full max-h-64 rounded-suave bg-court-50 object-cover"
            muted
            playsInline
            aria-label="Cámara para leer el código de la ficha"
          />
          <button ref={cerrarRef} type="button" className="btn-ghost mt-3" onClick={cerrar}>
            Cerrar la cámara
          </button>
        </div>
      )}
    </div>
  )
}
