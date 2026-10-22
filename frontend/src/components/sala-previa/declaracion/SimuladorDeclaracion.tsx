'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { guardarUltimaTolerancia } from '@/lib/perfil/ultimaTolerancia'
import { BotonCalma } from '@/components/sala-previa/BotonCalma'
import { useDistracciones } from '@/hooks/useDistracciones'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { MotorAudioSala } from '@/lib/sala-previa/audio'
import { bancoSonidos } from '@/lib/sala-previa/bancoSonidos'
import type { NivelDistracciones } from '@/lib/sala-previa/distracciones'
import { cargarAmbiente } from '@/lib/sala-previa/ambiente'
import { VALORES_AMBIENTE_SALA } from '@/lib/sala-previa/niveles'
import type { ValoresEstimulo } from '@/lib/sala-previa/tipos'
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
import {
  clasificarRespuestaLibre,
  esPeticionPausa,
  type ResultadoRespuestaLibre,
} from '@/lib/sala-previa/respuestaDeclaracion'
import { callar, hablar, precargarVoces } from '@/lib/sala-previa/vozSala'
import { PanelTurno } from './PanelTurno'
import { VistaDeclaracion3D, type ObjetivoCamara } from './VistaDeclaracion3D'

interface LineaSubtitulo {
  id: string
  quien: string
  texto: string
}
import type { ContadoresAyuda, RegistroTurno } from './ResumenDeclaracion'

const CLAVE_AJUSTES = 'sala-previa-distracciones-v2'
const FRASE_PAUSA = 'Sí. Podemos hacer una pausa. Cuando quieras, seguimos.'
const FRASE_SEGUIMOS = 'Continuamos. Tómese su tiempo.'
/** Beat corto de calma tras conceder agua, si la persona no pulsa «listo». */
const MS_AGUA_AUTO = 4500

type Pausa = null | 'jueza' | 'calma'

interface PendienteAvance {
  registro: RegistroTurno[]
  ayudas: ContadoresAyuda
  siguiente: number
}

interface LineaVoz {
  hablante: Hablante
  texto: string
}

function leerAjustes(): { nivel: NivelDistracciones } {
  try {
    const v = JSON.parse(window.localStorage.getItem(CLAVE_AJUSTES) ?? '{}')
    return {
      nivel: v.nivel === 'apagadas' || v.nivel === 'muchas' ? v.nivel : 'pocas',
    }
  } catch {
    return { nivel: 'pocas' }
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
  const [ajustes, setAjustes] = useState<{ nivel: NivelDistracciones }>({ nivel: 'pocas' })
  const [esperandoListo, setEsperandoListo] = useState(false)
  const [iniciada, setIniciada] = useState(false)
  const [ruidoQuitado, setRuidoQuitado] = useState(false)
  const [valores, setValores] = useState<ValoresEstimulo>(VALORES_AMBIENTE_SALA)
  const nivelSonido: NivelDistracciones = iniciada && !ruidoQuitado ? ajustes.nivel : 'apagadas'

  const gen = useRef(0)
  const timers = useRef<number[]>([])
  const motor = useRef<MotorAudioSala | null>(null)
  const vozRef = useRef(voz)
  vozRef.current = voz
  const pendienteRef = useRef<PendienteAvance | null>(null)
  const turno = guion.turnos[indice]

  const { activa, disparar } = useDistracciones({
    nivel: nivelSonido,
    avisar: false,
    enCalma: pausa !== null || !iniciada,
    papel,
    numPublico: numPublicoVisible(valores.gente, papel),
  })
  const activaRef = useRef(activa)
  activaRef.current = activa
  const nivelRef = useRef(nivelSonido)
  nivelRef.current = nivelSonido
  const ruidoQuitadoRef = useRef(ruidoQuitado)
  ruidoQuitadoRef.current = ruidoQuitado
  const valoresRef = useRef(valores)
  valoresRef.current = valores
  const perfilSubido = useRef(false)

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
    motor.current?.atenuarParaVoz(true)
    // Algunos navegadores no avisan del final de frases largas.
    timers.current.push(window.setTimeout(fin, msLectura(linea.texto) * 2 + 4000))
    hablar(linea.texto, { rol: linea.hablante, onFin: fin })
  }

  const reproducirLineas = (secuencia: LineaVoz[], g: number) => {
    const paso = (i: number) => {
      if (g !== gen.current || i >= secuencia.length) return
      const l = secuencia[i]
      const nombreH = HABLANTES[l.hablante].nombre
      setLineas((prev) => [...prev, { id: `${g}-${i}`, quien: nombreH, texto: l.texto }])
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
    setValores(cargarAmbiente())
    precargarVoces()
    const m = new MotorAudioSala()
    motor.current = m
    return () => {
      cortarTodo()
      m.detener(false)
    }
  }, [cortarTodo])

  useEffect(() => {
    if (!iniciada || pausa || esperandoListo) return
    reproducirTurno(turno, { conInterrupcion: !ruidoQuitadoRef.current })
    // eslint-disable-next-line react-hooks/exhaustive-deps -- un arranque por turno nuevo
  }, [indice, iniciada])

  const resolverIndiceSiguiente = (r: Respuesta) => {
    const salto = r.saltaA ? guion.turnos.findIndex((t) => t.id === r.saltaA) : -1
    return salto >= 0 ? salto : indice + 1
  }

  const aplicarAvance = (nuevoRegistro: RegistroTurno[], ayudasActuales: ContadoresAyuda, siguiente: number) => {
    pendienteRef.current = null
    setEsperandoListo(false)
    setRegistro(nuevoRegistro)
    setAyudas(ayudasActuales)
    if (siguiente >= guion.turnos.length) {
      anotarTolerancia(!ruidoQuitadoRef.current)
      onTerminar(nuevoRegistro, ayudasActuales)
      return
    }
    setIndice(siguiente)
  }

  const decirReplicaJueza = (texto: string, g: number, onFin: () => void) => {
    setLineas([{ id: `${g}-replica`, quien: HABLANTES.jueza.nombre, texto }])
    setAnuncio(`${HABLANTES.jueza.nombre}: ${texto}`)
    mirarA('jueza')
    decir({ hablante: 'jueza', texto }, g, onFin)
  }

  const avanzarTrasRespuesta = (r: Respuesta, ayudasActuales: ContadoresAyuda = ayudas) => {
    const nuevoRegistro = [...registro, { turno, respuesta: r }]
    const siguiente = resolverIndiceSiguiente(r)
    aplicarAvance(nuevoRegistro, ayudasActuales, siguiente)
  }

  const continuarTrasEspera = () => {
    const pend = pendienteRef.current
    if (!pend) return
    cortarTodo()
    aplicarAvance(pend.registro, pend.ayudas, pend.siguiente)
  }

  const responderLibre = (textoLibre: string) => {
    cortarTodo()
    const g = gen.current
    const pregunta = conNombre(turno.claro ?? turno.texto, nombre)
    const resultado: ResultadoRespuestaLibre = clasificarRespuestaLibre(textoLibre, {
      pregunta,
      esInvestigado: puntoVista === 'acusado',
    })
    const r: Respuesta = {
      texto: textoLibre,
      porQue: resultado.porQue,
      origen: 'libre',
    }
    const nuevoRegistro = [...registro, { turno, respuesta: r }]

    if (resultado.entrarPausa) {
      setRegistro(nuevoRegistro)
      entrarEnPausa('jueza')
      return
    }

    if (resultado.esperarListo) {
      const siguiente = resolverIndiceSiguiente(r)
      pendienteRef.current = { registro: nuevoRegistro, ayudas, siguiente }
      setRegistro(nuevoRegistro)
      setEsperandoListo(true)
      decirReplicaJueza(resultado.replicaJuez, g, () => {
        if (g !== gen.current) return
        timers.current.push(window.setTimeout(() => {
          if (g !== gen.current || !pendienteRef.current) return
          continuarTrasEspera()
        }, MS_AGUA_AUTO))
      })
      return
    }

    if (!resultado.avanzar) {
      setRegistro(nuevoRegistro)
      decirReplicaJueza(resultado.replicaJuez, g, () => {
        // Se queda en el mismo turno para que pueda contestar de nuevo.
      })
      return
    }

    const siguiente = resolverIndiceSiguiente(r)
    decirReplicaJueza(resultado.replicaJuez, g, () => {
      if (g !== gen.current) return
      aplicarAvance(nuevoRegistro, ayudas, siguiente)
    })
  }

  const responder = (r: Respuesta) => {
    if (r.origen === 'libre') {
      responderLibre(r.texto)
      return
    }
    cortarTodo()
    // Botón seguro que pide pausa: misma ruta que «Pedir una pausa» / texto libre.
    if (r.pidePausa || esPeticionPausa(r.texto)) {
      setRegistro((prev) => [...prev, { turno, respuesta: r }])
      entrarEnPausa('jueza')
      return
    }
    avanzarTrasRespuesta(r)
  }

  const entrarEnPausa = (origen: Exclude<Pausa, null>) => {
    cortarTodo()
    motor.current?.detener(true)
    bancoSonidos().cancelar()
    pendienteRef.current = null
    setEsperandoListo(false)
    setPausa(origen)
    if (origen === 'jueza') {
      setAyudas((a) => ({ ...a, pausas: a.pausas + 1 }))
      setLineas([{ id: 'pausa', quien: HABLANTES.jueza.nombre, texto: FRASE_PAUSA }])
      setAnuncio(`${HABLANTES.jueza.nombre}: ${FRASE_PAUSA}`)
      mirarA('jueza')
      if (vozRef.current) hablar(FRASE_PAUSA, { rol: 'jueza' })
    } else {
      setLineas([])
      setAnuncio('Modo calma. Todo está en silencio.')
    }
  }

  const aplicarAmbiente = () => {
    const actual = valoresRef.current
    if (ruidoQuitadoRef.current) {
      motor.current?.actualizar({ ruido: 0, luz: actual.luz, gente: 0 })
      return
    }
    motor.current?.actualizar(actual)
    void motor.current?.iniciar()
  }

  const anotarTolerancia = (subirPerfil: boolean) => {
    const sube = subirPerfil && !perfilSubido.current
    if (sube) perfilSubido.current = true
    guardarUltimaTolerancia({
      gente: valoresRef.current.gente,
      ruido: valoresRef.current.ruido,
      luz: valoresRef.current.luz,
      herramientas: [],
      subirPerfil: sube,
    })
  }

  const iniciarSimulacion = () => {
    bancoSonidos().desbloquear()
    setIniciada(true)
    setAnuncio('Empieza la simulación. Suena la sala.')
    aplicarAmbiente()
    anotarTolerancia(false)
  }

  const alternarRuido = () => {
    if (ruidoQuitadoRef.current) {
      ruidoQuitadoRef.current = false
      setRuidoQuitado(false)
      setAnuncio('El ruido de la sala vuelve.')
      aplicarAmbiente()
      return
    }
    ruidoQuitadoRef.current = true
    setRuidoQuitado(true)
    bancoSonidos().cancelar()
    motor.current?.actualizar({ ruido: 0, luz: valoresRef.current.luz, gente: 0 })
    setAnuncio('El ruido está quitado. Sigues en la simulación.')
  }

  const salirDePausa = () => {
    setPausa(null)
    if (!ruidoQuitadoRef.current) aplicarAmbiente()
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

  const lineaEnFoco = lineas[lineas.length - 1]
  const rotuloVisible = lineaEnFoco?.quien
    ? { quien: lineaEnFoco.quien, texto: lineaEnFoco.texto }
    : null

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {anuncio}
      </p>

      <div className="sticky top-20 z-40 flex flex-wrap items-center gap-3 rounded-suave border border-court-200 bg-white p-3">
        {!iniciada ? (
          <button type="button" className="btn-primary min-h-[44px]" onClick={iniciarSimulacion}>
            Iniciar simulación
          </button>
        ) : (
          <button
            type="button"
            className="btn-secondary min-h-[44px]"
            onClick={alternarRuido}
            aria-pressed={ruidoQuitado}
          >
            {ruidoQuitado ? 'Poner el ruido' : 'Quitar el ruido'}
          </button>
        )}
        <p className="text-court-800">
          {iniciada
            ? ruidoQuitado
              ? 'El ruido está quitado. Sigues en la simulación.'
              : 'Suena la sala, con tus ajustes de gente y ruido.'
            : 'La sala está en silencio. El ruido empieza cuando pulses iniciar.'}
        </p>
      </div>

      <VistaDeclaracion3D
        key={puntoVista}
        puntoVista={puntoVista}
        objetivo={objetivo}
        reduced={reduced}
        pausa={pausa !== null}
        distraccion={activa}
        luz={valores.luz}
        gente={valores.gente}
        acciones={
          iniciada ? (
            <div className="space-y-1 rounded-suave border border-white/20 bg-court-900/75 px-2.5 py-1.5 text-white shadow-lg backdrop-blur-sm">
              {pausa ? (
                <PanelPausa origen={pausa} onSeguir={salirDePausa} />
              ) : (
                <PanelTurno
                  turno={turno}
                  numero={indice + 1}
                  total={guion.turnos.length}
                  nombre={nombre}
                  dialogo={rotuloVisible}
                  onResponder={responder}
                  onCallar={cortarTodo}
                  esperandoListo={esperandoListo}
                  onListo={continuarTrasEspera}
                />
              )}
              <div className="flex flex-wrap gap-1" role="group" aria-label="Ayudas durante la declaración">
                <p className="sr-only">{PUNTOS_VISTA[puntoVista].dondeEstas}</p>
                <button
                  type="button"
                  className="inline-flex items-center min-h-[36px] px-2.5 py-1 text-xs font-bold text-court-900 bg-white rounded-suave"
                  onClick={() => entrarEnPausa('jueza')}
                  disabled={pausa !== null || esperandoListo}
                >
                  Pedir una pausa
                </button>
                <button
                  type="button"
                  className="inline-flex items-center min-h-[36px] px-2.5 py-1 text-xs font-bold text-white border border-white/40 rounded-suave hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50"
                  onClick={pedirRepetir}
                  disabled={pausa !== null || esperandoListo}
                >
                  Que lo repita
                </button>
                {turno.claro && (
                  <button
                    type="button"
                    className="inline-flex items-center min-h-[36px] px-2.5 py-1 text-xs font-bold text-white border border-white/40 rounded-suave hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50"
                    onClick={pedirClaro}
                    disabled={pausa !== null || esperandoListo}
                  >
                    Que lo diga más claro
                  </button>
                )}
                <button
                  type="button"
                  className="inline-flex items-center min-h-[36px] px-2.5 py-1 text-xs font-bold text-white border border-white/40 rounded-suave hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:opacity-50"
                  onClick={alternarVoz}
                  aria-pressed={voz}
                >
                  {voz ? 'Voz activada' : 'Voz apagada (solo texto)'}
                </button>
              </div>
            </div>
          ) : undefined
        }
      />

      {iniciada && (
        <BotonCalma
          enCalma={pausa === 'calma'}
          onPausa={() => entrarEnPausa('calma')}
          onReanudar={salirDePausa}
          nota="En el juicio real, la pausa la decide el juez. Pídela con esta frase: «¿Puedo hacer una pausa, por favor?»"
        />
      )}
    </div>
  )
}

function PanelPausa({ origen, onSeguir }: { origen: Exclude<Pausa, null>; onSeguir: () => void }) {
  const ref = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])
  return (
    <section className="card bg-calma-sage border-2 border-accent-success space-y-3" aria-labelledby="titulo-pausa">
      <h2
        id="titulo-pausa"
        ref={ref}
        tabIndex={-1}
        className="text-xl font-bold text-court-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-court-400 rounded-suave"
      >
        {origen === 'jueza' ? 'Pausa concedida' : 'Modo calma'}
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
