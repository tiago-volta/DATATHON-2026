'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Cabecera } from '@/components/Cabecera'
import { BotonLeerEnVoz } from '@/components/BotonLeerEnVoz'

const ESCENAS = [
  {
    id: 'entrada',
    nombre: 'Entrada al edificio',
    descripcion: 'Llegas al juzgado. Es un edificio grande con puertas de cristal.',
    audioguia: 'Al llegar, verás un edificio grande. Las puertas de entrada son de cristal y se abren automáticamente. Dentro hay un vestíbulo amplio.',
    consejos: [
      'Llega 15 minutos antes de tu cita',
      'Ten el DNI y la citación a mano',
      'Si vas con acompañante, puede entrar contigo',
    ],
  },
  {
    id: 'seguridad',
    nombre: 'Control de seguridad',
    descripcion: 'Tienes que pasar por un control como en el aeropuerto.',
    audioguia: 'Después de entrar, hay un control de seguridad. Es como el del aeropuerto: dejas tus cosas en una bandeja, pasas por un arco y las recoges al otro lado. Los agentes de seguridad llevan uniforme.',
    consejos: [
      'Deja el móvil y las llaves en la bandeja',
      'Si tienes marcapasos u otro dispositivo, avisa al guardia',
      'Los objetos punzantes no se pueden entrar',
    ],
  },
  {
    id: 'espera',
    nombre: 'Zona de espera',
    descripcion: 'Esperas hasta que te llamen por tu nombre.',
    audioguia: 'Después del control, hay un pasillo con bancos donde esperar. Habrá otras personas esperando también. Pueden llamarte por megafonía o puede salir alguien a buscarte. Escucha tu nombre o el número de tu sala.',
    consejos: [
      'Puedes pedir esperar en un sitio más tranquilo',
      'Puedes llevar auriculares o tapones si el ruido te molesta',
      'Si necesitas ir al baño, pregunta dónde está antes',
    ],
  },
  {
    id: 'sala',
    nombre: 'La sala de vistas',
    descripcion: 'Entras en la sala donde se hace el juicio.',
    audioguia: 'La sala es una habitación con varios muebles. Al fondo hay una mesa elevada donde se sienta el juez. A los lados hay mesas para los abogados. Hay sillas para el público y un sitio específico para ti cuando te llamen.',
    consejos: [
      'No hables hasta que te pregunten',
      'Si no entiendes algo, puedes pedir que te lo repitan',
      'Puedes pedir una pausa si lo necesitas',
    ],
  },
]

export default function PaginaSalaPrevia() {
  const [escenaActual, setEscenaActual] = useState(0)
  const [nivelRuido, setNivelRuido] = useState(30)
  const [nivelLuz, setNivelLuz] = useState(50)
  const [nivelGente, setNivelGente] = useState(30)

  const escena = ESCENAS[escenaActual]

  return (
    <>
      <Cabecera />
      
      <main id="contenido-principal" className="max-w-4xl mx-auto px-4 py-8">
        <nav className="mb-6">
          <Link href="/" className="text-puente-600 hover:text-puente-800">
            ← Volver al inicio
          </Link>
        </nav>

        <h1 className="text-3xl font-bold text-puente-800 mb-2">
          Visita la sala antes de ir
        </h1>
        <p className="text-lg text-puente-600 mb-8">
          Conoce cómo es un juzgado para que no te pille de sorpresa el día de tu cita.
        </p>

        <nav className="flex gap-2 mb-6 overflow-x-auto pb-2" aria-label="Escenas">
          {ESCENAS.map((e, i) => (
            <button
              key={e.id}
              onClick={() => setEscenaActual(i)}
              className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${
                escenaActual === i
                  ? 'bg-puente-600 text-white'
                  : 'bg-puente-100 text-puente-700 hover:bg-puente-200'
              }`}
            >
              {i + 1}. {e.nombre}
            </button>
          ))}
        </nav>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div 
              className="aspect-video rounded-tarjeta flex items-center justify-center relative overflow-hidden"
              style={{
                backgroundColor: `hsl(200, 20%, ${90 - nivelLuz * 0.4}%)`,
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center p-8">
                  <p className="text-6xl mb-4" aria-hidden="true">
                    {escena.id === 'entrada' && '🏛️'}
                    {escena.id === 'seguridad' && '🚪'}
                    {escena.id === 'espera' && '🪑'}
                    {escena.id === 'sala' && '⚖️'}
                  </p>
                  <p className="text-xl font-bold text-puente-800">{escena.nombre}</p>
                  <p className="text-puente-600 mt-2 max-w-md">{escena.descripcion}</p>
                </div>
              </div>
              
              {nivelGente > 50 && (
                <div className="absolute bottom-4 left-4 right-4 flex justify-around opacity-50">
                  {Array.from({ length: Math.floor(nivelGente / 20) }).map((_, i) => (
                    <span key={i} className="text-3xl">👤</span>
                  ))}
                </div>
              )}
            </div>

            <div className="card mt-4">
              <div className="flex justify-between items-start mb-3">
                <h2 className="font-bold text-puente-800">Audioguía</h2>
                <BotonLeerEnVoz texto={escena.audioguia} etiqueta="Escuchar" />
              </div>
              <p className="text-puente-700">{escena.audioguia}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="card">
              <h2 className="font-bold text-puente-800 mb-4">Ajusta el ambiente</h2>
              <p className="text-sm text-puente-600 mb-4">
                Prueba cómo te sentirías con diferentes niveles de estímulos.
              </p>

              <div className="space-y-6">
                <div>
                  <label htmlFor="ruido" className="flex justify-between text-sm text-puente-700 mb-2">
                    <span>Ruido</span>
                    <span>{nivelRuido < 30 ? 'Poco' : nivelRuido < 70 ? 'Normal' : 'Mucho'}</span>
                  </label>
                  <input
                    type="range"
                    id="ruido"
                    min="0"
                    max="100"
                    value={nivelRuido}
                    onChange={(e) => setNivelRuido(Number(e.target.value))}
                    className="w-full accent-puente-600"
                  />
                </div>

                <div>
                  <label htmlFor="luz" className="flex justify-between text-sm text-puente-700 mb-2">
                    <span>Luz</span>
                    <span>{nivelLuz < 30 ? 'Tenue' : nivelLuz < 70 ? 'Normal' : 'Fuerte'}</span>
                  </label>
                  <input
                    type="range"
                    id="luz"
                    min="0"
                    max="100"
                    value={nivelLuz}
                    onChange={(e) => setNivelLuz(Number(e.target.value))}
                    className="w-full accent-puente-600"
                  />
                </div>

                <div>
                  <label htmlFor="gente" className="flex justify-between text-sm text-puente-700 mb-2">
                    <span>Gente</span>
                    <span>{nivelGente < 30 ? 'Poca' : nivelGente < 70 ? 'Normal' : 'Mucha'}</span>
                  </label>
                  <input
                    type="range"
                    id="gente"
                    min="0"
                    max="100"
                    value={nivelGente}
                    onChange={(e) => setNivelGente(Number(e.target.value))}
                    className="w-full accent-puente-600"
                  />
                </div>
              </div>
            </div>

            <div className="card">
              <h2 className="font-bold text-puente-800 mb-3">Consejos</h2>
              <ul className="space-y-2">
                {escena.consejos.map((consejo, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-accent-success shrink-0" aria-hidden="true">✓</span>
                    <span className="text-puente-700 text-sm">{consejo}</span>
                  </li>
                ))}
              </ul>
            </div>

            {(nivelRuido > 60 || nivelLuz > 70 || nivelGente > 60) && (
              <div className="bg-accent-alert/10 border border-accent-alert rounded-lg p-4">
                <p className="text-sm text-puente-700">
                  <strong>¿Te agobia este nivel?</strong> Puedes pedir esperar en un sitio más tranquilo. 
                  Es tu derecho.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setEscenaActual(Math.max(0, escenaActual - 1))}
            disabled={escenaActual === 0}
            className="btn-secondary disabled:opacity-50"
          >
            ← Anterior
          </button>
          <button
            onClick={() => setEscenaActual(Math.min(ESCENAS.length - 1, escenaActual + 1))}
            disabled={escenaActual === ESCENAS.length - 1}
            className="btn-primary disabled:opacity-50"
          >
            Siguiente →
          </button>
        </div>
      </main>
    </>
  )
}
