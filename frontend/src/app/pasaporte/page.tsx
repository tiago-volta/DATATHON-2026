'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { QRCodeSVG } from 'qrcode.react'
import { Cabecera } from '@/components/Cabecera'
import { AJUSTES_DISPONIBLES } from '@/lib/contenido'
import { buildPasaporteUrl } from '@/lib/pasaporte'

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
  const [pasaporteId, setPasaporteId] = useState('')
  const [qrUrl, setQrUrl] = useState('')
  const [copiado, setCopiado] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const raw = params.get('ajustes')
    if (!raw) return
    const ids = raw
      .split(',')
      .map((id) => id.trim())
      .filter((id) => AJUSTES_DISPONIBLES.some((a) => a.id === id))
    if (ids.length === 0) return
    setDatos((prev) => ({
      ...prev,
      ajustes: Array.from(new Set([...prev.ajustes, ...ids])),
    }))
    setPaso('ajustes')
  }, [])

  const toggleAjuste = (id: string) => {
    setDatos((prev) => ({
      ...prev,
      ajustes: prev.ajustes.includes(id)
        ? prev.ajustes.filter((a) => a !== id)
        : [...prev.ajustes, id],
    }))
  }

  const generarPasaporte = () => {
    const id = Math.random().toString(36).substring(2, 10).toUpperCase()
    const url = buildPasaporteUrl({
      id,
      nombre: datos.nombre,
      ajustes: datos.ajustes,
      contacto: datos.contacto,
    })
    setPasaporteId(id)
    setQrUrl(url)
    setPaso('resultado')
    try {
      localStorage.setItem(
        'puente-pasaporte',
        JSON.stringify({ id, ...datos, url, creado: Date.now() })
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
      <Cabecera />

      <main id="contenido-principal" className="max-w-3xl mx-auto px-4 py-8">
        <nav className="mb-8" aria-label="Pasos del proceso">
          <ol className="flex items-center gap-2 text-sm flex-wrap">
            {[
              { key: 'datos', label: '1. Tus datos' },
              { key: 'ajustes', label: '2. Qué necesitas' },
              { key: 'resultado', label: '3. Tu Pasaporte' },
            ].map((item, i) => (
              <li key={item.key} className="flex items-center gap-2">
                {i > 0 && (
                  <span aria-hidden="true" className="text-puente-300">
                    →
                  </span>
                )}
                <span
                  className={
                    paso === item.key
                      ? 'font-bold text-puente-700'
                      : 'text-puente-500'
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
            <p className="text-sm font-medium text-puente-500 mb-2 uppercase tracking-wide">
              PUENTE
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-puente-800 mb-4">
              Pasaporte de Ajustes
            </h1>
            <p className="text-lg text-puente-600 mb-8">
              Indica qué adaptaciones necesitas, sin mostrar ningún diagnóstico.
              Tú decides qué compartir. El QR abre tu Pasaporte al escanearlo.
            </p>

            <div className="card">
              <h2 className="text-xl font-bold text-puente-800 mb-6">
                Tus datos básicos
              </h2>

              <div className="space-y-6">
                <div>
                  <label
                    htmlFor="nombre"
                    className="block text-lg font-medium text-puente-700 mb-2"
                  >
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    value={datos.nombre}
                    onChange={(e) =>
                      setDatos((prev) => ({ ...prev, nombre: e.target.value }))
                    }
                    className="input-accesible"
                    placeholder="Cómo quieres que te llamen"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="contacto"
                    className="block text-lg font-medium text-puente-700 mb-2"
                  >
                    Contacto de emergencia (opcional)
                  </label>
                  <input
                    type="text"
                    id="contacto"
                    value={datos.contacto}
                    onChange={(e) =>
                      setDatos((prev) => ({
                        ...prev,
                        contacto: e.target.value,
                      }))
                    }
                    className="input-accesible"
                    placeholder="Teléfono de alguien de confianza"
                    autoComplete="tel"
                  />
                  <p className="text-sm text-puente-500 mt-2" id="ayuda-contacto">
                    Una persona a la que puedan llamar si necesitas ayuda.
                  </p>
                </div>

                <button
                  onClick={() => setPaso('ajustes')}
                  disabled={!datos.nombre.trim()}
                  className="btn-primary w-full"
                >
                  Continuar
                </button>
              </div>
            </div>
          </section>
        )}

        {paso === 'ajustes' && (
          <section>
            <h1 className="text-3xl font-bold text-puente-800 mb-4">
              ¿Qué te ayudaría?
            </h1>
            <p className="text-lg text-puente-600 mb-8">
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

            <p className="text-puente-500 mb-4" aria-live="polite">
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
                ← Atrás
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
            <h1 className="text-3xl font-bold text-puente-800 mb-3 text-center">
              Tu Pasaporte de Ajustes
            </h1>
            <p className="text-lg text-puente-600 mb-8 text-center max-w-md mx-auto">
              Enseña este QR en el juzgado. Al escanearlo se abre tu Pasaporte
              con los ajustes que pediste.
            </p>

            <div className="card-destacada max-w-md mx-auto">
              <div className="bg-gradient-to-br from-puente-600 to-puente-800 text-white rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <svg
                    className="w-8 h-8"
                    viewBox="0 0 40 40"
                    fill="none"
                    aria-hidden="true"
                  >
                    <circle
                      cx="20"
                      cy="20"
                      r="18"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <path
                      d="M12 24 L20 16 L28 24"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                    <path
                      d="M20 16 L20 28"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-xl font-bold">PUENTE</span>
                </div>
                <p className="text-2xl font-bold mb-1">{datos.nombre}</p>
                <p className="text-puente-200 text-sm">Pasaporte de Ajustes</p>
              </div>

              <div className="flex justify-center mb-4">
                <div className="bg-white p-4 rounded-xl border border-puente-100">
                  {qrUrl && (
                    <QRCodeSVG
                      value={qrUrl}
                      size={200}
                      level="M"
                      fgColor="#1a4652"
                      bgColor="#ffffff"
                      aria-label={`Código QR del Pasaporte de ${datos.nombre}`}
                    />
                  )}
                </div>
              </div>

              <p className="text-center text-sm text-puente-500 mb-2">
                Código: {pasaporteId}
              </p>
              <p className="text-center text-xs text-puente-400 mb-6 break-all px-2">
                {qrUrl}
              </p>

              <div className="border-t border-puente-200 pt-6">
                <h2 className="font-bold text-puente-800 mb-3">
                  Esta persona necesita:
                </h2>
                <ul className="space-y-2">
                  {ajustesSeleccionados.map((ajuste) => (
                    <li key={ajuste.id} className="flex items-start gap-2">
                      <span
                        className="text-accent-success mt-1"
                        aria-hidden="true"
                      >
                        ✓
                      </span>
                      <span className="text-puente-700">{ajuste.nombre}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {datos.contacto && (
                <div className="border-t border-puente-200 pt-4 mt-4">
                  <p className="text-sm text-puente-600">
                    <strong>Contacto de emergencia:</strong> {datos.contacto}
                  </p>
                </div>
              )}
            </div>

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
                  setPasaporteId('')
                  setQrUrl('')
                  setCopiado(false)
                }}
                className="btn-ghost"
              >
                Crear otro Pasaporte
              </button>
            </div>

            <div className="mt-8 p-4 bg-calma-sage rounded-lg text-center text-sm text-puente-600">
              Este Pasaporte no muestra ningún diagnóstico. Solo indica qué
              adaptaciones necesitas.
              <br />
              Base legal: Art. 7 bis LEC, Art. 109 LECrim, Ley 15/2022.
            </div>
          </section>
        )}
      </main>
    </>
  )
}
