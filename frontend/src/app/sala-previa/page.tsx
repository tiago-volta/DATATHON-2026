'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Icono } from '@/components/Icono'
import { BotonCalma } from '@/components/sala-previa/BotonCalma'
import { SalaJuzgado360 } from '@/components/sala-previa/SalaJuzgado360'
import { BarraPreparacion } from '@/components/preparacion/BarraPreparacion'
import { MotorAudioSala } from '@/lib/sala-previa/audio'
import { bancoSonidos } from '@/lib/sala-previa/bancoSonidos'
import { ESCENAS_JUZGADO } from '@/lib/sala-previa/escenas'
import { VALORES_AMBIENTE_SALA } from '@/lib/sala-previa/niveles'
import { papelDesdeRol } from '@/lib/sala-previa/salaVistasConfig'
import type { ValoresEstimulo } from '@/lib/sala-previa/tipos'
import { cargarPerfil } from '@/lib/perfil/perfil'
import type { RolPerfil } from '@/lib/perfil/tipos'
import { marcarVistaSala } from '@/lib/preparacion'

const SALA = ESCENAS_JUZGADO.find((escena) => escena.id === 'sala-vistas') ?? ESCENAS_JUZGADO[0]
const SILENCIO: ValoresEstimulo = { ruido: 0, luz: 12, gente: 0 }

export default function PaginaSala() {
  const motorRef = useRef<MotorAudioSala | null>(null)
  const [rol, setRol] = useState<RolPerfil>('testigo')
  const [valores, setValores] = useState<ValoresEstimulo>(VALORES_AMBIENTE_SALA)
  const [enCalma, setEnCalma] = useState(false)
  const [sonido, setSonido] = useState(false)

  useEffect(() => {
    setRol(cargarPerfil()?.rol ?? 'testigo')
    marcarVistaSala()
    motorRef.current = new MotorAudioSala()
    return () => {
      motorRef.current?.detener(false)
    }
  }, [])

  const escuchar = async () => {
    bancoSonidos().precargar()
    await motorRef.current?.iniciar()
    setEnCalma(false)
    setValores(VALORES_AMBIENTE_SALA)
    motorRef.current?.actualizar(VALORES_AMBIENTE_SALA)
    setSonido(true)
  }

  const pausar = useCallback(() => {
    setEnCalma(true)
    motorRef.current?.volverACalma()
    bancoSonidos().cancelar()
    setValores(SILENCIO)
  }, [])

  const reanudar = useCallback(() => {
    setEnCalma(false)
    if (sonido) {
      setValores(VALORES_AMBIENTE_SALA)
      motorRef.current?.actualizar(VALORES_AMBIENTE_SALA)
    }
  }, [sonido])

  return (
    <>
      <main id="contenido-principal" className="page-shell-wide pb-28">
        <nav aria-label="Volver">
          <Link href="/" className="link-atras">
            <Icono nombre="←" />
            Volver al inicio
          </Link>
        </nav>

        <header className="mb-6 max-w-2xl">
          <h1 className="titulo-pagina mb-2">La sala</h1>
          <p className="entradilla mb-4">
            Esta es la sala del juzgado. Aquí ves quién hay y qué se oye.
            La simulación del juicio es el paso siguiente.
          </p>
          <BarraPreparacion />
          <div className="flex flex-wrap gap-3 mt-5">
            <Link href="/sala-previa/declaracion" className="btn-primary min-h-[44px]">
              Simular el juicio
            </Link>
            <button type="button" className="btn-secondary min-h-[44px]" onClick={escuchar}>
              {sonido ? 'Sonido de la sala activo' : 'Escuchar la sala'}
            </button>
          </div>
        </header>

        <SalaJuzgado360
          escenaId="sala-vistas"
          titulo="Sala del juzgado"
          valores={valores}
          enCalma={enCalma}
          papel={papelDesdeRol(rol, 'sala-vistas')}
        />

        <section className="card mt-6 max-w-2xl" aria-labelledby="titulo-quien">
          <h2 id="titulo-quien" className="text-xl font-bold text-court-900 mb-3">
            Quién hay
          </h2>
          <ul className="space-y-3">
            {SALA.roles.map((persona) => (
              <li key={persona.nombre}>
                <span className="font-bold text-court-900">{persona.nombre}.</span>{' '}
                <span className="text-court-800">{persona.explicacion}</span>
              </li>
            ))}
          </ul>
          <p className="text-court-800 mt-4">
            Puedes oír murmullos, una puerta o un móvil. Debajo de la sala eliges
            si hay pocos ruidos, muchos o ninguno.
          </p>
        </section>

        <p className="text-sm text-court-700 mt-6 max-w-2xl">
          Esto es un ensayo. No sustituye a tu citación ni a un abogado.
        </p>
      </main>
      <BotonCalma enCalma={enCalma} onPausa={pausar} onReanudar={reanudar} />
    </>
  )
}
