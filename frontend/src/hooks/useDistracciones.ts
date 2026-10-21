'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AVISO_PREVIO_MS,
  DISTRACCIONES,
  crearDistraccion,
  elegirDistraccion,
  intervaloDistraccion,
  volumenDistraccion,
  type Distraccion,
  type NivelDistracciones,
  type TipoDistraccion,
} from '@/lib/sala-previa/distracciones'
import { SonidosDistraccion } from '@/lib/sala-previa/sonidosDistraccion'
import type { PapelSala } from '@/lib/sala-previa/salaVistasConfig'

export interface EntradaHistorial {
  id: number
  texto: string
}

const MAX_HISTORIAL = 6

interface Opciones {
  nivel: NivelDistracciones
  avisar: boolean
  enCalma: boolean
  papel: PapelSala
  gente: number
  ruido: number
  numPublico: number
}

export function useDistracciones({
  nivel,
  avisar,
  enCalma,
  papel,
  gente,
  ruido,
  numPublico,
}: Opciones) {
  const [activa, setActiva] = useState<Distraccion | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [explicacion, setExplicacion] = useState('')
  const [historial, setHistorial] = useState<EntradaHistorial[]>([])

  const sonidos = useRef<SonidosDistraccion | null>(null)
  const contador = useRef(0)
  const activaRef = useRef<Distraccion | null>(null)
  const ultimoTipo = useRef<TipoDistraccion | null>(null)
  const timerFin = useRef<number | null>(null)
  const estado = useRef({ gente, ruido, numPublico, avisar, nivel })
  estado.current = { gente, ruido, numPublico, avisar, nivel }

  const sonido = useCallback(() => {
    if (!sonidos.current) sonidos.current = new SonidosDistraccion()
    return sonidos.current
  }, [])

  const terminar = useCallback((d: Distraccion) => {
    activaRef.current = null
    setActiva(null)
    const def = DISTRACCIONES[d.tipo]
    setExplicacion(def.explicacion)
    setHistorial((h) => [{ id: d.id, texto: def.registro }, ...h].slice(0, MAX_HISTORIAL))
  }, [])

  const empezar = useCallback(
    (d: Distraccion) => {
      setAviso(null)
      activaRef.current = d
      setActiva(d)
      const { nivel: n, ruido: r } = estado.current
      sonido().reproducir(d, volumenDistraccion(n === 'apagadas' ? 'pocas' : n, r))
      if (timerFin.current != null) window.clearTimeout(timerFin.current)
      timerFin.current = window.setTimeout(() => {
        timerFin.current = null
        terminar(d)
      }, d.duracion * 1000)
    },
    [sonido, terminar]
  )

  const cortar = useCallback(() => {
    if (timerFin.current != null) {
      window.clearTimeout(timerFin.current)
      timerFin.current = null
    }
    sonidos.current?.cancelar()
    activaRef.current = null
    setActiva(null)
    setAviso(null)
  }, [])

  useEffect(() => {
    if (enCalma || nivel === 'apagadas') {
      cortar()
      return
    }
    sonido().preparar()
    let timer: number | null = null
    let vivo = true

    const programar = () => {
      const { gente: g, ruido: r } = estado.current
      const espera = intervaloDistraccion(nivel, Math.max(g, r) / 100)
      timer = window.setTimeout(lanzar, espera)
    }

    const lanzar = () => {
      if (!vivo) return
      if (activaRef.current) {
        programar()
        return
      }
      contador.current += 1
      const d = elegirDistraccion({
        id: contador.current,
        papel,
        nivel,
        numPublico: estado.current.numPublico,
        anterior: ultimoTipo.current,
      })
      ultimoTipo.current = d.tipo
      const arrancar = () => {
        if (!vivo) return
        empezar(d)
        timer = window.setTimeout(programar, d.duracion * 1000)
      }
      if (estado.current.avisar) {
        setAviso(DISTRACCIONES[d.tipo].aviso)
        timer = window.setTimeout(arrancar, AVISO_PREVIO_MS)
        return
      }
      arrancar()
    }

    timer = window.setTimeout(lanzar, nivel === 'muchas' ? 4000 : 8000)

    return () => {
      vivo = false
      if (timer != null) window.clearTimeout(timer)
      cortar()
    }
  }, [enCalma, nivel, papel, empezar, cortar, sonido])

  useEffect(() => () => sonidos.current?.cerrar(), [])

  const disparar = useCallback(
    (tipo: TipoDistraccion, silenciosa = false) => {
      if (enCalma || activaRef.current) return
      contador.current += 1
      empezar(crearDistraccion(contador.current, tipo, estado.current.numPublico, silenciosa))
    },
    [empezar, enCalma]
  )

  const limpiarHistorial = useCallback(() => setHistorial([]), [])

  return { activa, aviso, explicacion, historial, disparar, limpiarHistorial }
}
