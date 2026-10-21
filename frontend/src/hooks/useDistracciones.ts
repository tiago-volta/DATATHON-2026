'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  AVISO_PREVIO_MS,
  DISTRACCIONES,
  crearDistraccion,
  elegirDistraccion,
  intervaloDistraccion,
  probabilidadSolape,
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
  numPublico: number
}

export function useDistracciones({ nivel, avisar, enCalma, papel, numPublico }: Opciones) {
  const [activa, setActiva] = useState<Distraccion | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [explicacion, setExplicacion] = useState('')
  const [historial, setHistorial] = useState<EntradaHistorial[]>([])

  const sonidos = useRef<SonidosDistraccion | null>(null)
  const contador = useRef(0)
  const activaRef = useRef<Distraccion | null>(null)
  const ultimoTipo = useRef<TipoDistraccion | null>(null)
  const timerFin = useRef<number | null>(null)
  const estado = useRef({ numPublico, avisar, nivel })
  estado.current = { numPublico, avisar, nivel }

  const sonido = useCallback(() => {
    if (!sonidos.current) sonidos.current = new SonidosDistraccion()
    return sonidos.current
  }, [])

  const anotar = useCallback((d: Distraccion) => {
    const texto = DISTRACCIONES[d.tipo].registro
    setHistorial((h) => [{ id: d.id, texto }, ...h].slice(0, MAX_HISTORIAL))
  }, [])

  const terminar = useCallback(
    (d: Distraccion) => {
      activaRef.current = null
      setActiva(null)
      setExplicacion(DISTRACCIONES[d.tipo].explicacion)
      anotar(d)
    },
    [anotar]
  )

  const empezar = useCallback(
    (d: Distraccion) => {
      setAviso(null)
      activaRef.current = d
      setActiva(d)
      const n = estado.current.nivel
      sonido().reproducir(d, volumenDistraccion(n === 'apagadas' ? 'pocas' : n))
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
    const timersSolape: number[] = []
    let vivo = true

    const programar = (ms: number) => {
      timer = window.setTimeout(lanzar, ms)
    }

    /** Sonido corto (tos, papeles, boli…) por encima de la distracción que ya está en marcha. */
    const solapar = () => {
      if (!vivo) return
      contador.current += 1
      const extra = elegirDistraccion({
        id: contador.current,
        papel,
        nivel,
        numPublico: estado.current.numPublico,
        anterior: activaRef.current?.tipo ?? ultimoTipo.current,
        soloRapidas: true,
      })
      const sonar = () => {
        if (!vivo) return
        setAviso(null)
        sonido().reproducir(extra, volumenDistraccion(nivel))
        timersSolape.push(
          window.setTimeout(() => {
            if (!activaRef.current) setExplicacion(DISTRACCIONES[extra.tipo].explicacion)
            anotar(extra)
          }, extra.duracion * 1000)
        )
      }
      if (estado.current.avisar) {
        setAviso(DISTRACCIONES[extra.tipo].aviso)
        timersSolape.push(window.setTimeout(sonar, AVISO_PREVIO_MS))
        return
      }
      sonar()
    }

    const lanzar = () => {
      if (!vivo) return
      if (activaRef.current) {
        if (Math.random() < probabilidadSolape(nivel)) solapar()
        programar(nivel === 'muchas' ? intervaloDistraccion(nivel) : 1500)
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
      const conAviso = estado.current.avisar
      const arrancar = () => {
        if (!vivo) return
        empezar(d)
        if (Math.random() < probabilidadSolape(nivel) * 0.5) {
          timersSolape.push(window.setTimeout(solapar, 700 + Math.random() * 1300))
        }
        programar(Math.max(800, intervaloDistraccion(nivel) - (conAviso ? AVISO_PREVIO_MS : 0)))
      }
      if (conAviso) {
        setAviso(DISTRACCIONES[d.tipo].aviso)
        timer = window.setTimeout(arrancar, AVISO_PREVIO_MS)
        return
      }
      arrancar()
    }

    programar(nivel === 'muchas' ? 1500 : 3000)

    return () => {
      vivo = false
      if (timer != null) window.clearTimeout(timer)
      for (const t of timersSolape) window.clearTimeout(t)
      cortar()
    }
  }, [enCalma, nivel, papel, empezar, cortar, sonido, anotar])

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
