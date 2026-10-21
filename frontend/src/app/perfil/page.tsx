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
import { sanitizarNombre, validarNombre } from '@/lib/pasaporte'
import type { IdEstimulo } from '@/lib/sala-previa/tipos'
import { MedallasPerfil } from '@/components/perfil/MedallasPerfil'

export default function PaginaPerfil() {
  const router = useRouter()
  const { sesion, cargando: cargandoSesion, eliminarCuenta } = useAuth()
  const [eliminando, setEliminando] = useState(false)
  const [mensajeBorrado, setMensajeBorrado] = useState('')
  const [nombre, setNombre] = useState('')
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
    if (!sesion) {
      setListo(true)
      return
    }
    const perfilCargado = cargarPerfil()
    if (perfilCargado) {
      setNombre(perfilCargado.nombre)
      setTolerancia(perfilCargado.tolerancia ?? 1)
      setEstimulos(perfilCargado.estimulosSensibles ?? [])
      setYaExiste(true)
    } else if (sesion.perfil?.nombre) {
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
      tolerancia,
      estimulosSensibles: estimulos,
    })
    if (!resultado) {
      setErrorGuardar('No se ha podido guardar el perfil en este dispositivo.')
      return
    }
    setErrorGuardar(undefined)
    if (!yaExiste && !tieneCitacion) {
      router.push('/citacion')
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

  if (!sesion) {
    return (
      <main id="contenido-principal" className="page-shell">
        <h1 className="titulo-pagina">Necesitas una cuenta</h1>
        <p className="entradilla max-w-[42ch]">
          Entra o crea una cuenta para guardar tu perfil en la base de datos.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link href="/registro" className="btn-primary">
            Crear cuenta
          </Link>
          <Link href="/login" className="btn-secondary">
            Entrar
          </Link>
        </div>
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
        Aquí guardas cómo quieres que sea la sala.
        Tu papel en el proceso sale de la citación.
      </p>
      <p className="text-court-700 mb-6 text-sm">{sesion.email}</p>

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
                        ? 'border-court-500 bg-court-50'
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
                      className="mt-1 h-5 w-5 accent-court-700"
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
              Qué te molesta más
            </legend>
            <p id="ayuda-estimulos" className="text-sm text-court-700 mb-4">
              Marca lo que te cuesta. Puedes dejarlo vacío y actualizarlo después.
            </p>
            <div className="space-y-2" role="group" aria-describedby="ayuda-estimulos">
              {ESTIMULOS_PERFIL.map((id) => {
                const seleccionado = estimulos.includes(id)
                const inputId = `estimulo-${id}`
                return (
                  <label
                    key={id}
                    htmlFor={inputId}
                    className={`flex items-start gap-3 min-h-[44px] p-4 rounded-suave border-2 cursor-pointer transition-[border-color,background-color] duration-200 ${
                      seleccionado
                        ? 'border-court-500 bg-court-50'
                        : 'border-court-200 bg-white hover:border-court-300'
                    }`}
                  >
                    <input
                      id={inputId}
                      type="checkbox"
                      checked={seleccionado}
                      onChange={() => toggleEstimulo(id)}
                      className="mt-1 h-5 w-5 accent-court-700"
                    />
                    <span className="font-bold text-court-900">{etiquetaEstimulo(id)}</span>
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

          <button type="submit" className="btn-primary w-full" disabled={!nombre.trim()}>
            {!yaExiste && !tieneCitacion ? 'Guardar y crear mi primera citación' : 'Guardar perfil'}
          </button>
          {guardado && (
            <p className="text-sm font-medium text-court-800" role="status">
              Perfil guardado.
            </p>
          )}
          {(yaExiste || guardado) && !tieneCitacion && (
            <div className="rounded-suave bg-calma-sage p-4">
              <p className="font-bold text-court-900">Crea tu primera citación</p>
              <p className="mt-1 text-court-700">
                La carta te dice la fecha, el lugar y tu papel.
              </p>
              <Link href="/citacion" className="btn-secondary mt-4">
                Crear citación
              </Link>
            </div>
          )}
        </div>
      </form>

      <MedallasPerfil />

      <section className="card max-w-lg mt-8 border-t-2 border-court-200 pt-6">
        <h2 className="text-lg font-bold text-court-800 mb-2">
          Privacidad y control de tus datos (Art. 17 RGPD)
        </h2>
        <p className="text-sm text-court-700 mb-4">
          Puedes eliminar tu cuenta y todos los datos asociados (perfil, pasaporte, ajustes y progreso) en cualquier momento. El borrado es completo e irreversible.
        </p>
        {sesion ? (
          <button
            type="button"
            disabled={eliminando}
            onClick={async () => {
              if (window.confirm('¿Seguro que quieres eliminar tu cuenta y todos tus datos definitivamente?')) {
                setEliminando(true)
                try {
                  await eliminarCuenta()
                  router.push('/')
                } catch {
                  setEliminando(false)
                  setErrorGuardar('No se ha podido eliminar la cuenta en este momento.')
                }
              }
            }}
            className="btn text-sm text-red-700 border border-red-300 hover:bg-red-50"
          >
            {eliminando ? 'Eliminando cuenta…' : 'Eliminar mi cuenta y todos mis datos'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Seguro que quieres borrar todos los datos guardados en este navegador?')) {
                try {
                  localStorage.clear()
                  setNombre('')
                  setEstimulos([])
                  setYaExiste(false)
                  setMensajeBorrado('Datos borrados de este dispositivo.')
                  window.setTimeout(() => setMensajeBorrado(''), 3000)
                } catch {}
              }
            }}
            className="btn text-sm text-court-700 border border-court-300 hover:bg-court-100"
          >
            Borrar datos de este dispositivo
          </button>
        )}
        {mensajeBorrado && (
          <p className="text-sm text-emerald-800 font-medium mt-2" role="status">
            {mensajeBorrado}
          </p>
        )}
      </section>
    </main>
  )
}
