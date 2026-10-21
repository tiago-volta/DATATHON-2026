'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { Icono } from '@/components/Icono'
import { Marca } from '@/components/Marca'
import { AvisoInsignia } from '@/components/insignias/AvisoInsignia'
import { PanelInsignias } from '@/components/insignias/PanelInsignias'
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
  const [errores, setErrores] = useState<{
    nombre?: string
    contacto?: string
  }>({})
  const [pasaporteId, setPasaporteId] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [copiado, setCopiado] = useState(false)
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
      const rawLocal = localStorage.getItem('puente-pasaporte')
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

    const ajustesCombinados = Array.from(new Set([...ajustesGuardados, ...idsUrl]))

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

    if (errorNombre || errorContacto) {
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
        'puente-pasaporte',
        JSON.stringify({ id, ...datosLimpios, url, creado: Date.now() })
      )
    } catch {
      /* ignore quota / private mode */
    }
  }

  const copiarEnlace = async () => {
    if (!qrUrl) return
    try {
      await navigator.clipboard.writeText(qrUrl)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      /* ignore */
    }
  }

  const ajustesSeleccionados = AJUSTES_DISPONIBLES.filter((a) =>
    datos.ajustes.includes(a.id)
  )

  return (
    <>
      <main id="contenido-principal" className="page-shell">
        <nav className="mb-8" aria-label="Pasos del proceso">
          <ol className="flex items-center gap-2 text-sm flex-wrap">
            {[
              { key: 'datos', label: '1. Tus datos' },
              { key: 'ajustes', label: '2. Qué necesitas' },
              { key: 'resultado', label: '3. Tu Pasaporte' },
            ].map((item, i) => (
              <li key={item.key} className="flex items-center gap-2">
                {i > 0 && (
                  <Icono nombre="→" className="h-4 w-4 text-puente-300" />
                )}
                <span
                  className={
                    paso === item.key
                      ? 'font-bold text-puente-900 underline underline-offset-4'
                      : 'text-puente-700'
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
                className="mb-6 p-4 rounded-suave bg-calma-sage border border-puente-200 text-puente-700"
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
              <h2 className="text-xl font-bold text-puente-800 mb-6">
                Tus datos básicos
              </h2>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-lg font-medium text-puente-700 mb-2"
                  >
                    Tu nombre <span className="text-puente-700 text-base font-normal">(obligatorio)</span>
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
                    className="block text-lg font-medium text-puente-700 mb-2"
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
                  <p className="text-sm text-puente-700 mt-2" id="ayuda-contacto">
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

                <fieldset className="border border-puente-200 rounded-suave p-4">
                  <legend className="px-1 text-lg font-medium text-puente-800">
                    Apoyos de voz y lectura
                  </legend>
                  <label
                    htmlFor="necesito-apoyos"
                    className="flex items-start gap-4 min-h-[44px] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      id="necesito-apoyos"
                      className="mt-1 h-5 w-5 shrink-0 accent-puente-700"
                      checked={necesitoApoyos}
                      onChange={(e) => {
                        const valor = e.target.checked
                        setNecesitoApoyos(valor)
                        // Solo preferencia local; no viaja en el QR ni etiqueta discapacidad.
                        guardarPreferencias({
                          necesitoApoyos: valor,
                          accesoPorVoz: valor,
                        })
                      }}
                      aria-describedby="ayuda-necesito-apoyos"
                    />
                    <span>
                      <span className="block font-bold text-puente-900">
                        Necesito más apoyos de voz y lectura
                      </span>
                      <span
                        id="ayuda-necesito-apoyos"
                        className="block text-sm text-puente-700 mt-1"
                      >
                        Opcional. Se guarda solo en este dispositivo. No es un
                        diagnóstico ni una etiqueta de discapacidad.
                      </span>
                    </span>
                  </label>
                </fieldset>

                <button
                  type="submit"
                  disabled={!datos.nombre.trim()}
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
                        ? 'border-puente-500 bg-puente-50'
                        : 'border-puente-200 bg-white hover:border-puente-300'
                    }`}
                    aria-pressed={seleccionado}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                          seleccionado
                            ? 'border-puente-600 bg-puente-600 text-white'
                            : 'border-puente-300'
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
                        <p className="font-bold text-puente-800 text-lg">
                          {ajuste.nombre}
                        </p>
                        <p className="text-puente-600">{ajuste.descripcion}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>

            <p className="text-puente-700 mb-4" aria-live="polite">
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
          <section>
            <h1 className="titulo-pagina text-center">
              Tu Pasaporte de Ajustes
            </h1>
            <p className="entradilla text-center max-w-md mx-auto">
              Enseña este QR en el juzgado. Al escanearlo se abre tu Pasaporte
              con los ajustes que pediste.
            </p>

            <article className="hoja max-w-md mx-auto">
              <header className="border-b-2 border-puente-800 pb-6 mb-6">
                <div className="flex items-center gap-3 mb-4 text-puente-800">
                  <Marca className="w-8 h-8" />
                  <span className="text-xl font-bold" translate="no">PUENTE</span>
                </div>
                <p className="text-3xl font-bold text-puente-900 mb-1">{datos.nombre}</p>
                <p className="text-puente-700">Pasaporte de Ajustes</p>
              </header>

              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-suave border border-puente-200">
                  {qrUrl && (
                    <QRCodeSVG
                      value={qrUrl}
                      size={200}
                      level="M"
                      fgColor="#1d1d1f"
                      bgColor="#ffffff"
                      aria-label={`Código QR del Pasaporte de ${datos.nombre}`}
                    />
                  )}
                </div>
              </div>

              <p className="text-center text-puente-800 mb-2 numeros">
                Código: {pasaporteId}
              </p>
              <p className="text-center text-sm text-puente-700 mb-6 break-all px-2">
                {qrUrl}
              </p>

              <div className="border-t border-puente-200 pt-6">
                <h2 className="font-bold text-puente-800 mb-3">
                  Esta persona necesita:
                </h2>
                <ul className="space-y-2">
                  {ajustesSeleccionados.map((ajuste) => (
                    <li key={ajuste.id} className="flex items-start gap-2">
                      <Icono nombre="✓" className="mt-1 h-5 w-5 text-accent-success" />
                      <span className="text-puente-700">{ajuste.nombre}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {datos.contacto && (
                <div className="border-t border-puente-200 pt-4 mt-4">
                  <p className="text-sm text-puente-700">
                    <strong>Contacto de emergencia:</strong> {datos.contacto}
                  </p>
                </div>
              )}
            </article>

            <div className="flex flex-col gap-3 mt-8 max-w-md mx-auto">
              <Link
                href={qrUrl || '#'}
                className="btn-primary w-full text-center"
                target="_blank"
                rel="noopener noreferrer"
              >
                Abrir vista escaneable
              </Link>
              <button
                type="button"
                onClick={copiarEnlace}
                className="btn-secondary w-full"
                aria-live="polite"
              >
                {copiado ? 'Enlace copiado' : 'Copiar enlace del Pasaporte'}
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="btn-ghost w-full"
              >
                Imprimir o guardar
              </button>
              <button
                type="button"
                onClick={() => {
                  setPaso('datos')
                  setDatos({ nombre: '', ajustes: [], contacto: '' })
                  setErrores({})
                  setPasaporteId('')
                  setQrUrl('')
                  setCopiado(false)
                  try {
                    localStorage.removeItem('puente-pasaporte')
                  } catch {
                    /* ignore */
                  }
                }}
                className="btn-ghost"
              >
                Crear otro Pasaporte
              </button>
            </div>

            <div className="mt-8 p-4 bg-calma-sage rounded-tarjeta text-center text-puente-800">
              Este Pasaporte no muestra ningún diagnóstico. Solo indica qué
              adaptaciones necesitas.
              <br />
              Base legal: Art. 7 bis LEC, Art. 109 LECrim, Ley 15/2022.
            </div>
          </section>
        )}

        <div className="mt-12 max-w-lg mx-auto">
          <PanelInsignias conseguidas={insigniasUtiles} apartado="pasaporte" />
        </div>
      </main>

      <AvisoInsignia insignia={avisoInsignia} onDescartar={descartarAviso} />
    </>
  )
}
