'use client'

import { FormEvent, useEffect, useState } from 'react'
import { Icono } from '@/components/Icono'
import { AvisoInsignia } from '@/components/insignias/AvisoInsignia'
import { PanelInsignias } from '@/components/insignias/PanelInsignias'
import { FichaAjustes } from '@/components/pasaporte/FichaAjustes'
import { useConfianza } from '@/hooks/useConfianza'
import { useInsigniasUtiles } from '@/hooks/useInsigniasUtiles'
import { AJUSTES_DISPONIBLES } from '@/lib/contenido'
import {
  buildPasaporteUrl,
  normalizarAjustes,
  sanitizarNombre,
  sanitizarTelefono,
  validarNombre,
  validarTelefono,
} from '@/lib/pasaporte'
import { leerAjustesDesdePerfilYSala, leerNombrePerfil } from '@/lib/perfil/perfil'
import {
  guardarPreferencias,
  leerPreferencias,
} from '@/lib/preferencias'

interface PasaporteData {
  nombre: string
  ajustes: string[]
  contacto: string
}

export default function PaginaPasaporte() {
  const [paso, setPaso] = useState<'datos' | 'ajustes' | 'resultado'>('datos')
  const [datos, setDatos] = useState<PasaporteData>({
    nombre: '',
    ajustes: [],
    contacto: '',
  })
  const [consentimientoSalud, setConsentimientoSalud] = useState(false)
  const [errores, setErrores] = useState<{
    nombre?: string
    contacto?: string
  }>({})
  const [pasaporteId, setPasaporteId] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [avisoCopia, setAvisoCopia] = useState('')
  /** Apoyo local opcional (no va al QR). Ver preferencias.ts — integración organismos [PENDIENTE]. */
  const [necesitoApoyos, setNecesitoApoyos] = useState(false)
  const {
    conseguidas: insigniasUtiles,
    aviso: avisoInsignia,
    desbloquear,
    descartarAviso,
  } = useInsigniasUtiles()
  const { registrar: registrarConfianza } = useConfianza()

  useEffect(() => {
    let nombreGuardado = ''
    let contactoGuardado = ''
    let ajustesGuardados: string[] = []

    try {
      const prefs = leerPreferencias()
      setNecesitoApoyos(prefs.necesitoApoyos)
    } catch {
      /* ignore */
    }

    try {
      const rawLocal = localStorage.getItem('court-pasaporte')
      if (rawLocal) {
        const parsed = JSON.parse(rawLocal)
        if (typeof parsed?.nombre === 'string') {
          const n = sanitizarNombre(parsed.nombre).trim()
          if (validarNombre(n) === null) nombreGuardado = n
        }
        if (typeof parsed?.contacto === 'string') {
          const c = sanitizarTelefono(parsed.contacto).trim()
          if (validarTelefono(c) === null) contactoGuardado = c
        }
        if (Array.isArray(parsed?.ajustes)) {
          ajustesGuardados = normalizarAjustes(parsed.ajustes)
        }
      }
    } catch {
      /* ignore */
    }

    const params = new URLSearchParams(window.location.search)
    const raw = params.get('ajustes')
    const idsUrl = raw
      ? normalizarAjustes(raw.split(',').map((id) => id.trim()))
      : []
    const ayudasPerfilSala = idsUrl.length === 0 ? leerAjustesDesdePerfilYSala() : []
    if (!nombreGuardado) {
      const nombrePerfil = leerNombrePerfil()
      if (nombrePerfil) nombreGuardado = nombrePerfil
    }

    const ajustesCombinados = Array.from(
      new Set([...ajustesGuardados, ...idsUrl, ...ayudasPerfilSala])
    )

    if (nombreGuardado || contactoGuardado || ajustesCombinados.length > 0) {
      setDatos({
        nombre: nombreGuardado,
        contacto: contactoGuardado,
        ajustes: ajustesCombinados,
      })
    }

    // Deep-link ?ajustes=: si ya hay nombre válido, ir directo a marcar/revisar ajustes.
    if (idsUrl.length > 0 && nombreGuardado && validarNombre(nombreGuardado) === null) {
      setPaso('ajustes')
    }

    // Abrir Pasaporte con ajustes (query o ya guardados) → insignia útil.
    if (idsUrl.length > 0 || ajustesGuardados.length > 0) {
      desbloquear('pedi-ajustes')
    }
  }, [desbloquear])

  const handleNombreChange = (raw: string) => {
    const limpio = sanitizarNombre(raw)
    const intentoInvalido = raw !== limpio && /[^\s]/.test(raw)
    setDatos((prev) => ({ ...prev, nombre: limpio }))
    setErrores((prev) => ({
      ...prev,
      nombre: intentoInvalido
        ? 'El nombre solo puede contener letras y espacios.'
        : undefined,
    }))
  }

  const handleContactoChange = (raw: string) => {
    const limpio = sanitizarTelefono(raw)
    const intentoLetras = /[^\d+\s]/.test(raw) || raw.trimStart().slice(1).includes('+')
    setDatos((prev) => ({ ...prev, contacto: limpio }))
    setErrores((prev) => ({
      ...prev,
      contacto: intentoLetras
        ? 'Solo puedes escribir números en el teléfono de contacto.'
        : undefined,
    }))
  }

  const avanzarAAjustes = (e: FormEvent) => {
    e.preventDefault()
    const errorNombre = validarNombre(datos.nombre)
    const errorContacto = validarTelefono(datos.contacto)

    if (errorNombre || errorContacto || !consentimientoSalud) {
      setErrores({
        nombre: errorNombre ?? undefined,
        contacto: errorContacto ?? undefined,
      })
      return
    }

    setErrores({})
    setPaso('ajustes')
  }

  const toggleAjuste = (id: string) => {
    setDatos((prev) => ({
      ...prev,
      ajustes: prev.ajustes.includes(id)
        ? prev.ajustes.filter((a) => a !== id)
        : [...prev.ajustes, id],
    }))
  }

  const generarPasaporte = () => {
    const errorNombre = validarNombre(datos.nombre)
    const errorContacto = validarTelefono(datos.contacto)
    if (errorNombre || errorContacto) {
      setErrores({
        nombre: errorNombre ?? undefined,
        contacto: errorContacto ?? undefined,
      })
      setPaso('datos')
      return
    }
    const ajustesValidos = normalizarAjustes(datos.ajustes)
    if (ajustesValidos.length === 0) return

    const id = Math.random().toString(36).substring(2, 10).toUpperCase()
    const datosLimpios: PasaporteData = {
      nombre: sanitizarNombre(datos.nombre).trim(),
      ajustes: ajustesValidos,
      contacto: sanitizarTelefono(datos.contacto).trim(),
    }
    const url = buildPasaporteUrl({
      id,
      ...datosLimpios,
    })
    setDatos(datosLimpios)
    setPasaporteId(id)
    setQrUrl(url)
    setPaso('resultado')
    desbloquear('pedi-ajustes')
    // Confianza en paralelo: generar Pasaporte (con ajustes) suma una vez.
    registrarConfianza('pasaporte')
    try {
      localStorage.setItem(
        'court-pasaporte',
        JSON.stringify({ id, ...datosLimpios, url, creado: Date.now() })
      )
      void import('@/lib/sync/estadoUsuario').then((m) => m.programarSyncEstado())
    } catch {
      /* ignore quota / private mode */
    }
  }

  const copiarEnlace = async () => {
    if (!qrUrl) return
    try {
      await navigator.clipboard.writeText(qrUrl)
      setAvisoCopia('Enlace copiado.')
      window.setTimeout(() => setAvisoCopia(''), 2000)
    } catch {
      setAvisoCopia('No se ha podido copiar el enlace.')
    }
  }

  const ajustesSeleccionados = AJUSTES_DISPONIBLES.filter((a) =>
    datos.ajustes.includes(a.id)
  )

  return (
    <>
      <main id="contenido-principal" className="page-shell">
        <nav className="no-imprimir mb-8" aria-label="Pasos del proceso">
          <ol className="flex items-center gap-2 text-sm flex-wrap">
            {[
              { key: 'datos', label: '1. Tus datos' },
              { key: 'ajustes', label: '2. Qué necesitas' },
              { key: 'resultado', label: '3. Tu ficha' },
            ].map((item, i) => (
              <li key={item.key} className="flex items-center gap-2">
                {i > 0 && (
                  <Icono nombre="→" className="h-4 w-4 text-court-300" />
                )}
                <span
                  className={
                    paso === item.key
                      ? 'font-bold text-court-900 underline underline-offset-4'
                      : 'text-court-700'
                  }
                  aria-current={paso === item.key ? 'step' : undefined}
                >
                  {item.label}
                </span>
              </li>
            ))}
          </ol>
        </nav>

        {paso === 'datos' && (
          <section>
            <h1 className="titulo-pagina">
              Pasaporte de Ajustes
            </h1>
            <p className="entradilla">
              Indica qué adaptaciones necesitas, sin mostrar ningún diagnóstico.
              Tú decides qué compartir. El QR abre tu Pasaporte al escanearlo.
            </p>

            {datos.ajustes.length > 0 && (
              <div
                className="mb-6 p-4 rounded-suave bg-calma-sage border border-court-200 text-court-700"
                role="status"
                aria-live="polite"
              >
                Tienes {datos.ajustes.length}{' '}
                {datos.ajustes.length === 1
                  ? 'ajuste preseleccionado'
                  : 'ajustes preseleccionados'}
                . Revisa tus datos para continuar.
              </div>
            )}

            <form className="card" onSubmit={avanzarAAjustes} noValidate>
              <h2 className="text-xl font-bold text-court-800 mb-6">
                Tus datos básicos
              </h2>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-lg font-medium text-court-700 mb-2"
                  >
                    Tu nombre <span className="text-court-700 text-base font-normal">(obligatorio)</span>
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    value={datos.nombre}
                    onChange={(e) => handleNombreChange(e.target.value)}
                    onBlur={() => {
                      if (datos.nombre.trim()) {
                        setErrores((prev) => ({
                          ...prev,
                          nombre: validarNombre(datos.nombre) ?? undefined,
                        }))
                      }
                    }}
                    className="input-accesible"
                    placeholder="Cómo quieres que te llamen"
                    autoComplete="name"
                    maxLength={60}
                    required
                    aria-invalid={Boolean(errores.nombre)}
                    aria-describedby={errores.nombre ? 'error-nombre' : undefined}
                  />
                  {errores.nombre && (
                    <p
                      id="error-nombre"
                      className="text-sm text-red-700 font-medium mt-2"
                      role="alert"
                    >
                      {errores.nombre}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contacto"
                    className="block text-lg font-medium text-court-700 mb-2"
                  >
                    Teléfono de contacto de emergencia (opcional)
                  </label>
                  <input
                    type="tel"
                    inputMode="tel"
                    id="contacto"
                    value={datos.contacto}
                    onChange={(e) => handleContactoChange(e.target.value)}
                    onBlur={() => {
                      if (datos.contacto.trim()) {
                        setErrores((prev) => ({
                          ...prev,
                          contacto: validarTelefono(datos.contacto) ?? undefined,
                        }))
                      }
                    }}
                    className="input-accesible"
                    placeholder="Ej: 600 123 456"
                    autoComplete="tel"
                    maxLength={18}
                    aria-invalid={Boolean(errores.contacto)}
                    aria-describedby={
                      errores.contacto
                        ? 'ayuda-contacto error-contacto'
                        : 'ayuda-contacto'
                    }
                  />
                  <p className="text-sm text-court-700 mt-2" id="ayuda-contacto">
                    Solo números (9 cifras en España, empezando por 6, 7, 8 o 9). Una persona a la que puedan llamar si necesitas ayuda.
                  </p>
                  {errores.contacto && (
                    <p
                      id="error-contacto"
                      className="text-sm text-red-700 font-medium mt-2"
                      role="alert"
                    >
                      {errores.contacto}
                    </p>
                  )}
                </div>

                <fieldset className="border border-court-200 rounded-suave p-4">
                  <legend className="px-1 text-lg font-medium text-court-800">
                    Apoyos de lectura y anticipación
                  </legend>
                  <label
                    htmlFor="necesito-apoyos"
                    className="flex items-start gap-4 min-h-[44px] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id="necesito-apoyos"
                      className="mt-1 h-5 w-5 shrink-0 accent-court-700"
                      checked={necesitoApoyos}
                      onChange={(e) => {
                        const valor = e.target.checked
                        setNecesitoApoyos(valor)
                        // Solo preferencia local; no viaja en el QR ni etiqueta discapacidad.
                        guardarPreferencias({
                          necesitoApoyos: valor,
                        })
                      }}
                      aria-describedby="ayuda-necesito-apoyos"
                    />
                    <span>
                      <span className="block font-bold text-court-900">
                        Necesito más apoyos de lectura y anticipación
                      </span>
                      <span
                        id="ayuda-necesito-apoyos"
                        className="block text-sm text-court-700 mt-1"
                      >
                        Opcional. Se guarda en este dispositivo y, si tienes cuenta, en tu cuenta. No es un diagnóstico ni una etiqueta de discapacidad.
                      </span>
                    </span>
                  </label>
                </fieldset>

                <fieldset className="border border-court-200 rounded-suave p-4 bg-amber-50/50">
                  <legend className="px-1 text-base font-semibold text-court-800">
                    Consentimiento de privacidad (Art. 9.2.a RGPD)
                  </legend>
                  <label
                    htmlFor="consentimiento-salud"
                    className="flex items-start gap-3 min-h-[44px] cursor-pointer mt-1"
                  >
                    <input
                      type="checkbox"
                      id="consentimiento-salud"
                      className="mt-1 h-5 w-5 shrink-0 accent-court-700"
                      checked={consentimientoSalud}
                      onChange={(e) => setConsentimientoSalud(e.target.checked)}
                      aria-describedby="ayuda-consentimiento"
                      required
                    />
                    <span className="text-sm text-court-800">
                      Acepto que PUENTE procese y guarde los ajustes de apoyo que seleccione.
                      Entiendo que pueden reflejar necesidades de salud o accesibilidad sensorial,
                      y que puedo modificarlos o borrarlos cuando lo desee.
                    </span>
                  </label>
                  {!consentimientoSalud && (
                    <p id="ayuda-consentimiento" className="text-xs text-red-700 font-medium mt-1">
                      Debes marcar la casilla para poder generar tu Pasaporte conforme a la normativa de protección de datos.
                    </p>
                  )}
                </fieldset>

                <button
                  type="submit"
                  disabled={!datos.nombre.trim() || !consentimientoSalud}
                  className="btn-primary w-full"
                >
                  Continuar
                </button>
              </div>
            </form>
          </section>
        )}

        {paso === 'ajustes' && (
          <section>
            <h1 className="titulo-pagina">
              ¿Qué te ayudaría?
            </h1>
            <p className="entradilla">
              Marca las adaptaciones que necesitas. Puedes elegir varias.
            </p>

            <div className="space-y-3 mb-8" role="group" aria-label="Lista de ajustes">
              {AJUSTES_DISPONIBLES.map((ajuste) => {
                const seleccionado = datos.ajustes.includes(ajuste.id)
                return (
                  <button
                    key={ajuste.id}
                    type="button"
                    onClick={() => toggleAjuste(ajuste.id)}
                    className={`w-full text-left p-5 rounded-tarjeta border-2 transition-[border-color,background-color] duration-150 ${
                      seleccionado
                        ? 'border-court-500 bg-court-50'
                        : 'border-court-200 bg-white hover:border-court-300'
                    }`}
                    aria-pressed={seleccionado}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          seleccionado
                            ? 'border-court-600 bg-court-600 text-white'
                            : 'border-court-300'
                        }`}
                        aria-hidden="true"
                      >
                        {seleccionado && (
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </span>
                      <div>
                        <p className="font-bold text-court-800 text-lg">
                          {ajuste.nombre}
                        </p>
                        <p className="text-court-600">{ajuste.descripcion}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <p className="text-court-700 mb-4" aria-live="polite">
              {datos.ajustes.length === 0
                ? 'Aún no has marcado ningún ajuste.'
                : `${datos.ajustes.length} ajuste${datos.ajustes.length === 1 ? '' : 's'} seleccionado${datos.ajustes.length === 1 ? '' : 's'}.`}
            </p>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setPaso('datos')}
                className="btn-ghost"
              >
                <Icono nombre="←" />
                Atrás
              </button>
              <button
                type="button"
                onClick={generarPasaporte}
                disabled={datos.ajustes.length === 0}
                className="btn-primary flex-1"
              >
                Generar mi Pasaporte
              </button>
            </div>
          </section>
        )}

        {paso === 'resultado' && (
          <FichaAjustes
            nombre={datos.nombre}
            ajustes={ajustesSeleccionados}
            contacto={datos.contacto}
            codigo={pasaporteId}
            url={qrUrl}
            avisoCopia={avisoCopia}
            onCopiar={() => void copiarEnlace()}
            onNueva={() => {
              setPaso('datos')
              setDatos({ nombre: '', ajustes: [], contacto: '' })
              setErrores({})
              setPasaporteId('')
              setQrUrl('')
              setAvisoCopia('')
              try {
                localStorage.removeItem('court-pasaporte')
              } catch {
                /* ignore */
              }
            }}
          />
        )}

        <div className="no-imprimir mt-12 max-w-lg mx-auto">
          <PanelInsignias conseguidas={insigniasUtiles} apartado="pasaporte" />
        </div>
      </main>

      <AvisoInsignia insignia={avisoInsignia} onDescartar={descartarAviso} />
    </>
  )
}
