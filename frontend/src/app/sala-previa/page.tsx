'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Icono } from '@/components/Icono'
import {
  PasosSalaPrevia,
  type IdPasoSala,
} from '@/components/sala-previa/PasosSalaPrevia'
import { MotorAudioSala } from '@/lib/sala-previa/audio'
import { bancoSonidos } from '@/lib/sala-previa/bancoSonidos'
import { cargarAmbiente, guardarAmbiente } from '@/lib/sala-previa/ambiente'
import { VALORES_AMBIENTE_SALA } from '@/lib/sala-previa/niveles'
import { obtenerRolActivo } from '@/lib/roles'
import type { RolPerfil } from '@/lib/perfil/tipos'
import type { ValoresEstimulo } from '@/lib/sala-previa/tipos'

export default function PaginaSalaPrevia() {
  const motorRef = useRef<MotorAudioSala | null>(null)
  const [rolUsuario, setRolUsuario] = useState<RolPerfil>('testigo')
  const [valores, setValores] = useState<ValoresEstimulo>(VALORES_AMBIENTE_SALA)
  const [listo, setListo] = useState(false)
  const [pasoInicial, setPasoInicial] = useState<IdPasoSala>('intro')

  useEffect(() => {
    setRolUsuario(obtenerRolActivo())
    const ambiente = cargarAmbiente()
    setValores(ambiente)
    motorRef.current = new MotorAudioSala()
    motorRef.current.actualizar(ambiente)
    void bancoSonidos().desbloquear()
    setListo(true)

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (
        params.get('ensayo') === '1' ||
        params.get('modo') === 'ensayo' ||
        params.get('desde') === 'ensaya'
      ) {
        setPasoInicial('sala')
      }
    }

    return () => {
      motorRef.current?.detener(false)
    }
  }, [])

  const aplicarValores = useCallback((nuevos: ValoresEstimulo) => {
    setValores(nuevos)
    guardarAmbiente(nuevos)
    motorRef.current?.actualizar(nuevos)
  }, [])

  return (
    <main id="contenido-principal" className="page-shell-wide pb-32">
        <div className="mx-auto w-full max-w-6xl flex flex-col items-center text-center">
        <nav aria-label="Volver" className="w-full self-start text-left">
          <Link href="/" className="link-atras">
            <Icono nombre="←" />
            Volver al inicio
          </Link>
        </nav>

        <header className="mb-8 mt-4 w-full">
          <h1 className="titulo-pagina mb-2">Sala Previa</h1>
          <p className="entradilla mx-auto">
            Prepara el día en el juzgado paso a paso. Poca información en cada
            pantalla.
          </p>
        </header>

        {listo && (
            <PasosSalaPrevia
              key={pasoInicial}
              valores={valores}
              onValores={aplicarValores}
              rol={rolUsuario}
              enCalma={false}
              pasoInicial={pasoInicial}
            />
        )}

      </div>
    </main>
  )
}
