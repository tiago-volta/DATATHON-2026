'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Icono } from '@/components/Icono'
import { useAuth } from '@/lib/auth/AuthContext'
import { leerCitaciones } from '@/lib/citaciones/almacen'
import {
  ESTIMULOS_PERFIL,
  NIVELES_TOLERANCIA,
  cargarPerfil,
  etiquetaEstimulo,
  guardarPerfil,
  type NivelTolerancia,
} from '@/lib/perfil/perfil'
import type { RolPerfil } from '@/lib/perfil/tipos'
import { sanitizarNombre, validarNombre } from '@/lib/pasaporte'
import type { IdEstimulo } from '@/lib/sala-previa/tipos'
import { MedallasPerfil } from '@/components/perfil/MedallasPerfil'

const ROLES_OPCIONES: { valor: RolPerfil; etiqueta: string; ayuda: string }[] = [
  { valor: 'testigo', etiqueta: 'Testigo', ayuda: 'Vas a contar lo que sabes o viste. No te acusan de nada.' },
  { valor: 'investigado', etiqueta: 'Investigado o acusado', ayuda: 'Hay una denuncia contra ti. Tienes derecho a guardar silencio.' },
  { valor: 'victima', etiqueta: 'Víctima', ayuda: 'Has sufrido el delito. Tienes derecho a protección y acompañamiento.' },
  { valor: 'parte_civil', etiqueta: 'Parte civil', ayuda: 'Demanda civil o laboral entre particulares.' },
]

export default function PaginaPerfil() {
  const router = useRouter()
  const { sesion, cargando: cargandoSesion, eliminarCuenta } = useAuth()
  const [eliminando, setEliminando] = useState(false)
  const [mensajeBorrado, setMensajeBorrado] = useState('')
  const [nombre, setNombre] = useState('')
  const [rol, setRol] = useState<RolPerfil>('testigo')
  const [tolerancia, setTolerancia] = useState<NivelTolerancia>(1)
  const [estimulos, setEstimulos] = useState<IdEstimulo[]>([])
  const [errorNombre, setErrorNombre] = useState<string | undefined>()
  const [errorGuardar, setErrorGuardar] = useState<string | undefined>()
  const [yaExiste, setYaExiste] = useState(false)
  const [tieneCitacion, setTieneCitacion] = useState(false)
  const [guardado, setGuardado] = useState(false)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    if (cargandoSesion) return

    const perfilCargado = cargarPerfil()
    if (perfilCargado) {
      setNombre(perfilCargado.nombre)
      if (perfilCargado.rol && perfilCargado.rol !== 'desconocido') {
        setRol(perfilCargado.rol)
      }
      setTolerancia(perfilCargado.tolerancia ?? 1)
      setEstimulos(perfilCargado.estimulosSensibles ?? [])
      setYaExiste(true)
    } else if (sesion?.perfil?.nombre) {
      setNombre(sesion.perfil.nombre)
    }
    setTieneCitacion(leerCitaciones().length > 0)
    setListo(true)
  }, [sesion, cargandoSesion])

  const toggleEstimulo = (id: IdEstimulo) => {
    setEstimulos((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    )
  }

  const guardar = (e: FormEvent) => {
    e.preventDefault()
    const error = validarNombre(nombre)
    if (error) {
      setErrorNombre(error)
      return
    }
    setErrorNombre(undefined)
    const resultado = guardarPerfil({
      nombre,
      rol,
      tolerancia,
      estimulosSensibles: estimulos,
    })
    if (!resultado) {
      setErrorGuardar('No se ha podido guardar el perfil en este dispositivo.')
      return
    }
    setErrorGuardar(undefined)
    if (!yaExiste) {
      router.push('/sala-previa?ensayo=1')
      return
    }
    setGuardado(true)
  }

  if (cargandoSesion || !listo) {
    return (
      <main id="contenido-principal" className="page-shell">
        <p className="text-court-700" aria-live="polite">
          Cargando tu perfil…
        </p>
      </main>
    )
  }

  return (
    <main id="contenido-principal" className="page-shell">
      <nav aria-label="Volver" className="mb-6">
        <Link href="/" className="link-atras">
          <Icono nombre="←" />
          Volver al inicio
        </Link>
      </nav>

      <h1 className="titulo-pagina">
        {yaExiste ? 'Tu perfil' : 'Crea tu perfil'}
      </h1>
      <p className="entradilla max-w-[42ch]">
        Elige tu papel en el juicio y cómo quieres adaptar el entorno de la sala.
      </p>
      {sesion?.email ? (
        <p className="text-court-700 mb-6 text-sm">{sesion.email}</p>
      ) : (
        <p className="text-xs text-court-600 mb-6 bg-calma-mist p-2.5 rounded-suave border border-accent-info/20">
          Tu perfil se guarda en este dispositivo. Puedes crear una cuenta arriba si deseas sincronizarlo en otros dispositivos.
        </p>
      )}

      <form className="card" onSubmit={guardar} noValidate>
        <div className="space-y-8">
          <div>
            <label htmlFor="perfil-nombre" className="block text-lg font-medium text-court-800 mb-2">
              Tu nombre <span className="text-base font-normal text-court-700">(obligatorio)</span>
            </label>
            <input
              id="perfil-nombre"
              type="text"
              value={nombre}
              onChange={(e) => {
                const limpio = sanitizarNombre(e.target.value)
                setNombre(limpio)
                if (errorNombre) setErrorNombre(undefined)
              }}
              onBlur={() => {
                if (nombre.trim()) setErrorNombre(validarNombre(nombre) ?? undefined)
              }}
              className="input-accesible"
              placeholder="Cómo quieres que te llamen"
              autoComplete="name"
              maxLength={60}
              required
              aria-invalid={Boolean(errorNombre)}
              aria-describedby={errorNombre ? 'error-perfil-nombre' : 'ayuda-perfil-nombre'}
            />
            {errorNombre && (
              <p id="error-perfil-nombre" className="text-sm text-red-700 font-medium mt-2" role="alert">
                {errorNombre}
              </p>
            )}
          </div>

          <fieldset>
            <legend className="text-lg font-medium text-court-800 mb-2">
              ¿Para qué vas al juzgado? (Tu papel)
            </legend>
            <p id="ayuda-rol" className="text-sm text-court-700 mb-4">
              Adaptamos tus derechos y las preguntas del ensayo según tu papel.
            </p>
            <div className="space-y-2" role="radiogroup" aria-describedby="ayuda-rol">
              {ROLES_OPCIONES.map((r) => {
                const id = `rol-${r.valor}`
                const seleccionado = rol === r.valor
                return (
                  <label
                    key={r.valor}
                    htmlFor={id}
                    className={`flex items-start gap-3 min-h-[44px] p-4 rounded-suave border-2 cursor-pointer transition-[border-color,background-color] duration-200 ${
                      seleccionado
                        ? 'border-accent-info bg-calma-mist'
                        : 'border-court-200 bg-white hover:border-court-300'
                    }`}
                  >
                    <input
                      id={id}
                      type="radio"
                      name="rol"
                      value={r.valor}
                      checked={seleccionado}
                      onChange={() => setRol(r.valor)}
                      className="mt-1 h-5 w-5 accent-accent-info"
                    />
                    <span>
                      <span className="block font-bold text-court-900">{r.etiqueta}</span>
                      <span className="block text-sm text-court-700 mt-1">{r.ayuda}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-medium text-court-800 mb-2">
              Tu tolerancia en la sala
            </legend>
            <p id="ayuda-tolerancia" className="text-sm text-court-700 mb-4">
              Elige cuánta gente, ruido y luz crees que puedes aguantar ahora.
            </p>
            <div className="space-y-2" role="radiogroup" aria-describedby="ayuda-tolerancia">
              {NIVELES_TOLERANCIA.map((nivel) => {
                const id = `tolerancia-${nivel.valor}`
                const seleccionado = tolerancia === nivel.valor
                return (
                  <label
                    key={nivel.valor}
                    htmlFor={id}
                    className={`flex items-start gap-3 min-h-[44px] p-4 rounded-suave border-2 cursor-pointer transition-[border-color,background-color] duration-200 ${
                      seleccionado
                        ? 'border-accent-info bg-calma-mist'
                        : 'border-court-200 bg-white hover:border-court-300'
                    }`}
                  >
                    <input
                      id={id}
                      type="radio"
                      name="tolerancia"
                      value={nivel.valor}
                      checked={seleccionado}
                      onChange={() => setTolerancia(nivel.valor)}
                      className="mt-1 h-5 w-5 accent-accent-info"
                    />
                    <span>
                      <span className="block font-bold text-court-900">{nivel.etiqueta}</span>
                      <span className="block text-sm text-court-700 mt-1">{nivel.ayuda}</span>
                    </span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-lg font-medium text-court-800 mb-2">
              Lo que más te molesta
            </legend>
            <p id="ayuda-estimulos" className="text-sm text-court-700 mb-4">
              Puedes marcar varios. Así la sala empieza más suave en esos puntos.
            </p>
            <div className="space-y-2" role="group" aria-describedby="ayuda-estimulos">
              {ESTIMULOS_PERFIL.map((idEstimulo) => {
                const id = `estimulo-${idEstimulo}`
                const marcado = estimulos.includes(idEstimulo)
                return (
                  <label
                    key={idEstimulo}
                    htmlFor={id}
                    className={`flex items-start gap-3 min-h-[44px] p-4 rounded-suave border-2 cursor-pointer transition-[border-color,background-color] duration-200 ${
                      marcado
                        ? 'border-accent-info bg-calma-mist'
                        : 'border-court-200 bg-white hover:border-court-300'
                    }`}
                  >
                    <input
                      id={id}
                      type="checkbox"
                      checked={marcado}
                      onChange={() => toggleEstimulo(idEstimulo)}
                      className="mt-1 h-5 w-5 rounded accent-accent-info"
                    />
                    <span className="font-bold text-court-900">{etiquetaEstimulo(idEstimulo)}</span>
                  </label>
                )
              })}
            </div>
          </fieldset>

          {errorGuardar && (
            <p className="text-sm text-red-700 font-medium" role="alert">
              {errorGuardar}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-court-200">
            <button type="submit" className="btn-primary min-h-[44px]">
              {yaExiste ? 'Guardar cambios' : 'Guardar y empezar'}
            </button>
            {guardado && (
              <p className="text-sm font-medium text-court-800 self-center" role="status">
                Cambios guardados en tu perfil.
              </p>
            )}
          </div>
        </div>
      </form>

      {sesion && (
        <section
          className="card mt-8 border-red-200 bg-red-50/40 p-6"
          aria-labelledby="titulo-eliminar-cuenta"
        >
          <h2 id="titulo-eliminar-cuenta" className="text-lg font-bold text-red-900 mb-1">
            Privacidad y control de tus datos (Art. 17 RGPD)
          </h2>
          <p className="text-court-700 text-sm mb-4">
            Puedes borrar tu cuenta y todo tu historial de preparación en cualquier momento.
          </p>
          <button
            type="button"
            onClick={async () => {
              if (!window.confirm('¿Seguro que quieres borrar tu cuenta? Se eliminarán todos tus datos.')) return
              setEliminando(true)
              try {
                await eliminarCuenta()
                router.push('/')
              } catch {
                setMensajeBorrado('No se pudo borrar la cuenta. Inténtalo de nuevo.')
              } finally {
                setEliminando(false)
              }
            }}
            disabled={eliminando}
            className="btn-ghost text-red-700 hover:bg-red-100 min-h-[44px] text-sm font-bold"
          >
            {eliminando ? 'Borrando…' : 'Borrar mi cuenta'}
          </button>
          {mensajeBorrado && (
            <p className="text-sm text-red-700 font-medium mt-2" role="alert">
              {mensajeBorrado}
            </p>
          )}
        </section>
      )}

      <div className="mt-8">
        <MedallasPerfil />
      </div>
    </main>
  )
}
