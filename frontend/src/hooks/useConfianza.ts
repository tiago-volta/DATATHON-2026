'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  cargarConfianza,
  etiquetaParaScore,
  registrarEvento,
  type EstadoConfianza,
  type EtiquetaConfianza,
  type TipoEventoConfianza,
} from '@/lib/confianza'

/**
 * Carga el medidor de confianza y permite registrar eventos (solo suben).
 */
export function useConfianza() {
  const [estado, setEstado] = useState<EstadoConfianza>({
    score: 0,
    eventos: [],
    checkinsBien: 0,
  })
  const [listo, setListo] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [etiqueta, setEtiqueta] = useState<EtiquetaConfianza>(() =>
    etiquetaParaScore(0)
  )

  useEffect(() => {
    const cargado = cargarConfianza()
    setEstado(cargado)
    setEtiqueta(etiquetaParaScore(cargado.score))
    setListo(true)
  }, [])

  const registrar = useCallback(
    (tipo: TipoEventoConfianza, detalle?: string | number) => {
      const resultado = registrarEvento(tipo, detalle)
      setEstado(resultado.estado)
      setEtiqueta(resultado.etiqueta)
      if (resultado.mensaje) {
        setMensaje(resultado.mensaje)
      }
      return resultado
    },
    []
  )

  const descartarMensaje = useCallback(() => {
    setMensaje(null)
  }, [])

  return {
    score: estado.score,
    etiqueta,
    listo,
    mensaje,
    registrar,
    descartarMensaje,
  }
}
