'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Cabecera } from '@/components/Cabecera'
import { TarjetaRol } from '@/components/TarjetaRol'

const PASOS_CGPJ = [
  {
    numero: 1,
    titulo: 'Detectar áreas de ajuste',
    descripcion: 'Identificar en qué ámbitos la persona necesita apoyo: comunicación, comprensión, interacción con el entorno, aspectos sensoriales.',
  },
  {
    numero: 2,
    titulo: 'Identificar apoyos necesarios',
    descripcion: 'Determinar qué tipo de apoyos concretos se requieren: lectura fácil, facilitador, adaptaciones del espacio, pausas, etc.',
  },
  {
    numero: 3,
    titulo: 'Valorar la intensidad',
    descripcion: 'Evaluar el grado de apoyo necesario en cada área: puntual, frecuente o constante.',
  },
  {
    numero: 4,
    titulo: 'Trasladar a un informe',
    descripcion: 'Documentar las necesidades y ajustes en un perfil individualizado que se incorpora al expediente.',
  },
]

const AJUSTES_POR_PERFIL = {
  tea: {
    nombre: 'Trastorno del Espectro Autista',
    ajustes: [
      'Lenguaje literal, sin metáforas, ironía ni dobles sentidos',
      'Anticipar cada paso del proceso',
      'Sala de espera tranquila, con menos estímulos',
      'Preguntas concretas, de una en una',
      'Más tiempo para procesar y responder',
      'Posibilidad de persona facilitadora',
      'Evitar cambios imprevistos',
    ],
  },
  tdah: {
    nombre: 'TDAH',
    ajustes: [
      'Declaraciones breves con pausas pactadas',
      'Preguntas cortas y directas',
      'Permitir apoyo de notas o esquema',
      'Horario sin esperas largas',
      'Posibilidad de movimiento o objeto de autorregulación',
      'Información en bloques cortos',
    ],
  },
  dislexia: {
    nombre: 'Dislexia',
    ajustes: [
      'Documentos en audio o con lectura asistida',
      'No exigir lectura en voz alta',
      'Más tiempo para revisar documentos',
      'Tipografía y espaciado amplios',
      'Glosario de términos jurídicos',
    ],
  },
  ceguera: {
    nombre: 'Ceguera o baja visión',
    ajustes: [
      'Documentos en formato accesible (digital etiquetado o braille)',
      'Lectura en voz alta de documentos',
      'Descripción de pruebas visuales',
      'Acompañamiento y orientación en la sede',
      'Más tiempo con productos de apoyo',
    ],
  },
}

export default function PaginaProfesional() {
  const [perfilSeleccionado, setPerfilSeleccionado] = useState<keyof typeof AJUSTES_POR_PERFIL | null>(null)

  const perfil = perfilSeleccionado ? AJUSTES_POR_PERFIL[perfilSeleccionado] : null

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
          Panel profesional
        </h1>
        <p className="text-lg text-puente-600 mb-8">
          Herramientas para generar el perfil individualizado de ajustes según la Guía del CGPJ (2025).
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-puente-800 mb-4">
            Perfil individualizado de ajustes (4 pasos CGPJ)
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {PASOS_CGPJ.map((paso) => (
              <div key={paso.numero} className="card">
                <div className="flex items-start gap-4">
                  <span className="paso-indicador shrink-0">{paso.numero}</span>
                  <div>
                    <h3 className="font-bold text-puente-800">{paso.titulo}</h3>
                    <p className="text-puente-600 text-sm">{paso.descripcion}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-puente-800 mb-4">
            Ajustes por perfil
          </h2>
          <p className="text-puente-600 mb-6">
            Selecciona un perfil para ver los ajustes recomendados.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {Object.entries(AJUSTES_POR_PERFIL).map(([key, value]) => (
              <button
                key={key}
                onClick={() => setPerfilSeleccionado(key as keyof typeof AJUSTES_POR_PERFIL)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  perfilSeleccionado === key
                    ? 'bg-puente-600 text-white'
                    : 'bg-puente-100 text-puente-700 hover:bg-puente-200'
                }`}
              >
                {value.nombre}
              </button>
            ))}
          </div>

          {perfil && (
            <div className="card-destacada">
              <h3 className="text-xl font-bold text-puente-800 mb-4">{perfil.nombre}</h3>
              <ul className="space-y-3">
                {perfil.ajustes.map((ajuste, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id={`ajuste-${i}`}
                      className="mt-1 w-5 h-5 accent-puente-600"
                    />
                    <label htmlFor={`ajuste-${i}`} className="text-puente-700">
                      {ajuste}
                    </label>
                  </li>
                ))}
              </ul>
              <button className="btn-primary mt-6 w-full">
                Generar informe de ajustes
              </button>
            </div>
          )}
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-puente-800 mb-4">
            Leer Pasaporte de Ajustes
          </h2>
          <div className="card">
            <p className="text-puente-600 mb-4">
              Escanea o introduce el código de un Pasaporte para ver los ajustes que la persona ha indicado.
            </p>
            <div className="flex gap-4">
              <input
                type="text"
                placeholder="Código del Pasaporte (ej: A1B2C3D4)"
                className="input-accesible flex-1"
              />
              <button className="btn-primary">
                Consultar
              </button>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-puente-800 mb-4">
            Analizar preguntas
          </h2>
          <p className="text-puente-600 mb-4">
            Revisa si las preguntas del interrogatorio pueden confundir a la persona.
          </p>
          <Link href="/mediador" className="btn-secondary">
            Ir a Pregunta Clara
          </Link>
        </section>

        <section className="bg-calma-sage rounded-tarjeta p-6">
          <h2 className="text-xl font-bold text-puente-800 mb-4">
            Derivación a recursos de apoyo
          </h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-bold text-puente-700 mb-2">Facilitación procesal</h3>
              <ul className="space-y-1 text-puente-600">
                <li>Plena inclusión · 917 444 600</li>
                <li>UAVDI (Fundación A LA PAR) · 917 355 790</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-puente-700 mb-2">Asociaciones (Galicia)</h3>
              <ul className="space-y-1 text-puente-600">
                <li>ASPERGA · 881 917 318</li>
                <li>ANHIDA Coruña · 981 903 830</li>
                <li>ONCE · 900 221 221</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-puente-500 mt-4">
            Base legal: Art. 7 bis LEC, Art. 109 LECrim, Ley 15/2022, Guía CGPJ 2025.
          </p>
        </section>
      </main>
    </>
  )
}
