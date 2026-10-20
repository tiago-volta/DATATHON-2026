'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Cabecera } from '@/components/Cabecera'
import { BotonLeerEnVoz } from '@/components/BotonLeerEnVoz'

const NIVELES = [
  {
    id: 1,
    nombre: 'Preguntas claras',
    descripcion: 'Preguntas sencillas como las que te hará el juez al principio.',
    preguntas: [
      '¿Cómo te llamas?',
      '¿Dónde vives?',
      '¿A qué te dedicas?',
      '¿Conoces a la persona de la que hablamos?',
    ],
  },
  {
    id: 2,
    nombre: 'Preguntas de los abogados',
    descripcion: 'Preguntas más concretas sobre lo que pasó.',
    preguntas: [
      '¿Qué día ocurrieron los hechos?',
      '¿Dónde estabas tú en ese momento?',
      '¿Qué viste exactamente?',
      '¿Había alguien más contigo?',
    ],
  },
  {
    id: 3,
    nombre: 'Preguntas difíciles',
    descripcion: 'Preguntas que pueden confundir. Aprende a pedir que te las repitan.',
    preguntas: [
      '¿No es cierto que usted no vio bien lo que pasó?',
      '¿Cómo puede estar seguro si estaba lejos y había poca luz?',
      '¿Por qué debería creerle a usted y no a la otra persona?',
    ],
  },
]

export default function PaginaEnsaya() {
  const [nivelActual, setNivelActual] = useState(0)
  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuesta, setRespuesta] = useState('')
  const [mostrarAyuda, setMostrarAyuda] = useState(false)
  const [iniciado, setIniciado] = useState(false)

  const nivel = NIVELES[nivelActual]
  const pregunta = nivel?.preguntas[preguntaActual]

  const siguientePregunta = () => {
    setRespuesta('')
    setMostrarAyuda(false)
    
    if (preguntaActual < nivel.preguntas.length - 1) {
      setPreguntaActual(prev => prev + 1)
    } else if (nivelActual < NIVELES.length - 1) {
      setNivelActual(prev => prev + 1)
      setPreguntaActual(0)
    }
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

        {!iniciado ? (
          <section className="text-center">
            <div className="w-24 h-24 rounded-full bg-puente-100 flex items-center justify-center text-5xl mx-auto mb-6">
              🎯
            </div>
            <h1 className="text-3xl font-bold text-puente-800 mb-4">
              Ensaya tu declaración
            </h1>
            <p className="text-xl text-puente-600 max-w-xl mx-auto mb-8">
              Practica responder preguntas como las que te harán en el juzgado. 
              Hay tres niveles, de más fácil a más difícil.
            </p>

            <div className="grid gap-4 mb-8 text-left">
              {NIVELES.map((n, i) => (
                <div key={n.id} className="card flex items-start gap-4">
                  <span className="paso-indicador shrink-0">{i + 1}</span>
                  <div>
                    <h2 className="font-bold text-puente-800">{n.nombre}</h2>
                    <p className="text-puente-600">{n.descripcion}</p>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setIniciado(true)} className="btn-primary text-xl px-8">
              Empezar a practicar
            </button>

            <p className="text-puente-500 mt-6">
              Puedes parar cuando quieras. No hay respuestas buenas ni malas.
            </p>
          </section>
        ) : (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm text-puente-500">Nivel {nivelActual + 1} de 3</p>
                <h1 className="text-2xl font-bold text-puente-800">{nivel.nombre}</h1>
              </div>
              <span className="etiqueta-info">
                Pregunta {preguntaActual + 1} de {nivel.preguntas.length}
              </span>
            </div>

            <div className="w-full bg-puente-100 rounded-full h-2 mb-8">
              <div 
                className="bg-puente-600 h-2 rounded-full transition-all"
                style={{ width: `${((preguntaActual + 1) / nivel.preguntas.length) * 100}%` }}
              />
            </div>

            <div className="card-destacada mb-6">
              <div className="flex justify-between items-start mb-4">
                <p className="text-sm text-puente-500">Te preguntan:</p>
                <BotonLeerEnVoz texto={pregunta} etiqueta="Escuchar" />
              </div>
              <p className="text-2xl text-puente-800 font-medium">
                {pregunta}
              </p>
            </div>

            {nivelActual === 2 && (
              <button
                onClick={() => setMostrarAyuda(!mostrarAyuda)}
                className="btn-ghost mb-4 w-full"
              >
                {mostrarAyuda ? 'Ocultar ayuda' : '¿Esta pregunta te confunde? Ver ayuda'}
              </button>
            )}

            {mostrarAyuda && (
              <div className="bg-accent-alert/10 border-2 border-accent-alert rounded-tarjeta p-6 mb-6">
                <h2 className="font-bold text-puente-800 mb-2">Esta pregunta es confusa</h2>
                <p className="text-puente-700 mb-4">
                  Tiene una doble negación o está formulada para confundirte. 
                  <strong> No tienes que responder así. </strong>
                  Puedes decir:
                </p>
                <ul className="space-y-2 text-puente-700">
                  <li>"Perdone, no he entendido la pregunta. ¿Puede repetirla de otra forma?"</li>
                  <li>"¿Me está preguntando si vi lo que pasó?"</li>
                </ul>
              </div>
            )}

            <div className="card mb-6">
              <label htmlFor="respuesta" className="block font-bold text-puente-800 mb-3">
                Tu respuesta (opcional)
              </label>
              <textarea
                id="respuesta"
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                className="textarea-accesible"
                placeholder="Escribe lo que responderías..."
                rows={4}
              />
              <p className="text-sm text-puente-500 mt-2">
                Esto es solo práctica. Nadie más ve lo que escribes.
              </p>
            </div>

            <div className="flex gap-4">
              <button onClick={siguientePregunta} className="btn-primary flex-1">
                {preguntaActual < nivel.preguntas.length - 1 
                  ? 'Siguiente pregunta' 
                  : nivelActual < NIVELES.length - 1 
                    ? 'Siguiente nivel'
                    : 'Terminar'}
              </button>
            </div>

            <button 
              onClick={() => setIniciado(false)} 
              className="btn-ghost mt-4 w-full"
            >
              Salir del ensayo
            </button>
          </section>
        )}
      </main>
    </>
  )
}
