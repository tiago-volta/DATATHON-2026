'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Icono } from '@/components/Icono'
import { AvisoInsignia } from '@/components/insignias/AvisoInsignia'
import { PanelInsignias } from '@/components/insignias/PanelInsignias'
import { ElegirPuntoVista } from '@/components/sala-previa/declaracion/ElegirPuntoVista'
import { SimuladorDeclaracion } from '@/components/sala-previa/declaracion/SimuladorDeclaracion'
import {
  ResumenDeclaracion,
  type ContadoresAyuda,
  type RegistroTurno,
} from '@/components/sala-previa/declaracion/ResumenDeclaracion'
import { useInsigniasUtiles } from '@/hooks/useInsigniasUtiles'
import {
  NOMBRE_POR_DEFECTO,
  puntoVistaDesdeRol,
  type PuntoVista,
} from '@/lib/sala-previa/declaracion'
import { hayVoz } from '@/lib/sala-previa/vozSala'
import { cargarPerfil } from '@/lib/perfil/perfil'

type Fase = 'elegir' | 'simular' | 'resumen'

export default function PaginaDeclaracion() {
  const [fase, setFase] = useState<Fase>('elegir')
  const [puntoVista, setPuntoVista] = useState<PuntoVista | null>(null)
  const [sugerido, setSugerido] = useState<PuntoVista | null>(null)
  const [nombre, setNombre] = useState(NOMBRE_POR_DEFECTO)
  const [voz, setVoz] = useState(false)
  const [registro, setRegistro] = useState<RegistroTurno[]>([])
  const [sesion, setSesion] = useState(0)
  const [ayudas, setAyudas] = useState<ContadoresAyuda>({
    pausas: 0,
    repeticiones: 0,
    aclaraciones: 0,
  })
  const {
    conseguidas,
    aviso,
    desbloquear,
    descartarAviso,
  } = useInsigniasUtiles()

  useEffect(() => {
    const perfil = cargarPerfil()
    if (perfil?.nombre) setNombre(perfil.nombre)
    setSugerido(puntoVistaDesdeRol(perfil?.rol))
    setVoz(hayVoz())
  }, [])

  const empezar = (pv: PuntoVista) => {
    setPuntoVista(pv)
    setRegistro([])
    setAyudas({ pausas: 0, repeticiones: 0, aclaraciones: 0 })
    setSesion((n) => n + 1)
    setFase('simular')
  }

  const terminar = (reg: RegistroTurno[], ay: ContadoresAyuda) => {
    setRegistro(reg)
    setAyudas(ay)
    desbloquear('ensaye-declaracion')
    setFase('resumen')
  }

  const repetir = () => {
    if (!puntoVista) return
    setRegistro([])
    setAyudas({ pausas: 0, repeticiones: 0, aclaraciones: 0 })
    setSesion((n) => n + 1)
    setFase('simular')
  }

  const cambiar = () => {
    setPuntoVista(null)
    setRegistro([])
    setAyudas({ pausas: 0, repeticiones: 0, aclaraciones: 0 })
    setFase('elegir')
  }

  return (
    <>
      <main id="contenido-principal" className="page-shell-wide pb-24">
        <nav aria-label="Volver" className="mb-6">
          <Link href="/sala-previa" className="link-atras">
            <Icono nombre="←" />
            Volver a la sala
          </Link>
        </nav>

        <header className="mb-8 max-w-3xl">
          <h1 className="titulo-pagina mb-2">Simula tu declaración</h1>
          <p className="entradilla mb-0">
            Practica las preguntas del juicio desde tres sitios de la sala. El caso es inventado.
            En un juicio real, di siempre lo que pasó de verdad.
          </p>
        </header>

        {fase === 'elegir' && (
          <ElegirPuntoVista sugerido={sugerido} onElegir={empezar} />
        )}

        {fase === 'simular' && puntoVista && (
          <SimuladorDeclaracion
            key={`${puntoVista}-${sesion}`}
            puntoVista={puntoVista}
            nombre={nombre}
            voz={voz}
            onVoz={setVoz}
            onTerminar={terminar}
          />
        )}

        {fase === 'resumen' && puntoVista && (
          <ResumenDeclaracion
            puntoVista={puntoVista}
            registro={registro}
            ayudas={ayudas}
            nombre={nombre}
            onRepetir={repetir}
            onCambiar={cambiar}
          />
        )}

        <div className="mt-12 max-w-2xl">
          <PanelInsignias conseguidas={conseguidas} apartado="sala-previa" />
        </div>
      </main>

      <AvisoInsignia insignia={aviso} onDescartar={descartarAviso} />
    </>
  )
}
