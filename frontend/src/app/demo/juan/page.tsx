'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Icono } from '@/components/Icono'
import { BotonLeerEnVoz } from '@/components/BotonLeerEnVoz'
import { LineaTiempo } from '@/components/LineaTiempo'
import { FASES_INVESTIGADO } from '@/lib/contenido'

const JUAN_LECTURA_CLARA = `Te citan como INVESTIGADO en un juicio por delito leve.

Cuándo: Jueves 12 de noviembre de 2026, a las 9 y media de la mañana.

Dónde: Juzgado de Instrucción número 7 de A Coruña.

De qué te acusan: De una estafa pequeña (menos de cuatrocientos euros) por una venta en internet.

Tus derechos:
1. Puedes quedarte callado. No tienes que hablar si no quieres.
2. Tienes derecho a un abogado. Si no puedes pagarlo, te dan uno gratis.
3. Puedes presentar pruebas que demuestren que no hiciste nada malo.
4. Te lo tienen que explicar todo de forma que lo entiendas.

Plazo importante: Puedes presentar pruebas hasta el día del juicio.

Puedes pedir ayuda: Que te lean los documentos en voz alta, pausas durante el juicio, más tiempo para responder.`

const JUAN_RESUMEN_VOZ = `
Hola Juan. Te resumo tu citación en tres puntos importantes.

Primero: Te acusan de una estafa pequeña por una venta en internet. El importe es menos de cuatrocientos euros.

Segundo: Tienes derechos. Puedes no hablar si no quieres. Tienes derecho a un abogado gratis. Puedes presentar pruebas.

Tercero: El juicio es el jueves 12 de noviembre, a las nueve y media de la mañana, en el Juzgado número 7 de A Coruña.

Puedes pedir que te lean los documentos en voz alta y que hagan pausas durante el juicio.
`

export default function DemoJuan() {
  const [seccion, setSeccion] = useState<'intro' | 'citacion' | 'linea-tiempo' | 'ajustes'>('intro')
  const [modoVoz, setModoVoz] = useState(false)

  useEffect(() => {
    if (modoVoz) {
      const utterance = new SpeechSynthesisUtterance(JUAN_RESUMEN_VOZ)
      utterance.lang = 'es-ES'
      utterance.rate = 0.85
      speechSynthesis.speak(utterance)
      return () => speechSynthesis.cancel()
    }
  }, [modoVoz])

  return (
    <>
      <main id="contenido-principal" className="page-shell">
        <nav aria-label="Volver">
          <Link href="/" className="link-atras">
            <Icono nombre="←" />
            Volver al inicio
          </Link>
        </nav>

        <header className="mb-8">
          <div className="mb-4">
            <h1 className="titulo-pagina">Juan, 32 años</h1>
            <p className="text-xl text-puente-700">Investigado en un juicio por delito leve</p>
          </div>
          <div className="bg-calma-sage rounded-lg p-4">
            <p className="text-puente-700">
              Juan tiene TDAH combinado y es ciego. Necesita que le lean los documentos en voz alta,
              le cuesta concentrarse en explicaciones largas y necesita pausas frecuentes.
            </p>
          </div>
        </header>

        <div className="bg-puente-800 text-white rounded-tarjeta p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Modo voz para Juan</h2>
          <p className="mb-4 text-puente-100">
            Juan usa lector de pantalla. Esta demo está pensada para escucharse.
          </p>
          <button
            type="button"
            onClick={() => setModoVoz(!modoVoz)}
            className="btn bg-white text-puente-800 hover:bg-puente-50"
            aria-pressed={modoVoz}
          >
            {modoVoz ? (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" />
                  <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" />
                </svg>
                Detener lectura
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
                Leer resumen en voz alta
              </>
            )}
          </button>
        </div>

        <nav className="flex flex-wrap gap-2 mb-8" aria-label="Secciones de la demo">
          {[
            { id: 'intro', label: 'Situación' },
            { id: 'citacion', label: 'Su citación' },
            { id: 'linea-tiempo', label: 'Línea de tiempo' },
            { id: 'ajustes', label: 'Ajustes' },
          ].map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setSeccion(s.id as typeof seccion)}
              aria-current={seccion === s.id ? 'true' : undefined}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                seccion === s.id
                  ? 'bg-puente-600 text-white'
                  : 'bg-puente-100 text-puente-700 hover:bg-puente-200'
              }`}
            >
              {s.label}
            </button>
          ))}
        </nav>

        {seccion === 'intro' && (
          <section className="card">
            <h2 className="text-2xl font-bold text-puente-800 mb-4">La situación de Juan</h2>
            <div className="space-y-4 text-lg text-puente-700">
              <p>
                Juan vendió un objeto de segunda mano por internet. El comprador dice que nunca
                lo recibió y le ha denunciado por estafa. Juan cree que hubo un problema con el
                envío, pero no tiene forma de demostrarlo fácilmente.
              </p>
              <p>
                Juan recibe una citación para un juicio por delito leve. Como es ciego, necesita
                que alguien le lea la carta. Además, con su TDAH le cuesta mucho leer documentos
                largos sin perderse.
              </p>
              <p>
                <strong>PUENTE le ayuda a:</strong>
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Escuchar su citación en voz alta, en bloques cortos</li>
                <li>Entender sus derechos como investigado</li>
                <li>Organizar los hechos en una línea de tiempo para no olvidar nada</li>
                <li>Pedir ajustes: lectura en voz alta, pausas, descripción de pruebas</li>
              </ul>
            </div>
            <button type="button" onClick={() => setSeccion('citacion')} className="btn-primary mt-6">
              Escuchar su citación
              <Icono nombre="→" />
            </button>
          </section>
        )}

        {seccion === 'citacion' && (
          <section>
            <div className="card-destacada mb-6">
              <h2 className="text-xl font-bold text-puente-800 mb-4">Lo esencial (3 puntos)</h2>
              <ol className="space-y-4">
                <li className="flex items-start gap-4 p-4 bg-calma-sage rounded-lg">
                  <span className="paso-indicador shrink-0">1</span>
                  <div>
                    <p className="font-bold text-puente-800">Te acusan de una estafa pequeña</p>
                    <p className="text-puente-600">Por una venta en internet. Menos de cuatrocientos euros.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-4 bg-calma-sage rounded-lg">
                  <span className="paso-indicador shrink-0">2</span>
                  <div>
                    <p className="font-bold text-puente-800">Tienes derechos</p>
                    <p className="text-puente-600">Puedes no hablar. Tienes derecho a abogado gratis. Puedes presentar pruebas.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4 p-4 bg-calma-sage rounded-lg">
                  <span className="paso-indicador shrink-0">3</span>
                  <div>
                    <p className="font-bold text-puente-800">El juicio es el 12 de noviembre</p>
                    <p className="text-puente-600">A las 9:30, en el Juzgado nº 7 de A Coruña.</p>
                  </div>
                </li>
              </ol>
            </div>

            <div className="card mb-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-bold text-puente-800">Citación completa</h2>
                <BotonLeerEnVoz texto={JUAN_LECTURA_CLARA} />
              </div>
              <div className="lectura-facil whitespace-pre-line">
                {JUAN_LECTURA_CLARA}
              </div>
            </div>

            <button type="button" onClick={() => setSeccion('linea-tiempo')} className="btn-primary">
              Ver la línea de tiempo
              <Icono nombre="→" />
            </button>
          </section>
        )}

        {seccion === 'linea-tiempo' && (
          <section>
            <h2 className="text-2xl font-bold text-puente-800 mb-2">Mi línea de tiempo</h2>
            <p className="text-puente-600 mb-6">
              Juan necesita ordenar los hechos para contarlos bien. Esta herramienta le ayuda
              a construir su versión de forma organizada.
            </p>

            <div className="card-destacada mb-8">
              <h3 className="text-lg font-bold text-puente-800 mb-4">Los hechos de Juan</h3>
              <ol className="space-y-3">
                <li className="flex gap-4 p-3 bg-calma-sage rounded-lg">
                  <span className="text-puente-700 numeros shrink-0">25 sep</span>
                  <span className="text-puente-700">Publiqué el anuncio del objeto en Wallapop</span>
                </li>
                <li className="flex gap-4 p-3 bg-calma-sage rounded-lg">
                  <span className="text-puente-700 numeros shrink-0">28 sep</span>
                  <span className="text-puente-700">El comprador me escribió interesado</span>
                </li>
                <li className="flex gap-4 p-3 bg-calma-sage rounded-lg">
                  <span className="text-puente-700 numeros shrink-0">30 sep</span>
                  <span className="text-puente-700">Acordamos el precio: trescientos cincuenta euros</span>
                </li>
                <li className="flex gap-4 p-3 bg-calma-sage rounded-lg">
                  <span className="text-puente-700 numeros shrink-0">1 oct</span>
                  <span className="text-puente-700">Recibí el pago por Bizum</span>
                </li>
                <li className="flex gap-4 p-3 bg-calma-sage rounded-lg">
                  <span className="text-puente-700 numeros shrink-0">2 oct</span>
                  <span className="text-puente-700">Envié el paquete por Correos</span>
                </li>
                <li className="flex gap-4 p-3 bg-calma-sage rounded-lg">
                  <span className="text-puente-700 numeros shrink-0">10 oct</span>
                  <span className="text-puente-700">El comprador dice que no lo recibió</span>
                </li>
              </ol>
              <p className="text-sm text-puente-700 mt-4">
                Esta información se la puede dar a su abogado para preparar la defensa.
              </p>
            </div>

            <h3 className="text-xl font-bold text-puente-800 mb-4">Fases del proceso</h3>
            <LineaTiempo fases={FASES_INVESTIGADO} faseActual={1} />

            <button type="button" onClick={() => setSeccion('ajustes')} className="btn-primary mt-8">
              Ver qué ajustes puede pedir
              <Icono nombre="→" />
            </button>
          </section>
        )}

        {seccion === 'ajustes' && (
          <section>
            <h2 className="text-2xl font-bold text-puente-800 mb-2">Ajustes para Juan</h2>
            <p className="text-puente-600 mb-6">
              Juan tiene dos condiciones: TDAH y ceguera. Puede pedir ajustes por ambas
              (Art. 118 LECrim, Ley 15/2022: discriminación múltiple).
            </p>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="card">
                <h3 className="font-bold text-puente-800 mb-3 flex items-center gap-2">
                  <Icono nombre="🦯" /> Por su ceguera
                </h3>
                <ul className="space-y-2">
                  {[
                    'Documentos leídos en voz alta',
                    'Descripción de pruebas visuales',
                    'Acompañamiento en la sede',
                    'Más tiempo con productos de apoyo',
                  ].map((ajuste) => (
                    <li key={ajuste} className="flex items-start gap-2">
                      <Icono nombre="✓" className="mt-1 h-5 w-5 text-accent-success" />
                      <span className="text-puente-700">{ajuste}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card">
                <h3 className="font-bold text-puente-800 mb-3 flex items-center gap-2">
                  <Icono nombre="⚡" /> Por su TDAH
                </h3>
                <ul className="space-y-2">
                  {[
                    'Pausas cada 15-20 minutos',
                    'Preguntas cortas, de una en una',
                    'Apoyo de notas o esquema',
                    'Horario sin esperas largas',
                  ].map((ajuste) => (
                    <li key={ajuste} className="flex items-start gap-2">
                      <Icono nombre="✓" className="mt-1 h-5 w-5 text-accent-success" />
                      <span className="text-puente-700">{ajuste}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="bg-accent-success/10 border-2 border-accent-success rounded-tarjeta p-6">
              <h3 className="text-xl font-bold text-puente-800 mb-4">
                Crear el Pasaporte de Juan
              </h3>
              <p className="text-puente-600 mb-4">
                Su Pasaporte mostrará que necesita ajustes de accesibilidad visual y de
                atención, sin revelar diagnósticos específicos.
              </p>
              <Link
                href="/pasaporte?ajustes=documentos-voz,descripcion-pruebas,pausas,preguntas-claras,acompanante"
                className="btn-primary"
              >
                Ir a crear Pasaporte
              </Link>
            </div>
          </section>
        )}
      </main>
    </>
  )
}
