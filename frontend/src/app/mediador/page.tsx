'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Cabecera } from '@/components/Cabecera'

const EJEMPLOS_PREGUNTAS = [
  {
    original: '¿No es cierto que usted no vio bien lo que pasó porque estaba lejos y había poca luz?',
    problemas: ['Doble negación', 'Pregunta compuesta', 'Sugestiva'],
    reformulada: '¿Viste lo que pasó? ¿Desde dónde lo viste? ¿Cómo era la luz en ese momento?',
    semaforo: 'rojo',
  },
  {
    original: '¿Por qué deberíamos creerle a usted?',
    problemas: ['Intimidante', 'No busca información'],
    reformulada: '¿Puedes explicar cómo sabes lo que nos has contado?',
    semaforo: 'rojo',
  },
  {
    original: '¿A qué hora ocurrieron los hechos aproximadamente?',
    problemas: [],
    reformulada: null,
    semaforo: 'verde',
  },
]

export default function PaginaMediador() {
  const [pregunta, setPregunta] = useState('')
  const [resultado, setResultado] = useState<typeof EJEMPLOS_PREGUNTAS[0] | null>(null)
  const [analizado, setAnalizado] = useState(false)

  const analizarPregunta = () => {
    if (!pregunta.trim()) return
    
    const tieneDobleNegacion = pregunta.includes('no ') && (pregunta.match(/no /g) || []).length >= 2
    const esCompuesta = pregunta.includes(' y ') || pregunta.includes(' o ')
    const esSugestiva = pregunta.toLowerCase().startsWith('¿no es cierto') || 
                        pregunta.toLowerCase().includes('¿verdad?')
    
    const problemas = []
    if (tieneDobleNegacion) problemas.push('Doble negación')
    if (esCompuesta) problemas.push('Pregunta compuesta')
    if (esSugestiva) problemas.push('Sugestiva')
    
    setResultado({
      original: pregunta,
      problemas,
      reformulada: problemas.length > 0 
        ? 'Considera dividir esta pregunta en partes más simples y directas.'
        : null,
      semaforo: problemas.length === 0 ? 'verde' : problemas.length === 1 ? 'amarillo' : 'rojo',
    })
    setAnalizado(true)
  }

  return (
    <>
      <Cabecera />
      
      <main id="contenido-principal" className="max-w-3xl mx-auto px-4 py-8">
        <nav className="mb-6">
          <Link href="/" className="text-puente-600 hover:text-puente-800">
            ← Volver al inicio
          </Link>
        </nav>

        <h1 className="text-3xl font-bold text-puente-800 mb-2">
          Pregunta Clara
        </h1>
        <p className="text-lg text-puente-600 mb-8">
          Analiza si una pregunta puede confundir a una persona neurodivergente 
          y obtén sugerencias para reformularla.
        </p>

        <div className="card mb-8">
          <label htmlFor="pregunta" className="block font-bold text-puente-800 mb-3">
            Escribe o pega una pregunta
          </label>
          <textarea
            id="pregunta"
            value={pregunta}
            onChange={(e) => { setPregunta(e.target.value); setAnalizado(false); }}
            className="textarea-accesible"
            placeholder="Ej: ¿No es cierto que usted no vio bien lo que pasó?"
            rows={3}
          />
          <button onClick={analizarPregunta} className="btn-primary mt-4 w-full">
            Analizar pregunta
          </button>
        </div>

        {analizado && resultado && (
          <div className="card-destacada mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                resultado.semaforo === 'verde' ? 'bg-accent-success/20' :
                resultado.semaforo === 'amarillo' ? 'bg-accent-alert/20' :
                'bg-red-100'
              }`}>
                {resultado.semaforo === 'verde' ? '✓' : resultado.semaforo === 'amarillo' ? '⚠' : '✗'}
              </div>
              <div>
                <h2 className="font-bold text-puente-800">
                  {resultado.semaforo === 'verde' 
                    ? 'Pregunta clara' 
                    : resultado.semaforo === 'amarillo'
                      ? 'Pregunta mejorable'
                      : 'Pregunta problemática'}
                </h2>
                <p className="text-puente-600">
                  {resultado.problemas.length === 0 
                    ? 'Esta pregunta es clara y directa.'
                    : `Problemas detectados: ${resultado.problemas.join(', ')}`}
                </p>
              </div>
            </div>

            {resultado.reformulada && (
              <div className="bg-calma-sage rounded-lg p-4 mt-4">
                <p className="font-bold text-puente-800 mb-2">Sugerencia</p>
                <p className="text-puente-700">{resultado.reformulada}</p>
              </div>
            )}
          </div>
        )}

        <section>
          <h2 className="text-2xl font-bold text-puente-800 mb-4">Ejemplos</h2>
          <div className="space-y-4">
            {EJEMPLOS_PREGUNTAS.map((ej, i) => (
              <div key={i} className="card">
                <div className="flex items-start gap-3 mb-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    ej.semaforo === 'verde' ? 'bg-accent-success/20 text-green-800' :
                    ej.semaforo === 'amarillo' ? 'bg-accent-alert/20 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {ej.semaforo === 'verde' ? '✓' : '!'}
                  </span>
                  <p className="text-puente-800 font-medium flex-1">"{ej.original}"</p>
                </div>
                
                {ej.problemas.length > 0 && (
                  <>
                    <div className="flex flex-wrap gap-2 mb-3 ml-11">
                      {ej.problemas.map((p) => (
                        <span key={p} className="etiqueta-alerta text-xs">{p}</span>
                      ))}
                    </div>
                    <div className="ml-11 bg-calma-sage rounded-lg p-3">
                      <p className="text-sm text-puente-600 mb-1">Mejor así:</p>
                      <p className="text-puente-700">"{ej.reformulada}"</p>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </section>

        <div className="mt-8 p-4 bg-calma-sage rounded-lg text-sm text-puente-600">
          <strong>Nota para profesionales:</strong> Este análisis se basa en las pautas de 
          The Advocate's Gateway (Reino Unido) para interrogar a personas vulnerables. 
          Las sugerencias son orientativas y deben adaptarse a cada caso.
        </div>
      </main>
    </>
  )
}
