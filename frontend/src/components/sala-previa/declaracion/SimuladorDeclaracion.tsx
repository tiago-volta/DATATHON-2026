'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ControlDistracciones } from '@/components/sala-previa/ControlDistracciones'
import { BotonCalma } from '@/components/sala-previa/BotonCalma'
import { useDistracciones } from '@/hooks/useDistracciones'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { MotorAudioSala } from '@/lib/sala-previa/audio'
import { bancoSonidos } from '@/lib/sala-previa/bancoSonidos'
import type { NivelDistracciones } from '@/lib/sala-previa/distracciones'
import { VALORES_AMBIENTE_SALA } from '@/lib/sala-previa/niveles'
import { numPublicoVisible } from '@/lib/sala-previa/salaVistasConfig'
import {
  HABLANTES,
  PUNTOS_VISTA,
  conNombre,
  papelDePuntoVista,
  type Hablante,
  type Interrupcion,
  type PuntoVista,
  type Respuesta,
  type Turno,
} from '@/lib/sala-previa/declaracion'
import { GUIONES } from '@/lib/sala-previa/declaracionGuiones'
import { callar, hablar, precargarVoces } from '@/lib/sala-previa/vozSala'
import { PanelTurno } from './PanelTurno'
import { Subtitulos, type LineaSubtitulo } from './Subtitulos'
import { VistaDeclaracion3D, type ObjetivoCamara } from './VistaDeclaracion3D'
import type { ContadoresAyuda, RegistroTurno } from './ResumenDeclaracion'

const CLAVE_AJUSTES = 'sala-previa-distracciones-v2'
const FRASE_PAUSA = 'De acuerdo. Hacemos una pausa de cinco minutos.'
const FRASE_SEGUIMOS = 'Continuamos. Tómese su tiempo.'

type Pausa = null | 'jueza' | 'calma'

interface LineaVoz {
  hablante: Hablante
  texto: string
}

function leerAjustes(): { nivel: NivelDistracciones; avisar: boolean } {
  try {
    const v = JSON.parse(window.localStorage.getItem(CLAVE_AJUSTES) ?? '{}')
    return {
      nivel: v.nivel === 'apagadas' || v.nivel === 'muchas' ? v.nivel : 'pocas',
      avisar: v.avisar !== false,
    }
  } catch {
    return { nivel: 'pocas', avisar: true }
  }
}

/** Tiempo de lectura cuando la voz está apagada: el texto aparece a ritmo de habla. */
function msLectura(texto: string): number {
  return Math.max(1800, texto.length * 55)
}

interface Props {
  puntoVista: PuntoVista
  nombre: string
  voz: boolean
  onVoz: (v: boolean) => void
  onTerminar: (registro: RegistroTurno[], ayudas: ContadoresAyuda) => void
}

export function SimuladorDeclaracion({ puntoVista, nombre, voz, onVoz, onTerminar }: Props) {
  const guion = GUIONES[puntoVista]
  const papel = papelDePuntoVista(puntoVista)
  const reduced = useReducedMotion()

  const [indice, setIndice] = useState(0)
  const [registro, setRegistro] = useState<RegistroTurno[]>([])
  const [ayudas, setAyudas] = useState<ContadoresAyuda>({ pausas: 0, repeticiones: 0, aclaraciones: 0 })
  const [pausa, setPausa] = useState<Pausa>(null)
  const [lineas, setLineas] = useState<LineaSubtitulo[]>([])
  const [anuncio, setAnuncio] = useState('')
  const [objetivo, setObjetivo] = useState<ObjetivoCamara>({ id: 0, destino: 'jueza' })
  const [ajustes, setAjustes] = useState({ nivel: 'pocas' as NivelDistracciones, avisar: true })

  const gen = useRef(0)
  const timers = useRef<number[]>([])
  const motor = useRef<MotorAudioSala | null>(null)
  const vozRef = useRef(voz)
  vozRef.current = voz
  const turno = guion.turnos[indice]

  const { activa, aviso, explicacion, historial, disparar } = useDistracciones({
    nivel: ajustes.nivel,
    avisar: ajustes.avisar,
    enCalma: pausa !== null,
    papel,
    numPublico: numPublicoVisible(VALORES_AMBIENTE_SALA.gente, papel),
  })
  const activaRef = useRef(activa)
  activaRef.current = activa
  const nivelRef = useRef(ajustes.nivel)
  nivelRef.current = ajustes.nivel

  const limpiarTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t))
    timers.current = []
  }

  const cortarTodo = useCallback(() => {
    gen.current += 1
    limpiarTimers()
    callar()
    motor.current?.atenuarParaVoz(false)
  }, [])

  const mirarA = (destino: Hablante | 'entrada') =>
    setObjetivo((o) => ({ id: o.id + 1, destino }))

  const decir = (linea: LineaVoz, g: number, onFin: () => void) => {
    let hecho = false
    const fin = () => {
      if (hecho || g !== gen.current) return
      hecho = true
      motor.current?.atenuarParaVoz(false)
      onFin()
    }
    if (!vozRef.current) {
      timers.current.push(window.setTimeout(fin, msLectura(linea.texto)))
      return
    }
    const h = HABLANTES[linea.hablante]
    motor.current?.atenuarParaVoz(true)
    // Algunos navegadores no avisan del final de frases largas.
    timers.current.push(window.setTimeout(fin, msLectura(linea.texto) * 2 + 4000))
    hablar(linea.texto, { genero: h.voz, tono: h.tono, onFin: fin })
  }

  const reproducirLineas = (secuencia: LineaVoz[], g: number) => {
    const paso = (i: number) => {
      if (g !== gen.current || i >= secuencia.length) return
      const l = secuencia[i]
      const nombreH = HABLANTES[l.hablante].nombre
      setLineas((prev) => [...prev, { id: `${g}-${i}`, tipo: 'voz', quien: nombreH, texto: l.texto }])
      setAnuncio(`${nombreH}: ${l.texto}`)
      mirarA(l.hablante)
      decir(l, g, () => paso(i + 1))
    }
    paso(0)
  }

  const lanzarInterrupcion = (intr: Interrupcion, g: number, intento = 0) => {
    if (g !== gen.current || nivelRef.current === 'apagadas') return
    if (activaRef.current && intento < 4) {
      timers.current.push(window.setTimeout(() => lanzarInterrupcion(intr, g, intento + 1), 1200))
      return
    }
    disparar(intr.tipo)
    setLineas((prev) => [...prev, { id: `${g}-ruido`, tipo: 'ruido', texto: intr.descripcion }])
  }

  const reproducirTurno = (
    t: Turno,
    opciones: { prefacio?: LineaVoz; conInterrupcion?: boolean; texto?: string } = {}
  ) => {
    cortarTodo()
    const g = gen.current
    setLineas([])
    const secuencia: LineaVoz[] = []
    if (opciones.prefacio) secuencia.push(opciones.prefacio)
    secuencia.push({ hablante: t.hablante, texto: conNombre(opciones.texto ?? t.texto, nombre) })
    if (t.intervencion && !opciones.texto) secuencia.push(t.intervencion)
    if (t.interrupcion && opciones.conInterrupcion) {
      const intr = t.interrupcion
      timers.current.push(window.setTimeout(() => lanzarInterrupcion(intr, g), intr.en * 1000))
    }
    reproducirLineas(secuencia, g)
  }

  useEffect(() => {
    setAjustes(leerAjustes())
    precargarVoces()
    const m = new MotorAudioSala()
    motor.current = m
    bancoSonidos().desbloquear()
    void m.iniciar().then(() => m.actualizar(VALORES_AMBIENTE_SALA))
    return () => {
      cortarTodo()
      m.detener(false)
    }
  }, [cortarTodo])

  useEffect(() => {
    if (pausa) return
    reproducirTurno(turno, { conInterrupcion: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- un arranque por turno nuevo
  }, [indice])

  const cambiarAjustes = (cambio: Partial<typeof ajustes>) => {
    bancoSonidos().desbloquear()
    const siguiente = { ...ajustes, ...cambio }
    setAjustes(siguiente)
    try {
      window.localStorage.setItem(CLAVE_AJUSTES, JSON.stringify(siguiente))
    } catch {
      // Sin almacenamiento: los ajustes duran solo esta visita.
    }
  }

  const responder = (r: Respuesta) => {
    cortarTodo()
    const nuevoRegistro = [...registro, { turno, respuesta: r }]
    setRegistro(nuevoRegistro)
    const salto = r.saltaA ? guion.turnos.findIndex((t) => t.id === r.saltaA) : -1
    const siguiente = salto >= 0 ? salto : indice + 1
    if (siguiente >= guion.turnos.length) {
      onTerminar(nuevoRegistro, ayudas)
      return
    }
    setIndice(siguiente)
  }

  const entrarEnPausa = (origen: Exclude<Pausa, null>) => {
    cortarTodo()
    motor.current?.detener(true)
    bancoSonidos().cancelar()
    setPausa(origen)
    if (origen === 'jueza') {
      setAyudas((a) => ({ ...a, pausas: a.pausas + 1 }))
      setLineas([{ id: 'pausa', tipo: 'voz', quien: HABLANTES.jueza.nombre, texto: FRASE_PAUSA }])
      setAnuncio(`${HABLANTES.jueza.nombre}: ${FRASE_PAUSA}`)
      mirarA('jueza')
      if (vozRef.current) hablar(FRASE_PAUSA, { genero: 'mujer' })
    } else {
      setLineas([])
      setAnuncio('Modo calma. Todo está en silencio.')
    }
  }

  const salirDePausa = () => {
    setPausa(null)
    void motor.current?.iniciar()
    reproducirTurno(turno, { prefacio: { hablante: 'jueza', texto: FRASE_SEGUIMOS } })
  }

  const pedirRepetir = () => {
    setAyudas((a) => ({ ...a, repeticiones: a.repeticiones + 1 }))
    reproducirTurno(turno)
  }

  const pedirClaro = () => {
    if (!turno.claro) return
    setAyudas((a) => ({ ...a, aclaraciones: a.aclaraciones + 1 }))
    reproducirTurno(turno, { texto: turno.claro })
  }

  const alternarVoz = () => {
    if (voz) callar()
    onVoz(!voz)
  }

  return (
    <div className="space-y-4">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {anuncio}
      </p>

      <VistaDeclaracion3D
        key={puntoVista}
        puntoVista={puntoVista}
        objetivo={objetivo}
        reduced={reduced}
        pausa={pausa !== null}
        distraccion={activa}
        aviso={aviso}
      />

      <Subtitulos lineas={lineas} />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {pausa ? (
            <PanelPausa origen={pausa} onSeguir={salirDePausa} />
          ) : (
            <PanelTurno
              turno={turno}
              numero={indice + 1}
              total={guion.turnos.length}
              nombre={nombre}
              onResponder={responder}
              onCallar={cortarTodo}
            />
          )}
        </div>

        <aside className="space-y-3" aria-label="Ayudas durante la declaración">
          <p className="text-sm text-court-700">{PUNTOS_VISTA[puntoVista].dondeEstas}</p>
          <div className="grid gap-2">
            <button
              type="button"
              className="btn-secondary min-h-[44px] py-3"
              onClick={() => entrarEnPausa('jueza')}
              disabled={pausa !== null}
            >
              Pedir una pausa
            </button>
            <button
              type="button"
              className="btn-ghost min-h-[44px] py-3 border border-court-200"
              onClick={pedirRepetir}
              disabled={pausa !== null}
            >
              Que lo repita
            </button>
            {turno.claro && (
              <button
                type="button"
                className="btn-ghost min-h-[44px] py-3 border border-court-200"
                onClick={pedirClaro}
                disabled={pausa !== null}
              >
                Que lo diga más claro
              </button>
            )}
            <button
              type="button"
              className="btn-ghost min-h-[44px] py-3 border border-court-200"
              onClick={alternarVoz}
              aria-pressed={voz}
            >
              {voz ? 'Voz activada' : 'Voz apagada (solo texto)'}
            </button>
          </div>
          <ControlDistracciones
            nivel={ajustes.nivel}
            avisar={ajustes.avisar}
            enCalma={pausa !== null}
            aviso={aviso}
            explicacion={explicacion}
            historial={historial}
            onNivel={(nivel) => cambiarAjustes({ nivel })}
            onAvisar={(avisar) => cambiarAjustes({ avisar })}
          />
        </aside>
      </div>

      <BotonCalma
        enCalma={pausa === 'calma'}
        onPausa={() => entrarEnPausa('calma')}
        onReanudar={salirDePausa}
      />
    </div>
  )
}

function PanelPausa({ origen, onSeguir }: { origen: Exclude<Pausa, null>; onSeguir: () => void }) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    ref.current?.focus()
  }, [])
  return (
    <section className="card bg-calma-sage border-2 border-accent-success space-y-3" aria-labelledby="titulo-pausa">
      <h2
        id="titulo-pausa"
        ref={ref}
        tabIndex={-1}
        className="text-xl font-bold text-court-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-court-400 rounded-suave"
      >
        {origen === 'jueza' ? 'Pausa de cinco minutos' : 'Modo calma'}
      </h2>
      {origen === 'jueza' && (
        <p className="text-court-800">
          La jueza ha dicho: «{FRASE_PAUSA}» En un juicio puedes pedir una pausa. La jueza decide cuándo.
        </p>
      )}
      <ul className="list-disc pl-5 space-y-1 text-court-800">
        <li>Todo está en silencio. No hay ruidos ni preguntas.</li>
        <li>Respira despacio. Puedes beber agua.</li>
        <li>Cuando quieras, vuelve a la sala. No hay prisa.</li>
      </ul>
      <button type="button" className="btn-primary min-h-[44px]" onClick={onSeguir}>
        Volver a la sala
      </button>
    </section>
  )
}
