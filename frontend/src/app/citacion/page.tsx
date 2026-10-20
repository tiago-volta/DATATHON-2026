'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Cabecera } from '@/components/Cabecera'
import { BotonLeerEnVoz } from '@/components/BotonLeerEnVoz'
import { Pictograma } from '@/components/Pictograma'
import { LineaTiempo } from '@/components/LineaTiempo'
import { FASES_TESTIGO, FASES_INVESTIGADO } from '@/lib/contenido'
import type { CitacionProcesada } from '@/lib/api'

const EJEMPLO_LUIS = `JUZGADO DE INSTRUCCIÓN Nº 3 DE A CORUÑA
Procedimiento: Diligencias Previas 245/2026

CÉDULA DE CITACIÓN

Se cita a D. LUIS GARCÍA FERNÁNDEZ para que comparezca ante este Juzgado el día 10 de noviembre de 2026, a las 10:00 horas, en calidad de TESTIGO...`

export default function PaginaCitacion() {
  const [paso, setPaso] = useState<'entrada' | 'procesando' | 'resultado'>('entrada')
  const [texto, setTexto] = useState('')
  const [modoLectura, setModoLectura] = useState<'clara' | 'facil'>('clara')
  const [resultado, setResultado] = useState<CitacionProcesada | null>(null)
  const [error, setError] = useState('')

  const procesarCitacion = async () => {
    if (!texto.trim()) {
      setError('Pega o escribe el texto de tu citación')
      return
    }

    setPaso('procesando')
    setError('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/procesar-citacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto, perfil: null }),
      })

      if (!response.ok) throw new Error('Error al procesar')

      const data = await response.json()
      setResultado(data)
      setPaso('resultado')
    } catch {
      setError('No se pudo procesar la citación. Inténtalo de nuevo.')
      setPaso('entrada')
    }
  }

  const descargarCalendario = async () => {
    if (!resultado) return
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
    const response = await fetch(`${apiUrl}/api/generar-ics?titulo=Citación Judicial`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultado.plazos),
    })
    
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'citacion_puente.ics'
    a.click()
  }

  return (
    <>
      <Cabecera />
      
      <main id="contenido-principal" className="max-w-3xl mx-auto px-4 py-8">
        <nav className="mb-8" aria-label="Pasos del proceso">
          <ol className="flex items-center gap-2 text-sm">
            <li className={paso === 'entrada' ? 'font-bold text-puente-700' : 'text-puente-500'}>
              1. Tu citación
            </li>
            <li aria-hidden="true" className="text-puente-300">→</li>
            <li className={paso === 'resultado' ? 'font-bold text-puente-700' : 'text-puente-500'}>
              2. Información clara
            </li>
          </ol>
        </nav>

        {paso === 'entrada' && (
          <section>
            <h1 className="text-3xl font-bold text-puente-800 mb-4">
              Entender tu citación
            </h1>
            <p className="text-lg text-puente-600 mb-8">
              Pega aquí el texto de la citación que has recibido del juzgado. 
              Te la explicamos de forma clara.
            </p>

            <div className="space-y-4">
              <label htmlFor="citacion" className="block text-lg font-medium text-puente-700">
                Texto de la citación
              </label>
              <textarea
                id="citacion"
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                className="textarea-accesible"
                placeholder="Pega aquí el texto de tu citación..."
                rows={10}
              />
              
              {error && (
                <p className="text-red-600 font-medium" role="alert">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap gap-4">
                <button onClick={procesarCitacion} className="btn-primary">
                  Procesar citación
                </button>
                <button
                  onClick={() => setTexto(EJEMPLO_LUIS)}
                  className="btn-ghost"
                >
                  Usar ejemplo (Luis)
                </button>
              </div>
            </div>
          </section>
        )}

        {paso === 'procesando' && (
          <section className="text-center py-16">
            <div className="animate-pulse">
              <p className="text-xl text-puente-600">Procesando tu citación...</p>
              <p className="text-puente-500 mt-2">Esto tarda unos segundos</p>
            </div>
          </section>
        )}

        {paso === 'resultado' && resultado && (
          <section>
            <h1 className="text-3xl font-bold text-puente-800 mb-2">
              Tu citación explicada
            </h1>
            <p className="text-lg text-puente-600 mb-8">
              Esto es lo que dice tu citación, en palabras sencillas.
            </p>

            <div className="card-destacada mb-8">
              <h2 className="text-xl font-bold text-puente-800 mb-4">Lo más importante</h2>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="bg-calma-sage rounded-lg p-4">
                  <dt className="text-sm text-puente-600 mb-1">Tu rol</dt>
                  <dd className="text-xl font-bold text-puente-800 capitalize">
                    {resultado.datos_clave.rol}
                  </dd>
                </div>
                <div className="bg-calma-sage rounded-lg p-4">
                  <dt className="text-sm text-puente-600 mb-1">Fecha y hora</dt>
                  <dd className="text-xl font-bold text-puente-800">
                    {resultado.datos_clave.fecha}, {resultado.datos_clave.hora}
                  </dd>
                </div>
                <div className="bg-calma-sage rounded-lg p-4 sm:col-span-2">
                  <dt className="text-sm text-puente-600 mb-1">Lugar</dt>
                  <dd className="text-lg font-bold text-puente-800">
                    {resultado.datos_clave.lugar}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setModoLectura('clara')}
                className={`btn ${modoLectura === 'clara' ? 'btn-primary' : 'btn-secondary'}`}
                aria-pressed={modoLectura === 'clara'}
              >
                Lectura clara
              </button>
              <button
                onClick={() => setModoLectura('facil')}
                className={`btn ${modoLectura === 'facil' ? 'btn-primary' : 'btn-secondary'}`}
                aria-pressed={modoLectura === 'facil'}
              >
                Lectura fácil
              </button>
            </div>

            <div className="card mb-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-puente-800">
                  {modoLectura === 'clara' ? 'En lenguaje claro' : 'En lectura fácil'}
                </h2>
                <BotonLeerEnVoz 
                  texto={modoLectura === 'clara' ? resultado.lectura_clara : resultado.lectura_facil}
                />
              </div>
              <div className="lectura-facil whitespace-pre-line">
                {modoLectura === 'clara' ? resultado.lectura_clara : resultado.lectura_facil}
              </div>
            </div>

            {resultado.pictogramas.length > 0 && (
              <div className="card mb-6">
                <h2 className="text-xl font-bold text-puente-800 mb-4">Pictogramas</h2>
                <div className="flex flex-wrap gap-4 justify-center">
                  {resultado.pictogramas.map((p) => (
                    <Pictograma key={p.id} url={p.url} keyword={p.keyword} />
                  ))}
                </div>
                <p className="text-sm text-puente-500 mt-4 text-center">
                  Pictogramas: ARASAAC, Sergio Palao, Gobierno de Aragón. CC BY-NC-SA.
                </p>
              </div>
            )}

            {resultado.plazos.length > 0 && (
              <div className="card mb-6">
                <h2 className="text-xl font-bold text-puente-800 mb-4">Fechas importantes</h2>
                <ul className="space-y-3">
                  {resultado.plazos.map((plazo, i) => (
                    <li key={i} className="flex items-center gap-4 p-4 bg-calma-sage rounded-lg">
                      <span className="text-3xl" aria-hidden="true">📅</span>
                      <div>
                        <p className="font-bold text-puente-800">{plazo.descripcion}</p>
                        <p className="text-puente-600">
                          {new Date(plazo.fecha).toLocaleDateString('es-ES', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                          {plazo.dias_restantes > 0 && (
                            <span className="ml-2 text-puente-500">
                              (faltan {plazo.dias_restantes} días)
                            </span>
                          )}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
                <button onClick={descargarCalendario} className="btn-secondary mt-4 w-full">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Añadir a mi calendario
                </button>
              </div>
            )}

            <div className="card mb-8">
              <h2 className="text-xl font-bold text-puente-800 mb-4">
                Fases del proceso
              </h2>
              <LineaTiempo 
                fases={resultado.datos_clave.rol === 'investigado' ? FASES_INVESTIGADO : FASES_TESTIGO}
                faseActual={1}
              />
            </div>

            <div className="bg-accent-success/10 border-2 border-accent-success rounded-tarjeta p-6 mb-8">
              <h2 className="text-xl font-bold text-puente-800 mb-2">
                Puedes pedir ajustes
              </h2>
              <p className="text-puente-600 mb-4">
                Tienes derecho a pedir adaptaciones para tu comparecencia: una sala tranquila, 
                más tiempo, que te expliquen las cosas de otra forma...
              </p>
              <Link href="/pasaporte" className="btn-primary">
                Crear mi Pasaporte de Ajustes
              </Link>
            </div>

            <button
              onClick={() => { setPaso('entrada'); setResultado(null); setTexto(''); }}
              className="btn-ghost"
            >
              ← Procesar otra citación
            </button>
          </section>
        )}
      </main>
    </>
  )
}
