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

Se cita a D. LUIS GARCÍA FERNÁNDEZ, con DNI 32.XXX.XXX-Y, domiciliado en C/ Ejemplo, 15, 15001 A Coruña, para que comparezca ante este Juzgado el día 10 de noviembre de 2026, a las 10:00 horas, en calidad de TESTIGO, a fin de prestar declaración en las Diligencias Previas arriba referenciadas.

Se le apercibe de que, si no comparece sin causa justificada, podrá ser sancionado con multa de 200 a 5.000 euros. Deberá acudir provisto de su documento nacional de identidad.`

const EJEMPLO_JUAN = `JUZGADO DE INSTRUCCIÓN Nº 7 DE A CORUÑA
Juicio por Delito Leve 892/2026

CÉDULA DE CITACIÓN

Se cita a D. JUAN MARTÍNEZ LÓPEZ para que comparezca ante este Juzgado el día 12 de noviembre de 2026, a las 09:30 horas, en calidad de INVESTIGADO, para la celebración del juicio por delito leve de estafa (art. 248 CP, cuantía inferior a 400 euros) por los hechos ocurridos el 3 de octubre de 2026 relativos a una compraventa en línea.

Se le informa de sus derechos conforme al artículo 118 de la Ley de Enjuiciamiento Criminal: derecho a guardar silencio, a designar abogado o solicitar uno de oficio y a presentar pruebas de descargo hasta el día del juicio.`

const TERMINOS_JUDICIALES = /\b(juzgado|citaci[oó]n|cita|comparezca|comparecer|procedimiento|diligencias|juicio|testigo|investigad[oa]|demandad[oa]|demandante|vista|declaraci[oó]n|tribunal|audiencia|letrad[oa]|fiscal|sentencia|notificaci[oó]n|c[eé]dula|autos|expediente|delito|instrucci[oó]n|penal|civil|denuncia|querella)\b/i

function validarTextoCitacion(valor: string): string | null {
  const limpio = valor.trim()
  if (!limpio) {
    return 'Pega o escribe el texto de tu citación.'
  }
  const soloLetras = limpio.replace(/[^\p{L}]/gu, '')
  const palabras = limpio.split(/\s+/).filter(Boolean)
  if (limpio.length < 30 || soloLetras.length < 20 || palabras.length < 5) {
    return 'El texto es demasiado corto. Pega al menos un párrafo de la carta que recibiste del juzgado.'
  }
  if (!TERMINOS_JUDICIALES.test(limpio)) {
    return 'El texto no parece una citación ni un documento del juzgado. Pega el texto de tu carta judicial o usa uno de los ejemplos de abajo.'
  }
  return null
}

export default function PaginaCitacion() {
  const [paso, setPaso] = useState<'entrada' | 'procesando' | 'resultado'>('entrada')
  const [texto, setTexto] = useState('')
  const [modoLectura, setModoLectura] = useState<'clara' | 'facil'>('clara')
  const [resultado, setResultado] = useState<CitacionProcesada | null>(null)
  const [error, setError] = useState('')
  const [errorCalendario, setErrorCalendario] = useState('')

  const procesarCitacion = async () => {
    const errorValidacion = validarTextoCitacion(texto)
    if (errorValidacion) {
      setError(errorValidacion)
      return
    }

    setPaso('procesando')
    setError('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/procesar-citacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: texto.trim(), perfil: null }),
      })

      if (!response.ok) throw new Error('Error al procesar')

      const data = await response.json()
      setResultado(data)
      setPaso('resultado')
    } catch {
      setError('No se pudo procesar la citación. Comprueba que el servidor esté encendido e inténtalo de nuevo.')
      setPaso('entrada')
    }
  }

  const descargarCalendario = async () => {
    if (!resultado || resultado.plazos.length === 0) return
    setErrorCalendario('')

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const params = new URLSearchParams({ titulo: 'Citación Judicial' })
      const response = await fetch(`${apiUrl}/api/generar-ics?${params.toString()}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resultado.plazos),
      })

      if (!response.ok) throw new Error('Error al generar calendario')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'citacion_puente.ics'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      setErrorCalendario('No se pudo descargar el archivo de calendario. Inténtalo de nuevo.')
    }
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
                onChange={(e) => {
                  setTexto(e.target.value)
                  if (error) setError('')
                }}
                maxLength={8000}
                className="textarea-accesible"
                placeholder="Pega aquí el texto de tu citación judicial…"
                rows={10}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? 'ayuda-citacion error-citacion' : 'ayuda-citacion'}
              />
              <p id="ayuda-citacion" className="text-sm text-puente-500">
                Incluye el texto donde aparece el juzgado, la fecha y en qué calidad te citan (testigo, investigado...).
              </p>

              {error && (
                <p id="error-citacion" className="text-red-700 font-medium" role="alert">
                  {error}
                </p>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <button type="button" onClick={procesarCitacion} className="btn-primary">
                  Procesar citación
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTexto(EJEMPLO_LUIS)
                    setError('')
                  }}
                  className="btn-ghost"
                >
                  Ejemplo Luis (testigo)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTexto(EJEMPLO_JUAN)
                    setError('')
                  }}
                  className="btn-ghost"
                >
                  Ejemplo Juan (investigado)
                </button>
              </div>
            </div>
          </section>
        )}

        {paso === 'procesando' && (
          <section className="text-center py-16" aria-live="polite">
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

              {resultado.datos_clave.que_llevar && resultado.datos_clave.que_llevar.length > 0 && (
                <div className="mt-4 pt-4 border-t border-puente-200">
                  <h3 className="font-bold text-puente-800 mb-2">Qué tienes que llevar</h3>
                  <ul className="list-disc pl-5 text-puente-700 space-y-1">
                    {resultado.datos_clave.que_llevar.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}

              {resultado.datos_clave.derechos && resultado.datos_clave.derechos.length > 0 && (
                <div className="mt-4 pt-4 border-t border-puente-200">
                  <h3 className="font-bold text-puente-800 mb-2">Tus derechos</h3>
                  <ul className="list-disc pl-5 text-puente-700 space-y-1">
                    {resultado.datos_clave.derechos.map((derecho) => (
                      <li key={derecho}>{derecho}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => setModoLectura('clara')}
                className={`btn ${modoLectura === 'clara' ? 'btn-primary' : 'btn-secondary'}`}
                aria-pressed={modoLectura === 'clara'}
              >
                Lectura clara
              </button>
              <button
                type="button"
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
                <button type="button" onClick={descargarCalendario} className="btn-secondary mt-4 w-full">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Añadir a mi calendario
                </button>
                {errorCalendario && (
                  <p className="text-sm text-red-700 font-medium mt-2" role="alert">
                    {errorCalendario}
                  </p>
                )}
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
              type="button"
              onClick={() => {
                setPaso('entrada')
                setResultado(null)
                setTexto('')
                setError('')
                setErrorCalendario('')
              }}
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
