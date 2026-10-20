'use client'

import { useCallback, useEffect, useState } from 'react'
import {
  cargarPractica,
  diasDeEstaSemana,
  diasPracticadosEstaSemana,
  marcarBienvenidaVista,
  mensajeBienvenidaPendiente,
  registrarPracticaHoy,
  totalDiasPracticados,
  type DiaSemana,
  type EstadoPractica,
} from '@/lib/practica'

/**
 * Días de práctica compartidos (Sala Previa + Ensaya).
 * Sin castigo ni reinicio de racha.
 */
export function usePractica() {
  const [estado, setEstado] = useState<EstadoPractica>({
    dias: [],
    bienvenidaVistaTras: null,
  })
  const [listo, setListo] = useState(false)
  const [bienvenida, setBienvenida] = useState<string | null>(null)
  const [semana, setSemana] = useState<DiaSemana[]>([])

  useEffect(() => {
    const cargado = cargarPractica()
    setEstado(cargado)
    setSemana(diasDeEstaSemana(cargado))
    setBienvenida(mensajeBienvenidaPendiente(cargado))
    setListo(true)
  }, [])

  const registrar = useCallback(() => {
    const resultado = registrarPracticaHoy()
    setEstado(resultado.estado)
    setSemana(diasDeEstaSemana(resultado.estado))
    // Si practica hoy, la bienvenida de pausa ya no hace falta.
    setBienvenida(null)
    return resultado
  }, [])

  const descartarBienvenida = useCallback(() => {
    const siguiente = marcarBienvenidaVista()
    setEstado(siguiente)
    setBienvenida(null)
  }, [])

  return {
    listo,
    estado,
    total: totalDiasPracticados(estado),
    estaSemana: diasPracticadosEstaSemana(estado),
    semana,
    bienvenida,
    registrar,
    descartarBienvenida,
  }
}
