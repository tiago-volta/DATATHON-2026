'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icono } from '@/components/Icono'
import { SimuladorDeclaracion } from '@/components/sala-previa/declaracion/SimuladorDeclaracion'
import {
  ResumenDeclaracion,
  type ContadoresAyuda,
  type RegistroTurno,
} from '@/components/sala-previa/declaracion/ResumenDeclaracion'
import { hayVoz } from '@/lib/sala-previa/vozSala'
import { marcarJuicioEnsayado } from '@/lib/preparacion'

const NOMBRE_LUIS = 'Luis'
const PUNTO_VISTA = 'testigo' as const

type Fase = 'simular' | 'resumen'

export default function PaginaDeclaracion() {
  const [listo, setListo] = useState(false)
  const [fase, setFase] = useState<Fase>('simular')
  const [voz, setVoz] = useState(false)
  const [registro, setRegistro] = useState<RegistroTurno[]>([])
  const [sesion, setSesion] = useState(0)
  const [ayudas, setAyudas] = useState<ContadoresAyuda>({
    pausas: 0,
    repeticiones: 0,
    aclaraciones: 0,
  })

  useEffect(() => {
    setVoz(hayVoz())
    setListo(true)
  }, [])

  const empezar = () => {
    setRegistro([])
    setAyudas({ pausas: 0, repeticiones: 0, aclaraciones: 0 })
    setSesion((n) => n + 1)
    setFase('simular')
  }

  const terminar = (reg: RegistroTurno[], ay: ContadoresAyuda) => {
    setRegistro(reg)
    setAyudas(ay)
    marcarJuicioEnsayado()
    setFase('resumen')
  }

  return (
    <main id="contenido-principal" className="page-shell-wide !py-3 flex flex-col h-[calc(100dvh-4.75rem)] overflow-y-auto">
      <nav aria-label="Volver" className="mb-2 shrink-0">
        <Link href="/sala-previa" className="link-atras">
          <Icono nombre="←" />
          Volver a la sala
        </Link>
      </nav>

      <h1 className="titulo-pagina !mb-2 shrink-0">Simulación del juicio</h1>

      {!listo && (
        <p className="text-court-800" aria-live="polite">
          Preparando la simulación…
        </p>
      )}

      {listo && fase === 'simular' && (
        <SimuladorDeclaracion
          key={`${PUNTO_VISTA}-${sesion}`}
          puntoVista={PUNTO_VISTA}
          nombre={NOMBRE_LUIS}
          voz={voz}
          onVoz={setVoz}
          onTerminar={terminar}
        />
      )}

      {listo && fase === 'resumen' && (
        <ResumenDeclaracion
          puntoVista={PUNTO_VISTA}
          registro={registro}
          ayudas={ayudas}
          nombre={NOMBRE_LUIS}
          onRepetir={empezar}
        />
      )}
    </main>
  )
}
