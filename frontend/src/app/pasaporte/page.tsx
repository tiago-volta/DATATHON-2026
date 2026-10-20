'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Cabecera } from '@/components/Cabecera'
import { AJUSTES_DISPONIBLES } from '@/lib/contenido'

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

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('ajustes')
    if (!raw) return
    const ids = raw.split(',').filter((id) => AJUSTES_DISPONIBLES.some((a) => a.id === id))
    if (ids.length === 0) return
    setDatos((prev) => ({ ...prev, ajustes: Array.from(new Set([...prev.ajustes, ...ids])) }))
    setPaso('ajustes')
  }, [])

  const toggleAjuste = (id: string) => {
    setDatos(prev => ({
      ...prev,
      ajustes: prev.ajustes.includes(id)
        ? prev.ajustes.filter(a => a !== id)
        : [...prev.ajustes, id]
    }))
  }

  const generarPasaporte = () => {
    const id = Math.random().toString(36).substring(2, 10).toUpperCase()
    setPasaporteId(id)
    setPaso('resultado')
  }

  const ajustesSeleccionados = AJUSTES_DISPONIBLES.filter(a => datos.ajustes.includes(a.id))

  return (
    <>
      <Cabecera />
      
      <main id="contenido-principal" className="max-w-3xl mx-auto px-4 py-8">
        <nav className="mb-8" aria-label="Pasos del proceso">
          <ol className="flex items-center gap-2 text-sm flex-wrap">
            <li className={paso === 'datos' ? 'font-bold text-puente-700' : 'text-puente-500'}>
              1. Tus datos
            </li>
            <li aria-hidden="true" className="text-puente-300">→</li>
            <li className={paso === 'ajustes' ? 'font-bold text-puente-700' : 'text-puente-500'}>
              2. Qué necesitas
            </li>
            <li aria-hidden="true" className="text-puente-300">→</li>
            <li className={paso === 'resultado' ? 'font-bold text-puente-700' : 'text-puente-500'}>
              3. Tu Pasaporte
            </li>
          </ol>
        </nav>

        {paso === 'datos' && (
          <section>
            <h1 className="text-3xl font-bold text-puente-800 mb-4">
              Pasaporte de Ajustes
            </h1>
            <p className="text-lg text-puente-600 mb-8">
              Tu Pasaporte indica qué adaptaciones necesitas, sin mostrar ningún diagnóstico. 
              Lo controlas tú: decides qué compartir.
            </p>

            <div className="card">
              <h2 className="text-xl font-bold text-puente-800 mb-6">Tus datos básicos</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="nombre" className="block text-lg font-medium text-puente-700 mb-2">
                    Tu nombre
                  </label>
                  <input
                    type="text"
                    id="nombre"
                    value={datos.nombre}
                    onChange={(e) => setDatos(prev => ({ ...prev, nombre: e.target.value }))}
                    className="input-accesible"
                    placeholder="Cómo quieres que te llamen"
                  />
                </div>

                <div>
                  <label htmlFor="contacto" className="block text-lg font-medium text-puente-700 mb-2">
                    Contacto de emergencia (opcional)
                  </label>
                  <input
                    type="text"
                    id="contacto"
                    value={datos.contacto}
                    onChange={(e) => setDatos(prev => ({ ...prev, contacto: e.target.value }))}
                    className="input-accesible"
                    placeholder="Teléfono de alguien de confianza"
                  />
                  <p className="text-sm text-puente-500 mt-2">
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
              Selecciona las adaptaciones que necesitas. 
              Puedes marcar todas las que quieras.
            </p>

            <div className="space-y-4 mb-8">
              {AJUSTES_DISPONIBLES.map((ajuste) => (
                <button
                  key={ajuste.id}
                  onClick={() => toggleAjuste(ajuste.id)}
                  className={`w-full text-left p-5 rounded-tarjeta border-2 ${
                    datos.ajustes.includes(ajuste.id)
                      ? 'border-puente-500 bg-puente-50'
                      : 'border-puente-200 bg-white hover:border-puente-300'
                  }`}
                  style={{ transition: 'border-color 200ms ease-out, background-color 200ms ease-out' }}
                  aria-pressed={datos.ajustes.includes(ajuste.id)}
                >
                  <div className="flex items-start gap-4">
                    <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                      datos.ajustes.includes(ajuste.id)
                        ? 'border-puente-600 bg-puente-600 text-white'
                        : 'border-puente-300'
                    }`}>
                      {datos.ajustes.includes(ajuste.id) && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                    <div>
                      <p className="font-bold text-puente-800 text-lg">{ajuste.nombre}</p>
                      <p className="text-puente-600">{ajuste.descripcion}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-4">
              <button onClick={() => setPaso('datos')} className="btn-ghost">
                ← Atrás
              </button>
              <button
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
            <h1 className="text-3xl font-bold text-puente-800 mb-4 text-center">
              Tu Pasaporte de Ajustes
            </h1>
            <p className="text-lg text-puente-600 mb-8 text-center">
              Muestra este código QR en el juzgado para que sepan qué necesitas.
            </p>

            <div className="card-destacada max-w-md mx-auto">
              <div className="bg-gradient-to-br from-puente-600 to-puente-800 text-white rounded-xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
                    <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="2.5" fill="none" />
                    <path d="M12 24 L20 16 L28 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    <path d="M20 16 L20 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  <span className="text-xl font-bold">PUENTE</span>
                </div>
                <p className="text-2xl font-bold mb-1">{datos.nombre}</p>
                <p className="text-puente-200 text-sm">Pasaporte de Ajustes</p>
              </div>

              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-xl">
                  <QRCodeSVG
                    value={`PUENTE:${pasaporteId}:${datos.ajustes.join(',')}`}
                    size={180}
                    level="M"
                    fgColor="#1e3a5f"
                  />
                </div>
              </div>

              <p className="text-center text-sm text-puente-500 mb-6">
                Código: {pasaporteId}
              </p>

              <div className="border-t border-puente-200 pt-6">
                <h2 className="font-bold text-puente-800 mb-3">Esta persona necesita:</h2>
                <ul className="space-y-2">
                  {ajustesSeleccionados.map((ajuste) => (
                    <li key={ajuste.id} className="flex items-start gap-2">
                      <span className="text-accent-success mt-1" aria-hidden="true">✓</span>
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

            <div className="flex flex-col gap-4 mt-8 max-w-md mx-auto">
              <button
                onClick={() => window.print()}
                className="btn-primary w-full"
              >
                Imprimir o guardar
              </button>
              <button
                onClick={() => { setPaso('datos'); setDatos({ nombre: '', ajustes: [], contacto: '' }); }}
                className="btn-ghost"
              >
                Crear otro Pasaporte
              </button>
            </div>

            <div className="mt-8 p-4 bg-calma-sage rounded-lg text-center text-sm text-puente-600">
              Este Pasaporte no muestra ningún diagnóstico. Solo indica qué adaptaciones necesitas.
              <br />
              Base legal: Art. 7 bis LEC, Art. 109 LECrim, Ley 15/2022.
            </div>
          </section>
        )}
      </main>
    </>
  )
}
